import {CalendarHeart, Home, ImagePlus, QrCode} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {BookStudioTab} from './components/BookStudioTab';
import {ClientGalleryTab} from './components/ClientGalleryTab';
import {HomeTab} from './components/HomeTab';
import {OfflineIndicator} from './components/OfflineIndicator';
import {PosterMakerTab} from './components/PosterMakerTab';
import {PWAInstallButton} from './components/PWAInstallButton';
import type {TabId} from './types/studio';

interface NavTriggerState {
  openScanner?: boolean;
  focusCode?: boolean;
  packageId?: string;
}

const TABS: Array<{id: TabId; label: string; shortLabel: string; icon: typeof Home}> = [
  {id: 'home', label: 'Home', shortLabel: 'Home', icon: Home},
  {id: 'gallery', label: 'Client Gallery (QR)', shortLabel: 'Gallery QR', icon: QrCode},
  {id: 'poster', label: 'Poster Maker', shortLabel: 'Poster Maker', icon: ImagePlus},
  {id: 'book', label: 'Book Studio', shortLabel: 'Book Studio', icon: CalendarHeart},
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [deepLinkCode, setDeepLinkCode] = useState<string | undefined>(undefined);
  const [triggerState, setTriggerState] = useState<NavTriggerState>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as TabId | null;
    const codeParam = params.get('code');

    if (codeParam && /^\d{6}$/.test(codeParam)) {
      setDeepLinkCode(codeParam);
      setActiveTab('gallery');
      return;
    }

    if (tabParam && ['home', 'gallery', 'poster', 'book'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleNavigateTab = useCallback((tab: TabId, options?: NavTriggerState) => {
    setActiveTab(tab);
    if (options) {
      setTriggerState(options);
    } else {
      setTriggerState({});
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const handleConsumeTriggers = useCallback(() => {
    setTriggerState({});
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413]">
      {/* Sticky Top App Bar (52px height) */}
      <header className="sticky top-0 z-30 h-[52px] border-b border-[#E6E1D6] bg-[#FAF9F6]/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => handleNavigateTab('home')}
            className="font-display text-xl font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0 sm:text-2xl"
          >
            Dasta Studio
          </button>

          {/* Zone 2: Clean single-line navigation links on tablet/desktop */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleNavigateTab(tab.id)}
                  className={`relative min-h-[40px] px-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active ? 'text-[#141413]' : 'text-[#6B675E] hover:text-[#141413]'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#B8860B]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action (PWA Install) */}
          <div className="flex items-center shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="mx-auto max-w-6xl px-4 pt-5 pb-24 sm:px-6 sm:pt-7 md:pb-12">
        {activeTab === 'home' && <HomeTab onNavigateTab={handleNavigateTab} />}
        {activeTab === 'gallery' && (
          <ClientGalleryTab
            initialCode={deepLinkCode}
            autoOpenScanner={triggerState.openScanner}
            autoFocusCode={triggerState.focusCode}
            onConsumedTriggers={handleConsumeTriggers}
          />
        )}
        {activeTab === 'poster' && <PosterMakerTab />}
        {activeTab === 'book' && (
          <BookStudioTab preselectedPackageId={triggerState.packageId} />
        )}
      </main>

      {/* Mobile Fixed 4-Tab Bottom Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6E1D6] bg-white/95 backdrop-blur-md pb-safe md:hidden"
      >
        <div className="grid h-16 grid-cols-4 items-center">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleNavigateTab(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-1 px-1 transition-colors ${
                  active ? 'text-[#141413]' : 'text-[#6B675E] hover:text-[#141413]'
                }`}
              >
                <Icon
                  className={`h-[22px] w-[22px] ${active ? 'text-[#9E7322]' : 'text-current'}`}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span
                  className={`text-[11px] leading-none tracking-tight whitespace-nowrap ${
                    active ? 'font-semibold text-[#141413]' : 'font-medium'
                  }`}
                >
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
