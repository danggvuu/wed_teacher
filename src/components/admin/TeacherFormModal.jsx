import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function TeacherFormModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          ID: '', 'Tên': '', 'Ảnh': '', 'Môn dạy': '', 'Cấp lớp': '', 
          'Kinh nghiệm': '', 'Bằng cấp': '', 'Thành tích': '', 
          'Học phí': '', 'Lịch dạy': '', 'Địa điểm': '', 
          'SĐT': '', 'Zalo': '', 'Facebook': '', 'Trạng thái': ''
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Cập nhật Giáo viên' : 'Thêm Giáo viên mới'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="teacher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Thông tin cơ bản</h3>
                
                <Input 
                  label="Mã Giáo Viên (ID) *" 
                  placeholder="VD: GV01"
                  {...register('ID', { required: 'Vui lòng nhập ID' })}
                  error={errors.ID?.message}
                  disabled={!!initialData} // Không cho sửa ID nếu đang update
                />
                
                <Input 
                  label="Họ và Tên *" 
                  placeholder="VD: Cô Nguyễn Thị A"
                  {...register('Tên', { required: 'Vui lòng nhập Tên' })}
                  error={errors['Tên']?.message}
                />
                
                <Input 
                  label="Link Ảnh đại diện" 
                  placeholder="VD: https://imgur.com/xyz.jpg"
                  {...register('Ảnh')}
                />
                
                <Input 
                  label="Môn dạy" 
                  placeholder="VD: Toán"
                  {...register('Môn dạy')}
                />
                
                <Input 
                  label="Cấp lớp" 
                  placeholder="VD: Cấp 2, Cấp 3"
                  {...register('Cấp lớp')}
                />
              </div>

              {/* Chuyên môn */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Chuyên môn & Đào tạo</h3>
                
                <Input 
                  label="Kinh nghiệm" 
                  placeholder="VD: 5 năm giảng dạy"
                  {...register('Kinh nghiệm')}
                />
                
                <Input 
                  label="Bằng cấp" 
                  placeholder="VD: Cử nhân Sư phạm Toán"
                  {...register('Bằng cấp')}
                />
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Thành tích nổi bật</label>
                  <textarea
                    className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 input-glow min-h-[100px] resize-none"
                    placeholder="Liệt kê thành tích..."
                    {...register('Thành tích')}
                  />
                </div>
              </div>

              {/* Lớp học */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Lớp học</h3>
                
                <Input 
                  label="Học phí" 
                  placeholder="VD: 200k/buổi"
                  {...register('Học phí')}
                />
                
                <Input 
                  label="Lịch dạy" 
                  placeholder="VD: Tối T2, T4, T6"
                  {...register('Lịch dạy')}
                />
                
                <Input 
                  label="Địa điểm" 
                  placeholder="VD: Online qua Zoom / Tòa nhà ABC"
                  {...register('Địa điểm')}
                />
              </div>

              {/* Liên hệ */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Liên hệ</h3>
                
                <Input 
                  label="Số điện thoại" 
                  placeholder="VD: 0987654321"
                  {...register('SĐT')}
                />
                
                <Input 
                  label="Zalo" 
                  placeholder="VD: 0987654321"
                  {...register('Zalo')}
                />
                
                <Input 
                  label="Facebook" 
                  placeholder="VD: https://facebook.com/..."
                  {...register('Facebook')}
                />
              </div>
            </div>
            
            <div className="pt-4 space-y-1.5 border-t">
              <label className="block text-sm font-medium text-slate-700">Trạng thái (Ẩn/Hiện)</label>
              <select 
                {...register('Trạng thái')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Hiện (Mặc định)</option>
                <option value="ẩn">Ẩn (Không hiển thị trên web)</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="teacher-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
              </span>
            ) : 'Lưu thông tin'}
          </Button>
        </div>
      </div>
    </div>
  );
}
