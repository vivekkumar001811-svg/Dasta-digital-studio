import {CalendarHeart, CheckCircle2, Edit3, Lock, Save, Send, ShieldAlert, Unlock} from 'lucide-react';
import {useState} from 'react';

interface StudioPackage {
  id: string;
  tier: string;
  title: string;
  price: string;
  features: string[];
}

const DEFAULT_PACKAGES: StudioPackage[] = [
  {
    id: 'low-budget',
    tier: 'लो बजट पैकेज',
    title: 'बेसिक वेडिंग एवं इवेंट पैकेज',
    price: '₹15,000',
    features: [
      '1 प्रोफेशनल फोटोग्राफर + 1 HD वीडियोग्राफर',
      'शादी या पार्टी के सभी मुख्य कार्यक्रमों की कवरेज',
      '150 एडिटेड फोटो + 1 फुल HD वीडियो पेनड्राइव में',
      'मोबाइल ऐप में QR कोड के ज़रिए फोटो सिलेक्शन सुविधा',
    ],
  },
  {
    id: 'medium-budget',
    tier: 'मीडियम बजट पैकेज',
    title: 'स्टैंडर्ड डिजिटल एल्बम पैकेज',
    price: '₹35,000',
    features: [
      'कैंडिड फोटोग्राफी + सिनेमैटिक वीडियोग्राफी',
      '30 शीट की प्रीमियम करिज्मा (Karizma) फोटो एल्बम',
      'हल्दी, मेहंदी और शादी के सभी फंक्शन की कवरेज',
      'हाईलाइट वीडियो रील्स + ऑनलाइन QR गैलरी',
    ],
  },
  {
    id: 'high-budget',
    tier: 'हाई बजट रॉयल पैकेज',
    title: 'प्रीमियम ड्रोन एवं सिनेमैटिक पैकेज',
    price: '₹65,000',
    features: [
      '4K सिनेमैटिक कैमरा + ड्रोन (Drone) कवरेज + LED वॉल',
      'प्री-वेडिंग शूट + 50 शीट की लग्ज़री फोटो एल्बम',
      'पूरी टीम (फोटोग्राफर, सिनेमैटोग्राफर, ड्रोन ऑपरेटर)',
      'सेम-डे शादी रील्स + लाइफटाइम क्लाउड फोटो सिलेक्शन',
    ],
  },
];

// आपका गुप्त एडमिन पिन (केवल आप ही पैसे बदल सकते हैं)
const ADMIN_PIN = '7860';

