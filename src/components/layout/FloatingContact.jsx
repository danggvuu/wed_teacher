import { MessageCircle, Phone } from 'lucide-react';

export function FloatingContact() {
  // Thay thế bằng link zalo thật và SĐT thật
  const zaloLink = "https://zalo.me/0123456789"; 
  const phoneStr = "0123456789";

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Zalo Button */}
      <a 
        href={zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-float shadow-[#0068FF]/30"
        aria-label="Chat Zalo"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
      
      {/* Phone Button */}
      <a 
        href={`tel:${phoneStr}`}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform shadow-green-500/30"
        aria-label="Gọi điện thoại"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
