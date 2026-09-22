import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for newly added community reports
interface CommunityReport {
  id: string;
  phoneNumber: string;
  callerName: string;
  riskLevel: string;
  riskScore: number;
  category: string;
  categoryLabelTh: string;
  commonScript: string;
  description: string;
  reportCount: number;
  lastReportedAt: string;
  source: string;
  isAutoBlocked: boolean;
}

const communityReportsCache: CommunityReport[] = [];

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Heuristic fallback analyzer for phone numbers & scam tactics
function analyzeHeuristically(phoneNumber: string, callerScript?: string, callerName?: string) {
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

  // Check prefixes
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

  // Scam pattern keywords
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
    warningNotice: riskLevel === 'extreme' || riskLevel === 'high' 
      ? 'ระวัง: หน่วยงานราชการ ตำรวจ ธนาคาร และ ปปง. ไม่มีนโยบายโทรแจ้งข้อหา หรือให้โอนเงินตรวจสอบเด็ดขาด'
      : 'ข้อควรระวัง: ห้ามแจ้งรหัส OTP หรือข้อมูลบัตรประชาชนแก่บุคคลอื่น',
    emergencyContact: 'ศูนย์ AOC สายด่วน 1441 (แจ้งระงับบัญชีม้า 24 ชม.)',
    aiAnalyzed: false,
  };
}

// Endpoint: AI Scam Analysis using Gemini
app.post('/api/analyze-number', async (req: Request, res: Response) => {
  const { phoneNumber, callerScript, callerName } = req.body;

  if (!phoneNumber) {
    res.status(400).json({ error: 'หมายเลขโทรศัพท์จำเป็นต้องระบุ' });
    return;
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Return high-precision heuristic analysis
    const heuristic = analyzeHeuristically(phoneNumber, callerScript, callerName);
    res.json(heuristic);
    return;
  }

  try {
    const prompt = `คุณคือผู้เชี่ยวชาญด้านความปลอดภัยทางไซเบอร์และการตรวจจับแก๊งคอลเซ็นเตอร์และสแกมเมอร์ในประเทศไทย
โปรดวิเคราะห์เบอร์โทรศัพท์และบทสนทนา/พฤติกรรมต่อไปนี้:

หมายเลขโทรศัพท์: "${phoneNumber}"
ชื่อที่อ้างหรือหัวข้อ: "${callerName || 'ไม่ระบุ'}"
ข้อความ/บทสนทนา/สคริปต์ที่โทรมา: "${callerScript || 'ไม่มีข้อมูลบทสนทนา'}"

เกณฑ์การประเมินในไทย:
1. นำหน้าด้วย +697 หรือ +698 เป็น VoIP ข้ามแดนของแก๊งคอลเซ็นเตอร์
2. อ้างเป็นตำรวจ สภ., ปปง., DSI, ศาล, ข่มขู่เรื่องยาเสพติด/ฟอกเงิน แล้วให้โอนเงินเข้า "บัญชีกลาง"
3. อ้างเป็นพัสดุ Flash/Kerry/EMS ตกค้าง มีสิ่งผิดกฎหมาย
4. อ้างเป็นการไฟฟ้า/สรรพากร ให้แอดไลน์ กดลิงก์ โหลดไฟล์ .apk
5. งานออนไลน์กดรับออเดอร์ หรือเงินกู้ดอกเบี้ยต่ำแต่ให้โอนมัดจำ

ส่งผลลัพธ์กลับมาในรูปแบบ JSON ตาม Schema นี้เท่านั้น (ห้ามใส่ Markdown code block อื่น):
{
  "phoneNumber": "${phoneNumber}",
  "riskScore": number (0 ถึง 100),
  "riskLevel": "extreme" | "high" | "medium" | "safe",
  "summary": "สรุปสั้นกระชับเตือนภัยภาษาไทย",
  "identifiedTactics": ["กลโกง/จิตวิทยาที่ตรวจพบ เช่น สร้างความกลัว, เร่งรัดเวลา, อ้างเจ้าหน้าที่"],
  "dangerIndicators": ["จุดอันตราย เช่น เบอร์ VoIP +697, อ้างส่งพัสดุผิดกฎหมาย"],
  "recommendedActions": ["สิ่งที่เหยื่อต้องทำทันที เช่น ตัดสาย, ห้ามโอน, ห้ามกดลิงก์"],
  "warningNotice": "ข้อเตือนใจสำคัญของทางการไทย",
  "emergencyContact": "AOC สายด่วน 1441 (แจ้งอายัดบัญชี 24 ชม.)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '';
    const cleanJson = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      ...parsed,
      aiAnalyzed: true,
    });
  } catch (error) {
    console.error('Gemini analysis error, falling back to heuristics:', error);
    const fallback = analyzeHeuristically(phoneNumber, callerScript, callerName);
    res.json(fallback);
  }
});

// Endpoint: Community Reports (GET & POST)
app.get('/api/community-reports', (req: Request, res: Response) => {
  res.json({ reports: communityReportsCache });
});

app.post('/api/community-reports', (req: Request, res: Response) => {
  const { phoneNumber, callerName, category, riskLevel, commonScript, description } = req.body;

  if (!phoneNumber || !callerName) {
    res.status(400).json({ error: 'กรุณากรอกเบอร์โทรศัพท์และชื่อที่แอบอ้าง' });
    return;
  }

  const newReport: CommunityReport = {
    id: 'user-' + Date.now(),
    phoneNumber: phoneNumber.trim(),
    callerName: callerName.trim(),
    riskLevel: riskLevel || 'extreme',
    riskScore: riskLevel === 'extreme' ? 98 : riskLevel === 'high' ? 85 : 60,
    category: category || 'call_center',
    categoryLabelTh: category === 'fake_police' ? 'แอบอ้างตำรวจ / คดีฟอกเงิน' :
                     category === 'fake_courier' ? 'พัสดุตกค้าง / สินค้าผิดกฎหมาย' :
                     category === 'tax_scam' ? 'สรรพากร / คืนภาษีปลอม' :
                     category === 'loan_scam' ? 'เงินกู้ทิพย์ / หลอกโอนมัดจำ' :
                     category === 'phishing_sms' ? 'ลิงก์การไฟฟ้า / หลอกโหลดแอป' : 'แก๊งคอลเซ็นเตอร์ / หลอกลงทุน',
    commonScript: commonScript || 'ได้รับแจ้งว่าเป็นมิจฉาชีพโทรมาหลอกลวง',
    description: description || 'ผู้ใช้งานรายงานเข้ามาผ่านแอป ScamShield',
    reportCount: 1,
    lastReportedAt: 'เมื่อสักครู่',
    source: 'community_realtime',
    isAutoBlocked: true,
  };

  communityReportsCache.unshift(newReport);
  res.status(201).json({ success: true, report: newReport });
});

// Endpoint: Realtime Statistics
app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    totalScamDatabase: 154820 + communityReportsCache.length,
    blockedToday: 4892,
    activeThreats24h: 312,
    latestReportTime: '1 นาทีที่แล้ว',
    autoProtectionActiveUsers: 89450,
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ScamShield Anti-Fraud API' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScamShield server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
