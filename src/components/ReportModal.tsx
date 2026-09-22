import React, { useState } from 'react';
import { X, PlusCircle, ShieldAlert, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { NewReportFormData, ScamCategory, RiskLevel, ScamNumberEntry } from '../types';
import { playSuccessSound } from '../utils/audio';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEntry: ScamNumberEntry) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callerName, setCallerName] = useState('');
  const [category, setCategory] = useState<ScamCategory>('call_center');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('extreme');
  const [commonScript, setCommonScript] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('กรุณากรอกหมายเลขโทรศัพท์');
      return;
    }
    if (!callerName.trim()) {
      setError('กรุณาระบุชื่อหรือหน่วยงานที่มิจฉาชีพแอบอ้าง');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/community-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          callerName: callerName.trim(),
          category,
          riskLevel,
          commonScript: commonScript.trim() || 'โทรมาหลอกลวงประชาชน',
          description: description.trim() || 'รายงานโดยผู้ใช้งานผ่านระบบ ScamShield',
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          await response.json();
        }
      }
      playSuccessSound();

      const newEntry: ScamNumberEntry = {
        id: 'report-' + Date.now(),
        phoneNumber: phoneNumber.trim(),
        formattedNumber: phoneNumber.trim(),
        callerName: callerName.trim(),
        riskLevel,
        riskScore: riskLevel === 'extreme' ? 98 : riskLevel === 'high' ? 85 : 60,
        category,
        categoryLabelTh: category === 'fake_police' ? 'แอบอ้างตำรวจ / คดีฟอกเงิน' :
                         category === 'fake_courier' ? 'พัสดุตกค้าง / สิ่งผิดกฎหมาย' :
                         category === 'tax_scam' ? 'สรรพากร / คืนภาษีปลอม' :
                         category === 'loan_scam' ? 'กู้เงินออนไลน์ / มัดจำทิพย์' :
                         category === 'phishing_sms' ? 'ลิงก์การไฟฟ้า / หลอกโหลดแอป' : 'แก๊งคอลเซ็นเตอร์ / หลอกลงทุน',
        reportCount: 1,
        lastReportedAt: 'เมื่อสักครู่',
        commonScript: commonScript.trim() || 'โทรมาข่มขู่หรือชักชวนให้โอนเงิน',
        description: description.trim() || 'รายงานโดยผู้ใช้งานผ่านระบบ ScamShield',
        tags: [category, 'รายงานจากชุมชน', 'เบอร์ใหม่'],
        source: 'user',
        isAutoBlocked: true,
      };

      onSuccess(newEntry);
      onClose();
    } catch {
      // Local fallback
      playSuccessSound();
      const fallbackEntry: ScamNumberEntry = {
        id: 'report-' + Date.now(),
        phoneNumber: phoneNumber.trim(),
        formattedNumber: phoneNumber.trim(),
        callerName: callerName.trim(),
        riskLevel,
        riskScore: 95,
        category,
        categoryLabelTh: 'รายงานจากประชาชน',
        reportCount: 1,
        lastReportedAt: 'เมื่อสักครู่',
        commonScript: commonScript.trim() || 'โทรมาหลอกลวง',
        description: description.trim() || 'รายงานผ่านแอปพลิเคชัน',
        tags: ['รายงานสด', 'ตรวจพบใหม่'],
        source: 'user',
        isAutoBlocked: true,
      };
      onSuccess(fallbackEntry);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                รายงานเบอร์มิจฉาชีพสู่ฐานข้อมูล
              </h3>
              <p className="text-[11px] text-slate-500">
                ร่วมสร้างสังคมปลอดภัย ข้อมูลจะถูกอัปเดตแบบเรียลไทม์เพื่อปกป้องผู้ใช้อื่น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              หมายเลขโทรศัพท์ที่โทรมา <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น 095xxxxxxx หรือ +697xxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อหรือหน่วยงานที่แอบอ้าง <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น สภ.เมือง..., ขนส่ง Flash, กรมสรรพากร, สินเชื่อเงินด่วน"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่กลโกง</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScamCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="fake_police">แอบอ้างตำรวจ / DSI / ศาล</option>
                <option value="fake_courier">พัสดุตกค้าง / สิ่งผิดกฎหมาย</option>
                <option value="tax_scam">สรรพากร / คืนภาษีปลอม</option>
                <option value="phishing_sms">การไฟฟ้า / ลิงก์ดูดเงิน</option>
                <option value="loan_scam">เงินกู้ทิพย์ / กู้เงินออนไลน์</option>
                <option value="call_center">งานออนไลน์ / ลงทุนทิพย์</option>
                <option value="telemarketing">การตลาดก่อกวน / ขายประกัน</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ระดับความอันตราย</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="extreme">อันตรายสูงสุด (แก๊งคอล/ดูดเงิน)</option>
                <option value="high">เสี่ยงสูง (หลอกลวง/กู้เงิน)</option>
                <option value="medium">ปานกลาง (ขายของ/ก่อกวน)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              พฤติกรรมหรือบทสนทนาที่พูด
            </label>
            <textarea
              rows={2}
              placeholder="ระบุสิ่งที่มิจฉาชีพพูด เช่น อ้างว่ามีพัสดุยาเสพติด ให้โอนเงินเข้าบัญชีตรวจสอบ..."
              value={commonScript}
              onChange={(e) => setCommonScript(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-rose-900/10 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ส่งรายงานทันที</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