export function BookStudioTab({preselectedPackageId}: {preselectedPackageId?: string}) {
  const [packages, setPackages] = useState<StudioPackage[]>(() => {
    const saved = localStorage.getItem('dasta_studio_packages');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
  });

  const [selectedPkgId, setSelectedPkgId] = useState<string>(preselectedPackageId || 'medium-budget');
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [studioWhatsapp, setStudioWhatsapp] = useState(() => {
    return localStorage.getItem('dasta_studio_whatsapp') || '919876543210';
  });

  // एडमिन सुरक्षा लॉक
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinBox, setShowPinBox] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editFeaturesText, setEditFeaturesText] = useState('');

  const handleUnlockAdmin = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdminUnlocked(true);
      setShowPinBox(false);
      setPinInput('');
    } else {
      alert('गलत एडमिन पिन! केवल दास्ता डिजिटल स्टूडियो के मालिक ही पैसे एडिट कर सकते हैं।');
    }
  };

  const startEditingPackage = (pkg: StudioPackage) => {
    setEditingPkgId(pkg.id);
    setEditPrice(pkg.price);
    setEditTitle(pkg.title);
    setEditFeaturesText(pkg.features.join('\n'));
  };

  const saveEditedPackage = (pkgId: string) => {
    const updated = packages.map((pkg) => {
      if (pkg.id !== pkgId) return pkg;
      return {
        ...pkg,
        title: editTitle.trim() || pkg.title,
        price: editPrice.trim() || pkg.price,
        features: editFeaturesText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      };
    });
    setPackages(updated);
    localStorage.setItem('dasta_studio_packages', JSON.stringify(updated));
    setEditingPkgId(null);
    alert('पैकेज के पैसे और विवरण सफलतापूर्वक अपडेट हो गए हैं!');
  };

  const handleSaveWhatsapp = (num: string) => {
    const clean = num.replace(/\D/g, '');
    setStudioWhatsapp(clean);
    localStorage.setItem('dasta_studio_whatsapp', clean);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find((p) => p.id === selectedPkgId) || packages[0];
    const msg = `नमस्ते दास्ता डिजिटल स्टूडियो,%0Aमैं अपने कार्यक्रम की बुकिंग करना चाहता/चाहती हूँ:%0A• नाम: ${clientName}%0A• मोबाइल: ${clientMobile}%0A• पैकेज: ${pkg.tier} (${pkg.price})%0A• तारीख: ${eventDate}%0A• स्थान: ${eventLocation}`;
    window.open(`https://wa.me{studioWhatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* शीर्षक और एडमिन लॉक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E1D6] bg-white p-4 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold text-[#141413]">
            फोटोग्राफी एवं वीडियोग्राफी पैकेज
          </h2>
          <p className="text-xs text-[#6B675E]">
            लो बजट से लेकर हाई बजट रॉयल पैकेज चुनें और अपनी तारीख बुक करें
          </p>
        </div>

        {!isAdminUnlocked ? (
          <button
            type="button"
            onClick={() => setShowPinBox(!showPinBox)}
            className="flex items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413]"
          >
            <Lock className="h-3.5 w-3.5 text-[#B8860B]" />
            पैसे एडिट करें (एडमिन लॉक)
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsAdminUnlocked(false);
              setEditingPkgId(null);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <Unlock className="h-3.5 w-3.5" />
            एडमिन मोड चालू (लॉक करें)
          </button>
        )}
      </div>

      {/* एडमिन पिन बॉक्स */}
      {showPinBox && !isAdminUnlocked && (
        <div className="rounded-2xl border border-[#B8860B] bg-amber-50/70 p-4">
          <p className="text-sm font-bold text-[#141413] mb-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-[#B8860B]" />
            पैकेज के पैसे बदलने के लिए अपना गुप्त एडमिन पिन डालें:
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="एडमिन पिन डालें"
              className="rounded-xl border border-[#E6E1D6] bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleUnlockAdmin}
              className="rounded-xl bg-[#B8860B] px-4 py-2 text-sm font-bold text-white"
            >
              खोलें
            </button>
          </div>
        </div>
      )}

      {/* एडमिन के लिए अपना व्हाट्सएप नंबर सेट करने का बॉक्स */}
      {isAdminUnlocked && (
        <div className="rounded-2xl border-2 border-dashed border-[#B8860B] bg-white p-4">
          <label className="block text-xs font-bold text-[#B8860B] mb-1">
            आपका स्टूडियो व्हाट्सएप नंबर (91 के साथ, जिस पर बुकिंग व फोटो सिलेक्शन आएगा):
          </label>
          <input
            type="tel"
            value={studioWhatsapp}
            onChange={(e) => handleSaveWhatsapp(e.target.value)}
            placeholder="जैसे: 919876543210"
            className="w-full max-w-xs rounded-xl border border-[#E6E1D6] px-3 py-2 text-sm font-bold"
          />
        </div>
      )}

      {/* पैकेज कार्ड्स */}
      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPkgId;
          const isEditing = editingPkgId === pkg.id;

          return (
            <div
              key={pkg.id}
              onClick={() => !isEditing && setSelectedPkgId(pkg.id)}
              className={`cursor-pointer rounded-2xl border-2 p-5 transition-all bg-white ${
                isSelected ? 'border-[#B8860B] shadow-md' : 'border-[#E6E1D6]'
              }`}
            >
              {isEditing ? (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <p className="text-xs font-bold text-[#B8860B]">{pkg.tier} एडिट करें:</p>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#E6E1D6] px-2.5 py-1.5 text-sm font-bold"
                    placeholder="पैकेज का नाम"
                  />
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-lg border border-[#B8860B] px-2.5 py-1.5 text-base font-extrabold text-[#B8860B]"
                    placeholder="पैसे लिखें (जैसे: ₹18,000)"
                  />
                  <textarea
                    rows={4}
                    value={editFeaturesText}
                    onChange={(e) => setEditFeaturesText(e.target.value)}
                    className="w-full rounded-lg border border-[#E6E1D6] p-2 text-xs"
                    placeholder="हर सुविधा नई लाइन में लिखें"
                  />
                  <button
                    type="button"
                    onClick={() => saveEditedPackage(pkg.id)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl bg-green-600 py-2 text-xs font-bold text-white"
                  >
                    <Save className="h-3.5 w-3.5" /> नए पैसे सेव करें
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#B8860B]/15 px-3 py-1 text-xs font-bold text-[#B8860B]">
                      {pkg.tier}
  
