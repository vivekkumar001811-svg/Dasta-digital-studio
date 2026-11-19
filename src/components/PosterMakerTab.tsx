import {
  Award,
  Briefcase,
  Download,
  Flag,
  ImagePlus,
  Lock,
  MapPin,
  Phone,
  Plus,
  ShieldAlert,
  Sparkles,
  Unlock,
  User,
} from 'lucide-react';
import React, {useRef, useState} from 'react';

type MakerCategory = 'political' | 'festival' | 'visiting';

interface TemplateItem {
  id: string;
  category: MakerCategory;
  name: string;
  shortTag: string;
  primaryColor: string;
  secondaryColor: string;
  defaultTitle: string;
  defaultSubtitle: string;
  leadersOrDetails: string;
}

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    id: 'sp',
    category: 'political',
    name: 'समाजवादी पार्टी (SP)',
    shortTag: 'सपा',
    primaryColor: '#E31E24',
    secondaryColor: '#008B45',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'काम बोलता है • सबका सम्मान, सबका विकास',
    leadersOrDetails: 'मा. मुलायम सिंह यादव जी • मा. अखिलेश यादव जी',
  },
  {
    id: 'bjp',
    category: 'political',
    name: 'भारतीय जनता पार्टी (BJP)',
    shortTag: 'भाजपा',
    primaryColor: '#FF671F',
    secondaryColor: '#138808',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'सबका साथ, सबका विकास, सबका विश्वास',
    leadersOrDetails: 'मा. नरेंद्र मोदी जी • मा. योगी आदित्यनाथ जी • मा. जे.पी. नड्डा जी',
  },
  {
    id: 'inc',
    category: 'political',
    name: 'भारतीय राष्ट्रीय कांग्रेस (INC)',
    shortTag: 'कांग्रेस',
    primaryColor: '#19AAED',
    secondaryColor: '#008000',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'हाथ बदलेगा हालात • न्याय का हक मिलने तक',
    leadersOrDetails: 'मा. मल्लिकार्जुन खड़गे जी • मा. राहुल गांधी जी • मा. प्रियंका गांधी जी',
  },
  {
    id: 'bsp',
    category: 'political',
    name: 'बहुजन समाज पार्टी (BSP)',
    shortTag: 'बसपा',
    primaryColor: '#22409A',
    secondaryColor: '#141413',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं जय भीम',
    defaultSubtitle: 'सर्वजन हिताय, सर्वजन सुखाय',
    leadersOrDetails: 'मान्यवर कांशीराम जी • बहन कु. मायावती जी',
  },
  {
    id: 'aap',
    category: 'political',
    name: 'आम आदमी पार्टी (AAP)',
    shortTag: 'आप',
    primaryColor: '#0072B0',
    secondaryColor: '#FDB913',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'ईमानदार राजनीति • शिक्षा और स्वास्थ्य की गारंटी',
    leadersOrDetails: 'मा. अरविंद केजरीवाल जी • मा. भगवंत मान जी',
  },
  {
    id: 'rld',
    category: 'political',
    name: 'राष्ट्रीय लोक दल (RLD)',
    shortTag: 'रालोद',
    primaryColor: '#009E49',
    secondaryColor: '#D9232E',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'जय जवान, जय किसान',
    leadersOrDetails: 'चौधरी चरण सिंह जी • मा. जयंत चौधरी जी',
  },
  {
    id: 'rjd',
    category: 'political',
    name: 'राष्ट्रीय जनता दल (RJD)',
    shortTag: 'राजद',
    primaryColor: '#008000',
    secondaryColor: '#141413',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'सामाजिक न्याय और धर्मनिरपेक्षता',
    leadersOrDetails: 'मा. लालू प्रसाद यादव जी • मा. तेजस्वी यादव जी',
  },
  {
    id: 'jdu',
    category: 'political',
    name: 'जनता दल यूनाइटेड (JDU)',
    shortTag: 'जदयू',
    primaryColor: '#006400',
    secondaryColor: '#141413',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं अभिनंदन',
    defaultSubtitle: 'न्याय के साथ विकास',
    leadersOrDetails: 'मा. नीतीश कुमार जी',
  },
  {
    id: 'ind',
    category: 'political',
    name: 'निर्दलीय / ग्राम प्रधान / समाजसेवी',
    shortTag: 'समाजसेवी',
    primaryColor: '#B8860B',
    secondaryColor: '#141413',
    defaultTitle: 'हार्दिक शुभकामनाएं एवं आभार',
    defaultSubtitle: 'जनसेवा ही हमारा परम धर्म है',
    leadersOrDetails: 'समस्त क्षेत्रवासियों के स्नेह और आशीर्वाद सहित',
  },
  {
    id: 'diwali',
    category: 'festival',
    name: 'शुभ दीपावली एवं धनतेरस',
    shortTag: 'दीपावली',
    primaryColor: '#D97706',
    secondaryColor: '#7C2D12',
    defaultTitle: 'शुभ दीपावली की हार्दिक शुभकामनाएं',
    defaultSubtitle: 'माँ लक्ष्मी और श्री गणेश जी की कृपा आप पर सदैव बनी रहे',
    leadersOrDetails: 'दीपों का यह पावन पर्व आपके जीवन में सुख, समृद्धि और खुशहाली लाए',
  },
  {
    id: 'holi',
    category: 'festival',
    name: 'रंगोत्सव होली मिलन',
    shortTag: 'होली',
    primaryColor: '#DB2777',
    secondaryColor: '#7E22CE',
    defaultTitle: 'रंगों के महापर्व होली की शुभकामनाएं',
    defaultSubtitle: 'प्रेम, सौहार्द और खुशियों के रंगों से भरा रहे आपका जीवन',
    leadersOrDetails: 'समस्त देश एवं क्षेत्रवासियों को होली की ढेरों बधाइयां',
  },
  {
    id: 'eid',
    category: 'festival',
    name: 'ईद-उल-फितर / ईद मुबारक',
    shortTag: 'ईद मुबारक',
    primaryColor: '#059669',
    secondaryColor: '#064E3B',
    defaultTitle: 'ईद मुबारक • हार्दिक शुभकामनाएं',
    defaultSubtitle: 'अमन, चैन, भाईचारे और खुशियों की दुआओं के साथ',
    leadersOrDetails: 'आप सभी को ईद के मुबारक मौके पर दिल से मुबारकबाद',
  },
  {
    id: 'rakhi',
    category: 'festival',
    name: 'रक्षाबंधन पावन पर्व',
    shortTag: 'रक्षाबंधन',
    primaryColor: '#DC2626',
    secondaryColor: '#991B1B',
    defaultTitle: 'रक्षाबंधन की हार्दिक शुभकामनाएं',
    defaultSubtitle: 'भाई-बहन के अटूट प्रेम और विश्वास का पावन पर्व',
    leadersOrDetails: 'समस्त माताओं, बहनों और क्षेत्रवासियों को रक्षाबंधन की बधाई',
  },
  {
    id: 'navratri',
    category: 'festival',
    name: 'शारदीय / चैत्र नवरात्रि एवं दशहरा',
    shortTag: 'नवरात्रि',
    primaryColor: '#EA580C',
    secondaryColor: '#9A3412',
    defaultTitle: 'पावन नवरात्रि की हार्दिक शुभकामनाएं',
    defaultSubtitle: 'जय माता दी • माँ दुर्गा आप सभी की मनोकामनाएं पूर्ण करें',
    leadersOrDetails: 'शक्ति, भक्ति और विजय के पावन पर्व की मंगलकामनाएं',
  },
  {
    id: 'independence',
    category: 'festival',
    name: 'स्वतंत्रता दिवस / गणतंत्र दिवस',
    shortTag: 'राष्ट्रीय पर्व',
    primaryColor: '#FF671F',
    secondaryColor: '#138808',
    defaultTitle: 'राष्ट्रीय पर्व की हार्दिक शुभकामनाएं',
    defaultSubtitle: 'वंदे मातरम् • भारत माता की जय • जय हिंद',
    leadersOrDetails: 'आइए मिलकर सशक्त, समृद्ध और आत्मनिर्भर भारत का निर्माण करें',
  },
  {
    id: 'birthday',
    category: 'festival',
    name: 'जन्मदिन एवं वैवाहिक वर्षगांठ बधाई',
    shortTag: 'जन्मदिन',
    primaryColor: '#4F46E5',
    secondaryColor: '#1E1B4B',
    defaultTitle: 'जन्मदिन की हार्दिक बधाई एवं शुभकामनाएं',
    defaultSubtitle: 'ईश्वर आपको उत्तम स्वास्थ्य और दीर्घायु प्रदान करें',
    leadersOrDetails: 'आप जीवन में सदैव उन्नति के शिखर पर आगे बढ़ते रहें',
  },
  {
    id: 'card_royal',
    category: 'visiting',
    name: 'रॉयल गोल्ड बिजनेस कार्ड',
    shortTag: 'प्रीमियम कार्ड',
    primaryColor: '#141413',
    secondaryColor: '#B8860B',
    defaultTitle: 'आपकी दुकान / संस्था का नाम',
    defaultSubtitle: 'हमारे यहाँ सभी कार्य संतोषजनक एवं उचित मूल्य पर किए जाते हैं',
    leadersOrDetails: 'पता: मुख्य बाजार, तहसील रोड, जनपद कासगंज (उ.प्र.)',
  },
  {
    id: 'card_blue',
    category: 'visiting',
    name: 'प्रोफेशनल ब्लू विजिटिंग कार्ड',
    shortTag: 'ऑफिस कार्ड',
    primaryColor: '#1E3A8A',
    secondaryColor: '#0284C7',
    defaultTitle: 'आपकी कंपनी / प्रेस / कार्यालय का नाम',
    defaultSubtitle: 'विश्वसनीय सेवा • आधुनिक तकनीक • त्वरित समाधान',
    leadersOrDetails: 'पता: आपका पूरा पता यहाँ लिखें',
  },
  {
    id: 'card_red',
    category: 'visiting',
    name: 'मीडिया / प्रेस / जनसेवा कार्ड',
    shortTag: 'प्रेस / सेवा',
    primaryColor: '#991B1B',
    secondaryColor: '#141413',
    defaultTitle: 'प्रेस / जनसेवा केंद्र / स्टूडियो नाम',
    defaultSubtitle: 'सत्य के साथ • जनहित में सदैव समर्पित',
    leadersOrDetails: 'पता: जिला मुख्यालय / ग्राम एवं पोस्ट का नाम',
  },
];

