/**
 * Types and interfaces for Smart Expert judicial real estate expert system.
 */

export interface Heir {
  id: string;
  name: string;
  gender: 'male' | 'female';
  relationship: 'son' | 'daughter' | 'wife' | 'husband' | 'father' | 'mother';
  selected?: boolean;
}

export interface Dispute {
  hasDispute: boolean;
  type: 'none' | 'ownership' | 'boundary' | 'contract' | 'inheritance' | 'rent' | 'construction';
  details: string;
}

export interface CourtSession {
  id: string;
  date: string; // e.g., "2026-07-15"
  time: string; // e.g., "10:00"
  type: string; // e.g., "معاينة ميدانية", "نطق بالحكم", "جلسة خبراء", "تقديم مذكرات"
  notes: string;
}

export interface FieldReference {
  id: string;
  title: string;
  type: 'legal' | 'engineering' | 'precedent' | 'other';
  text: string;
}

export interface FieldPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  timestamp?: string;
}

export interface CaseData {
  caseNumber: string;
  title: string;
  court: string;
  judge: string;
  expertName: string;
  date: string;
  status: 'جديدة' | 'قيد النظر' | 'مغلقة' | 'منجزة';
  
  // Land specifications
  landArea: number; // in sqm
  landType: 'زراعية' | 'بناء' | 'صحراوية' | 'صناعية' | 'تجارية';
  location: string;
  
  // Building specifications
  hasBuilding: boolean;
  buildingArea: number; // in sqm
  floors: number;
  finishType: 'قديم' | 'لوكس' | 'سوبر لوكس' | 'الترا سوبر لوكس' | 'نصف تشطيب';
  buildingType: 'سكني' | 'صناعي' | 'تجاري' | 'إداري';
  buildingAge: number; // in years
  
  // Financial details
  annualRent: number;
  transactionValue: number;
  
  // Heirs (for inheritance dispute/distribution)
  heirs: Heir[];
  estateValue: number;
  
  // Dispute
  dispute: Dispute;
  
  // GPS & Coordinates
  latitude: number;
  longitude: number;

  complianceScore?: number; // matching score with official documents (0-100)
  scannedArea?: number; // GPS scanned area

  plaintiff?: string; // اسم المدعي
  defendant?: string; // اسم المدعى عليه
  caseType?: string; // نوع القضية (جنائي، مدني، إداري، إلخ)

  // Upcoming Court Sessions & schedule
  sessions?: CourtSession[];

  // Field Photos & Approved References
  photos?: FieldPhoto[];
  references?: FieldReference[];

  // Client / User Details (ثابتة)
  clientName?: string;
  clientNationalId?: string;
  clientBirthDate?: string;
  clientJob?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;

  // Dynamic property details
  propertyType?: 'land' | 'apartment' | 'commercial';
  landUnit?: 'فدان' | 'قيراط' | 'متر';
  landZamam?: 'زمام' | 'صحراوي';
  landPieceNum?: string;
  landBasinNum?: string;
  landSectionNum?: string;
  landBoundaries?: { east?: string; west?: string; north?: string; south?: string };
  landOwnershipType?: 'ملكية خاصة' | 'ملكية دولة' | 'وقف' | 'مشاع';

  // Apartment details
  apartmentAddress?: string;
  apartmentFloorAndNumber?: string;
  apartmentAreaSqm?: number;
  apartmentRelationType?: 'old_rent' | 'new_rent' | 'inheritance' | 'waqf' | 'other';
  apartmentOldRentValue?: string;
  apartmentOldRentDetails?: string;
  apartmentNewRentValue?: string;
  apartmentNewRentDetails?: string;
  apartmentInheritanceDetails?: string;
  apartmentWaqfSupervisor?: string;
  apartmentWaqfDetails?: string;
  apartmentOtherDetails?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  sector: 'أراضي' | 'إنشاءات' | 'ميراث' | 'أوقاف' | 'قانون' | 'قضاء' | 'هندسة' | 'خرائط' | 'زراعة' | 'تعليم' | 'اقتصاد' | 'GPS' | 'عام';
  status: 'active' | 'busy' | 'idle';
  accuracy: number; // Percentage, e.g. 87
  tasksProcessed: number;
  description: string;
}

export interface CalculationResults {
  // Area and Land
  faddan: number;
  qirat: number;
  sahm: number;
  landValue: number;
  
  // Construction
  concreteVolume: number;
  steelWeight: number;
  bricksCount: number;
  cementTons: number;
  constructionCost: number;
  depreciatedBuildingValue: number;
  
  // Total Valuation
  totalPropertyValue: number;
  
  // Financials & ROI
  netAnnualIncome: number;
  roi: number;
  grm: number;
  capRate: number;
  
  // Taxes & Fees
  propertyTax: number;
  transferTax: number;
  registrationFee: number;
  notaryFee: number;
  
  // Heirs shares
  heirsShares: Array<{
    id: string;
    name: string;
    gender: 'ذكر' | 'أنثى';
    shareFraction: string;
    sharePercent: number;
    shareValue: number;
  }>;
}
