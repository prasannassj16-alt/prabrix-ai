import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { listingService } from '../../../services/listingService';
import { StepBasicInfo } from './StepBasicInfo';
import { StepLocationMap } from './StepLocationMap';
import { StepDimensionsPricing } from './StepDimensionsPricing';
import { StepPhotoUpload } from './StepPhotoUpload';
import { StepDocumentUpload } from './StepDocumentUpload';
import { StepReviewPublish } from './StepReviewPublish';
import { ListingSuccessPage } from './ListingSuccessPage';
import {
  FileText,
  MapPin,
  Ruler,
  Image,
  Lock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
  RotateCcw,
} from 'lucide-react';

const STORAGE_DRAFT_KEY = 'prabrix_listing_wizard_draft';

const INITIAL_FORM_DATA = {
  id: null,
  title: '',
  description: '',
  property_type: 'agricultural',
  district: 'Coimbatore',
  taluk: 'Sulur',
  village_panchayat: '',
  address: '',
  pincode: '',
  survey_number: '',
  patta_number: '',
  latitude: 11.025,
  longitude: 77.125,
  area_sqft: '',
  price: '',
  road_width_ft: '',
  road_type: 'tar',
  water_source: 'borewell',
  electricity_connected: true,
  soil_type: 'red',
  boundary_wall: 'fenced',
  facing_direction: 'east',
  photos: [],
  documents: [],
  views_count: 0,
};

