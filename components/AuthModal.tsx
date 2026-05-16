'use client';

import { X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
          >
            {/* Background design */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-50 rounded-full" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="text-emerald-600" size={32} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Servizio non disponibile</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Stiamo lavorando duramente per rendere le funzioni di Login e Registrazione disponibili. Torna a trovarci presto!
              </p>

              <button
                onClick={onClose}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Ho capito
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
