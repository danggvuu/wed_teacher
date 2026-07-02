import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { registerClass, getSchedule } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export function RegistrationForm({ teacher }) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const selectedTimeSlot = watch("timeSlot");

  useEffect(() => {
    async function loadSchedules() {
      if (!teacher || !teacher['ID']) {
        setLoadingSchedules(false);
        return;
      }
      try {
        const res = await getSchedule(teacher['ID']);
        if (res?.data) {
          setSchedules(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch học", err);
      } finally {
        setLoadingSchedules(false);
      }
    }
    loadSchedules();
  }, [teacher]);

  const fireConfetti = useCallback(() => {
    const defaults = {
      spread: 60,
      ticks: 80,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 25,
      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
    };

    confetti({ ...defaults, particleCount: 30, origin: { x: 0.3, y: 0.7 } });
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.7, y: 0.7 } });

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 20, origin: { x: 0.5, y: 0.6 }, spread: 80 });
    }, 150);
  }, []);

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
      // Fire confetti after a small delay for the success animation to start
      setTimeout(fireConfetti, 300);
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-10 text-center border border-green-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.25 }}
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-2xl font-bold text-slate-900 mb-3"
        >
          Đăng ký thành công! 🎉
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-slate-600 mb-4 max-w-md mx-auto"
        >
          Cảm ơn phụ huynh đã đăng ký. Thầy/Cô sẽ liên hệ trong thời gian sớm nhất để tư vấn chi tiết.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-sm text-slate-500 mb-8"
        >
          💬 Nếu cần gấp, phụ huynh có thể liên hệ qua Zalo để được hỗ trợ nhanh hơn.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button onClick={() => setSubmitStatus(null)} variant="outline">
            Đăng ký thêm học sinh khác
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center border border-red-100"
        >
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm">Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại hoặc liên hệ qua Zalo/SĐT.</p>
        </motion.div>
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

      <div className="space-y-5">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Khung giờ học mong muốn</label>
          {/* Ẩn input thực sự để dùng chung với hook-form */}
          <input type="hidden" {...register("timeSlot")} />
          
          {loadingSchedules ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải lịch học...
            </div>
          ) : schedules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((s, idx) => {
                const isFull = s['Trạng thái']?.toLowerCase().includes('kín');
                const isSelected = selectedTimeSlot === s['Mô tả'];
                
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (!isFull) {
                        setValue('timeSlot', s['Mô tả'], { shouldValidate: true });
                      }
                    }}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1
                      ${isFull 
                        ? 'border-slate-100 bg-slate-50 opacity-70 cursor-not-allowed' 
                        : isSelected 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                          {s['Mã Ca']}
                        </span>
                      </div>
                      {isFull && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                          Kín chỗ
                        </span>
                      )}
                      {isSelected && !isFull && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{s['Mô tả']}</span>
                    <span className="text-xs text-slate-500 mt-1">
                      Sĩ số: <strong className={isFull ? 'text-red-500' : ''}>{s['Sĩ số hiện tại'] || '0'}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Input
              placeholder="VD: Tối thứ 2, 4, 6 hoặc Cuối tuần"
              onChange={(e) => setValue('timeSlot', e.target.value)}
              value={selectedTimeSlot || ''}
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Mục tiêu học tập</label>
          <textarea
            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 input-glow min-h-[90px] resize-none"
            placeholder="VD: Cải thiện điểm số, Luyện thi đại học..."
            {...register("goal")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Ghi chú thêm</label>
          <textarea
            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 input-glow min-h-[90px] resize-none"
            placeholder="Các yêu cầu hoặc lưu ý khác..."
            {...register("note")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang gửi đăng ký...
          </span>
        ) : (
          'Xác nhận Đăng ký học'
        )}
      </Button>

      <p className="text-xs text-center text-slate-400 mt-4">
        🔒 Thông tin của bạn sẽ được bảo mật và chỉ dùng cho mục đích xếp lớp.
      </p>
    </form>
  );
}
