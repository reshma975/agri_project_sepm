import React, { useState } from 'react';
import Modal from '../common/Modal';
import apiClient from '../../api/apiClient';
import { Download, FileSpreadsheet, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExportModal({ isOpen, onClose }) {
  const [year, setYear] = useState('2026');
  const [loading, setLoading] = useState(false);

  const handleDownloadCSV = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/officer/export?year=${year}`);
      if (res.data.success && res.data.data) {
        const rows = res.data.data;
        if (rows.length === 0) {
          alert('No verified records found for the selected year to export.');
          setLoading(false);
          return;
        }

        const headers = Object.keys(rows[0]).join(',');
        const csvContent =
          'data:text/csv;charset=utf-8,' +
          [headers, ...rows.map((row) => Object.values(row).map((val) => `"${val || ''}"`).join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `FarmSetu_Verified_Crops_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📥 Export Official Crop Records" maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Download or print verified farmer crop records within your designated jurisdiction. Contains verified survey boundaries, cultivated area, and verification audit timestamps.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Agricultural Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-200 outline-none transition-all"
          >
            <option value="2026">2026 (Current Year)</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="All">All Years Archive</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownloadCSV}
            disabled={loading}
            className="p-3 bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-5 h-5 text-forest-600" />
            <span>Download CSV Data</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 transition-all shadow-xs"
          >
            <Printer className="w-5 h-5 text-slate-600" />
            <span>Print Report View</span>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
