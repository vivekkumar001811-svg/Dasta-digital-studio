import {CalendarHeart, Home, ImagePlus, LogOut, QrCode, ShieldCheck, UserCheck} from 'lucide-react';
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

interface AppUser {
  name: string;
  mobile: string;
  loginTime: string;
}

const TABS: Array<{id: TabId; label: string; shortLabel: string; icon: typeof Home}> = [
  {id: 'home', label: 'होम', shortLabel: 'होम', icon: Home},
  {id: 'gallery', label: 'फोटो सिलेक्शन', shortLabel: 'फोटो सिलेक्शन', icon: QrCode},
  {id: 'poster', label: 'पार्टी बैनर मेकर', shortLabel: 'बैनर मेकर', icon: ImagePlus},
  {id: 'book', label: 'पैकेज व बुकिंग', shortLabel: 'पैकेज/बुकिंग', icon: CalendarHeart},
];

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loginName, setLoginName] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [deepLinkCode, setDeepLinkCode] = useState<string | undefined>(undefined);
  const [triggerState, setTriggerState] = useState<NavTriggerState>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('dasta_studio_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('dasta_studio_user');
      }
    }

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

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.trim().length < 2) {
      setLoginError('कृपया अपना सही नाम लिखें।');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(loginMobile.trim())) {
      setLoginError('कृपया 10 अंकों का सही मोबाइल नंबर डालें।');
      return;
    }
    const newUser: AppUser = {
      name: loginName.trim(),
      mobile: loginMobile.trim(),
      loginTime: new Date().toLocaleString('hi-IN'),
    };
    localStorage.setItem('dasta_studio_user', JSON.stringify(newUser));
    setUser(newUser);
    setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('dasta_studio_user');
    setUser(null);
  };

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

  // ऐप खुलने से पहले अनिवार्य यूज़र लॉगिन स्क्रीन
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 text-[#141413]">
        <div className="w-full max-w-md rounded-2xl border border-[#E6E1D6] bg-white p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#B8860B]/10 text-[#B8860B]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#141413]">
              दास्ता डिजिटल स्टूडियो
            </h1>
            <p className="mt-1 text-sm text-[#6B675E]">
              ऐप में प्रवेश करने के लिए कृपया अपना नाम और मोबाइल नंबर डालकर लॉगिन करें
            </p>
          </div>

          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#141413] mb-1">
                आपका पूरा नाम *
              </label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="जैसे: राहुल कुमार"
                className="w-full rounded-xl border border-[#E6E1D6] px-4 py-3 text-base focus:border-[#B8860B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#141413] mb-1">
                मोबाइल नंबर (10 अंक) *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="जैसे: 9876543210"
                className="w-full rounded-xl border border-[#E6E1D6] px-4 py-3 text-base focus:border-[#B8860B] focus:outline-none"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm font-medium text-red-600 bg-red-50 p-2.5 rounded-lg">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B8860B] py-3.5 text-base font-bold text-white shadow-md hover:bg-[#9A7009] transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              लॉगिन करें और ऐप खोलें
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#6B675E]">
            सुरक्षित और सत्यापित प्रवेश • दास्ता डिजिटल स्टूडियो
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413]">
      <header className="sticky top-0 z-30 h-[56px] border-b border-[#E6E1D6] bg-[#FAF9F6]/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => handleNavigateTab('home')}
            className="font-display text-lg font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0 sm:text-xl"
          >
            दास्ता डिजिटल स्टूडियो
          </button>

          <nav className="hidden md:flex items-center gap-6" aria-label="मुख्य नेविगेशन">
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

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={handleLogout}
              title="लॉगआउट करें"
              className="flex items-center gap-1 rounded-lg border border-[#E6E1D6] bg-white px-2.5 py-1.5 text-xs font-medium text-[#6B675E] hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">बाहर निकलें</span>
            </button>
          </div>
        </div>
      </header>

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

      <nav
        aria-label="मोबाइल नेविगेशन"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6E1D6] bg-white/95 backdrop-blur-md pb-safe md:hidden"
      >
        <div className="grid grid-cols-4 h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleNavigateTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  active ? 'text-[#B8860B] font-bold' : 'text-[#6B675E]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
  }
