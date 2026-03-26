import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { supabaseApi } from '../lib/api';

const FALLBACK_BG = '';

export default function Hero() {
    const ref = useRef(null);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Static motion values used on mobile (no scroll listener)
    const staticY = useMotionValue('0%');
    const staticOpacity = useMotionValue(1);

    // Parallax only on desktop
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const parallaxOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const y = isMobile ? staticY : parallaxY;
    const opacity = isMobile ? staticOpacity : parallaxOpacity;
    const [heroBg, setHeroBg] = useState(FALLBACK_BG);
    const [heroMobileBg, setHeroMobileBg] = useState(FALLBACK_BG);
    const [imageHasTextDesktop, setImageHasTextDesktop] = useState(false);
    const [imageHasTextMobile, setImageHasTextMobile] = useState(false);

    useEffect(() => {
        Promise.all([
            // Desktop
            supabaseApi.gallery.getAll('hero_bg'),
            supabaseApi.gallery.getAll('hero_bg_text'),
            // Mobile
            supabaseApi.gallery.getAll('hero_mobile'),
            supabaseApi.gallery.getAll('hero_mobile_text'),
        ]).then(([desktopNormal, desktopText, mobileNormal, mobileText]) => {
            
            // --- DESKTOP HERO ---
            const activeDesktopNormal = desktopNormal.find((i: any) => i.is_active);
            const activeDesktopText = desktopText.find((i: any) => i.is_active);
            if (activeDesktopText?.image_url) {
                setHeroBg(activeDesktopText.image_url);
                setImageHasTextDesktop(true);
            } else if (activeDesktopNormal?.image_url) {
                setHeroBg(activeDesktopNormal.image_url);
                setImageHasTextDesktop(false);
            }

            // --- MOBILE HERO ---
            const activeMobileNormal = mobileNormal.find((i: any) => i.is_active);
            const activeMobileText = mobileText.find((i: any) => i.is_active);
            if (activeMobileText?.image_url) {
                setHeroMobileBg(activeMobileText.image_url);
                setImageHasTextMobile(true);
            } else if (activeMobileNormal?.image_url) {
                setHeroMobileBg(activeMobileNormal.image_url);
                setImageHasTextMobile(false);
            } else {
                // Fallback: If no mobile image uploaded, use desktop image for mobile too
                setHeroMobileBg(activeDesktopText?.image_url || activeDesktopNormal?.image_url || FALLBACK_BG);
                setImageHasTextMobile(Boolean(activeDesktopText?.image_url));
            }

        }).catch(() => {});
    }, []);

    return (
        <section id="inicio" ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-black">
            {/* Background Container */}
            <motion.div style={{ y, willChange: "transform" }} className="absolute inset-0 z-0 bg-black">
                {/* Desktop Image with Gradient Fade */}
                <div className="absolute right-0 top-0 bottom-0 w-[66%] hidden md:block">
                    <div
                        style={{ backgroundImage: `url(${heroBg})` }}
                        className="w-full h-full bg-contain bg-right lg:bg-center bg-no-repeat"
                    />
                    {/* Seamless fade mask from solid black on the left to transparent */}
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />
                    {/* Top fade for transparent navbar eligibility - deeper and smoother */}
                    <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
                    {/* Optional full dim if imageHasText */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${imageHasTextDesktop ? 'bg-black/30' : 'bg-transparent'}`} />
                </div>
                
                {/* Mobile Image with fade overlay */}
                <div
                    style={{ backgroundImage: `url(${heroMobileBg})` }}
                    className="w-full h-full absolute top-0 bg-contain bg-top bg-no-repeat block md:hidden"
                />
                {/* Mobile fade overlays */}
                <div className="absolute inset-0 block md:hidden pointer-events-none">
                    {/* Dark tint */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${imageHasTextMobile ? 'bg-black/40' : 'bg-black/50'}`} />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black via-black/70 to-transparent" />
                    {/* Side fades */}
                    <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-black to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-black to-transparent" />
                    {/* Top fade near navbar - even deeper and smoother for h-20 navbar */}
                    <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black/95 via-black/70 to-transparent" />
                </div>
            </motion.div>

            {/* Overlay text — hidden when the image already has text (controlled by CSS) */}
            <motion.div
                style={{ opacity, willChange: "opacity" }}
                className={`absolute inset-0 z-10 pointer-events-none flex justify-center w-full ${imageHasTextMobile ? 'hidden md:flex' : ''} ${imageHasTextDesktop ? 'md:hidden' : ''}`}
            >
                <div className="w-full max-w-7xl px-6 pt-[105px] md:pt-[110px] flex justify-center md:justify-start">
                        <div className="w-full md:w-1/3 text-center md:text-left relative z-20">
                            <motion.h1
                                initial="hidden"
                                animate="visible"
                                className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-wide text-white drop-shadow-[0_4px_35px_rgba(0,0,0,1)] flex flex-col items-center md:items-start"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                <span className="block mb-2 text-center md:text-left">
                                    {"Descubre tu".split("").map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.05, delay: i * 0.3 }}
                                            className="inline-block"
                                        >
                                            {char === " " ? "\u00A0" : char}
                                        </motion.span>
                                    ))}
                                    {/* Typewriter Cursor */}
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 1] }}
                                        className="inline-block w-[3px] h-8 md:h-12 lg:h-16 bg-red-600 ml-1 align-bottom"
                                    />
                                </span>
                                <motion.span 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 3.8, duration: 0.5 }}
                                    className="relative overflow-hidden inline-block px-4 py-1 bg-red-600 text-white italic rounded-sm shadow-lg whitespace-nowrap group"
                                >
                                    Propósito
                                    {/* Premium Shine Effect */}
                                    <motion.div
                                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
                                        initial={{ x: '-150%' }}
                                        animate={{ x: '150%' }}
                                        transition={{ 
                                            duration: 1.2, 
                                            ease: "easeInOut",
                                            repeat: Infinity, 
                                            repeatDelay: 5,
                                            delay: 5.0
                                        }}
                                    />
                                </motion.span>
                            </motion.h1>
                        </div>
                    </div>
            </motion.div>

            {/* Scroll indicator — always visible */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
                >
                    <div className="w-1.5 h-3 bg-white/60 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}

