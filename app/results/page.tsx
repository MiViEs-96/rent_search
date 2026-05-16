'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Loader2,
  Star,
  MapPin,
  Bed,
  Bath,
  ExternalLink,
  Navigation,
  School,
  Hospital,
  ShoppingCart,
  Bus,
  ShieldCheck,
  Calendar,
  Trees,
  Car,
  Accessibility
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScoredProperty, SearchCriteria } from '@/lib/scoring-engine';
import { searchPropertiesAction } from '@/app/actions/search-action';

const ResultsMap = dynamic(() => import('@/components/ResultsMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl" />
});

function ResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ScoredProperty[]>([]);
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dataParam = searchParams.get('data');
        let searchCriteria: SearchCriteria;

        if (dataParam) {
          searchCriteria = JSON.parse(dataParam);
        } else {
          searchCriteria = {
            numPeople: 3,
            numWorkers: 2,
            budget: 3500,
            rooms: 2,
            workers: [
              { address: "Silicon Docks, Dublin", lat: 53.3421, lon: -6.2394, transport: 'public' },
              { address: "Sandyford Business Park, Dublin", lat: 53.2778, lon: -6.2167, transport: 'car' }
            ],
            priorities: {
              schools: 1,
              hospitals: 2,
              supermarkets: 1,
              transport: 2
            }
          };
        }

        setCriteria(searchCriteria);

        const scored = await searchPropertiesAction(searchCriteria);
        setResults(scored);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Calcolando le migliori case per te...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#fdfcf8]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/search" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">I tuoi abbinamenti</h1>
        </div>
        <div className="text-sm text-gray-500">
          Trovate <span className="font-bold text-emerald-600">{results.length}</span> case ideali
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-full md:w-[450px] overflow-y-auto p-6 space-y-6 border-r border-gray-100">
          {results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Nessuna proprietà trovata corrispondente ai tuoi criteri.</p>
              <Link href="/search" className="text-emerald-600 font-bold mt-4 inline-block">Prova a regolare i tuoi filtri</Link>
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`group bg-white rounded-3xl border transition-all cursor-pointer overflow-hidden ${selectedId === p.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100 hover:border-emerald-200 hover:shadow-md'}`}
              >
                <div className="relative h-48">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-800">Score: {p.score}</span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-emerald-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                    €{p.price}/mo
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                    <MapPin size={14} />
                    <span>{p.address}</span>
                  </div>

                  {p.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl">
                      <Bed size={16} className="text-emerald-600" />
                      <span className="text-sm">{p.bedrooms} Camere</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl">
                      <Bath size={16} className="text-emerald-600" />
                      <span className="text-sm">{p.bathrooms} Bagni</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Navigation size={14} className="text-orange-500" /> Tempi di percorrenza
                      </div>
                      <div className="flex gap-2">
                        {p.commuteTimes.map((t, i) => (
                          <span key={i} className="text-xs font-bold px-2 py-1 bg-orange-50 text-orange-700 rounded-md">
                            L{i+1}: {t}m
                          </span>
                        ))}
                      </div>
                    </div>

                  {p.ber && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-emerald-500" /> BER Rating
                      </div>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-1 rounded">{p.ber}</span>
                    </div>
                  )}

                  {p.availableFrom && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Calendar size={14} className="text-blue-500" /> Disponibile
                      </div>
                      <span className="text-xs font-medium text-gray-700">{p.availableFrom}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {p.amenitiesCount.schools > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          <School size={10} /> SCUOLE ({p.amenitiesCount.schools})
                        </span>
                      )}
                      {p.amenitiesCount.supermarkets > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md">
                          <ShoppingCart size={10} /> MERCATI ({p.amenitiesCount.supermarkets})
                        </span>
                      )}
                      {p.amenitiesCount.transport > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                          <Bus size={10} /> TRASPORTI
                        </span>
                      )}
                      {p.features?.garden && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                          <Trees size={10} /> GIARDINO
                        </span>
                      )}
                      {p.features?.parking && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-50 text-gray-700 px-2 py-1 rounded-md">
                          <Car size={10} /> PARCHEGGIO
                        </span>
                      )}
                      {p.features?.accessible && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          <Accessibility size={10} /> ACCESSIBILE
                        </span>
                      )}
                    </div>
                  </div>

                  {p.url && p.url !== '#' && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white p-3 rounded-xl font-bold hover:bg-black transition-colors"
                    >
                      Vedi su Daft.ie <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </aside>

        <main className="flex-1 p-6 relative">
          <ResultsMap
            properties={results}
            workers={criteria?.workers || []}
            selectedProperty={selectedId || undefined}
          />
        </main>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Inizializzazione...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
