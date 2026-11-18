import {Download, ImagePlus, Lock, Plus, ShieldAlert, Sparkles, Unlock, User} from 'lucide-react';
import {useRef, useState} from 'react';

interface PoliticalParty {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  slogan: string;
  leadersText: string;
  leaderPhotoUrl: string;
}

const DEFAULT_PARTIES: PoliticalParty[] = [
  {
    id: 'sp',
    name: 'समाजवादी पार्टी (SP)',
    shortName: 'सपा',
    primaryColor: '#E31E24',
    secondaryColor: '#008B45',
    slogan: 'काम बोलता है • सबका सम्मान, सबका विकास',
    leadersText: 'मा. मुलायम सिंह यादव जी • मा. अखिलेश यादव जी',
    leaderPhotoUrl: 'https://wikimedia.org',
  },
  {
    id: 'bjp',
    name: 'भारतीय जनता पार्टी (BJP)',
    shortName: 'भाजपा',
    primaryColor: '#FF671F',
    secondaryColor: '#138808',
    slogan: 'सबका साथ, सबका विकास, सबका विश्वास',
    leadersText: 'मा. नरेंद्र मोदी जी • मा. योगी आदित्यनाथ जी • मा. जे.पी. नड्डा जी',
    leaderPhotoUrl: 'https://wikimedia.org',
  },
  {
    id: 'inc',
    name: 'भारतीय राष्ट्रीय कांग्रेस (INC)',
    shortName: 'कांग्रेस',
    primaryColor: '#19AAED',
    secondaryColor: '#008000',
    slogan: 'हाथ बदलेगा हालात • न्याय का हक मिलने तक',
    leadersText: 'मा. मल्लिकार्जुन खड़गे जी • मा. राहुल गांधी जी • मा. प्रियंका गांधी जी',
    leaderPhotoUrl: 'https://wikimedia.org',
  },
  {
    id: 'bsp',
    name: 'बहुजन समाज पार्टी (BSP)',
    shortName: 'बसपा',
    primaryColor: '#22409A',
    secondaryColor: '#FFFFFF',
    slogan: 'सर्वजन हिताय, सर्वजन सुखाय',
    leadersText: 'मान्यवर कांशीराम जी • बहन कु. मायावती जी',
    leaderPhotoUrl: 'https://wikimedia.org',
  },
  {
    id: 'aap',
    name: 'आम आदमी पार्टी (AAP)',
    shortName: 'आप',
    primaryColor: '#0072B0',
    secondaryColor: '#FDB913',
    slogan: 'ईमानदार राजनीति • शिक्षा और स्वास्थ्य की गारंटी',
    leadersText: 'मा. अरविंद केजरीवाल जी • मा. भगवंत मान जी',
    leaderPhotoUrl: 'https://wikimedia.org',
  },
  {
    id: 'rld',
    name: 'राष्ट्रीय लोक दल (RLD)',
    shortName: 'रालोद',
    primaryColor: '#009E49',
    secondaryColor: '#D9232E',
    slogan: 'जय जवान, जय किसान',
    leadersText: 'चौधरी चरण सिंह जी • मा. जयंत चौधरी जी',
    leaderPhotoUrl: '',
  },
  {
    id: 'rjd',
    name: 'राष्ट्रीय जनता दल (RJD)',
    shortName: 'राजद',
    primaryColor: '#008000',
    secondaryColor: '#FFFFFF',
    slogan: 'सामाजिक न्याय और धर्मनिरपेक्षता',
    leadersText: 'मा. लालू प्रसाद यादव जी • मा. तेजस्वी यादव जी',
    leaderPhotoUrl: '',
  },
  {
    id: 'jdu',
    name: 'जनता दल यूनाइटेड (JDU)',
    shortName: 'जदयू',
    primaryColor: '#006400',
    secondaryColor: '#FFFFFF',
    slogan: 'न्याय के साथ विकास',
    leadersText: 'मा. नीतीश कुमार जी',
    leaderPhotoUrl: '',
  },
  {
    id: 'other',
    name: 'अन्य सभी भारतीय पार्टियां / निर्दलीय',
    shortName: 'भारत',
    primaryColor: '#B8860B',
    secondaryColor: '#141413',
    slogan: 'जनसेवा ही हमारा संकल्प है',
    leadersText: 'जनता के आशीर्वाद से समाज सेवा में समर्पित',
    leaderPhotoUrl: '',
  },
];

// आपका गुप्त एडमिन पिन (इसे केवल आप जानते हैं)
const ADMIN_PIN = '7860';

