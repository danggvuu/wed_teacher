import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export function FloatingContact() {
  const zaloLink = "https://zalo.me/0123456789";
  const phoneStr = "0123456789";

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Zalo Button */}
      <motion.a
        href={zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0068FF]/30"
        aria-label="Chat Zalo"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#0068FF] animate-ping opacity-20"></span>
        <MessageCircle className="w-7 h-7 text-white relative z-10" />
      </motion.a>

      {/* Phone Button */}
      <motion.a
        href={`tel:${phoneStr}`}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
        aria-label="Gọi điện thoại"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Phone className="w-6 h-6 text-white" />
      </motion.a>
    </div>
  );
}
