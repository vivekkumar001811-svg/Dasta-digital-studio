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
import {useRef, useState} from 'react';

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
  // राजनीतिक पार्टियां
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

  // त्योहार एवं विशेष अवसर
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

  // विजिटिंग कार्ड
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
    const saved = localStorage.getItem('dasta_all_templates_v2');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [activeCategory, setActiveCategory] = useState<MakerCategory>('political');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sp');

  const filteredTemplates = templates.filter((t) => t.category === activeCategory);
  const activeTemplate =
    filteredTemplates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0];

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
