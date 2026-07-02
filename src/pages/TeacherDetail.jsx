import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useInView, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingContact } from '../components/layout/FloatingContact';
import { RegistrationForm } from '../components/sections/RegistrationForm';
import { getTeacher, getTestimonials } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import {
  Award, BookOpen, Clock, MapPin, Users, CheckCircle2,
  ChevronDown, Star, TrendingUp, BookCheck, ChevronLeft, ChevronRight, ArrowUp
} from 'lucide-react';

/* ========== Animation Variants ========== */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

/* ========== Animated Counter Component ========== */
function AnimatedCounter({ value, suffix = '', prefix = '', duration = 1.5 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const numericValue = parseFloat(value) || 0;
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 25,
    duration: duration * 1000,
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (Number.isInteger(numericValue)) {
        setDisplayValue(Math.round(latest).toString());
      } else {
        setDisplayValue(latest.toFixed(1));
      }
    });
    return unsubscribe;
  }, [springValue, numericValue]);

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

/* ========== FAQ Accordion Item ========== */
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden card-hover">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <span className="font-semibold text-slate-900 pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========== Star Rating with Fill Animation ========== */
function AnimatedStars({ inView, count = 5 }) {
  // Đảm bảo count hợp lệ từ 1-5
  const validCount = Math.max(1, Math.min(5, count));
  
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: validCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.35, type: 'spring', stiffness: 400 }}
        >
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </motion.div>
      ))}
    </div>
  );
}

