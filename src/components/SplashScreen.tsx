import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
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

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">
                    PLAN <span className="text-primary">V</span>
                </h1>
                <p className="text-xl md:text-2xl font-light tracking-widest uppercase text-gray-400 mb-12">
                    Elohim
                </p>

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
