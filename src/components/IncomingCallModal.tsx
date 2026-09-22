import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Radio,
  FileWarning,
  CheckCircle2,
  ExternalLink,
  Ban
} from 'lucide-react';
import { IncomingCall, AutoProtectionSettings } from '../types';
import { playRingSound, playDangerWarningSound, playBlockSound } from '../utils/audio';

interface IncomingCallModalProps {
  call: IncomingCall | null;
  settings: AutoProtectionSettings;
  onDecline: (call: IncomingCall) => void;
  onBlock: (call: IncomingCall) => void;
  onAnswer: (call: IncomingCall) => void;
  onAnalyze: (phoneNumber: string, script?: string, name?: string) => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  call,
  settings,
  onDecline,
  onBlock,
  onAnswer,
  onAnalyze,
}) => {
  const [isAnswered, setIsAnswered] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!call) {
      setIsAnswered(false);
      setCallDuration(0);
      return;
    }

    let stopRinging = () => {};

    if (call.status === 'ringing') {
      if (settings.alertSound) {
        stopRinging = playRingSound();
      }

      if (call.matchedEntry.riskLevel === 'extreme' && settings.alertSound) {
        playDangerWarningSound();
      }
    } else if (call.status === 'blocked') {
      playBlockSound();
    }

    return () => {
      stopRinging();
    };
  }, [call, settings.alertSound]);

  useEffect(() => {
    let timer: number;
    if (isAnswered) {
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAnswered]);

  if (!call) return null;

  const { matchedEntry, wasAutoBlocked } = call;
  const isDanger = matchedEntry.riskLevel === 'extreme' || matchedEntry.riskLevel === 'high';
  const isSafe = matchedEntry.riskLevel === 'safe';

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div id="incoming-call-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white"
        >
          {/* Top Status Bar Indicator */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>ระบบตรวจสอบสายเข้าแบบเรียลไทม์</span>
            </div>
            {wasAutoBlocked && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                บล็อกอัตโนมัติแล้ว
              </span>
            )}
          </div>

          {/* Risk Alert Header Banner */}
          <div
            className={`mx-4 mt-2 mb-4 p-3.5 rounded-2xl border flex items-start gap-3 ${
              isDanger
                ? 'bg-rose-950/60 border-rose-600/40 text-rose-200'
                : isSafe
                ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-200'
                : 'bg-amber-950/60 border-amber-600/40 text-amber-200'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isDanger
                  ? 'bg-rose-600 text-white'
                  : isSafe
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isDanger ? (
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              ) : isSafe ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold tracking-tight">
                  {isDanger
                    ? '⚠️ แจ้งเตือน: เบอร์มิจฉาชีพเสี่ยงสูงสุด!'
                    : isSafe
                    ? '✓ เบอร์ปลอดภัย: หน่วยงานทางการ'
                    : '⚡ แจ้งเตือน: สายการตลาด/น่าสงสัย'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  คะแนนความเสี่ยง {matchedEntry.riskScore}%
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {isDanger
                  ? wasAutoBlocked
                    ? 'โหมดป้องกันอัตโนมัติได้ตัดสายทันที เพื่อไม่ให้มิจฉาชีพรบกวน'
                    : 'พบรายงานการหลอกลวงจำนวนมาก! กรุณาตัดสายทันที ห้ามกดเลขต่อสายหรือโอนเงินเด็ดขาด'
                  : isSafe
                  ? 'ตรวจสอบแล้วเป็นหมายเลขทางการ ปลอดภัยในการติดต่อ'
                  : 'ระวังการโน้มน้าวขายประกันหรือขอข้อมูลส่วนบุคคล'}
              </p>
            </div>
          </div>

          {/* Caller Identity Card */}
          <div className="px-6 py-4 text-center">
            {/* Pulsing avatar */}
            <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
              <motion.div
                animate={
                  call.status === 'ringing'
                    ? { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }
                    : { scale: 1, opacity: 0.3 }
                }
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`absolute inset-0 rounded-full ${
                  isDanger ? 'bg-rose-500' : isSafe ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 ${
                  isDanger
                    ? 'bg-rose-900/80 border-rose-500 text-rose-300'
                    : isSafe
                    ? 'bg-emerald-900/80 border-emerald-500 text-emerald-300'
                    : 'bg-amber-900/80 border-amber-500 text-amber-300'
                }`}
              >
                {isDanger ? '🚨' : isSafe ? '🏢' : '📞'}
              </div>
            </div>

            {/* Caller Name & Number */}
            <h2 className="text-xl font-bold text-white tracking-tight">{matchedEntry.callerName}</h2>
            <p className="text-lg font-mono font-medium text-slate-300 mt-1 tracking-wider">
              {matchedEntry.formattedNumber}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {matchedEntry.categoryLabelTh}
              </span>
              {matchedEntry.reportCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  รายงานแล้ว {matchedEntry.reportCount.toLocaleString()} ครั้ง
                </span>
              )}
              {matchedEntry.prefixType === 'voip_international' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  VoIP ข้ามแดน
                </span>
              )}
            </div>

            {/* Simulated Scam Script Preview / Voice Player */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-left">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <FileWarning className="w-3.5 h-3.5 text-amber-400" />
                  พฤติกรรม/สคริปต์ที่มิจฉาชีพใช้:
                </span>
                <span className="text-[11px] text-slate-500">{matchedEntry.lastReportedAt}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 bg-slate-900/70 p-2.5 rounded-lg font-sans border border-slate-800">
                "{matchedEntry.commonScript}"
              </p>
            </div>

            {/* If Answered: Simulation Dialogue Timer */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-medium mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  กำลังจำลองการสนทนา: {formatSeconds(callDuration)}
                </div>
                <p className="text-xs text-amber-300 font-medium">
                  ⚠️ คำเตือน: อย่าเปิดเผยข้อมูลส่วนตัว หรือรหัส OTP เด็ดขาด!
                </p>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-5 bg-slate-950/70 border-t border-slate-800 flex flex-col gap-2.5">
            {wasAutoBlocked ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>สายถูกตัดโดยโหมดป้องกันอัตโนมัติแล้ว</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="close-autoblocked-btn"
                    onClick={() => onDecline(call)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    id="analyze-autoblocked-btn"
                    onClick={() => onAnalyze(matchedEntry.phoneNumber, matchedEntry.commonScript, matchedEntry.callerName)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>วิเคราะห์เบอร์นี้</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : isAnswered ? (
              <div className="flex items-center gap-2">
                <button
                  id="mute-call-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-xl border ${
                    isMuted ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-300'
                  }`}
                  title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  id="end-call-btn"
                  onClick={() => onDecline(call)}
                  className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition text-sm"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>วางสายทันที</span>
                </button>
                <button
                  id="block-during-call-btn"
                  onClick={() => onBlock(call)}
                  className="px-3.5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs border border-rose-500/30 flex items-center gap-1 transition"
                >
                  <Ban className="w-4 h-4" />
                  <span>บล็อก</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Answer simulation button */}
                <button
                  id="answer-simulation-btn"
                  onClick={() => {
                    setIsAnswered(true);
                    onAnswer(call);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 text-xs border border-slate-700 transition"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>รับสายฟังเสียงจำลอง</span>
                </button>

                {/* Decline button */}
                <button
                  id="decline-call-btn"
                  onClick={() => onDecline(call)}
                  className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center justify-center gap-2 text-xs shadow-md shadow-rose-900/30 transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>ตัดสายทันที</span>
                </button>

                {/* Block permanently & analyze buttons */}
                <button
                  id="block-permanent-btn"
                  onClick={() => onBlock(call)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-rose-500/30 transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>บล็อกเบอร์นี้ทันที</span>
                </button>

                <button
                  id="deep-analyze-btn"
                  onClick={() => onAnalyze(matchedEntry.phoneNumber, matchedEntry.commonScript, matchedEntry.callerName)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-indigo-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-indigo-500/30 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>วิเคราะห์เชิงลึก AI</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
