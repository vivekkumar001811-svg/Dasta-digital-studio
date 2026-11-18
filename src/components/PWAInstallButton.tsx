import {Download, Share, Smartphone, X} from 'lucide-react';
import React, {useState} from 'react';
import {usePWAInstall} from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#141413] px-3.5 py-2 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#292826] whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5 text-[#D4A84B]" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2DDD3] bg-white px-3 py-2 text-xs font-medium text-[#141413] transition-colors hover:bg-[#F3EFE6] whitespace-nowrap shrink-0"
      >
        <Smartphone className="h-3.5 w-3.5 text-[#9A6F04]" />
        <span>{isIOS ? 'Add to Home' : 'Get App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E5E0D5] bg-[#FAF9F6] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#8C681A]">Dasta Studio App</p>
                <h3 id="pwa-guide-title" className="mt-1 font-display text-2xl font-semibold text-[#141413]">
                  Install on Your Phone
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#5E5B52] hover:bg-[#ECE8DF]"
                aria-label="Close install instructions"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm text-[#434039]">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-[#8C681A]">01.</span>
                  <span>
                    Tap the <strong className="inline-flex items-center gap-1 font-semibold text-[#141413]">Share <Share className="h-3.5 w-3.5" /></strong> button in Safari&apos;s bottom toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-[#8C681A]">02.</span>
                  <span>
                    Scroll down and select <strong className="font-semibold text-[#141413]">Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-[#8C681A]">03.</span>
                  <span>Tap <strong className="font-semibold text-[#141413]">Add</strong> to launch Dasta Studio full-screen.</span>
                </li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-3 text-sm text-[#434039]">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-[#8C681A]">01.</span>
                  <span>Open your browser menu (<strong className="font-semibold text-[#141413]">⋮</strong>) in Chrome or Edge.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular text-xs font-semibold text-[#8C681A]">02.</span>
                  <span>Tap <strong className="font-semibold text-[#141413]">Install App</strong> or <strong className="font-semibold text-[#141413]">Add to Home screen</strong> for instant offline access.</span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full min-h-[44px] rounded-xl bg-[#141413] px-4 py-2.5 text-sm font-medium text-[#FAF9F6] transition-colors hover:bg-[#292826]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
