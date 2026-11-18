import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  QrCode,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {EventPhoto, PhotoCategory, StudioEvent} from '../types/studio';
import {AdminPanel} from './AdminPanel';
import {QrScannerModal} from './QrScannerModal';

interface ClientGalleryTabProps {
  initialCode?: string;
  autoOpenScanner?: boolean;
  autoFocusCode?: boolean;
  onConsumedTriggers?: () => void;
}

export const ClientGalleryTab: React.FC<ClientGalleryTabProps> = ({
  initialCode,
  autoOpenScanner,
  autoFocusCode,
  onConsumedTriggers,
}) => {
  const [mode, setMode] = useState<'guest' | 'admin'>('guest');
  const [codeInput, setCodeInput] = useState(initialCode || '');
  const [scannerOpen, setScannerOpen] = useState(false);

  const [eventData, setEventData] = useState<StudioEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'All' | PhotoCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  const loadEventByCode = useCallback(async (codeToLoad: string) => {
    const clean = codeToLoad.replace(/\D/g, '').slice(0, 6);
    setCodeInput(clean);
    if (clean.length !== 6) {
      setError('Enter a valid 6-digit Event Code.');
      return;
    }

    setLoading(true);
    setError(null);
    setCategoryFilter('All');
    try {
      const res = await fetch(`/api/events/${clean}`);
      const data = await res.json();
      if (!res.ok) {
        setEventData(null);
        setError(data.error || `No gallery found for code ${clean}.`);
        return;
      }
      setEventData(data.event);
    } catch {
      setError('Could not load gallery. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode && /^\d{6}$/.test(initialCode)) {
      loadEventByCode(initialCode);
    }
  }, [initialCode, loadEventByCode]);

  useEffect(() => {
    if (autoOpenScanner) {
      setMode('guest');
      setScannerOpen(true);
      onConsumedTriggers?.();
    } else if (autoFocusCode) {
      setMode('guest');
      setTimeout(() => codeInputRef.current?.focus(), 60);
      onConsumedTriggers?.();
    }
  }, [autoOpenScanner, autoFocusCode, onConsumedTriggers]);

  const filteredPhotos = eventData
    ? categoryFilter === 'All'
      ? eventData.photos
      : eventData.photos.filter((p) => p.category === categoryFilter)
    : [];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % Math.max(1, filteredPhotos.length)
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + Math.max(1, filteredPhotos.length)) % Math.max(1, filteredPhotos.length)
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, filteredPhotos.length]);

  const handleDownloadPhoto = async (photo: EventPhoto) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${photo.title.replace(/[^a-z0-9-_]+/gi, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `${photo.title}.jpg`;
      link.click();
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#8C681A]">Private Guest Access</p>
          <h2 className="font-display text-3xl font-semibold text-[#141413] sm:text-4xl">
            Client Gallery &amp; QR Access
          </h2>
        </div>

        <div className="inline-flex rounded-xl border border-[#E2DDD3] bg-white p-1">
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'guest'
                ? 'bg-[#141413] text-[#FAF9F6]'
                : 'text-[#58544B] hover:text-[#141413]'
            }`}
          >
            Guest Gallery
          </button>
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'admin'
                ? 'bg-[#141413] text-[#FAF9F6]'
                : 'text-[#58544B] hover:text-[#141413]'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>

      {mode === 'admin' ? (
        <AdminPanel
          onSelectEventForPreview={(code) => {
            setMode('guest');
            loadEventByCode(code);
          }}
        />
      ) : (
        <>
          {/* Guest QR Scanner + 6-Digit Event Code Entry */}
          <section className="rounded-3xl border border-[#E6E1D6] bg-white p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <h3 className="font-display text-2xl font-semibold text-[#141413]">
                  Enter Your 6-Digit Event Code
                </h3>
                <p className="mt-1 text-sm text-[#58544B]">
                  Find the 6-digit pass printed on your wedding invitation or reception QR standee.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadEventByCode(codeInput);
                  }}
                  className="mt-4 flex flex-col gap-3 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <input
                      ref={codeInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={codeInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCodeInput(clean);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. 240812"
                      aria-label="6-digit Event Code"
                      className="font-mono-tabular w-full min-h-[48px] rounded-xl border border-[#D8D2C5] bg-[#FAF9F6] px-4 text-lg font-semibold tracking-[0.25em] text-[#141413] outline-none focus:border-[#141413]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#141413] px-6 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#292826] disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    <Search className="h-4 w-4 text-[#D4A84B]" />
                    <span>{loading ? 'Opening...' : 'View Photos'}</span>
                  </button>
                </form>

                {/* Sample Event Codes */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B675E]">
                  <span>Sample events:</span>
                  <button
                    type="button"
                    onClick={() => loadEventByCode('240812')}
                    className="font-mono-tabular font-semibold text-[#8C681A] underline underline-offset-4 hover:text-[#141413]"
                  >
                    240812 (Udaipur Wedding)
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => loadEventByCode('518904')}
                    className="font-mono-tabular font-semibold text-[#8C681A] underline underline-offset-4 hover:text-[#141413]"
                  >
                    518904 (Pre-Wedding)
                  </button>
                </div>

                {error && (
                  <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-[#141413] p-5 text-[#FAF9F6] lg:col-span-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#D4A84B]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Instant Camera Lookup</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold">
                    Have a Dasta Studio QR Card?
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#D8D3C8]">
                    Scan the reception standee QR code or upload a QR screenshot to open the album directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#D4A84B] px-4 py-2.5 text-sm font-semibold text-[#141413] transition-colors hover:bg-[#E2BA63]"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Open QR Scanner</span>
                </button>
              </div>
            </div>
          </section>

          {/* Loaded Event Gallery */}
          {eventData && (
            <section className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B675E]">
                    <span className="font-mono-tabular font-semibold text-[#8C681A]">
                      Event {eventData.code}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{eventData.eventDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{eventData.location}</span>
                  </div>
                  <h3 className="mt-1 font-display text-3xl font-semibold text-[#141413]">
                    {eventData.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEventData(null);
                    setCodeInput('');
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-xl border border-[#E2DDD3] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#F3EFE6]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Switch Event</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-xl bg-[#EFECE4] p-1 overflow-x-auto max-w-full">
                  {(['All', 'Ceremony', 'Portraits', 'Candid', 'Aerial'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        categoryFilter === cat
                          ? 'bg-white text-[#141413] shadow-sm'
                          : 'text-[#58544B] hover:text-[#141413]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="font-mono-tabular text-xs text-[#6B675E]">
                  {filteredPhotos.length} frames
                </span>
              </div>

              {filteredPhotos.length === 0 ? (
                <div className="rounded-2xl border border-[#E6E1D6] bg-white p-10 text-center">
                  <p className="font-display text-2xl font-semibold text-[#141413]">
                    No photos in this category yet
                  </p>
                  <p className="mt-1 text-sm text-[#58544B]">
                    Studio photographers can upload photos from the Admin Panel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-2xl border border-[#E6E1D6] bg-[#1C1B19]"
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className="block aspect-[4/5] w-full overflow-hidden text-left"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      </button>

                      <div className="pointer-events-none absolute bottom-3 left-3 right-12">
                        <p className="truncate text-xs font-semibold text-white">{photo.title}</p>
                        <p className="text-[11px] text-white/75">{photo.category}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadPhoto(photo)}
                        aria-label={`Download ${photo.title}`}
                        className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-[#141413] shadow-sm transition-colors hover:bg-[#D4A84B]"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{filteredPhotos[lightboxIndex].title}</p>
              <p className="text-xs text-white/65">
                {filteredPhotos[lightboxIndex].category} · {lightboxIndex + 1} / {filteredPhotos.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPhoto(filteredPhotos[lightboxIndex])}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#D4A84B] px-3.5 py-2 text-xs font-semibold text-[#141413]"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close photo viewer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center p-4">
            <button
              type="button"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                )
              }
              aria-label="Previous photo"
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <img
              src={filteredPhotos[lightboxIndex].url}
              alt={filteredPhotos[lightboxIndex].title}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] max-w-full rounded-xl object-contain"
            />

            <button
              type="button"
              onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
              aria-label="Next photo"
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCodeDetected={(code) => loadEventByCode(code)}
      />
    </div>
  );
};
