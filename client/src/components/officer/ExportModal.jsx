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
        <p className="text-xs text-slate-300 leading-relaxed">
          Download or print verified farmer crop records within your designated jurisdiction. Contains verified survey boundaries, cultivated area, and verification audit timestamps.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Select Agricultural Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 outline-none transition-all cursor-pointer"
          >
            <option value="2026" className="bg-[#06151a] text-white">2026 (Current Year)</option>
            <option value="2025" className="bg-[#06151a] text-white">2025</option>
            <option value="2024" className="bg-[#06151a] text-white">2024</option>
            <option value="All" className="bg-[#06151a] text-white">All Years Archive</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownloadCSV}
            disabled={loading}
            className="p-3 bg-[#030b0e] hover:bg-[#0c242c] text-teal-300 border border-slate-700 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-teal-400" />
            <span>Download CSV Data</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3 bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 hover:text-white border border-slate-700 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-5 h-5 text-slate-400" />
            <span>Print Report View</span>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
