import {Download, ImagePlus, Share2, SlidersHorizontal} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';
import {POSTER_TEMPLATES, STUDIO_IMAGES} from '../data/studioCatalog';
import type {PosterCategory, PosterTemplate} from '../types/studio';

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.trim().split(/\s+/);
  let line = '';
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
  return currentY;
}

export const PosterMakerTab: React.FC = () => {
  const [category, setCategory] = useState<'All' | PosterCategory>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate>(POSTER_TEMPLATES[0]);

  const [userPhotoSrc, setUserPhotoSrc] = useState<string>(STUDIO_IMAGES.bridal);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  const [headline, setHeadline] = useState(POSTER_TEMPLATES[0].defaultHeadline);
  const [subheadline, setSubheadline] = useState(POSTER_TEMPLATES[0].defaultSubheadline);
  const [userName, setUserName] = useState('Aarav & Meera');
  const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
  const [eventNote, setEventNote] = useState('24 November 2026 · Udaipur');

  const [frameStyle, setFrameStyle] = useState<PosterTemplate['frameStyle']>(
    POSTER_TEMPLATES[0].frameStyle
  );
  const [photoZoom, setPhotoZoom] = useState(1.05);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedImg(img);
    img.src = userPhotoSrc;
  }, [userPhotoSrc]);

  const handleSelectTemplate = (tpl: PosterTemplate) => {
    setSelectedTemplate(tpl);
    setHeadline(tpl.defaultHeadline);
    setSubheadline(tpl.defaultSubheadline);
    setFrameStyle(tpl.frameStyle);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, selectedTemplate.bgPrimary);
    bgGrad.addColorStop(1, selectedTemplate.bgSecondary);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle ornamental architectural double border
    ctx.strokeStyle = selectedTemplate.accentColor;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.globalAlpha = 1;

    // Corner motifs
    const corners = [
      [58, 58],
      [W - 58, 58],
      [58, H - 58],
      [W - 58, H - 58],
    ];
    ctx.fillStyle = selectedTemplate.accentColor;
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Top Category / Studio Eyebrow
    ctx.fillStyle = selectedTemplate.accentColor;
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedTemplate.category.toUpperCase(), W / 2, 128);

    // 4. Main Headline
    ctx.fillStyle = selectedTemplate.textColor;
    ctx.font = '600 84px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(headline.trim() || 'Celebration', W / 2, 224);

    // 5. Photo Frame Geometry
    const frameX = 180;
    const frameY = 278;
    const frameW = 720;
    const frameH = 600;

    ctx.save();
    ctx.beginPath();
    if (frameStyle === 'circle') {
      const r = 285;
      ctx.arc(W / 2, frameY + frameH / 2, r, 0, Math.PI * 2);
    } else if (frameStyle === 'arch') {
      const r = frameW / 2;
      ctx.moveTo(frameX, frameY + frameH);
      ctx.lineTo(frameX, frameY + r);
      ctx.arc(frameX + r, frameY + r, r, Math.PI, 0, false);
      ctx.lineTo(frameX + frameW, frameY + frameH);
      ctx.closePath();
    } else {
      ctx.roundRect(frameX, frameY, frameW, frameH, 24);
    }
    ctx.clip();

    if (loadedImg) {
      const imgAspect = loadedImg.width / loadedImg.height;
      const boxAspect = frameW / frameH;
      let drawW = frameW;
      let drawH = frameH;
      if (imgAspect > boxAspect) {
        drawH = frameH * photoZoom;
        drawW = drawH * imgAspect;
      } else {
        drawW = frameW * photoZoom;
        drawH = drawW / imgAspect;
      }
      const dx = frameX + (frameW - drawW) / 2;
      const dy = frameY + (frameH - drawH) / 2 + photoOffsetY * 3;
      ctx.drawImage(loadedImg, dx, dy, drawW, drawH);
    } else {
      ctx.fillStyle = selectedTemplate.bgSecondary;
      ctx.fillRect(frameX, frameY, frameW, frameH);
    }
    ctx.restore();

    // Frame outline
    ctx.save();
    ctx.strokeStyle = selectedTemplate.accentColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (frameStyle === 'circle') {
      ctx.arc(W / 2, frameY + frameH / 2, 285, 0, Math.PI * 2);
    } else if (frameStyle === 'arch') {
      const r = frameW / 2;
      ctx.moveTo(frameX, frameY + frameH);
      ctx.lineTo(frameX, frameY + r);
      ctx.arc(frameX + r, frameY + r, r, Math.PI, 0, false);
      ctx.lineTo(frameX + frameW, frameY + frameH);
      ctx.closePath();
    } else {
      ctx.roundRect(frameX, frameY, frameW, frameH, 24);
    }
    ctx.stroke();
    ctx.restore();

    // 6. Subheadline & User Details
    ctx.fillStyle = selectedTemplate.mutedColor;
    ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const afterSubY = drawWrappedText(
      ctx,
      subheadline || '',
      W / 2,
      952,
      780,
      38
    );

    // Divider line
    ctx.strokeStyle = selectedTemplate.accentColor;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(390, afterSubY + 34);
    ctx.lineTo(690, afterSubY + 34);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Name
    ctx.fillStyle = selectedTemplate.textColor;
    ctx.font = '700 58px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(userName.trim() || 'Your Name', W / 2, afterSubY + 104);

    // Event Note & Mobile Number
    ctx.fillStyle = selectedTemplate.mutedColor;
    ctx.font = '500 25px "Plus Jakarta Sans", sans-serif';
    if (eventNote.trim()) {
      ctx.fillText(eventNote.trim(), W / 2, afterSubY + 150);
    }

    if (mobileNumber.trim()) {
      ctx.fillStyle = selectedTemplate.accentColor;
      ctx.font = '600 30px "JetBrains Mono", monospace';
      ctx.fillText(mobileNumber.trim(), W / 2, afterSubY + 196);
    }

    // 7. Required subtle 'Dasta Digital Studio' watermark
    ctx.save();
    ctx.fillStyle = selectedTemplate.textColor;
    ctx.globalAlpha = 0.72;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Created with Dasta Digital Studio', W - 82, H - 78);
    ctx.restore();
  }, [
    selectedTemplate,
    loadedImg,
    headline,
    subheadline,
    userName,
    mobileNumber,
    eventNote,
    frameStyle,
    photoZoom,
    photoOffsetY,
  ]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUserPhotoSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Dasta-Poster-${(userName || 'Design').replace(/[^a-z0-9]+/gi, '-')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const handleSharePoster = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'dasta-studio-poster.png', {type: 'image/png'});
      if (navigator.share && navigator.canShare?.({files: [file]})) {
        try {
          await navigator.share({
            title: `${userName} — Dasta Digital Photo Studio`,
            files: [file],
          });
          return;
        } catch {
          // User cancelled share or unsupported
        }
      }
      handleDownloadPoster();
    }, 'image/png');
  };

  const visibleTemplates =
    category === 'All'
      ? POSTER_TEMPLATES
      : POSTER_TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#8C681A]">Instant Social &amp; WhatsApp Cards</p>
          <h2 className="font-display text-3xl font-semibold text-[#141413] sm:text-4xl">
            Studio Poster Maker
          </h2>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-[#EFECE4] p-1">
          {(['All', 'Wedding', 'Festival', 'Business'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
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
        {/* Live Canvas Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="rounded-3xl border border-[#E6E1D6] bg-white p-4 sm:p-5">
            <div className="mx-auto aspect-[4/5] max-w-[380px] overflow-hidden rounded-2xl border border-[#E6E1D6] bg-[#FAF9F6] shadow-sm">
              <canvas
                ref={canvasRef}
                className="h-full w-full object-contain"
                aria-label="Live Poster Preview Canvas"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleDownloadPoster}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#141413] px-4 py-2.5 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#292826]"
              >
                <Download className="h-4 w-4 text-[#D4A84B]" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handleSharePoster}
                aria-label="Share poster"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#DDD7CB] bg-white px-4 py-2.5 text-sm font-medium text-[#141413] transition-colors hover:bg-[#F3EFE6]"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="space-y-5 lg:col-span-7">
          {/* Template Selector */}
          <section className="rounded-2xl border border-[#E6E1D6] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#141413]">01. Choose Template</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visibleTemplates.map((tpl) => {
                const active = selectedTemplate.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      active
                        ? 'border-[#141413] ring-1 ring-[#141413]'
                        : 'border-[#E6E1D6] hover:border-[#C89B3C]'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{backgroundColor: tpl.bgPrimary}}
                      />
                      <span className="text-[11px] font-medium text-[#6B675E]">{tpl.category}</span>
                    </div>
                    <p className="mt-2.5 text-xs font-semibold text-[#141413]">{tpl.name}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Photo & Framing */}
          <section className="rounded-2xl border border-[#E6E1D6] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#141413]">02. Your Photo &amp; Frame</h3>
              <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-[#F5F1E8] px-3.5 py-2 text-xs font-semibold text-[#8C681A] hover:bg-[#EBE4D3]">
                <ImagePlus className="h-4 w-4" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#58544B]">Frame Shape:</span>
              {(['arch', 'circle', 'editorial'] as const).map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => setFrameStyle(shape)}
                  className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    frameStyle === shape
                      ? 'border-[#141413] bg-[#141413] text-[#FAF9F6]'
                      : 'border-[#DDD7CB] text-[#434039] hover:bg-[#F3EFE6]'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="poster-zoom"
                  className="flex items-center justify-between text-xs font-medium text-[#58544B]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Photo Zoom
                  </span>
                  <span className="font-mono-tabular">{photoZoom.toFixed(2)}x</span>
                </label>
                <input
                  id="poster-zoom"
                  type="range"
                  min={1}
                  max={1.8}
                  step={0.05}
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(Number(e.target.value))}
                  className="mt-2 w-full accent-[#141413]"
                />
              </div>

              <div>
                <label
                  htmlFor="poster-offset"
                  className="flex items-center justify-between text-xs font-medium text-[#58544B]"
                >
                  <span>Vertical Position</span>
                  <span className="font-mono-tabular">{photoOffsetY}</span>
                </label>
                <input
                  id="poster-offset"
                  type="range"
                  min={-40}
                  max={40}
                  step={2}
                  value={photoOffsetY}
                  onChange={(e) => setPhotoOffsetY(Number(e.target.value))}
                  className="mt-2 w-full accent-[#141413]"
                />
              </div>
            </div>
          </section>

          {/* Text & Contact Details */}
          <section className="rounded-2xl border border-[#E6E1D6] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#141413]">03. Name, Number &amp; Greeting</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="poster-name" className="block text-xs font-medium text-[#58544B]">
                  Your Name / Couple / Business
                </label>
                <input
                  id="poster-name"
                  type="text"
                  maxLength={40}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="poster-mobile" className="block text-xs font-medium text-[#58544B]">
                  Mobile Number
                </label>
                <input
                  id="poster-mobile"
                  type="tel"
                  maxLength={24}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="font-mono-tabular mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="poster-headline" className="block text-xs font-medium text-[#58544B]">
                  Poster Headline
                </label>
                <input
                  id="poster-headline"
                  type="text"
                  maxLength={32}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="poster-note" className="block text-xs font-medium text-[#58544B]">
                  Date / Venue / Tagline
                </label>
                <input
                  id="poster-note"
                  type="text"
                  maxLength={48}
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="poster-sub" className="block text-xs font-medium text-[#58544B]">
                  Message / Invitation Line
                </label>
                <input
                  id="poster-sub"
                  type="text"
                  maxLength={90}
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
