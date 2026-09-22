import React, { useState } from 'react';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Ban,
  CheckCircle2,
  Copy,
  Check,
  PhoneForwarded,
  Info,
  Loader2
} from 'lucide-react';
import { ScamAnalysisResult, ScamNumberEntry } from '../types';
import { analyzePhoneNumber } from '../utils/scamAnalyzer';

interface NumberCheckerProps {
  onSimulateCall: (number: string) => void;
  onAddToBlocked: (entry: ScamNumberEntry) => void;
}

export const NumberChecker: React.FC<NumberCheckerProps> = ({
  onSimulateCall,
  onAddToBlocked,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callerScript, setCallerScript] = useState('');
  const [callerName, setCallerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick preset test buttons for user convenience
  const presets = [
    {
      label: 'แก๊งคอลเซ็นเตอร์ (+697)',
      number: '+6970891234567',
      name: 'อ้าง สภ.เมืองเชียงใหม่',
      script: 'พบพัสดุชื่อคุณมีสมุดบัญชีพัวพันยาเสพติด ให้โอนเงินเข้าบัญชีกลาง ปปง. เพื่อตรวจสอบความบริสุทธิ์',
    },
    {
      label: 'พัสดุตกค้าง (+698)',
      number: '+6980987654321',
      name: 'ศูนย์ขนส่ง Flash Express ปลอม',
      script: 'แจ้งพัสดุตกค้างข้างในมีของผิดกฎหมาย ให้กด 9 ต่อสายร้อยเวร',
    },
    {
      label: 'ลิงก์การไฟฟ้าคืนเงิน',
      number: '0951239876',
      name: 'เจ้าหน้าที่การไฟฟ้า PEA ปลอม',
      script: 'คืนเงินประกันมิเตอร์ไฟฟ้า 2,000 บาท ให้แอดไลน์กดลิงก์ติดตั้งแอป Pea-service.apk',
    },
    {
      label: 'เบอร์ทางการ AOC 1441',
      number: '1441',
      name: 'ศูนย์ปราบปรามอาชญากรรมทางเทคโนโลยี AOC',
      script: 'สายด่วนแจ้งอายัดบัญชีม้า 24 ชั่วโมง',
    },
  ];

  const handleAnalyze = async (numToAnalyze?: string, scriptToAnalyze?: string, nameToAnalyze?: string) => {
    const targetNum = numToAnalyze !== undefined ? numToAnalyze : phoneNumber;
    const targetScript = scriptToAnalyze !== undefined ? scriptToAnalyze : callerScript;
    const targetName = nameToAnalyze !== undefined ? nameToAnalyze : callerName;

    if (!targetNum.trim()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: targetNum,
          callerScript: targetScript,
          callerName: targetName,
        }),
      });

      if (!response.ok) {
        throw new Error('Server not reachable or returned error');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data: ScamAnalysisResult = await response.json();
      setAnalysis(data);
    } catch {
      // Robust client-side analysis fallback (ensures 100% operation on Vercel static/serverless)
      const localAnalysis = analyzePhoneNumber(targetNum, targetScript, targetName);
      setAnalysis(localAnalysis);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: (typeof presets)[0]) => {
    setPhoneNumber(preset.number);
    setCallerName(preset.name);
    setCallerScript(preset.script);
    handleAnalyze(preset.number, preset.script, preset.name);
  };

  const copyReport = () => {
    if (!analysis) return;
    const reportText = `[รายงานตรวจสอบเบอร์มิจฉาชีพ ScamShield]\nหมายเลข: ${analysis.phoneNumber}\nความเสี่ยง: ${analysis.riskScore}% (${analysis.riskLevel})\nสรุป: ${analysis.summary}\nกลโกง: ${analysis.identifiedTactics.join(', ')}\nคำแนะนำ: ${analysis.recommendedActions.join(' / ')}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              ระบบตรวจสอบและวิเคราะห์ความเสี่ยงเบอร์โทรศัพท์
            </h2>
            <p className="text-xs text-slate-500">
              วิเคราะห์แบบเรียลไทม์ ตรวจสอบรหัส VoIP, สถิติการร้องเรียน และพฤติกรรมกลโกง
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs">
          <span className="text-slate-400 font-medium mr-1">ตัวอย่างทดสอบ:</span>
          {presets.map((preset) => (
            <button
              key={preset.number}
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเลขโทรศัพท์ที่น่าสงสัย <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="search-phone-input"
                type="text"
                placeholder="เช่น 0951234567 หรือ +697..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อหรือหน่วยงานที่แอบอ้าง (ถ้ามี)
            </label>
            <input
              id="search-caller-name-input"
              type="text"
              placeholder="เช่น ตำรวจ สภ., Flash Express, PEA"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              id="submit-analyze-btn"
              onClick={() => handleAnalyze()}
              disabled={loading || !phoneNumber.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>วิเคราะห์ความเสี่ยง</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional script text area */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ข้อความหรือบทสนทนาที่พูด (ช่วยเพิ่มความแม่นยำในการวิเคราะห์)
          </label>
          <input
            id="search-script-input"
            type="text"
            placeholder="เช่น อ้างพัสดุตกค้างมียาเสพติด, ให้กดลิงก์คืนภาษี, ขอรหัส OTP..."
            value={callerScript}
            onChange={(e) => setCallerScript(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysis && (
        <div
          id="analysis-result-card"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 md:p-6 mb-6 transition-all"
        >
          {/* Header & Risk Score Gauge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                  ผลการตรวจสอบ
                </span>
                {analysis.aiAnalyzed && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1 border border-indigo-100">
                    <Sparkles className="w-3 h-3" />
                    AI Verified
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono tracking-tight">
                {analysis.phoneNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{analysis.summary}</p>
            </div>

            {/* Visual Risk Meter */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">ระดับความเสี่ยง</div>
                <div
                  className={`text-2xl font-black font-mono ${
                    analysis.riskLevel === 'extreme'
                      ? 'text-rose-600'
                      : analysis.riskLevel === 'high'
                      ? 'text-orange-600'
                      : analysis.riskLevel === 'medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {analysis.riskScore}%
                </div>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                  analysis.riskLevel === 'extreme'
                    ? 'bg-rose-600'
                    : analysis.riskLevel === 'high'
                    ? 'bg-orange-600'
                    : analysis.riskLevel === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
              >
                {analysis.riskLevel === 'extreme' ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : analysis.riskLevel === 'high' ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : analysis.riskLevel === 'medium' ? (
                  <Info className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            {/* Tactics detected */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                กลโกงและจิตวิทยาที่ตรวจพบ:
              </h4>
              <ul className="space-y-1.5">
                {analysis.identifiedTactics.map((tactic, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Danger indicators */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                จุดอันตราย / ข้อสังเกต:
              </h4>
              <ul className="space-y-1.5">
                {analysis.dangerIndicators.map((indicator, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Advice Box */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 mb-5">
            <h4 className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              คำแนะนำและสิ่งที่ควรทำทันที:
            </h4>
            <div className="space-y-1.5">
              {analysis.recommendedActions.map((action, idx) => (
                <div key={idx} className="text-xs text-indigo-950 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>

            {analysis.warningNotice && (
              <div className="mt-3 pt-3 border-t border-indigo-200/60 text-xs text-indigo-800 font-medium">
                🚨 {analysis.warningNotice}
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              สายด่วนฉุกเฉิน: <span className="font-bold text-slate-800">AOC 1441</span> (อายัดบัญชีม้า)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyReport}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรายงาน'}</span>
              </button>

              <button
                onClick={() => onSimulateCall(analysis.phoneNumber)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>จำลองสายเข้าเบอร์นี้</span>
              </button>

              {analysis.riskLevel !== 'safe' && (
                <button
                  onClick={() =>
                    onAddToBlocked({
                      id: 'custom-' + Date.now(),
                      phoneNumber: analysis.phoneNumber,
                      formattedNumber: analysis.phoneNumber,
                      callerName: callerName || 'เบอร์เสี่ยงจากผลตรวจวิเคราะห์',
                      riskLevel: analysis.riskLevel,
                      riskScore: analysis.riskScore,
                      category: 'call_center',
                      categoryLabelTh: 'เบอร์มิจฉาชีพ',
                      reportCount: 1,
                      lastReportedAt: 'เมื่อสักครู่',
                      commonScript: callerScript || analysis.summary,
                      description: analysis.summary,
                      tags: analysis.identifiedTactics,
                      source: 'user',
                      isAutoBlocked: true,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>เพิ่มในบัญชีดำ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
