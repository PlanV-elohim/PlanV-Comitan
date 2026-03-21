import { motion } from 'motion/react';

export function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-12">
          <motion.div 
            animate={{ opacity: [0.4, 0.7, 0.4] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded-full" 
          />
          <motion.div 
            animate={{ opacity: [0.4, 0.7, 0.4] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-64 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" 
          />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-full h-64 bg-gray-100 dark:bg-gray-900 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SingleColumnSkeleton({ height }: { height?: string }) {
  return (
    <div className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          animate={{ opacity: [0.4, 0.7, 0.4] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-48 h-10 mx-auto bg-gray-200 dark:bg-gray-800 rounded-xl mb-12" 
        />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="w-full h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
