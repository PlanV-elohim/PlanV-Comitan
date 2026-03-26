import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const { dark, toggle } = useTheme();

    return (
        <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center justify-center transition-all ${className}`}
            aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            <motion.div
                initial={false}
                animate={{ rotate: dark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {dark ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-400" />
                )}
            </motion.div>
        </motion.button>
    );
}
