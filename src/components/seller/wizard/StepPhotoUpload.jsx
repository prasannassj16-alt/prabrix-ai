import React, { useState } from 'react';
import { listingService } from '../../../services/listingService';
import { Image, Upload, Trash2, Star, AlertCircle, CheckCircle2, Camera as CameraIcon } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativeMobile } from '../../../mobile/mobilePlatform';

export const StepPhotoUpload = ({ formData, updateFormData, errors }) => {
  const [uploadError, setUploadError] = useState('');
  const photos = formData.photos || [];

  const handleFileSelect = (e) => {
    setUploadError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > 10) {
      setUploadError('You can upload a maximum of 10 photos per listing.');
      return;
    }

    const newPhotos = [...photos];

    for (const file of files) {
      const validationError = listingService.validatePhotoFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Convert to local object URL for preview and storage
      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        url: previewUrl,
        caption: '',
        is_cover: newPhotos.length === 0, // First photo is cover by default
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      });
    }

    updateFormData({ photos: newPhotos });
    // Reset file input
    e.target.value = '';
  };

  const handleTakePhoto = async () => {
    if (photos.length >= 10) {
      setUploadError('You can upload a maximum of 10 photos per listing.');
      return;
    }
    setUploadError('');
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Prompts user: Camera or Photos
      });

      if (image && image.webPath) {
        const newPhoto = {
          id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          url: image.webPath,
          caption: '',
          is_cover: photos.length === 0,
          fileName: 'camera_photo_' + Date.now() + '.' + (image.format || 'jpg'),
          fileSize: 'Camera Photo',
        };
        updateFormData({ photos: [...photos, newPhoto] });
      }
    } catch (e) {
      if (!e.message?.toLowerCase().includes('cancel')) {
        setUploadError(e.message || 'Camera capture failed');
      }
    }
  };

  const handleRemovePhoto = (id) => {
    const updated = photos.filter((p) => p.id !== id);
    // If cover was removed, make first remaining photo cover
    if (updated.length > 0 && !updated.some((p) => p.is_cover)) {
      updated[0].is_cover = true;
    }
    updateFormData({ photos: updated });
  };

  const handleSetCover = (id) => {
    const updated = photos.map((p) => ({
      ...p,
      is_cover: p.id === id,
    }));
    updateFormData({ photos: updated });
  };

  const handleCaptionChange = (id, caption) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, caption } : p));
    updateFormData({ photos: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 4: Property Photos</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload clear ground photos, approach road views, water sources, and parcel perimeter.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-6 text-center transition-all">
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          Click or browse to upload property photos
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supported: JPEG, PNG, WebP • Max 5MB per file • Up to 10 photos
        </p>

        <input
          type="file"
          id="photoInput"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <label
            htmlFor="photoInput"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
          >
            <Image className="w-4 h-4 text-emerald-600" />
            <span>Browse Photos / Files</span>
          </label>

          <button
            type="button"
            onClick={handleTakePhoto}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <CameraIcon className="w-4 h-4" />
            <span>Take Photo / Camera</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Uploaded Photos ({photos.length} / 10)</span>
            <span className="text-emerald-700 font-medium">Click star to set hero cover photo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative rounded-lg border overflow-hidden bg-white shadow-sm transition-all ${
                  photo.is_cover ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200'
                }`}
              >
                <div className="h-36 w-full bg-slate-100 relative">
                  <img
                    src={photo.url}
                    alt="Property Preview"
                    className="w-full h-full object-cover"
                  />
                  {photo.is_cover && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Cover Photo
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      title={photo.is_cover ? 'Current Cover' : 'Set as Cover'}
                      className={`p-1.5 rounded-full shadow transition-colors ${
                        photo.is_cover
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-white/80 hover:bg-white text-slate-600'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      title="Delete Photo"
                      className="p-1.5 bg-white/80 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full shadow transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5">
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                    placeholder="Add brief caption (e.g. Borewell point)..."
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No photos added yet. Photos significantly boost buyer discovery.</p>
      )}
    </div>
  );
};
