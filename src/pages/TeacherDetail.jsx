import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingContact } from '../components/layout/FloatingContact';
import { RegistrationForm } from '../components/sections/RegistrationForm';
import { getTeacher } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Award, BookOpen, Clock, MapPin, Users, CheckCircle2, 
  ChevronDown, Star, TrendingUp, BookCheck
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function TeacherDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacher() {
      try {
        const response = await getTeacher(slug);
        if (response?.data) {
          setTeacher(response.data);
        } else {
          // Fallback mock
          setTeacher(mockTeacher);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin", err);
        setTeacher(mockTeacher);
      } finally {
        setLoading(false);
      }
    }
    loadTeacher();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy giáo viên</h1>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Quay về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200 pt-16 pb-20 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-50 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
              <motion.div 
                className="w-full md:w-1/2"
                initial="hidden" animate="visible" variants={fadeIn}
              >
                <div className="inline-block bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm mb-6">
                  {teacher['Môn dạy'] || '[PLACEHOLDER - Môn/Cấp lớp]'}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
                  {teacher['Tên'] || '[PLACEHOLDER - Tên Giáo Viên]'}
                </h1>
                <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                  Đồng hành cùng học sinh chinh phục môn Toán, xây dựng tư duy logic và sự tự tin để bứt phá điểm số trong các kỳ thi quan trọng.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#dang-ky" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    Đăng ký học thử miễn phí
                  </a>
                  <a href="#gioi-thieu" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
                    Tìm hiểu thêm
                  </a>
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2 relative"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 relative border-8 border-white">
                  <img 
                    src={teacher['Ảnh'] || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"} 
                    alt={teacher['Tên']} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                    <p className="font-medium text-lg">{teacher['Kinh nghiệm'] || '[PLACEHOLDER - Kinh nghiệm]'}</p>
                  </div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -left-6 -bottom-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">100%</p>
                    <p className="text-xs text-slate-500 font-medium">Học sinh tiến bộ</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* GIỚI THIỆU & THÀNH TÍCH */}
        <section id="gioi-thieu" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-16">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Về {teacher['Tên']}</h2>
                <div className="prose text-slate-600">
                  <p className="mb-4">
                    Với phương pháp giảng dạy hiện đại, trực quan, {teacher['Tên']} luôn biến những khái niệm Toán học phức tạp trở nên đơn giản và dễ hiểu nhất đối với từng học sinh.
                  </p>
                  <p>
                    Triết lý: <strong>"Không có học sinh yếu, chỉ có học sinh chưa tìm đúng phương pháp."</strong>
                  </p>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg shrink-0 mt-1">
                      <Award className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Bằng cấp / Chứng chỉ</h4>
                      <p className="text-slate-600 text-sm mt-1">{teacher['Bằng cấp'] || '[PLACEHOLDER - Bằng cấp, VD: Cử nhân Sư phạm Toán ĐHSP HN]'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg shrink-0 mt-1">
                      <TrendingUp className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Thành tích nổi bật</h4>
                      <p className="text-slate-600 text-sm mt-1">{teacher['Thành tích'] || '[PLACEHOLDER - Thành tích, VD: 90% HS đỗ NV1, nhiều HS đạt giải HSG]'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-2 gap-4"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              >
                <Card className="bg-white border-0 shadow-md">
                  <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                    <Users className="w-8 h-8 text-blue-500 mb-3" />
                    <h3 className="text-3xl font-black text-slate-900 mb-1">500+</h3>
                    <p className="text-sm text-slate-500 font-medium">Học sinh theo học</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-md">
                  <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                    <BookCheck className="w-8 h-8 text-blue-500 mb-3" />
                    <h3 className="text-3xl font-black text-slate-900 mb-1">8.5+</h3>
                    <p className="text-sm text-slate-500 font-medium">Điểm thi trung bình</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-md col-span-2">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Phương pháp cá nhân hóa</h3>
                      <p className="text-sm text-slate-500">Giáo án riêng cho từng năng lực học sinh</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* THÔNG TIN LỚP HỌC */}
        <section id="lop-hoc" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Thông Tin Lớp Học</h2>
              <p className="text-slate-600">Đa dạng hình thức phù hợp với nhu cầu của từng học sinh.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: 'Địa điểm / Hình thức', desc: teacher['Địa điểm'] || '[PLACEHOLDER - Địa điểm dạy offline hoặc Online]' },
                { icon: Users, title: 'Sĩ số', desc: '[PLACEHOLDER - Sĩ số: 1 kèm 1, nhóm 5-7 bạn, hoặc lớp đông]' },
                { icon: Clock, title: 'Lịch dạy', desc: teacher['Lịch dạy'] || '[PLACEHOLDER - Lịch: Các buổi tối trong tuần & Cuối tuần]' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HỌC PHÍ */}
        <section id="hoc-phi" className="py-20 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Học phí đầu tư</h2>
            <p className="text-slate-300 mb-12 max-w-2xl mx-auto">
              Cam kết chất lượng tương xứng với học phí. Phụ huynh có thể tham khảo mức học phí chi tiết bên dưới.
            </p>
            
            <div className="bg-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700 mx-auto max-w-3xl">
              <div className="text-2xl font-semibold mb-6">
                {teacher['Học phí'] || '[PLACEHOLDER - Học phí, VD: 200k/buổi (nhóm), 350k/buổi (1-1)]'}
              </div>
              <ul className="space-y-4 text-left max-w-md mx-auto mb-8">
                <li className="flex items-center text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0" />
                  Được học thử 1-2 buổi miễn phí
                </li>
                <li className="flex items-center text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0" />
                  Kiểm tra năng lực đầu vào miễn phí
                </li>
                <li className="flex items-center text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0" />
                  Hỗ trợ giải đáp bài tập 24/7 qua Zalo
                </li>
              </ul>
              <a href="#dang-ky" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors w-full sm:w-auto">
                Đăng ký ngay
              </a>
            </div>
          </div>
        </section>

        {/* ĐÁNH GIÁ (TESTIMONIALS) */}
        <section id="danh-gia" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Phụ huynh & Học sinh nói gì?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { content: "[PLACEHOLDER - Review 1: 'Cô dạy rất nhiệt tình, con tôi từ sợ môn Toán giờ đã thích học và điểm cải thiện rõ rệt.']", author: "Phụ huynh em Linh - Lớp 9" },
                { content: "[PLACEHOLDER - Review 2: 'Bài giảng của thầy rất dễ hiểu, có nhiều mẹo giải nhanh giúp em tiết kiệm thời gian làm bài thi.']", author: "Học sinh Minh - Lớp 12" },
                { content: "[PLACEHOLDER - Review 3: 'Lớp học không quá đông nên cô kèm cặp sát sao, bài tập về nhà được chấm chữa chi tiết.']", author: "Phụ huynh em Nam - Lớp 6" }
              ].map((item, i) => (
                <Card key={i} className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex text-yellow-400 mb-4">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-slate-600 italic mb-6">"{item.content}"</p>
                    <p className="font-semibold text-slate-900 text-sm">- {item.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ĐĂNG KÝ HỌC */}
        <section id="dang-ky" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-blue-600 p-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Đăng Ký Học</h2>
                <p className="text-blue-100">Điền thông tin bên dưới để được tư vấn và xếp lớp phù hợp nhất.</p>
              </div>
              <div className="p-8 md:p-10 bg-slate-50">
                <RegistrationForm teacher={teacher} />
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
}

const mockTeacher = {
  ID: 'demo',
  'Tên': 'Thầy/Cô [PLACEHOLDER]',
  'Ảnh': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
  'Môn dạy': '[PLACEHOLDER - Môn dạy]',
  'Cấp lớp': '[PLACEHOLDER - Cấp lớp]',
  'Kinh nghiệm': '[PLACEHOLDER - Năm kinh nghiệm]',
  'Bằng cấp': '[PLACEHOLDER - Bằng cấp]',
  'Thành tích': '[PLACEHOLDER - Thành tích]',
  'Học phí': '[PLACEHOLDER - Học phí]',
  'Lịch dạy': '[PLACEHOLDER - Lịch dạy]',
  'Địa điểm': '[PLACEHOLDER - Địa điểm]',
  'SĐT': '0123456789',
  'Zalo': '0123456789',
};