/* ========== Testimonial Card Component ========== */
function TestimonialCard({ item }) {
  const testimonialRef = useRef(null);
  const isInView = useInView(testimonialRef, { once: true });

  return (
    <Card glass className="h-full border-slate-100" ref={testimonialRef}>
      <CardContent className="p-7">
        <AnimatedStars inView={isInView} count={item.stars || 5} />
        <p className="text-slate-600 italic mt-5 mb-6 leading-relaxed">"{item.content}"</p>
        <div className="flex items-center gap-3">
          <div className="avatar-gradient-ring">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
              {item.author.charAt(item.author.length - 1)}
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{item.author}</p>
            <p className="text-xs text-slate-500">{item.detail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ========== Main Component ========== */
export default function TeacherDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [teacherRes, testimonialsRes] = await Promise.all([
          getTeacher(slug),
          getTestimonials(slug).catch(() => ({ data: [] }))
        ]);
        
        if (teacherRes?.data) {
          setTeacher(teacherRes.data);
        } else {
          setTeacher(mockTeacher);
        }

        if (testimonialsRes?.data && testimonialsRes.data.length > 0) {
          setTestimonials(testimonialsRes.data.map(t => ({
            content: t['Nội dung'] || '',
            author: t['Tên'] || '',
            detail: t['Chi tiết'] || '',
            stars: parseInt(t['Số sao']) || 5
          })));
        } else {
          setTestimonials(mockTestimonials);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin", err);
        setTeacher(mockTeacher);
        setTestimonials(mockTestimonials);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const faqs = [
    { q: "Lớp học có bao nhiêu bạn?", a: "Mỗi lớp từ 5 – 8 bạn để đảm bảo giáo viên có thể kèm sát từng em. Ngoài ra có hình thức 1 kèm 1 cho học sinh cần bổ sung chuyên sâu." },
    { q: "Có được học thử trước không?", a: "Có! Mỗi học sinh được học thử 1 – 2 buổi hoàn toàn miễn phí để trải nghiệm phương pháp trước khi đăng ký chính thức." },
    { q: "Thanh toán học phí như thế nào?", a: "Phụ huynh đóng theo tháng (4 buổi/tháng). Hỗ trợ chuyển khoản hoặc tiền mặt. Minh bạch, không phát sinh phí ẩn." },
    { q: "Giáo viên có cam kết đầu ra không?", a: "Cam kết: học sinh sẽ tiến bộ rõ rệt sau 2 – 3 tháng theo học. Nếu không tiến bộ, hỗ trợ thêm buổi miễn phí." },
    { q: "Con tôi học yếu, có theo kịp không?", a: "Hoàn toàn có thể. Giáo viên xây dựng giáo án riêng cho từng em theo năng lực, kiên nhẫn hướng dẫn từ cơ bản." },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 animate-pulse">Đang tải...</p>
        </div>
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
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative pt-20 pb-24 overflow-hidden">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="gradient-blob gradient-blob-1"></div>
            <div className="gradient-blob gradient-blob-2"></div>
            <div className="gradient-blob gradient-blob-3"></div>
            <div className="absolute inset-0 dot-grid"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">
              <motion.div
                className="w-full md:w-1/2"
                initial="hidden" animate="visible" variants={staggerContainer}
              >
                <motion.div variants={staggerItem}>
                  <span className="inline-block bg-blue-100/80 text-blue-800 font-semibold px-4 py-1.5 rounded-full text-sm mb-6 backdrop-blur-sm">
                    {teacher['Môn dạy'] || '[PLACEHOLDER - Môn/Cấp lớp]'}
                  </span>
                </motion.div>

                <motion.h1
                  variants={staggerItem}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight"
                >
                  {teacher['Tên'] || '[PLACEHOLDER - Tên Giáo Viên]'}
                </motion.h1>

                <motion.p
                  variants={staggerItem}
                  className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed"
                >
                  Đồng hành cùng học sinh chinh phục môn Toán, xây dựng tư duy logic và sự tự tin để bứt phá điểm số trong các kỳ thi quan trọng.
                </motion.p>

                <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#dang-ky"
                    className="inline-flex items-center justify-center h-13 px-8 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-[0.97] btn-glow"
                  >
                    Đăng ký học thử miễn phí
                  </a>
                  <a
                    href="#gioi-thieu"
                    className="inline-flex items-center justify-center h-13 px-8 rounded-xl bg-white/80 backdrop-blur text-slate-700 font-semibold hover:bg-white transition-all duration-300 border border-slate-200 hover:-translate-y-0.5"
                  >
                    Tìm hiểu thêm
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 relative"
                initial={{ opacity: 0, scale: 0.9, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Teacher image with rotating gradient border */}
                <div className="teacher-image-frame">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-slate-300/40 relative">
                    <img
                      src={teacher['Ảnh'] || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"}
                      alt={teacher['Tên']}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 pt-16 text-white">
                      <p className="font-semibold text-lg">{teacher['Kinh nghiệm'] || '[PLACEHOLDER - Kinh nghiệm]'}</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -left-4 md:-left-8 bottom-8 glass-card p-4 rounded-2xl flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="bg-yellow-100 p-2.5 rounded-xl">
                    <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">100%</p>
                    <p className="text-xs text-slate-500 font-medium">Học sinh tiến bộ</p>
                  </div>
                </motion.div>

                {/* Second floating badge */}
                <motion.div
                  className="absolute -right-2 md:-right-6 top-12 glass-card p-3 rounded-2xl flex items-center gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  style={{ animation: 'float 4s ease-in-out 1s infinite' }}
                >
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Đã xác minh</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================== GIỚI THIỆU & THÀNH TÍCH ==================== */}
        <section id="gioi-thieu" className="py-24 bg-white relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 lg:gap-20">
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
              >
                <motion.div variants={staggerItem}>
                  <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Giới thiệu</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6">
                    Về {teacher['Tên']}
                  </h2>
                </motion.div>

                <motion.div variants={staggerItem} className="prose text-slate-600">
                  <p className="mb-4 leading-relaxed">
                    Với phương pháp giảng dạy hiện đại, trực quan, {teacher['Tên']} luôn biến những khái niệm Toán học phức tạp trở nên đơn giản và dễ hiểu nhất đối với từng học sinh.
                  </p>
                  <p className="leading-relaxed">
                    Triết lý: <strong className="text-slate-900">"Không có học sinh yếu, chỉ có học sinh chưa tìm đúng phương pháp."</strong>
                  </p>
                </motion.div>

                <motion.div variants={staggerItem} className="mt-10 space-y-5">
                  <div className="flex items-start gap-4 group">
                    <div className="bg-blue-50 p-2.5 rounded-xl shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Bằng cấp / Chứng chỉ</h4>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{teacher['Bằng cấp'] || '[PLACEHOLDER - Bằng cấp, VD: Cử nhân Sư phạm Toán ĐHSP HN]'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="bg-blue-50 p-2.5 rounded-xl shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Thành tích nổi bật</h4>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{teacher['Thành tích'] || '[PLACEHOLDER - Thành tích, VD: 90% HS đỗ NV1, nhiều HS đạt giải HSG]'}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Stats Cards with animated counters */}
              <motion.div
                className="grid grid-cols-2 gap-5"
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
              >
                <motion.div variants={staggerItem}>
                  <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100/50 h-full">
                    <CardContent className="p-7 text-center flex flex-col items-center justify-center h-full">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Users className="w-9 h-9 text-blue-500 mb-4" />
                      </motion.div>
                      <h3 className="text-4xl font-black text-slate-900 mb-1">
                        <AnimatedCounter value={500} suffix="+" />
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">Học sinh theo học</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100/50 h-full">
                    <CardContent className="p-7 text-center flex flex-col items-center justify-center h-full">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      >
                        <BookCheck className="w-9 h-9 text-purple-500 mb-4" />
                      </motion.div>
                      <h3 className="text-4xl font-black text-slate-900 mb-1">
                        <AnimatedCounter value={8.5} suffix="+" />
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">Điểm thi trung bình</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={staggerItem} className="col-span-2">
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100/50">
                    <CardContent className="p-7 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Phương pháp cá nhân hóa</h3>
                        <p className="text-sm text-slate-500">Giáo án riêng cho từng năng lực học sinh</p>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                        className="bg-green-100 p-3 rounded-full"
                      >
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================== THÔNG TIN LỚP HỌC ==================== */}
        <section id="lop-hoc" className="py-24 bg-slate-50 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeInUp}
            >
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Lớp học</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Thông Tin Lớp Học</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Đa dạng hình thức phù hợp với nhu cầu của từng học sinh.</p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {[
                { icon: MapPin, title: 'Địa điểm / Hình thức', desc: teacher['Địa điểm'] || '[PLACEHOLDER - Địa điểm dạy offline hoặc Online]', color: 'blue' },
                { icon: Users, title: 'Sĩ số', desc: '[PLACEHOLDER - Sĩ số: 1 kèm 1, nhóm 5-7 bạn, hoặc lớp đông]', color: 'purple' },
                { icon: Clock, title: 'Lịch dạy', desc: teacher['Lịch dạy'] || '[PLACEHOLDER - Lịch: Các buổi tối trong tuần & Cuối tuần]', color: 'pink' }
              ].map((item, i) => {
                const colorMap = {
                  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100/50' },
                  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100/50' },
                  pink: { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-100/50' },
                };
                const c = colorMap[item.color];
                return (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className={`glass-card rounded-2xl p-8 text-center border ${c.border}`}
                  >
                    <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                      <item.icon className={`w-7 h-7 ${c.icon}`} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ==================== HỌC PHÍ ==================== */}
        <section id="hoc-phi" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -top-48 -right-48"></div>
            <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -bottom-32 -left-32"></div>
          </div>

          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={staggerItem}>
                <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Đầu tư cho tương lai</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Học phí minh bạch</h2>
                <p className="text-slate-400 mb-14 max-w-2xl mx-auto">
                  Cam kết chất lượng tương xứng với học phí. Phụ huynh có thể tham khảo mức học phí chi tiết bên dưới.
                </p>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="glass-card-dark rounded-3xl p-8 md:p-12 mx-auto max-w-3xl"
              >
                <div className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {teacher['Học phí'] || '[PLACEHOLDER - Học phí, VD: 200k/buổi (nhóm), 350k/buổi (1-1)]'}
                </div>
                <ul className="space-y-4 text-left max-w-md mx-auto mb-10">
                  {[
                    'Được học thử 1-2 buổi miễn phí',
                    'Kiểm tra năng lực đầu vào miễn phí',
                    'Hỗ trợ giải đáp bài tập 24/7 qua Zalo'
                  ].map((text, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center text-slate-300"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0" />
                      {text}
                    </motion.li>
                  ))}
                </ul>
                <a
                  href="#dang-ky"
                  className="inline-flex items-center justify-center h-13 px-10 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Đăng ký ngay
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ==================== ĐÁNH GIÁ (TESTIMONIALS) ==================== */}
        <section id="danh-gia" className="py-24 bg-white relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              className="text-center mb-14"
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeInUp}
            >
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Đánh giá</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Phụ huynh & Học sinh nói gì?</h2>
            </motion.div>

            {/* Desktop: 3 cards grid */}
            <motion.div
              className="hidden md:grid md:grid-cols-3 gap-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {testimonials.map((item, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <TestimonialCard item={item} />
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile: Carousel */}
            <div className="md:hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card glass className="border-slate-100">
                    <CardContent className="p-7">
                      <div className="flex gap-0.5 mb-4">
                        {[0, 1, 2, 3, 4].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                      </div>
                      <p className="text-slate-600 italic mb-6 leading-relaxed">"{testimonials[currentTestimonial].content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="avatar-gradient-ring">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {testimonials[currentTestimonial].author.charAt(testimonials[currentTestimonial].author.length - 1)}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{testimonials[currentTestimonial].author}</p>
                          <p className="text-xs text-slate-500">{testimonials[currentTestimonial].detail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={prevTestimonial} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" aria-label="Previous">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-blue-600 w-6' : 'bg-slate-300'}`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button onClick={nextTestimonial} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" aria-label="Next">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FAQ ==================== */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              className="text-center mb-14"
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeInUp}
            >
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Câu hỏi thường gặp</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Phụ huynh thường hỏi gì?</h2>
            </motion.div>

            <motion.div
              className="space-y-3"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <FAQItem
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openFAQ === i}
                    onClick={() => setOpenFAQ(openFAQ === i ? -1 : i)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==================== ĐĂNG KÝ HỌC ==================== */}
        <section id="dang-ky" className="py-24 bg-white relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeInUp}
              className="rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute w-40 h-40 bg-white/10 rounded-full -top-10 -left-10 blur-xl"></div>
                  <div className="absolute w-32 h-32 bg-white/5 rounded-full bottom-0 right-10 blur-lg"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 relative z-10">Đăng Ký Học</h2>
                <p className="text-blue-100 relative z-10 max-w-lg mx-auto">Điền thông tin bên dưới để được tư vấn và xếp lớp phù hợp nhất.</p>
              </div>
              <div className="p-8 md:p-12 bg-slate-50/80">
                <RegistrationForm teacher={teacher} />
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
      <FloatingContact />

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5 text-slate-600" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

const mockTeacher = {
  "Tên": "Thầy / Cô [Tên]",
  "Môn dạy": "[Môn]",
  "Cấp lớp": "[Cấp lớp]",
  "Kinh nghiệm": "[X] năm",
  "Bằng cấp": "[Bằng cấp]",
  "Thành tích": "[Thành tích nổi bật]",
  "Học phí": "[Học phí]",
  "Lịch dạy": "[Lịch dạy]",
  "Địa điểm": "[Địa điểm]",
  "SĐT": "[SĐT]",
  "Zalo": "[Zalo]",
  "Facebook": "[Link Facebook]"
};

const mockTestimonials = [
  { content: "[PLACEHOLDER - Review 1: 'Cô dạy rất nhiệt tình, con tôi từ sợ môn Toán giờ đã thích học và điểm cải thiện rõ rệt.']", author: "Phụ huynh em Linh", detail: "Lớp 9", stars: 5 },
  { content: "[PLACEHOLDER - Review 2: 'Bài giảng của thầy rất dễ hiểu, có nhiều mẹo giải nhanh giúp em tiết kiệm thời gian làm bài thi.']", author: "Học sinh Minh", detail: "Lớp 12", stars: 5 },
  { content: "[PLACEHOLDER - Review 3: 'Lớp học không quá đông nên cô kèm cặp sát sao, bài tập về nhà được chấm chữa chi tiết.']", author: "Phụ huynh em Nam", detail: "Lớp 6", stars: 5 },
];

/* ========== Helper Animation Components ========== */
