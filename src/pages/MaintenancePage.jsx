import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Clock, Mail } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#001236] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center flex flex-col items-center gap-8 shadow-2xl relative z-10"
      >
        <div className="w-24 h-24 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-4">
          <Hammer size={48} className="animate-bounce" />
        </div>
        
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
            Preserving Our <span className="italic text-secondary">Heritage</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Arab Finds is currently undergoing scheduled maintenance to enhance your luxury acquisition experience. We'll be back shortly with a more refined collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
            <Clock className="text-secondary" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expected Return</span>
            <span className="text-white font-bold">2-4 Hours</span>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
            <Mail className="text-secondary" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Support</span>
            <span className="text-white font-bold">support@arabfinds.com</span>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 w-full">
          <img src="/ARAB_FINDS-removebg-preview.png" alt="Arab Finds" className="h-8 mx-auto brightness-0 invert opacity-30" />
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
