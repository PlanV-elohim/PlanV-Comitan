import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '../components/Hero';
import Countdown from '../components/Countdown';
import UpcomingEvents from '../components/UpcomingEvents';
import { lazy, Suspense } from 'react';

const Stats = lazy(() => import('../components/Stats'));
const Values = lazy(() => import('../components/Values'));
const Gallery = lazy(() => import('../components/Gallery'));
const Timeline = lazy(() => import('../components/Timeline'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const FAQ = lazy(() => import('../components/FAQ'));
const AboutUs = lazy(() => import('../components/AboutUs'));
const MapSection = lazy(() => import('../components/MapSection'));
import { SectionSkeleton, SingleColumnSkeleton } from '../components/SkeletonSections';
import Footer from '../components/Footer';
import CalendarModal from '../components/CalendarModal';
import CampInfoModal from '../components/CampInfoModal';
import Navbar from '../components/Navbar';
import JoinModal from '../components/JoinModal';
import WhatsAppButton from '../components/WhatsAppButton';
import CustomCursor from '../components/ui/CustomCursor';
import GlobalTouchEffect from '../components/ui/GlobalTouchEffect';
import ScrollToTop from '../components/ScrollToTop';
import ThemeToggle from '../components/ThemeToggle';
import SplashScreen from '../components/SplashScreen';
import BottomNavbar from '../components/BottomNavbar';
import { useNavigate } from 'react-router-dom';
import { CampEvent } from '../types';

const ScrollSection = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ duration: 0.7, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [infoCamp, setInfoCamp] = useState<CampEvent | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (showSplash || showCalendar || showJoin || infoCamp) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [showSplash, showCalendar, showJoin, infoCamp]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <CustomCursor />
        <GlobalTouchEffect />
        <ThemeToggle />
        <Navbar onJoin={() => setShowJoin(true)} />

        <AnimatePresence mode="wait">
          {showSplash && (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          )}
        </AnimatePresence>

        <Hero />
        <ScrollSection><Countdown /></ScrollSection>
        <ScrollSection><Stats /></ScrollSection>
        
        <div className="relative z-10 -mt-10">
          <UpcomingEvents 
            onRegister={(camp) => {
              navigate('/registro/' + camp.id, { state: { camp } });
            }}
            onOpenCalendar={() => setShowCalendar(true)}
            onInfo={(camp) => setInfoCamp(camp)}
          />
        </div>

        <ScrollSection>
          <Suspense fallback={<SectionSkeleton />}><Values /></Suspense>
        </ScrollSection>
        
        <ScrollSection>
          <Suspense fallback={<SingleColumnSkeleton height="h-96" />}><Timeline /></Suspense>
        </ScrollSection>

        <ScrollSection>
          <Suspense fallback={<SingleColumnSkeleton height="h-[500px]" />}><Gallery /></Suspense>
        </ScrollSection>

        <ScrollSection>
          <Suspense fallback={<SectionSkeleton />}><Testimonials /></Suspense>
        </ScrollSection>
        
        <ScrollSection>
          <Suspense fallback={<SingleColumnSkeleton height="h-[400px]" />}><FAQ /></Suspense>
        </ScrollSection>
        
        <ScrollSection>
          <Suspense fallback={<SingleColumnSkeleton height="h-[500px]" />}><AboutUs /></Suspense>
        </ScrollSection>
        
        <ScrollSection>
          <Suspense fallback={<SingleColumnSkeleton height="h-[400px]" />}><MapSection /></Suspense>
        </ScrollSection>

        <Footer onJoinForm={() => setShowJoin(true)} />
        <WhatsAppButton phoneNumber="1234567890" message="¡Hola! Me gustaría obtener más información sobre los campamentos." />
        <BottomNavbar /> 
        <ScrollToTop />

        <AnimatePresence>
          {showCalendar && (
            <CalendarModal
              onClose={() => setShowCalendar(false)}
              onRegister={(camp) => {
                setShowCalendar(false);
                navigate('/registro/' + camp.id, { state: { camp } });
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {infoCamp && (
            <CampInfoModal
              camp={infoCamp}
              onClose={() => setInfoCamp(null)}
              onRegister={(camp) => {
                setInfoCamp(null);
                navigate('/registro/' + camp.id, { state: { camp } });
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showJoin && (
            <JoinModal onClose={() => setShowJoin(false)} />
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  return <>{children}</>;
}
