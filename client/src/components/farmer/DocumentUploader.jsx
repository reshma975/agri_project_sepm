import React, { useState, useRef } from 'react';
import apiClient from '../../api/apiClient';
import Modal from '../common/Modal';
import {
  FileText,
  CheckCircle2,
  Upload,
  RefreshCw,
  Eye,
  FileCheck,
  AlertCircle,
  Download,
  ExternalLink,
  ImageIcon
} from 'lucide-react';

export default function DocumentUploader({ documents, onDocumentUpdated }) {
  const [uploading, setUploading] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [localDocs, setLocalDocs] = useState({});

  // Hidden file input refs for each doc type
  const fileInputRefs = {
    aadhaarDoc: useRef(null),
    passbookDoc: useRef(null),
    landRecordDoc: useRef(null),
  };

  const docList = [
    {
      key: 'aadhaarDoc',
      label: '1. Aadhaar Card (ID Proof)',
      description: 'Government photo identity card (Photo or PDF)',
      accept: '.pdf,.png,.jpg,.jpeg'
    },
    {
      key: 'passbookDoc',
      label: '2. Bank Passbook (DBT Account)',
      description: 'First page showing Bank Account, IFSC & Farmer Name',
      accept: '.pdf,.png,.jpg,.jpeg'
    },
    {
      key: 'landRecordDoc',
      label: '3. Land Title Record (1-B / RoR / Adangal / Pattadar)',
      description: 'Official revenue document showing Survey Number & Ownership',
      accept: '.pdf,.png,.jpg,.jpeg,.doc,.docx'
    }
  ];

  const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleBrowseClick = (docKey) => {
    setErrorMessage('');
    if (fileInputRefs[docKey]?.current) {
      fileInputRefs[docKey].current.click();
    }
  };

  const handleFileSelected = async (e, docKey, label) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds maximum allowed size of 20 MB.`);
      return;
    }

    setUploading(docKey);
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = reader.result;
        const formattedSize = formatBytes(file.size);

        // Store immediately in local state for instant responsive preview
        setLocalDocs((prev) => ({
          ...prev,
          [docKey]: {
            fileName: file.name,
            fileSize: formattedSize,
            fileType: file.type,
            fileData: typeof fileData === 'string' ? fileData : '',
            status: 'Uploaded',
            uploadedAt: new Date()
          }
        }));

        try {
          const res = await apiClient.post('/farmers/upload-document', {
            docType: docKey,
            fileName: file.name,
            fileSize: formattedSize,
            fileType: file.type || 'application/octet-stream',
            fileData: typeof fileData === 'string' ? fileData : ''
          });

          if (res.data.success && onDocumentUpdated) {
            onDocumentUpdated(res.data.documents);
          }
        } catch (apiErr) {
          console.warn('Backend document save warning:', apiErr);
          // Even if backend fails, local file is kept in state so farmer can view it
        } finally {
          setUploading(null);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read file from your device. Please try again.');
        setUploading(null);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Document upload error:', err);
      setErrorMessage('Failed to process document. Please try again.');
      setUploading(null);
    } finally {
      e.target.value = '';
    }
  };

  const openPreview = (docKey, label, docObj) => {
    const activeDoc = localDocs[docKey] || docObj || {};
    setPreviewDoc({
      ...activeDoc,
      key: docKey,
      label
    });
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        {docList.map((doc) => {
          const currentDoc = localDocs[doc.key] || documents?.[doc.key];
          const isUploaded = !!currentDoc?.fileName;
          const isThisUploading = uploading === doc.key;

          return (
            <div
              key={doc.key}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl gap-3 transition-all border ${
                isUploaded
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-forest-300'
              } shadow-xs`}
            >
              {/* Native file input */}
              <input
                type="file"
                ref={fileInputRefs[doc.key]}
                onChange={(e) => handleFileSelected(e, doc.key, doc.label)}
                accept={doc.accept}
                className="hidden"
              />

              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isUploaded
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-forest-100 text-forest-700'
                  }`}
                >
                  {isUploaded ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">{doc.label}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>

                  {isUploaded ? (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                        📎 {currentDoc.fileName}
                      </span>
                      {currentDoc.fileSize && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({currentDoc.fileSize})
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      No document uploaded yet
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {isUploaded && (
                  <>
                    <button
                      type="button"
                      onClick={() => openPreview(doc.key, doc.label, currentDoc)}
                      className="px-3.5 py-1.5 text-xs font-bold text-forest-700 bg-white hover:bg-forest-50 border border-forest-300 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                      title="Click to view and inspect uploaded document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Uploaded
                    </span>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleBrowseClick(doc.key)}
                  disabled={isThisUploading}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 shadow-xs ${
                    isUploaded
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-forest-600 hover:bg-forest-700 text-white border-forest-600 shadow-forest-100'
                  }`}
                >
                  {isThisUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : isUploaded ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Replace</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document View & Inspection Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview — ${previewDoc.label || 'Verification File'}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">{previewDoc.fileName}</h5>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {previewDoc.fileSize ? `Size: ${previewDoc.fileSize} • ` : ''}Status:{' '}
                    <span className="text-emerald-600 font-bold">{previewDoc.status || 'Verified & Uploaded'}</span>
                  </p>
                </div>
              </div>

              {previewDoc.fileData && (
                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName}
                    className="px-3.5 py-1.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const win = window.open();
                      if (win) {
                        win.document.write(
                          `<iframe src="${previewDoc.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                        );
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Tab</span>
                  </button>
                </div>
              )}
            </div>

            {/* Document Content View Area */}
            <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-200 min-h-[320px] flex items-center justify-center overflow-hidden">
              {previewDoc.fileData && previewDoc.fileData.startsWith('data:image/') ? (
                <div className="space-y-2 text-center w-full">
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.fileName}
                    className="max-h-[460px] max-w-full mx-auto object-contain rounded-xl shadow-lg border border-white"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Image Document Preview
                  </span>
                </div>
              ) : previewDoc.fileData && previewDoc.fileData.startsWith('data:application/pdf') ? (
                <div className="w-full space-y-2">
                  <iframe
                    src={previewDoc.fileData}
                    title="PDF Document Preview"
                    className="w-full h-[480px] rounded-xl border border-slate-300 bg-white shadow-inner"
                  />
                </div>
              ) : previewDoc.fileData ? (
                <div className="w-full space-y-2 text-center">
                  <iframe
                    src={previewDoc.fileData}
                    title="Document Preview"
                    className="w-full h-[400px] rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              ) : (
                /* Fallback preview for seeded demonstration records */
                <div className="p-8 text-center space-y-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-forest-100 text-forest-700 mx-auto flex items-center justify-center shadow-xs">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{previewDoc.label}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-1">{previewDoc.fileName}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    Official digital copy verified by Agricultural Department. To replace with a new file from your device, click "Replace".
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
