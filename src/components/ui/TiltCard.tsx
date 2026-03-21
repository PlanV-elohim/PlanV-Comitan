import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import React, { useRef } from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 100 };
    const mouseXSpring = useSpring(x, springConfig);
    const mouseYSpring = useSpring(y, springConfig);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        const width = rect.width;
        const height = rect.height;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                rotateX, 
                rotateY, 
                transformStyle: "preserve-3d",
                perspective: "1000px" 
            }}
            className={`w-full h-full relative cursor-pointer ${className}`}
            whileHover={{ scale: 1.02 }}
        >
            {/* translateZ(30px) creates the 3D pop-out effect for the children when the card tilts */}
            <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="w-full h-full">
                {children}
            </div>
            
            {/* Optional subtle light glare effect that moves with the mouse */}
            <motion.div 
                className="pointer-events-none absolute inset-0 z-50 rounded-[inherit] mix-blend-overlay"
                style={{
                    background: useTransform(
                        [mouseXSpring, mouseYSpring],
                        ([mx, my]: any) => {
                            const xPos = (mx + 0.5) * 100;
                            const yPos = (my + 0.5) * 100;
                            return `radial-gradient(circle at ${xPos}% ${yPos}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
                        }
                    )
                }}
            />
        </motion.div>
    );
};

export default TiltCard;
