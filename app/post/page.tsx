'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Home,
  MapPin,
  Bed,
  Bath,
  Trees,
  Car,
  ShieldCheck,
  Euro,
  Calendar,
  FileText,
  Accessibility,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { postPropertyAction } from '@/app/actions/post-action';

export default function PostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await postPropertyAction(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } else {
      setError(result.error || 'Errore durante il salvataggio.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-emerald-50">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-600" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Annuncio Pubblicato!</h1>
          <p className="text-gray-600 mb-8">
            La tua casa è stata inserita nel database e i servizi nelle vicinanze sono stati calcolati automaticamente.
          </p>
          <p className="text-sm text-emerald-600 font-medium">Reindirizzamento alla home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 transition-colors font-medium">
          <ArrowLeft size={20} /> Torna alla Home
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-emerald-50">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Home className="text-emerald-600" /> Posta un Annuncio
          </h1>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" /> Posizione
              </label>
              <input
                name="eircode"
                required
                placeholder="Inserisci l'Eircode (es. D02 XW14)"
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Bed size={16} /> Camere da letto
                </label>
                <input name="rooms" type="number" min="1" defaultValue="1" className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Bath size={16} /> Bagni
                </label>
                <input name="bathrooms" type="number" min="1" defaultValue="1" className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" />
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors group has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-200">
                <input name="garden" type="checkbox" className="hidden" />
                <Trees size={24} className="text-gray-400 group-hover:text-emerald-600" />
                <span className="text-xs font-bold mt-2 text-gray-500">Giardino</span>
              </label>
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors group has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-200">
                <input name="parking" type="checkbox" className="hidden" />
                <Car size={24} className="text-gray-400 group-hover:text-emerald-600" />
                <span className="text-xs font-bold mt-2 text-gray-500">Parcheggio</span>
              </label>
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors group has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-200">
                <input name="propertyType" value="apartment" type="checkbox" className="hidden" />
                <Home size={24} className="text-gray-400 group-hover:text-emerald-600" />
                <span className="text-xs font-bold mt-2 text-gray-500">Appartamento</span>
              </label>
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors group has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-200">
                <input name="isAccessible" type="checkbox" className="hidden" />
                <Accessibility size={24} className="text-gray-400 group-hover:text-emerald-600" />
                <span className="text-xs font-bold mt-2 text-gray-500">Accessibile</span>
              </label>
            </div>

            {/* BER and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ShieldCheck size={16} /> Classe Energetica (BER)
                </label>
                <select name="ber" className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none">
                  {['A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','E1','E2','F','G'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Euro size={16} /> Prezzo al mese (€)
                </label>
                <input name="price" type="number" required placeholder="Es. 2500" className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={16} /> Disponibile da
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input name="availableFromDate" type="date" className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" onChange={(e) => {
                  const input = document.getElementById('combined-availability') as HTMLInputElement;
                  if (input) input.value = e.target.value;
                }} />
                <input name="availableFromText" placeholder="Es: Subito, Da Gennaio" className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" onChange={(e) => {
                  const input = document.getElementById('combined-availability') as HTMLInputElement;
                  if (input) input.value = e.target.value;
                }} />
                <input type="hidden" name="availableFrom" id="combined-availability" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText size={16} /> Breve descrizione
              </label>
              <textarea name="description" rows={3} className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none resize-none" placeholder="Descrivi la tua casa..."></textarea>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} /> URL Foto (o carica da PC)
              </label>
              <input name="imageUrl" placeholder="Incolla l'URL dell'immagine" className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" />
              <p className="text-[10px] text-gray-400">Nota: Al momento il caricamento diretto salva solo l'URL. Supporto per file binari in arrivo.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-70"
            >
              {loading ? (
                <>Pubblicazione... <Loader2 className="animate-spin" /></>
              ) : (
                <>Pubblica Annuncio <CheckCircle2 /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
