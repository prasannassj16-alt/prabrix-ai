import React, { useState } from 'react';
import { listingService } from '../../../services/listingService';
import { FileText, Lock, Upload, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

export const StepDocumentUpload = ({ formData, updateFormData, errors }) => {
  const [docType, setDocType] = useState('patta_chitta');
  const [customTitle, setCustomTitle] = useState('');
  const [uploadError, setUploadError] = useState('');
  const documents = formData.documents || [];

  const documentCategories = [
    { id: 'patta_chitta', label: 'Patta / Chitta Extract (Tamil Nilam)' },
    { id: 'sale_deed', label: 'Parent Sale Deed / Title Deed' },
    { id: 'encumbrance_certificate', label: 'Encumbrance Certificate (EC - 15+ Yrs)' },
    { id: 'fmb_sketch', label: 'FMB Sketch / Revenue Map' },
    { id: 'tslr_extract', label: 'TSLR Extract (Town Survey Land Register)' },
    { id: 'layout_plan', label: 'DTCP / CMDA Approved Layout Plan' },
    { id: 'noc', label: 'NOC / Revenue Clearance Certificate' },
    { id: 'tax_receipt', label: 'Latest Property / Land Tax Receipt' },
    { id: 'other', label: 'Other Legal Instrument' },
  ];

  const handleFileSelect = (e) => {
    setUploadError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const file = files[0];
    const validationError = listingService.validateDocumentFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    const categoryObj = documentCategories.find((c) => c.id === docType);
    const title = customTitle.trim() || categoryObj.label;

    const newDoc = {
      id: 'doc-' + Date.now(),
      type: docType,
      title: title,
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      mimeType: file.type,
      status: 'unverified',
      uploaded_at: new Date().toISOString(),
    };

    updateFormData({ documents: [...documents, newDoc] });
    setCustomTitle('');
    e.target.value = '';
  };

  const handleRemoveDoc = (id) => {
    updateFormData({ documents: documents.filter((d) => d.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 5: Confidential Legal Document Vault</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Attach revenue and title instruments to fast-track buyer diligence and verification badges.
        </p>
      </div>

      {/* Security & RLS Privacy Guarantee Banner */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-900">
        <Lock className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Confidential Vault Guarantee:</span> Documents uploaded here are stored in our protected private document repository guarded by PostgreSQL Row Level Security (RLS). They are <span className="font-bold underline">never made publicly accessible</span> and can only be inspected by you and verified platform administrators during legal moderation.
        </div>
      </div>

      {/* Document Uploader Form */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Document</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="docCategory">
              Document Category
            </label>
            <select
              id="docCategory"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:border-emerald-500"
            >
              {documentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="docTitle">
              Document Title / Label (Optional)
            </label>
            <input
              id="docTitle"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Patta Extract for SF 204/1B"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <input
            type="file"
            id="docFileInput"
            accept="application/pdf,image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="docFileInput"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Choose PDF or Image File</span>
          </label>
          <span className="text-[11px] text-slate-400">PDF, JPEG, or PNG up to 10MB</span>
        </div>

        {uploadError && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700">
          Attached Vault Documents ({documents.length})
        </h3>

        {documents.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900">{doc.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {doc.fileName} • {doc.fileSize} • Category: {doc.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Private / Unverified
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No private documents attached yet. You can still save or publish and upload them later.
          </p>
        )}
      </div>
    </div>
  );
};
