export type RiskLevel = 'extreme' | 'high' | 'medium' | 'safe';

export type ScamCategory =
  | 'call_center'
  | 'fake_police'
  | 'fake_courier'
  | 'loan_scam'
  | 'phishing_sms'
  | 'tax_scam'
  | 'telemarketing'
  | 'verified_official';

export interface ScamNumberEntry {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
  callerName: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  category: ScamCategory;
  categoryLabelTh: string;
  reportCount: number;
  lastReportedAt: string;
  commonScript: string;
  description: string;
  tags: string[];
  isAutoBlocked?: boolean;
  source: 'community' | 'official_cyber' | 'user';
  prefixType?: 'voip_international' | 'mobile_th' | 'landline_th' | 'toll_free';
}

export interface IncomingCall {
  id: string;
  phoneNumber: string;
  timestamp: string;
  matchedEntry: ScamNumberEntry;
  simulatedAudioScript?: string;
  status: 'ringing' | 'blocked' | 'rejected' | 'accepted' | 'ended';
  wasAutoBlocked?: boolean;
}

export interface ScamAnalysisResult {
  phoneNumber: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  identifiedTactics: string[];
  dangerIndicators: string[];
  recommendedActions: string[];
  warningNotice: string;
  emergencyContact: string;
  aiAnalyzed?: boolean;
}

export interface AutoProtectionSettings {
  enabled: boolean;
  autoBlockExtremeDanger: boolean;
  autoBlockVoIPSpoofing: boolean; // +697, +698
  alertSound: boolean;
  vibration: boolean;
  showFloatingCallerOverlay: boolean;
  strictFilter: boolean;
}

export interface CallHistoryItem {
  id: string;
  phoneNumber: string;
  timestamp: string;
  actionTaken: 'blocked_automatically' | 'user_declined' | 'user_answered' | 'flagged';
  callerName: string;
  riskLevel: RiskLevel;
  categoryLabelTh: string;
}

export interface NewReportFormData {
  phoneNumber: string;
  callerName: string;
  category: ScamCategory;
  riskLevel: RiskLevel;
  commonScript: string;
  description: string;
}
