import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Ban,
  PlusCircle,
  FileText,
  Filter,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { ScamNumberEntry, ScamCategory } from '../types';
import { SCAM_CATEGORIES_INFO } from '../data/initialScamNumbers';

interface DatabaseListProps {
  entries: ScamNumberEntry[];
  onSimulateCall: (entry: ScamNumberEntry) => void;
  onBlockNumber: (entry: ScamNumberEntry) => void;
  onAnalyze: (phoneNumber: string, script?: string, name?: string) => void;
  onOpenReportModal: () => void;
  blockedNumberSet: Set<string>;
}

export const DatabaseList: React.FC<DatabaseListProps> = ({
  entries,
  onSimulateCall,
  onBlockNumber,
  onAnalyze,
  onOpenReportModal,
  blockedNumberSet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Risk filter
      if (selectedRisk !== 'all' && item.riskLevel !== selectedRisk) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().replace(/[\s\-\(\)]/g, '');
        const cleanPhone = item.phoneNumber.replace(/[\s\-\(\)]/g, '').toLowerCase();
        const cleanName = item.callerName.toLowerCase();
        const cleanScript = item.commonScript.toLowerCase();
        const cleanTags = item.tags.join(' ').toLowerCase();

        return (
          cleanPhone.includes(query) ||
          cleanName.includes(query) ||
          cleanScript.includes(query) ||
          cleanTags.includes(query)
        );
      }
      return true;
    });
  }, [entries, searchQuery, selectedCategory, selectedRisk]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header & Report Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ฐานข้อมูลเบอร์มิจฉาชีพแบบเรียลไทม์</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold border border-rose-200">
              อัปเดตสด
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รวบรวมเบอร์ที่ถูกรายงานจากประชาชน ตำรวจไซเบอร์ และเกตเวย์ต้องสงสัย
          </p>
        </div>

        <button
          id="open-report-modal-btn"
          onClick={onOpenReportModal}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-rose-900/10 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>รายงานเบอร์มิจฉาชีพ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-database-input"
              type="text"
              placeholder="ค้นหาด้วยเบอร์โทร, ชื่อที่แอบอ้าง, คำในสคริปต์ หรือแท็ก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <span className="text-slate-400 font-medium whitespace-nowrap">ความเสี่ยง:</span>
            <button
              onClick={() => setSelectedRisk('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                selectedRisk === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setSelectedRisk('extreme')}
              className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                selectedRisk === 'extreme'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
            >
              อันตรายสูงสุด
            </button>
            <button
              onClick={() => setSelectedRisk('high')}
              className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                selectedRisk === 'high'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
              }`}
            >
              น่าสงสัย
            </button>
            <button
              onClick={() => setSelectedRisk('safe')}
              className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                selectedRisk === 'safe'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              ปลอดภัย
            </button>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pt-3 border-t border-slate-100 text-xs scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {SCAM_CATEGORIES_INFO.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Database Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.map((entry) => {
          const isBlocked = blockedNumberSet.has(entry.phoneNumber);
          const isExtreme = entry.riskLevel === 'extreme';
          const isHigh = entry.riskLevel === 'high';
          const isSafe = entry.riskLevel === 'safe';

          return (
            <div
              key={entry.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                isBlocked
                  ? 'border-rose-200 bg-rose-50/20'
                  : isExtreme
                  ? 'border-slate-200/90 hover:border-rose-300'
                  : isSafe
                  ? 'border-emerald-200/80 bg-emerald-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isExtreme
                          ? 'bg-rose-100 text-rose-700'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800'
                          : isSafe
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isExtreme ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : isSafe ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span>
                        {isExtreme
                          ? 'อันตรายสูงสุด'
                          : isHigh
                          ? 'ความเสี่ยงสูง'
                          : isSafe
                          ? 'ปลอดภัย'
                          : 'ก่อกวน'}
                      </span>
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono">
                      คะแนน {entry.riskScore}%
                    </span>
                  </div>

                  {isBlocked && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-semibold flex items-center gap-1">
                      <Ban className="w-3 h-3" />
                      บล็อกแล้ว
                    </span>
                  )}
                </div>

                {/* Number & Name */}
                <div className="mb-2">
                  <div className="text-base font-bold text-slate-900 font-mono tracking-tight">
                    {entry.formattedNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    {entry.callerName}
                  </div>
                </div>

                {/* Common Script Snippet */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>บทสนทนาที่อ้าง:</span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    "{entry.commonScript}"
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {entry.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {entry.reportCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-semibold">
                      แจ้งเตือนแล้ว {entry.reportCount.toLocaleString()} ครั้ง
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSimulateCall(entry)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  title="ทดสอบการแจ้งเตือนสายเข้าเบอร์นี้"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>จำลองสายเข้า</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAnalyze(entry.phoneNumber, entry.commonScript, entry.callerName)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs transition cursor-pointer"
                    title="วิเคราะห์ความเสี่ยงเบอร์นี้"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onBlockNumber(entry)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                      isBlocked
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isBlocked ? 'ปลดบล็อก' : 'บล็อก'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">ไม่พบหมายเลขที่ตรงกับเงื่อนไขการค้นหา</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            หากคุณได้รับสายจากเบอร์นี้และสงสัยว่าเป็นมิจฉาชีพ คุณสามารถรายงานเพื่อให้ระบบเพิ่มในฐานข้อมูลได้ทันที
          </p>
          <button
            onClick={onOpenReportModal}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>รายงานเบอร์นี้ทันที</span>
          </button>
        </div>
      )}
    </div>
  );
};