const ADMIN_PIN = '7860';
export function PosterMakerTab() {
  const [templates, setTemplates] = useState<TemplateItem[]>(() => {
    try {
      const saved = localStorage.getItem('dasta_all_templates_v2');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [activeCategory, setActiveCategory] = useState<MakerCategory>('political');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sp');

  const filteredTemplates = templates.filter((t) => t.category === activeCategory);
  const activeTemplate =
    filteredTemplates.find((t) => t.id === selectedTemplateId) ||
    filteredTemplates[0] ||
    DEFAULT_TEMPLATES[0];

  const [userName, setUserName] = useState('');
  const [userDesignation, setUserDesignation] = useState('युवा नेता / समाजसेवी');
  const [userMobile, setUserMobile] = useState('');
  const [customTitle, setCustomTitle] = useState(activeTemplate.defaultTitle);
  const [customAddressOrSub, setCustomAddressOrSub] = useState(activeTemplate.leadersOrDetails);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinBox, setShowPinBox] = useState(false);

  const [newItemName, setNewItemName] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDetails, setNewItemDetails] = useState('');
  const [newItemColor, setNewItemColor] = useState('#E31E24');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCategoryChange = (cat: MakerCategory) => {
    setActiveCategory(cat);
    const first = templates.find((t) => t.category === cat);
    if (first) {
      setSelectedTemplateId(first.id);
      setCustomTitle(first.defaultTitle);
      setCustomAddressOrSub(first.leadersOrDetails);
      if (cat === 'visiting') {
        setUserDesignation('प्रोपराइटर / संचालक');
      } else if (cat === 'festival') {
        setUserDesignation('शुभेच्छु / समाजसेवी');
      } else {
        setUserDesignation('युवा नेता / समाजसेवी');
      }
    }
  };

  const handleTemplateSelect = (tpl: TemplateItem) => {
    setSelectedTemplateId(tpl.id);
    setCustomTitle(tpl.defaultTitle);
    setCustomAddressOrSub(tpl.leadersOrDetails);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserPhoto(reader.result as string);
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

  const handleAddNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newTpl: TemplateItem = {
      id: 'custom_' + Date.now(),
      category: activeCategory,
      name: newItemName.trim(),
      shortTag: newItemName.trim().slice(0, 10),
      primaryColor: newItemColor,
      secondaryColor: '#141413',
      defaultTitle: newItemTitle.trim() || 'हार्दिक शुभकामनाएं एवं अभिनंदन',
      defaultSubtitle: 'जनसेवा एवं विश्वास हमारा संकल्प',
      leadersOrDetails: newItemDetails.trim() || 'Dasta Digital Photo Studio द्वारा प्रस्तुत',
    };
    const updated = [...templates, newTpl];
    setTemplates(updated);
    localStorage.setItem('dasta_all_templates_v2', JSON.stringify(updated));
    setSelectedTemplateId(newTpl.id);
    setCustomTitle(newTpl.defaultTitle);
    setCustomAddressOrSub(newTpl.leadersOrDetails);
    setNewItemName('');
    setNewItemTitle('');
    setNewItemDetails('');
    alert('नया टेम्पलेट सफलतापूर्वक जुड़ गया है!');
  };

  const handleDownloadHDImage = () => {
    if (!userName.trim()) {
      alert('कृपया पोस्टर या कार्ड पर अपना नाम ज़रूर लिखें।');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isVisiting = activeCategory === 'visiting';
    canvas.width = isVisiting ? 1050 : 1080;
    canvas.height = isVisiting ? 600 : 1080;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, activeTemplate.primaryColor);
    grad.addColorStop(1, activeTemplate.secondaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fillRect(35, 35, canvas.width - 70, canvas.height - 70);

    ctx.fillStyle = activeTemplate.primaryColor;
    ctx.fillRect(35, 35, canvas.width - 70, isVisiting ? 110 : 150);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = isVisiting ? 'bold 34px sans-serif' : 'bold 36px sans-serif';
    ctx.fillText(activeTemplate.name, canvas.width / 2, isVisiting ? 102 : 122);

    ctx.fillStyle = activeTemplate.primaryColor;
    ctx.font = isVisiting ? 'bold 42px sans-serif' : 'bold 52px sans-serif';
    ctx.fillText(customTitle, canvas.width / 2, isVisiting ? 210 : 270);

    ctx.fillStyle = '#333333';
    ctx.font = isVisiting ? '600 24px sans-serif' : '600 30px sans-serif';
    ctx.fillText(activeTemplate.defaultSubtitle, canvas.width / 2, isVisiting ? 255 : 330);

    ctx.fillStyle = '#4B5563';
    ctx.font = isVisiting ? '22px sans-serif' : '26px sans-serif';
    ctx.fillText(customAddressOrSub, canvas.width / 2, isVisiting ? 300 : 385);

    const drawBottomAndFinish = () => {
      const barY = isVisiting ? 430 : 810;
      const barH = isVisiting ? 135 : 195;

      ctx.fillStyle = activeTemplate.secondaryColor;
      ctx.fillRect(35, barY, canvas.width - 70, barH);

      ctx.textAlign = 'left';
      const textStartX = userPhoto ? (isVisiting ? 250 : 380) : 80;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = isVisiting ? 'bold 40px sans-serif' : 'bold 54px sans-serif';
      ctx.fillText(userName, textStartX, barY + (isVisiting ? 55 : 75));

      ctx.fillStyle = '#FDE047';
      ctx.font = isVisiting ? 'bold 26px sans-serif' : 'bold 34px sans-serif';
      ctx.fillText(userDesignation, textStartX, barY + (isVisiting ? 95 : 125));

      if (userMobile.trim()) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = isVisiting ? 'bold 24px sans-serif' : 'bold 30px sans-serif';
        ctx.fillText('मो. ' + userMobile, textStartX, barY + (isVisiting ? 125 : 170));
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Dasta Digital Photo Studio', canvas.width - 60, barY + barH - 16);

      const link = document.createElement('a');
      link.download = `${userName.replace(/\s+/g, '_')}_${activeTemplate.shortTag}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    if (userPhoto) {
      const img = new Image();
      img.onload = () => {
        const imgSize = isVisiting ? 175 : 320;
        const imgX = 55;
        const imgY = isVisiting ? 375 : 670;

        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.strokeRect(imgX, imgY, imgSize, imgSize);

        drawBottomAndFinish();
      };
      img.src = userPhoto;
    } else {
      drawBottomAndFinish();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E1D6] bg-white p-4 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold text-[#141413]">
            पोस्टर, त्योहार बैनर एवं विजिटिंग कार्ड मेकर
          </h2>
          <p className="text-xs text-[#6B675E]">
            पार्टी, त्योहार या विजिटिंग कार्ड चुनें — अपनी फोटो व नाम लगाकर तुरंत HD इमेज डाउनलोड करें
          </p>
        </div>

        {!isAdminUnlocked ? (
          <button
            type="button"
            onClick={() => setShowPinBox(!showPinBox)}
            className="flex items-center gap-1.5 rounded-xl border border-[#E6E1D6] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413]"
          >
            <Lock className="h-3.5 w-3.5 text-[#B8860B]" />
            एडमिन लॉक
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdminUnlocked(false)}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <Unlock className="h-3.5 w-3.5" />
            एडमिन अनलॉक
          </button>
        )}
      </div>

      {showPinBox && !isAdminUnlocked && (
        <div className="rounded-2xl border border-[#B8860B] bg-amber-50/70 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#141413]">
            <ShieldAlert className="h-4 w-4 text-[#B8860B]" />
            नए टेम्पलेट जोड़ने के लिए एडमिन पिन डालें:
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

      {isAdminUnlocked && (
        <form
          onSubmit={handleAddNewTemplate}
          className="space-y-3 rounded-2xl border-2 border-dashed border-[#B8860B] bg-white p-4"
        >
            >
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#B8860B]">
            <Plus className="h-4 w-4" /> वर्तमान कैटेगरी में नया पोस्टर/कार्ड जोड़ें
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="पार्टी / त्योहार / कार्ड का नाम"
              className="rounded-xl border border-[#E6E1D6] px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="मुख्य शुभकामना संदेश"
              className="rounded-xl border border-[#E6E1D6] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newItemDetails}
              onChange={(e) => setNewItemDetails(e.target.value)}
              placeholder="शीर्ष नेताओं के नाम या पता"
              className="flex-1 rounded-xl border border-[#E6E1D6] px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-[#141413]">
              थीम रंग:
              <input
                type="color"
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-[#141413] px-4 py-2 text-xs font-bold text-white"
            >
              टेम्पलेट जोड़ें
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#F3EFE6] p-1.5">
        <button
          type="button"
          onClick={() => handleCategoryChange('political')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition sm:text-sm ${
            activeCategory === 'political'
              ? 'bg-[#141413] text-white shadow'
              : 'text-[#6B675E] hover:text-[#141413]'
          }`}
        >
          <Flag className="h-4 w-4" />
          राजनीतिक बैनर
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('festival')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition sm:text-sm ${
            activeCategory === 'festival'
              ? 'bg-[#141413] text-white shadow'
              : 'text-[#6B675E] hover:text-[#141413]'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          सभी त्योहार
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('visiting')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition sm:text-sm ${
            activeCategory === 'visiting'
              ? 'bg-[#141413] text-white shadow'
              : 'text-[#6B675E] hover:text-[#141413]'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          विजिटिंग कार्ड
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[#6B675E]">
          1. नीचे से अपना पसंदीदा डिजाइन चुनें:
        </p>
        <div className="flex flex-wrap gap-2">
          {filteredTemplates.map((tpl) => {
            const isSelected = tpl.id === activeTemplate.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleTemplateSelect(tpl)}
                style={{
                  backgroundColor: isSelected ? tpl.primaryColor : '#FFFFFF',
                  borderColor: tpl.primaryColor,
                  color: isSelected ? '#FFFFFF' : '#141413',
                }}
                className="rounded-xl border-2 px-3 py-1.5 text-xs font-bold shadow-sm transition"
              >
                {tpl.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[#E6E1D6] bg-white p-4 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-[#141413]">
            आपका पूरा नाम *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-[#6B675E]" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="अपना नाम लिखें"
              className="w-full rounded-xl border border-[#E6E1D6] py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#141413]">
            पद / व्यवसाय / परिचय
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-2.5 h-4 w-4 text-[#6B675E]" />
            <input
              type="text"
              value={userDesignation}
              onChange={(e) => setUserDesignation(e.target.value)}
              placeholder="जैसे: ग्राम प्रधान / समाजसेवी / संचालक"
              className="w-full rounded-xl border border-[#E6E1D6] py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#141413]">
            मोबाइल नंबर
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#6B675E]" />
            <input
              type="tel"
              value={userMobile}
              onChange={(e) => setUserMobile(e.target.value)}
              placeholder="98XXXXXXXX"
              className="w-full rounded-xl border border-[#E6E1D6] py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#141413]">
            अपनी फोटो या दुकान का लोगो चुनें
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#B8860B] bg-amber-50/40 px-3 py-2 text-xs font-bold text-[#141413]">
            <ImagePlus className="h-4 w-4 text-[#B8860B]" />
            {userPhoto ? 'फोटो बदलें (फोटो लग गई है)' : 'गैलरी से फोटो चुनें'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#141413]">
            {activeCategory === 'visiting'
              ? 'दुकान / संस्था का मुख्य नाम'
              : 'शुभकामना संदेश (बदल भी सकते हैं)'}
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full rounded-xl border border-[#E6E1D6] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#141413]">
            {activeCategory === 'visiting'
              ? 'पूरा पता (Address)'
              : 'शीर्ष नेताओं के नाम या विशेष संदेश'}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#6B675E]" />
            <input
              type="text"
              value={customAddressOrSub}
              onChange={(e) => setCustomAddressOrSub(e.target.value)}
              className="w-full rounded-xl border border-[#E6E1D6] py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[#6B675E]">
          2. लाइव प्रिव्यू (आपका बैनर/कार्ड ऐसा दिखेगा):
        </p>
        <div
          style={{
            background: `linear-gradient(135deg, ${activeTemplate.primaryColor}, ${activeTemplate.secondaryColor})`,
          }}
          className={`mx-auto flex flex-col justify-between overflow-hidden rounded-3xl p-3 shadow-xl ${
            activeCategory === 'visiting' ? 'aspect-[16/9] max-w-xl' : 'aspect-square max-w-md'
          }`}
        >
          <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-white/95">
            <div
              style={{backgroundColor: activeTemplate.primaryColor}}
              className="px-4 py-2.5 text-center text-xs font-bold text-white sm:text-sm"
            >
              {activeTemplate.name}
            </div>

            <div className="my-auto space-y-1.5 px-4 py-2 text-center">
              <h3
                style={{color: activeTemplate.primaryColor}}
                className="text-lg font-extrabold leading-tight sm:text-2xl"
              >
                {customTitle}
              </h3>
              <p className="text-xs font-semibold text-gray-800 sm:text-sm">
                {activeTemplate.defaultSubtitle}
              </p>
              <p className="text-[11px] text-gray-600 sm:text-xs">{customAddressOrSub}</p>
            </div>

            <div
              style={{backgroundColor: activeTemplate.secondaryColor}}
              className="relative flex items-center gap-3 px-4 py-3 text-white"
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="User"
                  className="h-16 w-16 shrink-0 rounded-xl border-2 border-white object-cover shadow sm:h-20 sm:w-20"
                />
              ) : (
            
