import {
  ArrowRight,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Hash,
  ImagePlus,
  QrCode,
} from 'lucide-react';
import React, {useRef, useState} from 'react';
import {STUDIO_IMAGES, WEDDING_OFFERS} from '../data/studioCatalog';
import type {TabId} from '../types/studio';

interface HomeTabProps {
  onNavigateTab: (tab: TabId, options?: {openScanner?: boolean; focusCode?: boolean; packageId?: string}) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({onNavigateTab}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSlide = (index: number) => {
    const clamped = Math.max(0, Math.min(WEDDING_OFFERS.length - 1, index));
    setActiveSlide(clamped);
    const container = sliderRef.current;
    if (!container) return;
    const child = container.children[clamped] as HTMLElement | undefined;
    if (child) {
      container.scrollTo({left: child.offsetLeft, behavior: 'smooth'});
    }
  };

  const handleSliderScroll = () => {
    const container = sliderRef.current;
    if (!container) return;
    const width = container.clientWidth || 1;
    const idx = Math.round(container.scrollLeft / (width * 0.85));
    setActiveSlide(Math.max(0, Math.min(WEDDING_OFFERS.length - 1, idx)));
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Hero Studio Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#141413] text-[#FAF9F6] shadow-sm">
        <div className="grid lg:grid-cols-12 lg:items-stretch">
          <div className="relative z-10 flex flex-col justify-between p-6 sm:p-10 lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#D4A84B]">
                Dasta Digital Photo Studio · Wedding &amp; Aerial Cinema
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#FAF9F6] sm:text-5xl [text-wrap:balance]">
                Timeless Wedding Frames &amp; Instant Guest Galleries
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#D8D3C8] sm:text-base">
                Access private wedding albums in seconds with a 6-digit event code, design custom
                invitation or festival posters, and reserve our 4K drone cinema crew.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('gallery', {openScanner: true})}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#D4A84B] px-5 py-2.5 text-sm font-semibold text-[#141413] transition-colors hover:bg-[#E2BA63] whitespace-nowrap shrink-0"
              >
                <QrCode className="h-4 w-4" />
                <span>Scan Gallery QR</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('book')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-[#FAF9F6] transition-colors hover:bg-white/15 whitespace-nowrap shrink-0"
              >
                <span>View Packages</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/10] lg:col-span-6 lg:aspect-auto lg:min-h-[360px]">
            <img
              src={STUDIO_IMAGES.hero}
              alt="Royal Indian wedding couple walking through sunlit sandstone arches captured by Dasta Digital Photo Studio"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/20 to-transparent lg:bg-gradient-to-r lg:from-[#141413] lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section aria-labelledby="quick-actions-heading">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="quick-actions-heading" className="font-display text-2xl font-semibold text-[#141413] sm:text-3xl">
            Quick Actions
          </h2>
          <span className="text-xs text-[#6B675E]">One-tap studio tools</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => onNavigateTab('gallery', {openScanner: true})}
            className="group flex min-h-[124px] flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-4 text-left transition-all hover:border-[#C89B3C] hover:shadow-sm active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8C681A] transition-colors group-hover:bg-[#141413] group-hover:text-[#D4A84B]">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-[#141413]">Scan Event QR</p>
              <p className="mt-0.5 text-xs text-[#6B675E]">Open wedding album</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('gallery', {focusCode: true})}
            className="group flex min-h-[124px] flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-4 text-left transition-all hover:border-[#C89B3C] hover:shadow-sm active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8C681A] transition-colors group-hover:bg-[#141413] group-hover:text-[#D4A84B]">
              <Hash className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-[#141413]">6-Digit Code</p>
              <p className="mt-0.5 text-xs text-[#6B675E]">Enter guest pass</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('poster')}
            className="group flex min-h-[124px] flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-4 text-left transition-all hover:border-[#C89B3C] hover:shadow-sm active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8C681A] transition-colors group-hover:bg-[#141413] group-hover:text-[#D4A84B]">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-[#141413]">Poster Maker</p>
              <p className="mt-0.5 text-xs text-[#6B675E]">Wedding &amp; festival cards</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('book')}
            className="group flex min-h-[124px] flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-4 text-left transition-all hover:border-[#C89B3C] hover:shadow-sm active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8C681A] transition-colors group-hover:bg-[#141413] group-hover:text-[#D4A84B]">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-[#141413]">Book Studio</p>
              <p className="mt-0.5 text-xs text-[#6B675E]">4K drone &amp; wedding</p>
            </div>
          </button>
        </div>
      </section>

      {/* Special Wedding Offers Slider */}
      <section aria-labelledby="offers-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 id="offers-heading" className="font-display text-2xl font-semibold text-[#141413] sm:text-3xl">
              Special Wedding Offers
            </h2>
            <p className="text-xs text-[#6B675E]">Seasonal studio packages &amp; aerial bonuses</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              aria-label="Previous wedding offer"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D6] bg-white text-[#141413] transition-colors hover:bg-[#F3EFE6] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide + 1)}
              disabled={activeSlide === WEDDING_OFFERS.length - 1}
              aria-label="Next wedding offer"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E1D6] bg-white text-[#141413] transition-colors hover:bg-[#F3EFE6] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          onScroll={handleSliderScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {WEDDING_OFFERS.map((offer) => (
            <article
              key={offer.id}
              className="relative min-w-[86%] sm:min-w-[420px] lg:min-w-[380px] lg:flex-1 snap-start overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#22201D]">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
                  <span className="text-xs font-medium text-[#F5D68A]">{offer.eyebrow}</span>
                  <span className="font-mono-tabular text-xs font-semibold text-white">
                    {offer.discountText}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold text-[#141413]">{offer.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#58544B]">{offer.subtitle}</p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EFECE4] pt-4">
                  <span className="text-xs text-[#6B675E]">{offer.validUntil}</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('book', {packageId: offer.packageId})}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#141413] px-3.5 py-2 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#292826] whitespace-nowrap shrink-0"
                  >
                    <span>Claim Offer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Slide progress bars */}
        <div className="mt-3 flex items-center justify-center gap-2 sm:hidden">
          {WEDDING_OFFERS.map((offer, i) => (
            <button
              key={offer.id}
              type="button"
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to offer ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === i ? 'w-6 bg-[#141413]' : 'w-2 bg-[#D6D0C4]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Recent Studio Showcase Strip */}
      <section className="rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#8C681A]">Live Demo Guest Access</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#141413]">
              Preview a Real Client Gallery
            </h2>
            <p className="mt-1 text-sm text-[#58544B]">
              Try Event Code <span className="font-mono-tabular font-semibold text-[#141413]">240812</span> or{' '}
              <span className="font-mono-tabular font-semibold text-[#141413]">518904</span> in the Client Gallery tab.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('gallery', {focusCode: true})}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#141413] px-5 py-2.5 text-sm font-semibold text-[#141413] transition-colors hover:bg-[#141413] hover:text-[#FAF9F6] whitespace-nowrap shrink-0"
          >
            <span>Open Client Gallery</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
