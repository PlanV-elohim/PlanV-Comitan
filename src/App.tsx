import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { CampEvent } from './types';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UpcomingEvents from './components/UpcomingEvents';
import Testimonials from './components/Testimonials';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import CalendarModal from './components/CalendarModal';
import CampInfoModal from './components/CampInfoModal';
import RegistrationModal from './components/RegistrationModal';
import JoinModal from './components/JoinModal';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState<CampEvent | null>(null);
  const [infoCamp, setInfoCamp] = useState<CampEvent | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (showSplash || selectedCamp || showCalendar || showJoin || infoCamp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSplash, selectedCamp, showCalendar, showJoin, infoCamp]);

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Navbar onJoin={() => setShowJoin(true)} />
          <main>
            <Hero />
            <UpcomingEvents
              onRegister={(camp) => setSelectedCamp(camp)}
              onOpenCalendar={() => setShowCalendar(true)}
              onInfo={(camp) => setInfoCamp(camp)}
            />
            <Testimonials />
            <AboutUs />
          </main>
          <Footer />
          <WhatsAppButton />
          <ScrollToTop />
        </motion.div>
      )}

      <AnimatePresence>
        {showCalendar && (
          <CalendarModal
            onClose={() => setShowCalendar(false)}
            onRegister={(camp) => {
              setShowCalendar(false);
              setSelectedCamp(camp);
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
              setSelectedCamp(camp);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCamp && (
          <RegistrationModal
            camp={selectedCamp}
            onClose={() => setSelectedCamp(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoin && (
          <JoinModal onClose={() => setShowJoin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
