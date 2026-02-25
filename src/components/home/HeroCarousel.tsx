import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Imports for Web Images
import web1 from '@/assets/hero-carrosel/web/arte-1.png';
import web2 from '@/assets/hero-carrosel/web/arte-2.png';
import web3 from '@/assets/hero-carrosel/web/arte-3.png';
import web4 from '@/assets/hero-carrosel/web/arte-4.png';

// Imports for Mobile Images
import mobile1 from '@/assets/hero-carrosel/mobile/arte-1-mobile.png';
import mobile2 from '@/assets/hero-carrosel/mobile/arte-2-mobile.png';
import mobile3 from '@/assets/hero-carrosel/mobile/arte-3-mobile.png';
import mobile4 from '@/assets/hero-carrosel/mobile/arte-4-mobile.png';

const SLIDES = [
  { type: 'component', id: 'hero-content' },
  { type: 'image', id: 'slide-1', web: web1, mobile: mobile1 },
  { type: 'image', id: 'slide-2', web: web2, mobile: mobile2 },
  { type: 'image', id: 'slide-3', web: web3, mobile: mobile3 },
  { type: 'image', id: 'slide-4', web: web4, mobile: mobile4 },
];

interface HeroCarouselProps {
  children: React.ReactNode;
}

export function HeroCarousel({ children }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 12000); // 12 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950 aspect-[4/5] md:aspect-auto md:h-[600px]">
       <AnimatePresence mode="wait">
        <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
        >
            {SLIDES[current].type === 'component' ? (
                <div className="w-full h-full relative">
                    {children}
                </div>
            ) : (
                <div className="w-full h-full relative">
                     {/* Mobile Image */}
                    <img 
                        src={SLIDES[current].mobile} 
                        alt="Slide" 
                        className="w-full h-full object-cover md:hidden"
                    />
                    {/* Web Image */}
                    <img 
                        src={SLIDES[current].web} 
                        alt="Slide" 
                        className="w-full h-full object-cover hidden md:block"
                    />
                </div>
            )}
        </motion.div>
       </AnimatePresence>
       
       {/* Navigation Buttons */}
       <button onClick={prev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 text-white/50 hover:text-white p-2 transition-colors bg-black/20 rounded-full md:bg-transparent">
         <ChevronLeft size={32} />
       </button>
       <button onClick={next} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 text-white/50 hover:text-white p-2 transition-colors bg-black/20 rounded-full md:bg-transparent">
         <ChevronRight size={32} />
       </button>

       {/* Indicators */}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
         {SLIDES.map((_, idx) => (
           <button
             key={idx}
             onClick={() => setCurrent(idx)}
             className={`h-2 rounded-full transition-all duration-300 ${
               current === idx ? 'bg-primary w-8' : 'bg-white/30 w-2 hover:bg-white/50'
             }`}
           />
         ))}
       </div>
    </div>
  );
}
