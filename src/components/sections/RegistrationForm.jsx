import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerClass } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function RegistrationForm({ teacher }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const payload = {
        ...data,
        teacherName: teacher['Tên'] || 'Mặc định',
      };
      await registerClass(payload);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 rounded-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Đăng ký thành công!</h3>
        <p className="text-slate-600 mb-6">
          Cảm ơn phụ huynh đã đăng ký. Thầy/Cô sẽ liên hệ trong thời gian sớm nhất để tư vấn chi tiết.
        </p>
        <Button onClick={() => setSubmitStatus(null)} variant="outline">
          Đăng ký thêm học sinh khác
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại hoặc liên hệ qua Zalo/SĐT.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Họ tên học sinh *"
          placeholder="Nhập họ tên học sinh"
          {...register("studentName", { required: "Vui lòng nhập họ tên học sinh" })}
          error={errors.studentName?.message}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Lớp *"
            placeholder="VD: Lớp 10"
            {...register("grade", { required: "Vui lòng nhập lớp" })}
            error={errors.grade?.message}
          />
          <Input
            label="Trường đang học"
            placeholder="VD: THPT Chuyên"
            {...register("school")}
          />
        </div>

        <Input
          label="Tên phụ huynh *"
          placeholder="Nhập tên phụ huynh"
          {...register("parentName", { required: "Vui lòng nhập tên phụ huynh" })}
          error={errors.parentName?.message}
        />
        
        <Input
          label="Số điện thoại *"
          type="tel"
          placeholder="Nhập số điện thoại liên hệ"
          {...register("phone", { 
            required: "Vui lòng nhập số điện thoại",
            pattern: {
              value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
              message: "Số điện thoại không hợp lệ"
            }
          })}
          error={errors.phone?.message}
        />
      </div>

      <div className="space-y-4">
        <Input
          label="Khung giờ học mong muốn"
          placeholder="VD: Tối thứ 2, 4, 6 hoặc Cuối tuần"
          {...register("timeSlot")}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Mục tiêu học tập</label>
          <textarea
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            placeholder="VD: Cải thiện điểm số, Luyện thi đại học..."
            {...register("goal")}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Ghi chú thêm</label>
          <textarea
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            placeholder="Các yêu cầu hoặc lưu ý khác..."
            {...register("note")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Đang gửi đăng ký...' : 'Xác nhận Đăng ký học'}
      </Button>
      
      <p className="text-xs text-center text-slate-500 mt-4">
        Thông tin của bạn sẽ được bảo mật và chỉ dùng cho mục đích xếp lớp.
      </p>
    </form>
  );
}
