import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingContact } from '../components/layout/FloatingContact';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

export default function Home() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTeachers() {
      try {
        const response = await getTeachers();
        
        // Mock data nếu chưa có API thật hoặc trả về rỗng
        const data = response?.data && response.data.length > 0 ? response.data : [
          {
            ID: 'co-hoa-toan',
            'Tên': 'Cô [PLACEHOLDER Tên]',
            'Môn dạy': 'Toán cấp 2, cấp 3',
            'Kinh nghiệm': '10+ năm kinh nghiệm',
            'Ảnh': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800'
          }
        ];

        if (data.length === 1) {
          // Nếu chỉ có 1 giáo viên, chuyển thẳng sang trang chi tiết
          navigate(`/giao-vien/${data[0].ID || 'demo'}`);
        } else {
          setTeachers(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách giáo viên", err);
        // Fallback mockup nếu API lỗi do chưa setup
        const fallbackData = [
          {
            ID: 'co-hoa-toan',
            'Tên': 'Cô [PLACEHOLDER Tên]',
            'Môn dạy': 'Toán cấp 2, cấp 3',
            'Kinh nghiệm': '10+ năm kinh nghiệm',
            'Ảnh': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800'
          }
        ];
        navigate(`/giao-vien/${fallbackData[0].ID}`);
      }
    }
    
    loadTeachers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Đội ngũ Giáo viên Toán</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Gặp gỡ những người thầy, người cô tận tâm, có chuyên môn cao và giàu kinh nghiệm giảng dạy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((teacher, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img 
                  src={teacher['Ảnh'] || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800'} 
                  alt={teacher['Tên']}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{teacher['Tên']}</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{teacher['Môn dạy']}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{teacher['Kinh nghiệm']}</span>
                  </div>
                </div>
                <Button 
                  className="w-full justify-between" 
                  onClick={() => navigate(`/giao-vien/${teacher.ID}`)}
                >
                  <span>Xem chi tiết lớp học</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
}
