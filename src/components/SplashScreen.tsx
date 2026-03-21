import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center flex flex-col items-center"
            >
                <div className="w-24 h-24 border-4 border-primary rounded-full flex items-center justify-center mb-8 relative">
                    <motion.div
                        className="absolute inset-0 border-4 border-primary rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-4xl font-bold text-white tracking-tighter">PV</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2 flex items-center gap-3">
                    <div className="flex">
                        {"PLAN".split("").map((letter, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ 
                                    duration: 0.8, 
                                    delay: i * 0.1,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                    <motion.span 
                        initial={{ opacity: 0, scale: 2, rotate: -20, filter: "blur(20px)" }}
                        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.6, ease: "backOut" }}
                        className="text-primary relative"
                    >
                        V
                        <motion.div 
                            className="absolute inset-0 bg-primary blur-2xl opacity-50 -z-10"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.span>
                </h1>
                <motion.p 
                    initial={{ opacity: 0, letterSpacing: "1em" }}
                    animate={{ opacity: 1, letterSpacing: "0.2em" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="text-xl md:text-2xl font-light uppercase text-gray-400 mb-12"
                >
                    Ministerio Heloim
                </motion.p>

                <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
