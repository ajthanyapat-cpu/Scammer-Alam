import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Bell,
  Volume2,
  Globe,
  Radio,
  Smartphone,
  PhoneCall,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { AutoProtectionSettings } from '../types';

interface ProtectionSettingsProps {
  settings: AutoProtectionSettings;
  onUpdateSettings: (newSettings: AutoProtectionSettings) => void;
  onTestCall: () => void;
  blockedCount: number;
}

export const ProtectionSettings: React.FC<ProtectionSettingsProps> = ({
  settings,
  onUpdateSettings,
  onTestCall,
  blockedCount,
}) => {
  const toggleSetting = (key: keyof AutoProtectionSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Master Protection Status Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
          settings.enabled
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/40 text-white'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700 text-slate-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 ${
                settings.enabled
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-emerald-900/40'
                  : 'bg-slate-800 border-slate-600 text-slate-500'
              }`}
            >
              {settings.enabled ? (
                <ShieldCheck className="w-9 h-9 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-9 h-9 text-slate-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    settings.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {settings.enabled ? 'ระบบเปิดใช้งานอยู่' : 'ปิดการป้องกัน'}
                </span>
                {settings.enabled && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ปกป้องแบบเรียลไทม์ 24 ชม.
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">
                {settings.enabled
                  ? 'โหมดป้องกันและบล็อกอัตโนมัติ กำลังทำงาน'
                  : 'โหมดป้องกันอัตโนมัติถูกปิดอยู่'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {settings.enabled
                  ? 'ตัดสายมิจฉาชีพ บัญชีม้า และเกตเวย์ VoIP ต่างประเทศทันทีก่อนที่โทรศัพท์ของคุณจะดัง'
                  : 'เปิดใช้งานเพื่อบล็อกเบอร์อันตรายสูงสุดและแจ้งเตือนสายเข้าทันที'}
              </p>
            </div>
          </div>

          {/* Master Switch Button */}
          <button
            id="master-protection-toggle-btn"
            onClick={() => toggleSetting('enabled')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition cursor-pointer shrink-0 ${
              settings.enabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
            }`}
          >
            {settings.enabled ? 'เปิดการป้องกันอยู่ (คลิกเพื่อปิด)' : 'กดเพื่อเปิดการป้องกัน'}
          </button>
        </div>

        {/* Live Protection Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">ฐานข้อมูลที่ตรวจจับ</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">154,820+</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">บล็อกให้คุณแล้ว</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">{blockedCount} ครั้ง</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">ตรวจจับ VoIP (+697)</div>
            <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">100% ครอบคลุม</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">สายด่วน AOC</div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">1441 ทันที</div>
          </div>
        </div>
      </div>

      {/* Detailed Protection Toggles Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-indigo-600" />
          <span>การกำหนดค่าความปลอดภัยและการบล็อก</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {/* Toggle: Auto Block Extreme Danger */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  บล็อกสายมิจฉาชีพอันตรายสูงสุดอัตโนมัติ (Auto-Block Extreme Danger)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เมื่อตรวจพบเบอร์ที่มีคะแนนความเสี่ยงเกิน 85% ระบบจะตัดสายทันที ไม่ให้รบกวนเวลาคุณ
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="toggle-auto-block-extreme"
                type="checkbox"
                checked={settings.autoBlockExtremeDanger}
                onChange={() => toggleSetting('autoBlockExtremeDanger')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Toggle: VoIP Gateway (+697, +698) */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  บล็อกเบอร์ต่างประเทศและ VoIP แปลกปลอม (+697, +698)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เกตเวย์ VoIP ที่แก๊งคอลเซ็นเตอร์ใช้โทรข้ามพรมแดนจากประเทศเพื่อนบ้าน
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="toggle-auto-block-voip"
                type="checkbox"
                checked={settings.autoBlockVoIPSpoofing}
                onChange={() => toggleSetting('autoBlockVoIPSpoofing')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Toggle: Alert Sound */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  สัญญาณเสียงเตือนภัยฉุกเฉิน (Warning Audio Beep)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  ส่งสัญญาณเสียงเตือนภัยเฉพาะเมื่อมีสายอันตรายโทรเข้ามา
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="toggle-alert-sound"
                type="checkbox"
                checked={settings.alertSound}
                onChange={() => toggleSetting('alertSound')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Toggle: Floating Caller Overlay */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  แสดงหน้าต่างระบุตัวตนผู้โทรแบบเรียลไทม์ (Live Caller ID Overlay)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  แสดงป๊อปอัปแจ้งเตือนชื่อ รูปแบบกลโกง และคะแนนความเสี่ยงขณะสายกำลังเข้า
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="toggle-floating-overlay"
                type="checkbox"
                checked={settings.showFloatingCallerOverlay}
                onChange={() => toggleSetting('showFloatingCallerOverlay')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Test Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            ต้องการทดสอบว่าเมื่อมิจฉาชีพโทรมาจริง หน้าจอและการตัดสายอัตโนมัติจะทำงานอย่างไร?
          </div>
          <button
            id="test-incoming-call-btn"
            onClick={onTestCall}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>ทดสอบจำลองสายเข้าทันที</span>
          </button>
        </div>
      </div>
    </div>
  );
};