export const ListingWizard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // If navigated with existing listing to edit
  const existingListing = location.state?.editListing || null;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (existingListing) return existingListing;
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_FORM_DATA;
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedListing, setSubmittedListing] = useState(null);

  // Persist form draft to localStorage whenever it changes
  useEffect(() => {
    if (!submittedListing && !existingListing) {
      try {
        localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
      } catch (e) {}
    }
  }, [formData, submittedListing, existingListing]);

  const updateFormData = (fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
    // Clear field-specific errors
    if (Object.keys(fields).some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(fields).forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText, desc: 'Title & Category' },
    { number: 2, title: 'Location & Map', icon: MapPin, desc: 'Jurisdiction & Pin' },
    { number: 3, title: 'Pricing & Dimensions', icon: Ruler, desc: 'Area & Utilities' },
    { number: 4, title: 'Photos', icon: Image, desc: 'Visual Showcase' },
    { number: 5, title: 'Private Vault', icon: Lock, desc: 'Deeds & Records' },
    { number: 6, title: 'Review & Publish', icon: CheckCircle2, desc: 'Final Verification' },
  ];

  // Validation per step
  const validateStep = (step) => {
    const errs = {};

    if (step === 1) {
      if (!formData.title || formData.title.trim().length < 5) {
        errs.title = 'Title must be at least 5 characters long.';
      } else if (formData.title.trim().length > 200) {
        errs.title = 'Title cannot exceed 200 characters.';
      }
      if (!formData.property_type) {
        errs.property_type = 'Please select a property classification.';
      }
    }

    if (step === 2) {
      if (!formData.district) errs.district = 'Tamil Nadu District is required.';
      if (!formData.taluk) errs.taluk = 'Taluk is required.';
      if (!formData.address || formData.address.trim().length < 5) {
        errs.address = 'Please specify a detailed address or landmark (min 5 characters).';
      }
      if (formData.latitude === null || formData.latitude === undefined || isNaN(formData.latitude)) {
        errs.coords = 'Please drop a reference marker on the map to set coordinates.';
      }
      if (formData.longitude === null || formData.longitude === undefined || isNaN(formData.longitude)) {
        errs.coords = 'Please drop a reference marker on the map to set coordinates.';
      }
    }

    if (step === 3) {
      const area = Number(formData.area_sqft);
      if (!area || isNaN(area) || area <= 0) {
        errs.area_sqft = 'Please specify a valid positive area.';
      }
      const pr = Number(formData.price);
      if (!pr || isNaN(pr) || pr <= 0) {
        errs.price = 'Please specify a valid asking price.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSaveDraft = () => {
    try {
      const listingToSave = {
        ...formData,
        owner_id: user?.id || '00000000-0000-0000-0000-000000000002',
      };
      const saved = listingService.saveListing(listingToSave, true);
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      setSubmittedListing(saved);
      toast.info('Listing draft saved to local records.');
    } catch (e) {
      setErrors({ submit: e.message || 'Error saving draft.' });
      toast.error('Failed to save draft.');
    }
  };

  const handleSubmitListing = (targetStatus = 'pending_review') => {
    setIsSubmitting(true);
    try {
      const listingToSave = {
        ...formData,
        status: targetStatus,
        owner_id: user?.id || '00000000-0000-0000-0000-000000000002',
      };
      const saved = listingService.saveListing(listingToSave, false);
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      setSubmittedListing(saved);
      toast.success(
        targetStatus === 'published'
          ? 'Listing published live to marketplace!'
          : 'Listing submitted for administrative verification!'
      );
    } catch (e) {
      setErrors({ submit: e.message || 'Error publishing listing.' });
      toast.error('Error submitting listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetWizard = () => {
    localStorage.removeItem(STORAGE_DRAFT_KEY);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setErrors({});
    setSubmittedListing(null);
    toast.info('Wizard fields reset to defaults.');
  };

  if (submittedListing) {
    return (
      <ListingSuccessPage
        listing={submittedListing}
        onResetWizard={handleResetWizard}
      />
    );
  }

  // Calculate percentage for animated progress bar
  const progressPercentage = ((currentStep - 1) / 5) * 100;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner / Heading */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
            6-Step Land Listing Wizard
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            List Your Land Parcel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Section 8 compliant &bull; Multi-unit area converter &bull; Confidential document vault
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleManualSaveDraft}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all draft fields and start over?')) {
                handleResetWizard();
              }
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-red-600 rounded-lg transition-colors"
            title="Reset All Fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Animated Step Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mb-4">
          <motion.div
            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Step Indicator Badges (Desktop) */}
        <div className="hidden sm:grid grid-cols-6 gap-2">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.number;
            const isCurrent = currentStep === st.number;

            return (
              <button
                key={st.number}
                type="button"
                onClick={() => {
                  if (st.number < currentStep) setCurrentStep(st.number);
                }}
                disabled={st.number > currentStep}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isCurrent
                    ? 'border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                    : isCompleted
                    ? 'border-teal-200 dark:border-teal-800 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 cursor-pointer'
                    : 'border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-teal-600 text-white'
                        : isCompleted
                        ? 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200'
                        : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : st.number}
                  </div>
                  <Icon
                    className={`w-4 h-4 ${
                      isCurrent
                        ? 'text-teal-700 dark:text-teal-300'
                        : isCompleted
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-400'
                    }`}
                  />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{st.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{st.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden flex items-center justify-between p-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
              {currentStep}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {steps[currentStep - 1].title}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Step {currentStep} of 6</span>
        </div>
      </div>

      {/* Step Content Container with Smooth Transition */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 rounded-2xl p-5 sm:p-7 shadow-sm mb-6 transition-colors">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <StepBasicInfo
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <StepLocationMap
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <StepDimensionsPricing
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}

            {currentStep === 4 && (
              <StepPhotoUpload
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}

            {currentStep === 5 && (
              <StepDocumentUpload
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}

            {currentStep === 6 && (
              <StepReviewPublish
                formData={formData}
                onSaveDraft={handleManualSaveDraft}
                onSubmitListing={handleSubmitListing}
                isSubmitting={isSubmitting}
                errors={errors}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Step Navigation Bar (for steps 1 to 5) */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-4 shadow-sm">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-navy-800 text-slate-400'
                : 'border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-400 hidden sm:block">
            Step {currentStep} of 6 &bull; {steps[currentStep - 1].title}
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm hover:shadow transition-colors"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
