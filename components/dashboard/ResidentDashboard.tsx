import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Smartphone, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import MyLockersPreview, { MyLockerItem, Locker } from './MyLockersPreview';
import AvailableLockersPreview from './AvailableLockersPreview';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as Error & { info?: unknown; status?: number };
    try { error.info = await res.json(); } catch { /* ignore */ }
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API returned an error");
  return json.data;
};

export default function ResidentDashboard({
  onNavigate,
}: { onNavigate: (page: string, locker?: Locker) => void }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Fetch myLockers count for the banner
  const { data } = useSWR<MyLockerItem[]>(
    session?.user?.id ? `/api/lockers/resident/mylocker` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const myLockers = data || [];

  const userName = session?.user?.name;

  // Draggable Carousel states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const slides = useMemo(() => [
    {
      title: "Quản lý tủ thông minh, trong tầm tay bạn",
      description: "Theo dõi trạng thái, mở tủ từ xa và nhận thông báo realtime ngay trên dashboard.",
      cta1: { text: "Tìm tủ ngay", action: () => onNavigate('register-locker') },
      cta2: { text: "Tìm hiểu thêm", action: () => router.push('/HowItWorks') },
      image: "https://i.pinimg.com/1200x/37/58/ff/3758ff1aff31ae34b2005e98f3fb72eb.jpg",
      icon: <Smartphone className="w-6 h-6" />,
      iconText: "VLocker"
    },
    {
      title: `Chào ${userName || 'bạn'}`,
      description: `Bạn đang sử dụng ${myLockers.length} tủ, nếu bạn muốn sử dụng thêm hãy đăng ký tủ mới liền nha!`,
      cta1: { text: "Xem tủ của tôi", action: () => onNavigate('my-lockers') },
      cta2: { text: "Xem lịch sử", action: () => onNavigate('history') },
      image: "https://i.pinimg.com/1200x/03/98/03/039803e9538226f3dd913cf3b7246771.jpg",
      icon: <UserIcon className="w-6 h-6" />,
      iconText: "Cá nhân hoá"
    }
  ], [userName, myLockers.length, onNavigate, router]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    intervalRef.current = setInterval(nextSlide, 30000);
  }, [nextSlide, stopAutoSlide]);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [startAutoSlide, stopAutoSlide, slides.length]);

  // Xử lý trạng thái tải session
  if (status === "loading") {
    return <div className="p-6 max-w-7xl mx-auto">Đang tải phiên làm việc...</div>;
  }
  if (!session?.user) {
    return <div className="p-6 max-w-7xl mx-auto text-red-600">Lỗi: Không thể tải dữ liệu người dùng. Vui lòng đăng nhập lại.</div>;
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    stopAutoSlide();
    dragStartRef.current = e.clientX;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const offset = e.clientX - dragStartRef.current;
    setDragOffset(offset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
    startAutoSlide();

    const threshold = 50;
    if (dragOffset > threshold) {
      prevSlide();
    } else if (dragOffset < -threshold) {
      nextSlide();
    }
    
    setDragOffset(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Carousel Banner */}
      <Card className="relative bg-gradient-to-r from-neutral-700 to-neutral-900 text-white overflow-hidden min-h-[320px] rounded-2xl group select-none cursor-grab active:cursor-grabbing">
        <div
          className={`flex h-full ${!isDragging ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="grid md:grid-cols-2 gap-8 items-center h-full px-10 md:px-20 py-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {slide.icon}
                    <span className="text-grey-100">{slide.iconText}</span>
                  </div>
                  <h2 className="text-white mb-4 text-2xl font-bold" style={{ whiteSpace: 'pre-line' }}>
                    {slide.title}
                  </h2>
                  <p className="text-grey-500 mb-6" style={{ whiteSpace: 'pre-line' }}>
                    {slide.description}
                  </p>
                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={slide.cta1.action}>
                      {slide.cta1.text}
                    </Button>
                    <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-neutral-800" onClick={slide.cta2.action}>
                      {slide.cta2.text}
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block relative h-full">
                  <ImageWithFallback
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}`} // No change needed here
            />
          ))}
        </div>
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/10 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/10 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </Card>

      {/* My Lockers Section */}
      <MyLockersPreview onNavigate={onNavigate} />

      {/* Available Lockers Section */}
      <AvailableLockersPreview onNavigate={onNavigate} />
    </div>
  );
}