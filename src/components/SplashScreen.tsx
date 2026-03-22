import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CODE_LINES = [
    { indent: 0, tokens: [{ text: 'const ', color: '#569CD6' }, { text: 'planV', color: '#9CDCFE' }, { text: ' = {', color: '#D4D4D4' }] },
    { indent: 1, tokens: [{ text: 'ministerio', color: '#9CDCFE' }, { text: ': ', color: '#D4D4D4' }, { text: '"Heloim"', color: '#CE9178' }, { text: ',', color: '#D4D4D4' }] },
    { indent: 1, tokens: [{ text: 'mision', color: '#9CDCFE' }, { text: ': ', color: '#D4D4D4' }, { text: '"Transformar vidas"', color: '#CE9178' }, { text: ',', color: '#D4D4D4' }] },
    { indent: 1, tokens: [{ text: 'campamentos', color: '#9CDCFE' }, { text: ': [', color: '#D4D4D4' }] },
    { indent: 2, tokens: [{ text: '"Plan B"', color: '#CE9178' }, { text: ', ', color: '#D4D4D4' }, { text: '"Elohim"', color: '#CE9178' }, { text: ', ', color: '#D4D4D4' }, { text: '"Comitán"', color: '#CE9178' }] },
    { indent: 1, tokens: [{ text: ']', color: '#D4D4D4' }, { text: ',', color: '#D4D4D4' }] },
    { indent: 1, tokens: [{ text: 'inscripcion', color: '#9CDCFE' }, { text: ': ', color: '#D4D4D4' }, { text: 'true', color: '#569CD6' }] },
    { indent: 0, tokens: [{ text: '};', color: '#D4D4D4' }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ text: 'launch', color: '#DCDCAA' }, { text: '(planV); ', color: '#D4D4D4' }, { text: '// 🚀', color: '#6A9955' }] },
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [visibleLines, setVisibleLines] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        // Reveal lines one by one
        const interval = setInterval(() => {
            setVisibleLines(prev => {
                if (prev >= CODE_LINES.length) {
                    clearInterval(interval);
                    // After last line visible, wait then fade out
                    setTimeout(() => setDone(true), 500);
                    setTimeout(onComplete, 1100);
                    return prev;
                }
                return prev + 1;
            });
        }, 220);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E1E1E] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
        >
            {/* Ambient glow */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Editor Window */}
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5"
            >
                {/* Title Bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#2D2D30] border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                    </div>
                    <span className="flex-1 text-center text-xs text-gray-400 font-mono tracking-widest">planV.ts — Ministerio Heloim</span>
                </div>

                {/* Editor Body */}
                <div className="bg-[#1E1E1E] p-5 font-mono text-sm min-h-[240px]">
                    {/* Line numbers + code */}
                    {CODE_LINES.slice(0, visibleLines).map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex gap-4 leading-7"
                        >
                            <span className="select-none text-gray-600 text-right w-5 shrink-0">{i + 1}</span>
                            <span>
                                {' '.repeat(line.indent * 2)}
                                {line.tokens.map((tok, j) => (
                                    <span key={j} style={{ color: tok.color }}>{tok.text}</span>
                                ))}
                                {/* Blinking cursor on last visible line */}
                                {i === visibleLines - 1 && !done && (
                                    <motion.span
                                        className="inline-block w-[2px] h-[14px] bg-white align-middle ml-0.5"
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    />
                                )}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-primary text-white text-xs font-mono">
                    <span>● TypeScript</span>
                    <AnimatePresence mode="wait">
                        {!done ? (
                            <motion.span key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                Iniciando campamento...
                            </motion.span>
                        ) : (
                            <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-200">
                                ✓ Listo
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <span>UTF-8</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
