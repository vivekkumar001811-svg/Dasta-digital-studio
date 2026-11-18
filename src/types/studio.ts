export type TabId = 'home' | 'gallery' | 'poster' | 'book';

export type PhotoCategory = 'Ceremony' | 'Portraits' | 'Candid' | 'Aerial';

export interface EventPhoto {
  id: string;
  url: string;
  title: string;
  category: PhotoCategory;
  uploadedAt: string;
}

export interface StudioEvent {
  code: string;
  title: string;
  clientName: string;
  eventDate: string;
  location: string;
  coverUrl: string;
  createdAt: string;
  photos: EventPhoto[];
}

export interface WeddingOffer {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  discountText: string;
  validUntil: string;
  imageUrl: string;
  packageId: string;
}

export interface StudioPackage {
  id: string;
  name: string;
  category: 'Wedding' | 'Pre-Wedding' | 'Drone Cinema';
  priceInr: number;
  duration: string;
  deliverables: string[];
  includesDrone: boolean;
  highlight?: string;
}

export type PosterCategory = 'Wedding' | 'Festival' | 'Business';

export interface PosterTemplate {
  id: string;
  name: string;
  category: PosterCategory;
  bgPrimary: string;
  bgSecondary: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  defaultHeadline: string;
  defaultSubheadline: string;
  frameStyle: 'arch' | 'circle' | 'editorial';
}
