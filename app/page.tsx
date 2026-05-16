'use client';

import { ArrowRight, Search, MapPin, Clock, Star, PlusCircle, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="flex-1 bg-[#fdfcf8] flex flex-col items-center justify-center px-6 relative min-h-screen overflow-hidden">
      {/* Navbar simulation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="text-2xl font-black text-gray-900">
          Versa<span className="text-emerald-600">Temple</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <LogIn size={18} /> Login
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-emerald-600 rounded-xl shadow-sm border border-emerald-50 hover:bg-emerald-50 transition-colors"
          >
            <UserPlus size={18} /> Registrati
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-8 border border-emerald-100">
          <Star size={16} className="fill-emerald-700" />
          <span>Dublin's #1 Smart Housing Helper</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
          Versa<span className="text-emerald-600">Temple</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          Sei stanco di cercare manualmente le case? Eccoti un sito che potrebbe aiutarti a risparmiare tempo
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link
            href="/search"
            className="group relative inline-flex items-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95"
          >
            <Search size={24} /> Cerca casa <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/post"
            className="group relative inline-flex items-center gap-3 bg-white text-emerald-600 border-2 border-emerald-100 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-emerald-50 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <PlusCircle size={24} /> Posta annuncio
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <Clock className="text-emerald-600 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Commute Focused</h3>
            <p className="text-gray-500 text-sm">We find homes perfectly balanced between your workplaces.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <MapPin className="text-emerald-600 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Dublin Area</h3>
            <p className="text-gray-500 text-sm">Focused only on Dublin, using real data from Daft.ie.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <Search className="text-emerald-600 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Smart Amenities</h3>
            <p className="text-gray-500 text-sm">Prioritize schools, hospitals, or transport with one click.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
