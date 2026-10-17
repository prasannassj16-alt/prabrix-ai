import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validateName, validateMobile } from '../../services/validationService';
import { User, Phone, Mail, Shield, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, isPhoneVerified, isEmailVerified } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'buyer',
    bio: user?.bio || '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameErr = validateName(formData.fullName);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
          {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Profile & Account Settings</h1>
          <p className="text-xs text-slate-500">Manage your identity and platform role permissions</p>
        </div>
      </div>

      {/* Verification Status Badges */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">Mobile Verification</span>
          </div>
          {isPhoneVerified ? (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unverified</span>
            </span>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">Email Verification</span>
          </div>
          {isEmailVerified ? (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
              Optional
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="profName">
            Full Name
          </label>
          <input
            id="profName"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="profEmail">
            Registered Email (Fixed)
          </label>
          <input
            id="profEmail"
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-md text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="profPhone">
            Verified Phone Number
          </label>
          <input
            id="profPhone"
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Role Preferences: User may be both buyer and seller */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Role & Platform Preferences
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Select your operating mode. You can choose to be both a buyer and seller simultaneously.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'buyer',
                title: 'Land Buyer / Investor',
                desc: 'Access suitability reports, bookmark parcels, contact sellers.',
              },
              {
                id: 'seller',
                title: 'Land Owner / Seller',
                desc: 'List parcels, upload documents, receive inquiries & offers.',
              },
              {
                id: 'both',
                title: 'Buyer & Seller (Both)',
                desc: 'Full access to both Buyer and Seller dashboards simultaneously.',
              },
            ].map((r) => (
              <label
                key={r.id}
                className={`p-3 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                  formData.role === r.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs sm:text-sm">{r.title}</span>
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={formData.role === r.id}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</span>
              </label>
            ))}
          </div>

          {/* Admin badge if user is admin */}
          {user?.role === 'admin' && (
            <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 font-medium flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>You possess Administrator status. You have access to all portals.</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="profBio">
            Bio / Notes (Optional)
          </label>
          <textarea
            id="profBio"
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about your property goals or background in Tamil Nadu real estate..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-md text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
        </button>
      </form>
    </div>
  );
};
