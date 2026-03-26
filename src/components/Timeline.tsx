import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, MapPin } from 'lucide-react';
import { supabaseApi } from '../lib/api';

const TimelineItem = ({ camp, index }: { camp: any; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group w-full mb-16 last:mb-0">
      
      {/* Icon Node */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.1, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
        style={{ willChange: "transform, opacity" }}
        className="absolute left-[2.25rem] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center z-10 border-4 border-white dark:border-gray-950 shadow-[0_0_15px_rgba(234,88,12,0.5)] transition-colors"
      >
        <div className="w-2.5 h-2.5 bg-white rounded-full" />
      </motion.div>

      {/* Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1, margin: "-100px" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        style={{ willChange: "transform, opacity" }}
        className={`w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] ml-auto md:ml-0 ${isEven ? 'md:pr-12' : 'md:pl-12'} relative`}
      >
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden group-hover:border-primary/30">
          
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Image */}
          <div className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden mb-6 z-10">
            <img 
              src={camp.image_url || 'https://picsum.photos/seed/' + camp.id + '/800/600'} 
              alt={camp.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-block px-3 py-1 bg-primary rounded-full text-xs font-bold tracking-wider uppercase mb-2">
                {camp.year}
              </span>
              <h3 className="text-xl md:text-2xl font-bold leading-tight">{camp.title}</h3>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{camp.date_string || camp.year}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{camp.location}</span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {camp.description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function Timeline() {
  const containerRef = useRef(null);
  const [events, setEvents] = useState<any[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    supabaseApi.timeline.getAll()
      .then((data: any[]) => setEvents(data))
      .catch((err: Error) => console.error("Error loading timeline:", err));
  }, []);

  if (events.length === 0) return null;

  return (
    <section id="historia" className="py-20 md:py-32 relative bg-gray-50 dark:bg-gray-950/50 overflow-hidden transition-colors duration-300">
      
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-5 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_#3b82f6_0%,_transparent_70%)] opacity-5 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          style={{ willChange: "transform, opacity" }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Nuestro Legado</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Campamentos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Anteriores</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Un recorrido por los momentos que han marcado vidas y transformado corazones en nuestra trayectoria.
          </p>
        </motion.div>

        <div className="relative" ref={containerRef}>
          {/* Central Line */}
          <div className="absolute left-[2.25rem] md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />
          
          {/* Animated fill line */}
          <motion.div 
            style={{ height: lineHeight }}
            className="absolute left-[2.25rem] md:left-1/2 top-0 w-0.5 bg-gradient-to-b from-primary via-orange-400 to-primary -translate-x-1/2 origin-top" 
          />

          <div className="relative pt-10 pb-10">
            {events.map((camp, i) => (
              <TimelineItem key={camp.id} camp={camp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
