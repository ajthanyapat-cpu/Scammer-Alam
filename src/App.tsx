import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Search,
  Database,
  History,
  LifeBuoy,
  PlusCircle,
  Radio,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  X,
  Layers
} from 'lucide-react';
import {
  ScamNumberEntry,
  IncomingCall,
  AutoProtectionSettings,
  CallHistoryItem,
  RiskLevel
} from './types';
import { INITIAL_SCAM_DATABASE } from './data/initialScamNumbers';
import { IncomingCallModal } from './components/IncomingCallModal';
import { NumberChecker } from './components/NumberChecker';
import { DatabaseList } from './components/DatabaseList';
import { ProtectionSettings } from './components/ProtectionSettings';
import { CallHistoryView } from './components/CallHistoryView';
import { ReportModal } from './components/ReportModal';
import { EmergencyGuideModal } from './components/EmergencyGuideModal';
import { playBlockSound } from './utils/audio';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'protection' | 'checker' | 'database' | 'history'>('protection');

  // Database of scam numbers (initial + community additions)
  const [entries, setEntries] = useState<ScamNumberEntry[]>(() => {
    try {
      const saved = localStorage.getItem('scamshield_database');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial database to ensure presets exist
        const ids = new Set(parsed.map((p: ScamNumberEntry) => p.id));
        const missing = INITIAL_SCAM_DATABASE.filter((item) => !ids.has(item.id));
        return [...parsed, ...missing];
      }
    } catch {
      // Fallback
    }
    return INITIAL_SCAM_DATABASE;
  });

  // Blocked numbers set
  const [blockedNumbers, setBlockedNumbers] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('scamshield_blocked');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set(['+6970891234567', '+6980987654321', '028765432']);
  });

  // Protection Settings
  const [settings, setSettings] = useState<AutoProtectionSettings>(() => {
    try {
      const saved = localStorage.getItem('scamshield_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      enabled: true,
      autoBlockExtremeDanger: true,
      autoBlockVoIPSpoofing: true,
      alertSound: true,
      vibration: true,
      showFloatingCallerOverlay: true,
      strictFilter: false,
    };
  });

  // Call history & auto-blocked logs
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('scamshield_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'hist-1',
        phoneNumber: '+697 089 123 4567',
        callerName: 'แก๊งคอลเซ็นเตอร์ (อ้าง สภ.เมืองเชียงใหม่)',
        riskLevel: 'extreme',
        categoryLabelTh: 'แอบอ้างตำรวจ / คดีฟอกเงิน',
        actionTaken: 'blocked_automatically',
        timestamp: '10 นาทีที่แล้ว',
      },
      {
        id: 'hist-2',
        phoneNumber: '+698 098 765 4321',
        callerName: 'ศูนย์กระจายพัสดุ Flash ปลอม',
        riskLevel: 'extreme',
        categoryLabelTh: 'พัสดุตกค้าง',
        actionTaken: 'blocked_automatically',
        timestamp: '1 ชั่วโมงที่แล้ว',
      },
    ];
  });

  // Live incoming call state
  const [activeCall, setActiveCall] = useState<IncomingCall | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deep analyze target
  const [prefilledChecker, setPrefilledChecker] = useState<{ number: string; script?: string; name?: string } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scamshield_database', JSON.stringify(entries));
    } catch {}
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem('scamshield_blocked', JSON.stringify(Array.from(blockedNumbers)));
    } catch {}
  }, [blockedNumbers]);

  useEffect(() => {
    try {
      localStorage.setItem('scamshield_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('scamshield_history', JSON.stringify(callHistory));
    } catch {}
  }, [callHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Simulate an incoming call
  const triggerIncomingCall = (entryOrNumber?: ScamNumberEntry | string) => {
    let targetEntry: ScamNumberEntry;

    if (typeof entryOrNumber === 'object' && entryOrNumber) {
      targetEntry = entryOrNumber;
    } else if (typeof entryOrNumber === 'string' && entryOrNumber) {
      const found = entries.find((e) => e.phoneNumber.replace(/\D/g, '') === entryOrNumber.replace(/\D/g, ''));
      if (found) {
        targetEntry = found;
      } else {
        targetEntry = {
          id: 'sim-' + Date.now(),
          phoneNumber: entryOrNumber,
          formattedNumber: entryOrNumber,
          callerName: 'เบอร์น่าสงสัย (ไม่ระบุชื่อ)',
          riskLevel: entryOrNumber.startsWith('+697') || entryOrNumber.startsWith('+698') ? 'extreme' : 'high',
          riskScore: entryOrNumber.startsWith('+697') || entryOrNumber.startsWith('+698') ? 95 : 75,
          category: 'call_center',
          categoryLabelTh: 'เบอร์โทรที่น่าสงสัย',
          reportCount: 12,
          lastReportedAt: 'เมื่อสักครู่',
          commonScript: 'โทรเข้ามาและขอตรวจสอบข้อมูลส่วนตัว หรือส่งลิงก์ดูดเงิน',
          description: 'เบอร์จำลองการทดสอบ',
          tags: ['สายเข้าทดสอบ'],
          source: 'community',
          isAutoBlocked: true,
        };
      }
    } else {
      // Pick random scam entry from database
      const scamOnly = entries.filter((e) => e.riskLevel === 'extreme');
      targetEntry = scamOnly[Math.floor(Math.random() * scamOnly.length)] || entries[0];
    }

    // Check Auto-Block conditions
    const isExtreme = targetEntry.riskLevel === 'extreme';
    const isVoIP = targetEntry.prefixType === 'voip_international' || targetEntry.phoneNumber.startsWith('+697') || targetEntry.phoneNumber.startsWith('+698');
    const isUserBlocked = blockedNumbers.has(targetEntry.phoneNumber);

    const shouldAutoBlock =
      settings.enabled &&
      (isUserBlocked ||
        (settings.autoBlockExtremeDanger && isExtreme) ||
        (settings.autoBlockVoIPSpoofing && isVoIP));

    const newCall: IncomingCall = {
      id: 'call-' + Date.now(),
      phoneNumber: targetEntry.phoneNumber,
      timestamp: 'เมื่อสักครู่',
      matchedEntry: targetEntry,
      status: shouldAutoBlock ? 'blocked' : 'ringing',
      wasAutoBlocked: shouldAutoBlock,
    };

    setActiveCall(newCall);

    // Record into history
    const historyItem: CallHistoryItem = {
      id: 'hist-' + Date.now(),
      phoneNumber: targetEntry.formattedNumber || targetEntry.phoneNumber,
      callerName: targetEntry.callerName,
      riskLevel: targetEntry.riskLevel,
      categoryLabelTh: targetEntry.categoryLabelTh,
      actionTaken: shouldAutoBlock ? 'blocked_automatically' : 'user_declined',
      timestamp: 'เมื่อสักครู่',
    };

    setCallHistory((prev) => [historyItem, ...prev]);

    if (shouldAutoBlock) {
      playBlockSound();
      showToast(`🛡️ ระบบบล็อกเบอร์ ${targetEntry.callerName} อัตโนมัติแล้ว`);
    }
  };

  // Call actions
  const handleDeclineCall = (call: IncomingCall) => {
    setActiveCall(null);
    showToast(`ตัดสาย ${call.matchedEntry.callerName} สำเร็จ`);
  };

  const handleBlockCall = (call: IncomingCall) => {
    setBlockedNumbers((prev) => new Set([...prev, call.matchedEntry.phoneNumber]));
    setActiveCall(null);
    playBlockSound();
    showToast(`บล็อกเบอร์ ${call.matchedEntry.phoneNumber} และเพิ่มในบัญชีดำเรียบร้อย`);
  };

  const handleAnswerCall = (call: IncomingCall) => {
    showToast(`กำลังฟังเสียงบทสนทนาจำลองของ ${call.matchedEntry.callerName}`);
  };

  const handleDeepAnalyze = (phoneNumber: string, script?: string, name?: string) => {
    setActiveCall(null);
    setPrefilledChecker({ number: phoneNumber, script, name });
    setActiveTab('checker');
  };

  const handleToggleBlockNumber = (entry: ScamNumberEntry) => {
    setBlockedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(entry.phoneNumber)) {
        next.delete(entry.phoneNumber);
        showToast(`ปลดบล็อกเบอร์ ${entry.phoneNumber} แล้ว`);
      } else {
        next.add(entry.phoneNumber);
        playBlockSound();
        showToast(`บล็อกเบอร์ ${entry.phoneNumber} เรียบร้อย`);
      }
      return next;
    });
  };

  const handleAddNewReport = (newEntry: ScamNumberEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
    setBlockedNumbers((prev) => new Set([...prev, newEntry.phoneNumber]));
    showToast(`บันทึกรายงานเบอร์ ${newEntry.phoneNumber} เข้าสู่ฐานข้อมูลสดเรียบร้อย`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-lg border border-slate-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Live Protection Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/10">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  ScamShield
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  เรียลไทม์
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                ระบบตรวจจับเบอร์มิจฉาชีพและโหมดบล็อกอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Quick Action Buttons in Header */}
          <div className="flex items-center gap-2">
            {/* Emergency Hotline */}
            <button
              id="emergency-aoc-btn"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200/80 transition cursor-pointer"
              title="สายด่วน AOC 1441 และข้อมูลอายัดบัญชีฉุกเฉิน"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
              <span>AOC 1441</span>
            </button>

            {/* Quick Report */}
            <button
              id="header-report-btn"
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">รายงานเบอร์</span>
            </button>

            {/* Simulate Call Button */}
            <button
              id="simulate-incoming-call-header-btn"
              onClick={() => triggerIncomingCall()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>จำลองสายเข้า</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none border-t border-slate-100 py-1">
          <button
            id="tab-protection-btn"
            onClick={() => setActiveTab('protection')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'protection'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>โหมดป้องกันอัตโนมัติ</span>
          </button>

          <button
            id="tab-checker-btn"
            onClick={() => setActiveTab('checker')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'checker'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-400" />
            <span>ตรวจสอบเบอร์ & AI วิเคราะห์</span>
          </button>

          <button
            id="tab-database-btn"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>ฐานข้อมูลเบอร์มิจฉาชีพ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700">
              {entries.length}
            </span>
          </button>

          <button
            id="tab-history-btn"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>ประวัติบล็อก & สายเข้า</span>
            {callHistory.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
                {callHistory.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'protection' && (
          <ProtectionSettings
            settings={settings}
            onUpdateSettings={setSettings}
            onTestCall={() => triggerIncomingCall()}
            blockedCount={callHistory.filter((c) => c.actionTaken === 'blocked_automatically').length}
          />
        )}

        {activeTab === 'checker' && (
          <NumberChecker
            onSimulateCall={(num) => triggerIncomingCall(num)}
            onAddToBlocked={(entry) => {
              setBlockedNumbers((prev) => new Set([...prev, entry.phoneNumber]));
              showToast(`เพิ่มเบอร์ ${entry.phoneNumber} ในบัญชีดำแล้ว`);
            }}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseList
            entries={entries}
            onSimulateCall={(entry) => triggerIncomingCall(entry)}
            onBlockNumber={handleToggleBlockNumber}
            onAnalyze={handleDeepAnalyze}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            blockedNumberSet={blockedNumbers}
          />
        )}

        {activeTab === 'history' && (
          <CallHistoryView
            history={callHistory}
            onClearHistory={() => {
              setCallHistory([]);
              showToast('ล้างประวัติสายเข้าเรียบร้อย');
            }}
            onSimulateCall={(num) => triggerIncomingCall(num)}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ScamShield Thailand</span>
            <span>•</span>
            <span>ร่วมมือกับเครือข่ายความปลอดภัยไซเบอร์และประชาชน</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="hover:text-rose-600 cursor-pointer font-medium"
            >
              สายด่วน AOC 1441
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-indigo-600 cursor-pointer font-medium"
            >
              รายงานเบอร์ใหม่
            </button>
            <span>v1.0 Real-time</span>
          </div>
        </div>
      </footer>

      {/* Incoming Call Real-Time Alert HUD */}
      <IncomingCallModal
        call={activeCall}
        settings={settings}
        onDecline={handleDeclineCall}
        onBlock={handleBlockCall}
        onAnswer={handleAnswerCall}
        onAnalyze={handleDeepAnalyze}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={handleAddNewReport}
      />

      {/* Emergency Guide Modal */}
      <EmergencyGuideModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
}
