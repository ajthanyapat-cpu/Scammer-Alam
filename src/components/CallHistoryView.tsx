import React from 'react';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  PhoneMissed,
  Ban,
  Trash2,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { CallHistoryItem, RiskLevel } from '../types';

interface CallHistoryViewProps {
  history: CallHistoryItem[];
  onClearHistory: () => void;
  onSimulateCall: (number: string) => void;
  onUnblock?: (number: string) => void;
}

export const CallHistoryView: React.FC<CallHistoryViewProps> = ({
  history,
  onClearHistory,
  onSimulateCall,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>ประวัติสายเข้าและการป้องกันอัตโนมัติ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกสายที่ถูกระบบป้องกันบล็อกอัตโนมัติ และประวัติการตรวจสอบสายเข้าทั้งหมด
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างประวัติ</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ยังไม่มีประวัติสายอันตราย</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            เมื่อมีสายโทรเข้ามา หรือระบบตัดสายมิจฉาชีพอัตโนมัติ รายการจะถูกบันทึกที่นี่เพื่อให้คุณตรวจสอบย้อนหลังได้ตลอดเวลา
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
          {history.map((item) => {
            const isExtreme = item.riskLevel === 'extreme';
            const isSafe = item.riskLevel === 'safe';
            const isAutoBlocked = item.actionTaken === 'blocked_automatically';

            return (
              <div
                key={item.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAutoBlocked
                        ? 'bg-rose-100 text-rose-600'
                        : isSafe
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isAutoBlocked ? (
                      <Ban className="w-5 h-5" />
                    ) : isSafe ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <PhoneMissed className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {item.phoneNumber}
                      </span>
                      {isAutoBlocked && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                          บล็อกอัตโนมัติแล้ว
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {item.callerName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{item.categoryLabelTh}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSimulateCall(item.phoneNumber)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ทดสอบโทรอีกครั้ง</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
