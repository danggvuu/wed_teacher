import { Phone, MapPin, Mail, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Lớp Toán Uy Tín</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              Đồng hành cùng các em học sinh trên con đường chinh phục môn Toán, tự tin đỗ đạt vào các trường điểm.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>[PLACEHOLDER - SĐT]</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>[PLACEHOLDER - Email]</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>[PLACEHOLDER - Địa chỉ]</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#gioi-thieu" className="hover:text-blue-400 transition-colors">Giới thiệu giáo viên</a></li>
              <li><a href="#lop-hoc" className="hover:text-blue-400 transition-colors">Thông tin lớp học</a></li>
              <li><a href="#hoc-phi" className="hover:text-blue-400 transition-colors">Học phí & Lịch học</a></li>
              <li><a href="#dang-ky" className="hover:text-blue-400 transition-colors">Đăng ký học thử</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Lớp Toán Uy Tín. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
