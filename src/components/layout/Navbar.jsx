import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Toán Thầy/Cô</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#gioi-thieu" className="hover:text-blue-600 transition-colors">Giới thiệu</a>
          <a href="#lop-hoc" className="hover:text-blue-600 transition-colors">Lớp học</a>
          <a href="#hoc-phi" className="hover:text-blue-600 transition-colors">Học phí</a>
          <a href="#danh-gia" className="hover:text-blue-600 transition-colors">Đánh giá</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Button asChild className="hidden sm:inline-flex">
            <a href="#dang-ky">Đăng ký học</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
