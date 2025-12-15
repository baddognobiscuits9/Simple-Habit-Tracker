import React, { useState } from 'react';
import { X, Copy, Download, FileText, Check, ChevronDown } from 'lucide-react';
import { Habit } from '../types';
import * as exporter from '../services/export';
import { getLocalDateKey } from '../services/date';

interface SettingsModalProps {
  habits: Habit[];
  onClose: () => void;
}

type ExportRange = 'current_month' | 'last_30' | 'all_time' | 'custom';

const SettingsModal: React.FC<SettingsModalProps> = ({ habits, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [range, setRange] = useState<ExportRange>('current_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getExportDates = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === 'current_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'last_30') {
        start.setDate(now.getDate() - 30);
    } else if (range === 'all_time') {
        // Find earliest date from all habits (logs or created date)
        const timestamps = habits.flatMap(h => {
            const logDates = Object.keys(h.logs).map(d => new Date(d).getTime());
            const created = h.createdAt ? new Date(h.createdAt).getTime() : Date.now();
            return [...logDates, created];
        });
        
        if (timestamps.length > 0) {
            start = new Date(Math.min(...timestamps));
        } else {
            start.setDate(now.getDate() - 30); // Default if no data
        }
    } else if (range === 'custom') {
        if (customStart) start = new Date(customStart + 'T00:00:00');
        if (customEnd) end = new Date(customEnd + 'T23:59:59');
    }
    return { start, end };
  };

  const handleCopyMarkdown = () => {
    const { start, end } = getExportDates();
    const md = exporter.generateMarkdown(habits, start, end);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const { start, end } = getExportDates();
    const csv = exporter.generateCSV(habits, start, end);
    
    // Filename: habit-tracker-export-YYYY-MM-DD_HH-mm.csv
    const now = new Date();
    const dateStr = getLocalDateKey(now);
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', '-');
    const filename = `habit-tracker-export-${dateStr}_${timeStr}.csv`;

    exporter.downloadFile(csv, filename, 'text/csv');
  };

  const handleDownloadJSON = () => {
    const now = new Date();
    const dateStr = getLocalDateKey(now);
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', '-');
    const json = JSON.stringify(habits, null, 2);
    exporter.downloadFile(json, `habit-tracker-backup-${dateStr}_${timeStr}.json`, 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Data & Integrations</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-black transition-colors">
                <X size={20} />
            </button>
        </div>
        
        <div className="space-y-4">
            
            {/* Global Date Range Selector */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                 <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Export Date Range</label>
                 <div className="relative">
                    <select 
                        value={range}
                        onChange={(e) => setRange(e.target.value as ExportRange)}
                        className="w-full bg-white border border-neutral-200 text-neutral-900 text-sm rounded-lg p-2.5 appearance-none focus:outline-none focus:border-neutral-400 transition-colors"
                    >
                        <option value="current_month">Current Month</option>
                        <option value="last_30">Last 30 Days</option>
                        <option value="all_time">All Time</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-neutral-400 pointer-events-none" />
                </div>

                {range === 'custom' && (
                    <div className="flex gap-2 mt-2 animate-fade-in">
                        <input 
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-1/2 bg-white border border-neutral-200 text-sm rounded-lg p-2 focus:outline-none focus:border-neutral-400"
                        />
                        <input 
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-1/2 bg-white border border-neutral-200 text-sm rounded-lg p-2 focus:outline-none focus:border-neutral-400"
                        />
                    </div>
                )}
            </div>

            {/* Notion / Notes Integration */}
            <div className="p-4 border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-neutral-100 rounded-lg text-neutral-900">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium text-neutral-900">Copy to Notion / Notes</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">Formats the selected date range as a Markdown checklist.</p>
                    </div>
                </div>
                <button 
                    onClick={handleCopyMarkdown}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors active:scale-95 text-neutral-700"
                >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copied ? "Copied to Clipboard" : "Copy Markdown"}
                </button>
            </div>

            {/* CSV Export */}
            <div className="p-4 border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-neutral-100 rounded-lg text-neutral-900">
                        <Download size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">Export CSV</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">Compatible with Excel & Google Sheets.</p>
                    </div>
                </div>

                <button 
                    onClick={handleDownloadCSV}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors active:scale-95"
                >
                    Download .csv
                </button>
            </div>

            {/* JSON Backup */}
            <div className="pt-4 border-t border-neutral-100">
                <button 
                    onClick={handleDownloadJSON}
                    className="text-xs text-neutral-400 hover:text-neutral-900 underline transition-colors"
                >
                    Download raw JSON backup
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;