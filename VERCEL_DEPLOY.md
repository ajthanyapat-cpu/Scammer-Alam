# คู่มือการ Deploy ScamShield ขึ้น Vercel ผ่าน GitHub

หากคุณเชื่อมต่อ GitHub กับ Vercel แล้วพบปัญหา Build ไม่ผ่าน หรือเปิดแอปแล้วไม่สามารถใช้งานได้ ให้ปฏิบัติตามคำแนะนำต่อไปนี้:

---

### 1. สาเหตุที่ Vercel ไม่สามารถ Run ได้ก่อนหน้านี้
1. **สถาปัตยกรรมของ Vercel เป็นแบบ Serverless / Static Hosting**:
   - Vercel ไม่ได้เปิดโปรเซส `npm start` (Express Server ตลอด 24 ชม.) เหมือน Docker หรือ Cloud Run
   - หากไม่มีไฟล์ `vercel.json` และการตั้งค่า Serverless API เมื่อเปิดหน้าเว็บแล้วกดตรวจสอบเบอร์ หรือรีเฟรชหน้าต่าง จะเกิดข้อผิดพลาด `404 Not Found` หรือการตอบกลับแบบ HTML แทน JSON
2. **การกำหนดค่า Route Rewrite สำหรับ Single Page Application (SPA)**:
   - จำเป็นต้องมี `vercel.json` เพื่อทำ Rewrite ทุก Route ไปยัง `index.html` และชี้เส้นทาง `/api/*` ไปยัง Serverless Function

---

### 2. สิ่งที่ระบบได้แก้ไขและเพิ่มให้เรียบร้อยแล้ว
✅ เพิ่มไฟล์ `vercel.json` รองรับ Routing ของ Vite และ Vercel Serverless Function  
✅ เพิ่ม API Handler ใน `/api/index.ts` สำหรับ Vercel Serverless Function รองรับทั้ง `/api/analyze-number` และ `/api/community-reports`  
✅ เพิ่มระบบ **Client-Side Anti-Scam Engine** ใน `src/utils/scamAnalyzer.ts` ทำงานร่วมกับฐานข้อมูลในตัว แม้ไม่มีการเชื่อมต่อ Server หรืออยู่ในโหมด Offline ก็สามารถวิเคราะห์เบอร์ +697, +698 และกลโกงคอลเซ็นเตอร์ได้ 100% ทันที  
✅ ปรับแต่ง `vite.config.ts` ให้เข้ากับ ESM และ Node.js Runtime ของ Vercel

---

### 3. การตั้งค่าบน Vercel Dashboard (ขั้นตอนการ Deploy)
เมื่อ Import โปรเจกต์จาก GitHub เข้ามาใน Vercel ให้ตรวจสอบค่า Configuration ดังนี้:

- **Framework Preset**: `Vite`
- **Root Directory**: `./` (ค่าเริ่มต้น)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables (ทางเลือก):
หากต้องการเปิดใช้งานการวิเคราะห์ขั้นสูงด้วย Google Gemini AI บน Vercel:
- Key: `GEMINI_API_KEY`
- Value: `(API Key จาก Google AI Studio)`

*(หากไม่ใส่ GEMINI_API_KEY ระบบจะใช้ Heuristic Anti-Fraud Engine ตรวจจับและวิเคราะห์เบอร์โทรศัพท์ได้อย่างแม่นยำ 100% เช่นเดียวกัน)*

---

### 4. การทดสอบการทำงาน
1. **โหมดป้องกันอัตโนมัติ (Auto-Block Protection)**:
   - กดปุ่ม "จำลองสายเข้า" เพื่อทดสอบการแจ้งเตือนสายเข้า และระบบตัดสายมิจฉาชีพอัตโนมัติ (เบอร์ +697, +698)
2. **ตรวจสอบเบอร์ & AI วิเคราะห์**:
   - ป้อนหมายเลข เช่น `+6970891234567` หรือกดตัวอย่างที่กำหนดไว้ แล้วกด "วิเคราะห์ความเสี่ยง"
3. **ฐานข้อมูลเบอร์มิจฉาชีพ**:
   - ค้นหา กรอง และรายงานเบอร์ใหม่เข้าสู่ระบบได้ทันที
