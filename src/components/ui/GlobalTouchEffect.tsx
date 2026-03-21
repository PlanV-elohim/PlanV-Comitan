import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const GlobalTouchEffect: React.FC = () => {
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        // Only trigger these ripples on touch devices (pointer: coarse)
        if (typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const handleTouch = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const newRipple = {
                    id: Date.now() + Math.random(),
                    x: touch.clientX,
                    y: touch.clientY
                };
                
                setRipples(prev => [...prev, newRipple]);
                
                // Cleanup ripple after animation
                setTimeout(() => {
                    setRipples(prev => prev.filter(r => r.id !== newRipple.id));
                }, 800);
            }
        };

        window.addEventListener('touchstart', handleTouch, { passive: true });
        
        return () => {
            window.removeEventListener('touchstart', handleTouch);
        };
    }, []);

    // If not a touch device, don't render anything
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches) {
        return null;
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.div
                        key={ripple.id}
                        initial={{ 
                            opacity: 0.8, 
                            scale: 0, 
                            x: ripple.x - 24, 
                            y: ripple.y - 24 
                        }}
                        animate={{ 
                            opacity: 0, 
                            scale: 2.5,
                            x: ripple.x - 24, 
                            y: ripple.y - 24 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="absolute left-0 top-0 w-12 h-12 border-2 border-primary rounded-full bg-primary/20 pointer-events-none"
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GlobalTouchEffect;
