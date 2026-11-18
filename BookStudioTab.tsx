import {Check, MessageCircle, Plane, Sparkles} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {
  BOOKING_ADDONS,
  STUDIO_PACKAGES,
  STUDIO_WHATSAPP_NUMBER,
} from '../data/studioCatalog';
import type {StudioPackage} from '../types/studio';

interface BookStudioTabProps {
  preselectedPackageId?: string;
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const BookStudioTab: React.FC<BookStudioTabProps> = ({preselectedPackageId}) => {
  const [category, setCategory] = useState<'All' | StudioPackage['category']>('All');
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    preselectedPackageId || 'pkg-gold-royal'
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venueCity, setVenueCity] = useState('');

  useEffect(() => {
    if (preselectedPackageId) {
      setSelectedPkgId(preselectedPackageId);
    }
  }, [preselectedPackageId]);

  const selectedPkg =
    STUDIO_PACKAGES.find((p) => p.id === selectedPkgId) || STUDIO_PACKAGES[1];

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const found = BOOKING_ADDONS.find((a) => a.id === id);
    return sum + (found ? found.priceInr : 0);
  }, 0);

  const totalEstimate = selectedPkg.priceInr + addonsTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const visiblePackages =
    category === 'All'
      ? STUDIO_PACKAGES
      : STUDIO_PACKAGES.filter((p) => p.category === category);

  const buildWhatsAppUrl = () => {
    const addonNames = selectedAddons
      .map((id) => BOOKING_ADDONS.find((a) => a.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    const lines = [
      'Namaste Dasta Digital Photo Studio!',
      `I would like to book: *${selectedPkg.name}* (${formatInr(selectedPkg.priceInr)})`,
      clientName ? `Name: ${clientName}` : null,
      clientPhone ? `Phone: ${clientPhone}` : null,
      eventDate ? `Event Date: ${eventDate}` : null,
      venueCity ? `City / Venue: ${venueCity}` : null,
      addonNames ? `Add-ons: ${addonNames}` : null,
      `Estimated Package Total: *${formatInr(totalEstimate)}*`,
      'Please share date availability and next steps.',
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#8C681A]">2026–27 Season Reservations</p>
          <h2 className="font-display text-3xl font-semibold text-[#141413] sm:text-4xl">
            Wedding &amp; Drone Packages
          </h2>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-[#EFECE4] p-1 overflow-x-auto max-w-full">
          {(['All', 'Wedding', 'Pre-Wedding', 'Drone Cinema'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-white text-[#141413] shadow-sm'
                  : 'text-[#58544B] hover:text-[#141413]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Package List */}
        <div className="space-y-4 lg:col-span-7">
          {visiblePackages.map((pkg) => {
            const isSelected = pkg.id === selectedPkg.id;
            return (
              <article
                key={pkg.id}
                className={`rounded-2xl border bg-white p-5 transition-all ${
                  isSelected
                    ? 'border-[#141413] ring-1 ring-[#141413]'
                    : 'border-[#E6E1D6] hover:border-[#C89B3C]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B675E]">
                      <span className="font-medium text-[#8C681A]">{pkg.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pkg.duration}</span>
                      {pkg.includesDrone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-medium text-[#141413]">
                            <Plane className="h-3 w-3 text-[#8C681A]" />
                            4K Drone Included
                          </span>
                        </>
                      )}
                      {pkg.highlight && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#141413]">
                            <Sparkles className="h-3 w-3 text-[#8C681A]" />
                            {pkg.highlight}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-[#141413]">
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="font-mono-tabular text-xl font-semibold text-[#141413]">
                      {formatInr(pkg.priceInr)}
                    </p>
                    <p className="text-[11px] text-[#6B675E]">Base studio fee</p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 border-t border-[#EFECE4] pt-4 text-sm text-[#434039]">
                  {pkg.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8C681A]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-[#141413] text-[#FAF9F6]'
                        : 'border border-[#DDD7CB] bg-[#FAF9F6] text-[#141413] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    {isSelected ? 'Selected Package' : 'Select Package'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Booking Customizer & Direct WhatsApp CTA */}
        <aside className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="rounded-3xl border border-[#E6E1D6] bg-white p-5 sm:p-6">
            <p className="text-xs font-medium text-[#8C681A]">Direct Studio Inquiry</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-[#141413]">
              Confirm Your Booking
            </h3>

            <div className="mt-4 rounded-xl bg-[#FAF9F6] p-3.5 border border-[#EFECE4]">
              <p className="text-xs text-[#6B675E]">Selected Package</p>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-[#141413]">{selectedPkg.name}</p>
                <span className="font-mono-tabular text-sm font-semibold text-[#141413]">
                  {formatInr(selectedPkg.priceInr)}
                </span>
              </div>
            </div>

            {/* Optional Add-ons */}
            <div className="mt-4">
              <p className="text-xs font-medium text-[#58544B]">Optional Aerial &amp; Album Add-ons</p>
              <div className="mt-2 space-y-2">
                {BOOKING_ADDONS.map((addon) => {
                  const checked = selectedAddons.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-xs transition-colors ${
                        checked
                          ? 'border-[#141413] bg-[#FAF9F6]'
                          : 'border-[#E6E1D6] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 font-medium text-[#141413]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="h-4 w-4 accent-[#141413]"
                        />
                        {addon.label}
                      </span>
                      <span className="font-mono-tabular text-[#58544B]">
                        +{formatInr(addon.priceInr)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Client Inputs */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="bk-name" className="block text-xs font-medium text-[#58544B]">
                  Your Name
                </label>
                <input
                  id="bk-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1 w-full min-h-[42px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="bk-phone" className="block text-xs font-medium text-[#58544B]">
                  Mobile Number
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="font-mono-tabular mt-1 w-full min-h-[42px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="bk-date" className="block text-xs font-medium text-[#58544B]">
                  Event Date
                </label>
                <input
                  id="bk-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 w-full min-h-[42px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="bk-city" className="block text-xs font-medium text-[#58544B]">
                  City / Venue
                </label>
                <input
                  id="bk-city"
                  type="text"
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  placeholder="e.g. Udaipur"
                  className="mt-1 w-full min-h-[42px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            {/* Total Estimate */}
            <div className="mt-5 flex items-baseline justify-between border-t border-[#EFECE4] pt-4">
              <span className="text-sm font-medium text-[#58544B]">Estimated Total</span>
              <span className="font-mono-tabular text-2xl font-semibold text-[#141413]">
                {formatInr(totalEstimate)}
              </span>
            </div>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#14532D]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Book Directly on WhatsApp</span>
            </a>
            <p className="mt-2 text-center text-[11px] text-[#6B675E]">
              Opens WhatsApp with your selected package &amp; date pre-filled
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
