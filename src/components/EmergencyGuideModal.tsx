import React from 'react';
import { X, PhoneCall, ShieldAlert, AlertTriangle, ExternalLink, LifeBuoy, Building2, CheckCircle2 } from 'lucide-react';

interface EmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyGuideModal: React.FC<EmergencyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const bankHotlines = [
    { bank: 'ธนาคารกสิกรไทย (KBANK)', tel: '02-888-8888 กด 001' },
    { bank: 'ธนาคารไทยพาณิชย์ (SCB)', tel: '02-777-7575' },
    { bank: 'ธนาคารกรุงไทย (KTB)', tel: '02-111-1111 กด 108' },
    { bank: 'ธนาคารกรุงเทพ (BBL)', tel: '1333 หรือ 02-645-5555' },
    { bank: 'ธนาคารกรุงศรีอยุธยา (BAY)', tel: '1572 กด 5' },
    { bank: 'ธนาคารทหารไทยธนชาต (TTB)', tel: '1428 กด 03' },
    { bank: 'ธนาคารออมสิน (GSB)', tel: '1115 กด 6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                ศูนย์ช่วยเหลือฉุกเฉินและคู่มือรับมือมิจฉาชีพ
              </h3>
              <p className="text-[11px] text-slate-500">
                หากเผลอโอนเงิน หรือถูกหลอกกดลิงก์ดูดเงิน ต้องทำอย่างไรทันที
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Immediate Action: AOC 1441 */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-900 to-rose-950 text-white border border-rose-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/40 text-rose-200 uppercase tracking-wider">
                สายด่วนอายัดบัญชีม้า 24 ชม.
              </span>
              <span className="text-xs text-rose-300 font-medium">โทรฟรี ทุกเครือข่าย</span>
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              <div>
                <h4 className="text-xl font-bold tracking-tight">ศูนย์ AOC 1441</h4>
                <p className="text-xs text-rose-200 mt-0.5">
                  แจ้งระงับและอายัดบัญชีคนร้ายได้ทันทีทุกธนาคารในจุดเดียว (One Stop Service)
                </p>
              </div>
              <a
                href="tel:1441"
                className="px-4 py-2.5 rounded-xl bg-white text-rose-950 font-bold text-sm flex items-center gap-1.5 shadow-md hover:bg-rose-50 transition shrink-0"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>โทร 1441</span>
              </a>
            </div>
          </div>

          {/* Golden Rules */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              คาถา 3 ข้อ ป้องกันมิจฉาชีพ 100%:
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-base font-bold text-rose-600">1. ไม่เชื่อ</div>
                <div className="text-[11px] text-slate-500 mt-0.5">อย่าเชื่อเบอร์แปลก หรือคนอ้างเป็นตำรวจ</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-base font-bold text-amber-600">2. ไม่รีบ</div>
                <div className="text-[11px] text-slate-500 mt-0.5">อย่าตื่นตระหนก มิจฉาชีพมักขู่ให้รีบโอน</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-base font-bold text-emerald-600">3. ไม่โอน</div>
                <div className="text-[11px] text-slate-500 mt-0.5">หน่วยงานรัฐไม่มี "บัญชีกลาง" ตรวจสอบ</div>
              </div>
            </div>
          </div>

          {/* Bank Hotlines for Freezing Accounts */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              สายด่วนเฉพาะกิจ อายัดบัญชีธนาคาร (ตลอด 24 ชั่วโมง):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bankHotlines.map((b, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-700">{b.bank}</span>
                  <span className="font-bold text-slate-900 font-mono">{b.tel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Police Website */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-indigo-950">แจ้งความออนไลน์ สำนักงานตำรวจแห่งชาติ</div>
              <div className="text-[11px] text-indigo-700">thaipoliceonline.go.th (ศูนย์แจ้งความคดีอาชญากรรมทางเทคโนโลยี)</div>
            </div>
            <a
              href="https://thaipoliceonline.go.th"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1 hover:bg-indigo-700 transition shrink-0"
            >
              <span>เปิดเว็บ</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
