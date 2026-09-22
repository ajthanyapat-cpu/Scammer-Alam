import { ScamAnalysisResult } from '../types';

export function analyzePhoneNumber(
  phoneNumber: string,
  callerScript?: string,
  callerName?: string
): ScamAnalysisResult {
  const cleanNum = phoneNumber.replace(/[\s\-\(\)]/g, '');
  let riskScore = 15;
  let riskLevel: 'extreme' | 'high' | 'medium' | 'safe' = 'safe';
  const tactics: string[] = [];
  const dangerIndicators: string[] = [];
  const actions: string[] = [
    'ห้ามโอนเงินหรือให้ข้อมูลส่วนตัวเด็ดขาด',
    'อย่าหลงเชื่อหากมีการเร่งรัดให้ตัดสินใจ',
    'หากได้รับความเสียหาย โทรแจ้งศูนย์ AOC 1441 ทันที',
  ];

  // Official white-list
  if (['1441', '191', '1599', '1155', '1111'].includes(cleanNum)) {
    return {
      phoneNumber,
      riskScore: 0,
      riskLevel: 'safe',
      summary: 'หมายเลขทางการของหน่วยงานรัฐ ปลอดภัยในการติดต่อ',
      identifiedTactics: ['หมายเลขสายด่วนฉุกเฉินทางการที่ได้รับการรับรอง'],
      dangerIndicators: [],
      recommendedActions: ['ติดต่อสอบถามหรือแจ้งเหตุด่วนได้ตามปกติ'],
      warningNotice: 'หมายเลขนี้เป็นศูนย์บริการทางการ ปลอดภัย',
      emergencyContact: 'AOC 1441 หรือ 191',
      aiAnalyzed: false,
    };
  }

  // Check dangerous prefixes (VoIP / Border gateways)
  if (cleanNum.startsWith('+697') || cleanNum.startsWith('697')) {
    riskScore += 80;
    dangerIndicators.push('ขึ้นต้นด้วย +697: โทรผ่านระบบอินเทอร์เน็ต (VoIP) จากต่างประเทศโดยไม่ผ่านการลงทะเบียนซิมไทย');
    tactics.push('ใช้เกตเวย์ VoIP ข้ามพรมแดนเพื่อหลบเลี่ยงการตรวจสอบของ กสทช.');
  } else if (cleanNum.startsWith('+698') || cleanNum.startsWith('698')) {
    riskScore += 75;
    dangerIndicators.push('ขึ้นต้นด้วย +698: โทรข้ามแดนจากประเทศเพื่อนบ้าน (Roaming VoIP)');
    tactics.push('หมายเลขชุมสายต่างประเทศที่มักใช้โดยแก๊งคอลเซ็นเตอร์');
  } else if (cleanNum.startsWith('+') && !cleanNum.startsWith('+66')) {
    riskScore += 50;
    dangerIndicators.push('เป็นเบอร์โทรระหว่างประเทศที่ไม่ใช่รหัสไทย (+66)');
  }

  const textToScan = `${phoneNumber} ${callerScript || ''} ${callerName || ''}`.toLowerCase();

  // Scam pattern keywords common in Thailand
  const suspiciousKeywords = [
    { word: 'สภ.', score: 35, tactic: 'แอบอ้างเจ้าหน้าที่ตำรวจ ขู่ดำเนินคดี' },
    { word: 'ตำรวจ', score: 30, tactic: 'แอบอ้างเจ้าหน้าที่ตำรวจ' },
    { word: 'ฟอกเงิน', score: 40, tactic: 'ข่มขู่ว่ามีส่วนพัวพันคดียาเสพติด/ฟอกเงิน' },
    { word: 'ยาเสพติด', score: 40, tactic: 'สร้างความกลัวเรื่องคดีอาญาร้ายแรง' },
    { word: 'พัสดุตกค้าง', score: 35, tactic: 'หลอกว่ามีพัสดุผิดกฎหมายส่งไปต่างประเทศ' },
    { word: 'ศุลกากร', score: 30, tactic: 'แอบอ้างกรมศุลกากร' },
    { word: 'สรรพากร', score: 35, tactic: 'แอบอ้างกรมสรรพากรเรื่องคืนภาษีหรือค้างชำระ' },
    { word: 'การไฟฟ้า', score: 30, tactic: 'หลอกคืนเงินประกันมิเตอร์ไฟฟ้า' },
    { word: 'คืนเงิน', score: 25, tactic: 'ใช้ผลประโยชน์หรือเงินคืนมาล่อลวง' },
    { word: 'โอนเงิน', score: 30, tactic: 'ชี้นำหรือกดดันให้โอนเงินเข้าบัญชีบุคคลอื่น (บัญชีม้า)' },
    { word: 'บัญชีม้า', score: 35, tactic: 'กลลวงบัญชีม้า' },
    { word: 'บัญชีกลาง', score: 45, tactic: 'หลอกให้โอนเข้าบัญชีตรวจสอบ (ไม่มีจริงในหน่วยงานรัฐ)' },
    { word: 'ปปง', score: 35, tactic: 'แอบอ้างสำนักงาน ปปง.' },
    { word: 'ดาวน์โหลด', score: 25, tactic: 'หลอกให้ติดตั้งแอปพลิเคชันนอกสโตร์ (.apk)' },
    { word: 'apk', score: 50, tactic: 'ส่งไฟล์อันตรายดูดเงินเพื่อควบคุมมือถือ' },
    { word: 'ลิงก์', score: 25, tactic: 'ส่งลิงก์ฟิชชิ่งดูดข้อมูลหรือควบคุมเครื่อง' },
    { word: 'otp', score: 40, tactic: 'พยายามขอรหัส OTP หรือรหัสผ่านส่วนตัว' },
    { word: 'แอดไลน์', score: 25, tactic: 'ชวนย้ายไปคุยในแอป LINE เพื่อส่งเอกสารราชการปลอม' },
    { word: 'กู้เงิน', score: 30, tactic: 'หลอกให้กู้เงินออนไลน์แต่ให้โอนเงินมัดจำก่อน' },
    { word: 'งานออนไลน์', score: 30, tactic: 'ชวนทำงานเสริมกดรับออเดอร์/กดไลก์ได้เงิน' },
  ];

  for (const item of suspiciousKeywords) {
    if (textToScan.includes(item.word.toLowerCase())) {
      riskScore += item.score;
      if (!tactics.includes(item.tactic)) {
        tactics.push(item.tactic);
      }
    }
  }

  if (riskScore > 100) riskScore = 99;

  if (riskScore >= 85) {
    riskLevel = 'extreme';
    actions.unshift('ตัดสายทิ้งทันที และบล็อกเบอร์โดยไม่ต้องสนทนาต่อ');
    actions.push('หากเผลอกดลิงก์หรือโอนเงิน ให้รีบตัดเน็ตและโทรอายัดที่ 1441 ทันที');
  } else if (riskScore >= 60) {
    riskLevel = 'high';
    actions.unshift('ตัดสายทันที ห้ามกดหมายเลขต่อสายหรือแอดไลน์ตามคำบอก');
  } else if (riskScore >= 35) {
    riskLevel = 'medium';
    actions.unshift('ระมัดระวังการสนทนา ตรวจสอบตัวตนผู้โทรโดยตรงกับบริษัท');
  }

  let summary = 'ตรวจพบความเสี่ยงระดับต่ำ เบอร์ปกติหรือยังไม่มีประวัติการรายงานร้ายแรง';
  if (riskLevel === 'extreme') {
    summary = 'เตือนภัยระดับสูงสุด! รูปแบบตรงกับขบวนการแก๊งคอลเซ็นเตอร์หรือมิจฉาชีพ 100%';
  } else if (riskLevel === 'high') {
    summary = 'ตรวจพบความเสี่ยงสูงมาก มีพฤติกรรมหลอกลวงหรือใช้เทคนิคเร่งรัดและข่มขู่';
  } else if (riskLevel === 'medium') {
    summary = 'เป็นเบอร์ที่อาจเป็นการตลาดก่อกวน หรือมีลักษณะน่าสงสัยเบื้องต้น';
  }

  return {
    phoneNumber,
    riskScore: Math.min(Math.max(riskScore, 0), 100),
    riskLevel,
    summary,
    identifiedTactics: tactics.length > 0 ? tactics : ['ไม่พบคำหรือพฤติกรรมหลอกลวงที่ชัดเจน'],
    dangerIndicators: dangerIndicators.length > 0 ? dangerIndicators : ['ไม่พบรหัสข้ามประเทศอันตราย'],
    recommendedActions: actions,
    warningNotice:
      riskLevel === 'extreme' || riskLevel === 'high'
        ? 'ระวัง: หน่วยงานราชการ ตำรวจ ธนาคาร และ ปปง. ไม่มีนโยบายโทรแจ้งข้อหา หรือให้โอนเงินตรวจสอบเด็ดขาด'
        : 'ข้อควรระวัง: ห้ามแจ้งรหัส OTP หรือข้อมูลบัตรประชาชนแก่บุคคลอื่น',
    emergencyContact: 'ศูนย์ AOC สายด่วน 1441 (แจ้งระงับบัญชีม้า 24 ชม.)',
    aiAnalyzed: false,
  };
}
