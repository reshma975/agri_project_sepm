import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import apiClient from '../../api/apiClient';
import { Calendar, Clock, ShieldCheck, AlertCircle, CheckCircle2, Save, X } from 'lucide-react';

export default function DeadlineManagerModal({ isOpen, onClose, currentDeadline, mandal, onDeadlineSaved }) {
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [season, setSeason] = useState('Kharif');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentDeadline) {
      const d = new Date(currentDeadline.deadlineDate);
      if (!isNaN(d.getTime())) {
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        setDeadlineDate(`${yearStr}-${monthStr}-${dayStr}`);

        const hoursStr = String(d.getHours()).padStart(2, '0');
        const minsStr = String(d.getMinutes()).padStart(2, '0');
        setDeadlineTime(`${hoursStr}:${minsStr}`);
      }
      setSeason(currentDeadline.season || 'Kharif');
      setYear(currentDeadline.year ? currentDeadline.year.toString() : new Date().getFullYear().toString());
      setDescription(currentDeadline.description || '');
    } else {
      // Default: 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      const yearStr = defaultDate.getFullYear();
      const monthStr = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(defaultDate.getDate()).padStart(2, '0');
      setDeadlineDate(`${yearStr}-${monthStr}-${dayStr}`);
      setDeadlineTime('23:59');
      setSeason('Kharif');
      setYear(new Date().getFullYear().toString());
      setDescription(`Official crop registration deadline for ${mandal || 'Penamaluru'} Mandal.`);
    }
    setError('');
    setSuccess('');
  }, [currentDeadline, isOpen, mandal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deadlineDate) {
      return setError('Please select a deadline date');
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const fullDateTimeString = `${deadlineDate}T${deadlineTime || '23:59'}:00`;
      const combinedDate = new Date(fullDateTimeString);

      const res = await apiClient.post('/officer/deadline', {
        deadlineDate: combinedDate.toISOString(),
        season,
        year: parseInt(year, 10),
        description: description.trim(),
        mandal
      });

      if (res.data.success) {
        setSuccess(`Crop registration deadline for ${mandal || 'your mandal'} updated successfully!`);
        if (onDeadlineSaved) {
          onDeadlineSaved(res.data.deadline);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update registration deadline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Crop Registration Deadline — ${mandal || 'Mandal'}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-3.5 bg-[#030b0e] border border-slate-700 rounded-2xl text-xs text-slate-300 space-y-1">
          <p className="font-extrabold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Mandal Jurisdiction: <span className="text-teal-300">{mandal || 'Penamaluru'}</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Once this deadline passes, farmers in this mandal will not be able to submit new applications or resubmissions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Deadline Date */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Deadline Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none font-bold"
              />
            </div>
          </div>

          {/* Deadline Time */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Cut-off Time (24h) *
            </label>
            <div className="relative">
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none font-bold"
              />
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Agricultural Season
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none cursor-pointer"
            >
              <option value="Kharif">Kharif Season</option>
              <option value="Rabi">Rabi Season</option>
              <option value="Zaid">Zaid Season</option>
              <option value="Annual">Annual / Commercial</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Crop Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none font-bold"
            />
          </div>
        </div>

        {/* Circular / Notice description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Department Circular / Instructions for Farmers
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. All farmers of Penamaluru Mandal must complete Aadhaar eKYC, land 1-B title upload, and crop survey submission before the cut-off date."
            className="w-full px-3.5 py-2 text-xs bg-[#06151a] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 btn-glow-primary text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{loading ? 'Saving Deadline...' : 'Set & Broadcast Deadline'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
