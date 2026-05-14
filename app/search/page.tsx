'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  MapPin,
  Car,
  Bus,
  GraduationCap,
  Hospital,
  ShoppingCart,
  Train,
  ArrowRight,
  ArrowLeft,
  Home,
  Search,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Worker = {
  id: number;
  address: string;
  transport: 'car' | 'public';
};

export default function SearchPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    numPeople: 1,
    numWorkers: 0,
    budget: 2000,
    rooms: 1,
    propertyType: 'apartment',
    priorities: {
      schools: 3,
      hospitals: 3,
      supermarkets: 3,
      transport: 3
    }
  });
  const [workers, setWorkers] = useState<Worker[]>([]);

  const handleNumWorkersChange = (val: number) => {
    setFormData({ ...formData, numWorkers: val });
    const newWorkers: Worker[] = [];
    for (let i = 0; i < val; i++) {
      newWorkers.push({ id: i, address: '', transport: 'public' });
    }
    setWorkers(newWorkers);
  };

  const updateWorker = (id: number, field: keyof Worker, value: any) => {
    setWorkers(workers.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEircode = (eircode: string) => {
    const eircodeRegex = /^[A-Z][0-9][0-9W]\s?[0-9A-Z]{4}$/i;
    return eircodeRegex.test(eircode);
  };

  const handleSubmit = async () => {
    setError(null);

    // Check if at least one worker has an address
    if (formData.numWorkers > 0 && workers.some(w => !w.address)) {
      setError("Please provide an address or Eircode for all workers.");
      return;
    }

    setIsGeocoding(true);
    try {
      const { geocode } = await import('@/lib/geo-service');

      const workersWithCoords = await Promise.all(
        workers.map(async (w) => {
          const coords = await geocode(w.address);
          if (!coords) {
            throw new Error(`Could not find location for: ${w.address}`);
          }
          return {
            ...w,
            lat: coords.lat,
            lon: coords.lon
          };
        })
      );

      const searchParams = new URLSearchParams();
      searchParams.set('data', JSON.stringify({
        ...formData,
        workers: workersWithCoords
      }));

      router.push(`/results?${searchParams.toString()}`);
    } catch (err) {
      console.error(err);
      router.push('/results');
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-1/3 h-2 rounded-full mx-1 ${s <= step ? 'bg-emerald-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">Step {step} of 3</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="text-emerald-600" /> Informazioni di base
              </h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="numPeople" className="block text-sm font-medium text-gray-700 mb-2">Quante persone fanno parte del nucleo familiare?</label>
                  <input
                    id="numPeople"
                    type="number"
                    min="1"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.numPeople}
                    onChange={(e) => setFormData({ ...formData, numPeople: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <label htmlFor="numWorkers" className="block text-sm font-medium text-gray-700 mb-2">Quante persone lavorano?</label>
                  <input
                    id="numWorkers"
                    type="number"
                    min="0"
                    max={formData.numPeople}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.numWorkers}
                    onChange={(e) => handleNumWorkersChange(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-2">Quante camere da letto stai cercando?</label>
                  <input
                    id="rooms"
                    type="number"
                    min="1"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Mensile Massimo (€)</label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  />
                  <p className="text-center mt-2 font-semibold text-emerald-600">€ {formData.budget}</p>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full mt-8 bg-emerald-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                Avanti <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="text-emerald-600" /> Posti di lavoro
              </h2>

              {workers.length === 0 ? (
                <p className="text-gray-500 mb-6 italic">Nessun lavoratore inserito. Passa al passaggio successivo.</p>
              ) : (
                <div className="space-y-8">
                  {workers.map((worker, index) => (
                    <div key={worker.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                      <h3 className="font-semibold text-emerald-800 mb-4">Lavoratore {index + 1}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eircode del posto di lavoro</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                              type="text"
                              placeholder="Es: D02 XW14 o O'Connell St"
                              className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                              value={worker.address}
                              onChange={(e) => updateWorker(worker.id, 'address', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Commute Mode</label>
                          <div className="flex gap-4">
                            <button
                              onClick={() => updateWorker(worker.id, 'transport', 'car')}
                              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${worker.transport === 'car' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                              <Car size={18} /> Car
                            </button>
                            <button
                              onClick={() => updateWorker(worker.id, 'transport', 'public')}
                              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${worker.transport === 'public' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                              <Bus size={18} /> Public Transport
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={20} /> Indietro
                </button>
                <button
                  onClick={nextStep}
                  className="flex-[2] bg-emerald-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  Avanti <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Home className="text-emerald-600" /> Priorità e Servizi
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-500 mb-8 italic">
                Imposta la priorità per ogni servizio (1 = Alta, 3 = Bassa).
              </p>

              <div className="space-y-6">
                {[
                  { id: 'schools', label: 'Vicinanza a scuole', icon: GraduationCap },
                  { id: 'hospitals', label: 'Vicinanza a ospedali', icon: Hospital },
                  { id: 'supermarkets', label: 'Vicinanza a supermercati', icon: ShoppingCart },
                  { id: 'transport', label: 'Vicinanza ai mezzi di trasporto pubblici', icon: Train },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                        <item.icon size={20} />
                      </div>
                      <span className="font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((p) => (
                        <button
                          key={p}
                          onClick={() => setFormData({
                            ...formData,
                            priorities: { ...formData.priorities, [item.id]: p }
                          })}
                          className={`w-10 h-10 rounded-full font-bold transition-all ${
                            formData.priorities[item.id as keyof typeof formData.priorities] === p
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-400 border border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={20} /> Indietro
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isGeocoding}
                  className="flex-[2] bg-emerald-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70"
                >
                  {isGeocoding ? (
                    <>Calcolo in corso... <Loader2 className="animate-spin" size={20} /></>
                  ) : (
                    <>Trova la mia casa <Search size={20} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