export function PosterMakerTab() {
  const [parties, setParties] = useState<PoliticalParty[]>(() => {
    const saved = localStorage.getItem('dasta_political_parties');
    return saved ? JSON.parse(saved) : DEFAULT_PARTIES;
  });

  const [selectedPartyId, setSelectedPartyId] = useState<string>('sp');
  const [userName, setUserName] = useState('');
  const [userDesignation, setUserDesignation] = useState('युवा नेता / समाजसेवी');
  const [userMobile, setUserMobile] = useState('');
  const [occasionText, setOccasionText] = useState('हार्दिक शुभकामनाएं एवं अभिनंदन');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // एडमिन सुरक्षा लॉक स्टेट
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinBox, setShowPinBox] = useState(false);

  // नया बैनर/नेता जोड़ने के लिए एडमिन फॉर्म
  const [newPartyName, setNewPartyName] = useState('');
  const [newLeadersText, setNewLeadersText] = useState('');
  const [newColor, setNewColor] = useState('#E31E24');
  const [newLeaderImg, setNewLeaderImg] = useState('');

  const posterRef = useRef<HTMLDivElement>(null);

  const activeParty = parties.find((p) => p.id === selectedPartyId) || parties[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdminLeaderPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewLeaderImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdminUnlock = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdminUnlocked(true);
      setShowPinBox(false);
      setPinInput('');
    } else {
      alert('गलत एडमिन पिन! केवल स्टूडियो मालिक ही बदलाव कर सकते हैं।');
    }
  };

  const handleAddNewPartyBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    const updated: PoliticalParty[] = [
      ...parties,
      {
        id: 'custom_' + Date.now(),
        name: newPartyName.trim(),
        shortName: newPartyName.trim().slice(0, 8),
        primaryColor: newColor,
        secondaryColor: '#141413',
        slogan: 'जनसेवा और विकास हमारा संकल्प',
        leadersText: newLeadersText.trim() || 'पार्टी के शीर्ष नेतृत्व के आशीर्वाद सहित',
        leaderPhotoUrl: newLeaderImg,
      },
    ];
    setParties(updated);
    localStorage.setItem('dasta_political_parties', JSON.stringify(updated));
    setNewPartyName('');
    setNewLeadersText('');
    setNewLeaderImg('');
    alert('नया पार्टी बैनर सफलतापूर्वक जुड़ गया है!');
  };

  const handleDownloadPoster = () => {
    if (!userName.trim()) {
      alert('कृपया पोस्टर पर अपना नाम ज़रूर लिखें।');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* शीर्षक और एडमिन लॉक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E1D6] bg-white p-4 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold text-[#141413]">
            सभी पार्टियों का बैनर एवं पोस्टर मेकर
          </h2>
          <p className="text-xs text-[#6B675E]">
            पार्टी चुनें, अपनी फोटो लगाएं, नाम व नंबर डालें और तुरंत पोस्टर तैयार करें
          </p>
        </div>

        {!isAdminUnlocked ? (
          <button
            type="button"
            onClick={() => setShowPinBox(!showPinBox)}
            className="flex items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413]"
          >
            <Lock className="h-3.5 w-3.5 text-[#B8860B]" />
            एडमिन लॉक (केवल मालिक)
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdminUnlocked(false)}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <Unlock className="h-3.5 w-3.5" />
            एडमिन अनलॉक (लॉक करें)
          </button>
        )}
      </div>

      {/* एडमिन पिन बॉक्स */}
      {showPinBox && !isAdminUnlocked && (
        <div className="rounded-2xl border border-[#B8860B] bg-amber-50/70 p-4">
          <p className="text-sm font-bold text-[#141413] mb-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-[#B8860B]" />
            नए नेता या पार्टी बैनर जोड़ने के लिए एडमिन पिन डालें:
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="गुप्त पिन डालें"
              className="rounded-xl border border-[#E6E1D6] bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAdminUnlock}
              className="rounded-xl bg-[#B8860B] px-4 py-2 text-sm font-bold text-white"
            >
              खोलें
            </button>
          </div>
        </div>
      )}

      {/* एडमिन पैनल: नया बैनर और नेताओं की फोटो जोड़ने का फॉर्म */}
      {isAdminUnlocked && (
        <form
          onSubmit={handleAddNewPartyBanner}
          className="space-y-3 rounded-2xl border-2 border-dashed border-[#B8860B] bg-white p-4"
        >
          <h3 className="text-sm font-bold text-[#B8860B] flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> नया पार्टी बैनर और नेताओं का फोटो जोड़ें (एडमिन मोड)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              placeholder="पार्टी का नाम (जैसे: शिवसेना / TMC)"
              className="rounded-xl border border-[#E6E1D6] px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              value={newLeadersText}
              onChange={(e) => setNewLeadersText(e.target.value)}
