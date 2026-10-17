import { describe, it, expect, beforeEach } from 'vitest';
import {
  DOCUMENT_CATEGORIES,
  documentAccessControl,
  validateDocumentFile,
  getListingDocuments,
  uploadPrivateDocument,
  requestDocumentAccess,
  grantDocumentAccess,
  analyzeDocument,
  isOcrConfigured,
  OCR_UNAVAILABLE_MESSAGE,
} from '../services/documentService';

describe('Phase 8: Private Document Management & Legal Intelligence Service', () => {
  const mockOwner = {
    id: 'user-owner-01',
    full_name: 'Ramesh Sundaram',
    email: 'seller@example.com',
    role: 'seller',
  };

  const mockAdmin = {
    id: 'user-admin-99',
    full_name: 'Platform Admin',
    email: 'admin@prabrix.local',
    role: 'admin',
  };

  const mockBuyer = {
    id: 'user-buyer-02',
    full_name: 'Karthik Raja',
    email: 'buyer@example.com',
    role: 'buyer',
  };

  const mockListing = {
    id: 'listing-sulur-01',
    owner_id: 'user-owner-01',
    title: '[DEMO] Fertile Red Soil Farmland - 1 Acre',
    survey_number: '204/1B',
    patta_number: 'PT-8942',
    village_panchayat: 'Kannampalayam',
    taluk: 'Sulur',
    district: 'Coimbatore',
    area_sqft: 43560,
    area_cents: 100,
    property_type: 'agricultural',
    documents: [
      {
        id: 'doc-seed-1',
        type: 'patta_chitta',
        title: 'Tamil Nilam Patta 8942',
        fileName: 'patta_8942.pdf',
        fileSize: '240 KB',
        status: 'verified',
      },
      {
        id: 'doc-seed-2',
        type: 'encumbrance_certificate',
        title: 'Encumbrance Certificate (15 Yrs Nil)',
        fileName: 'ec_15yr.pdf',
        fileSize: '450 KB',
        status: 'verified',
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Role-Based Access Control (RLS Guarantee)', () => {
    it('allows listing owner full access to view, download, and upload documents', () => {
      expect(documentAccessControl.canAccessListingDocuments(mockListing, mockOwner)).toBe(true);
      expect(documentAccessControl.canUploadDocuments(mockListing, mockOwner)).toBe(true);
    });

    it('allows platform administrator full access across any listing', () => {
      expect(documentAccessControl.canAccessListingDocuments(mockListing, mockAdmin)).toBe(true);
      expect(documentAccessControl.canUploadDocuments(mockListing, mockAdmin)).toBe(true);
      expect(documentAccessControl.canVerifyDocuments(mockAdmin)).toBe(true);
    });

    it('restricts unauthorized buyer and unauthenticated visitors from raw private documents', () => {
      expect(documentAccessControl.canAccessListingDocuments(mockListing, mockBuyer)).toBe(false);
      expect(documentAccessControl.canUploadDocuments(mockListing, mockBuyer)).toBe(false);
      expect(documentAccessControl.canAccessListingDocuments(mockListing, null)).toBe(false);
      expect(documentAccessControl.canVerifyDocuments(mockBuyer)).toBe(false);
    });

    it('returns sanitized restricted metadata for unauthorized callers to protect privacy', () => {
      const docs = getListingDocuments(mockListing.id, mockBuyer, mockListing);

      expect(docs.length).toBe(2);
      docs.forEach((doc) => {
        expect(doc.isRestricted).toBe(true);
        expect(doc.file_url).toBeUndefined(); // Raw cloud URL is redacted
        expect(doc.notice).toContain('Confidential document');
      });
    });

    it('unlocks full document access when buyer access request is granted by owner', () => {
      // 1. Initially restricted
      expect(documentAccessControl.canAccessListingDocuments(mockListing, mockBuyer)).toBe(false);

      // 2. Buyer submits access request
      requestDocumentAccess(mockListing.id, mockBuyer, 'Legal Diligence by Advocate');

      // 3. Owner grants access
      const granted = grantDocumentAccess(mockListing.id, mockBuyer.id, mockOwner);
      expect(granted).toBe(true);

      // 4. Now buyer has access
      expect(documentAccessControl.canAccessListingDocuments(mockListing, mockBuyer)).toBe(true);
      const docs = getListingDocuments(mockListing.id, mockBuyer, mockListing);
      expect(docs[0].isRestricted).toBe(false);
      expect(docs[0].file_url).toBeDefined();
    });
  });

  describe('2. File Validation and Secure Upload', () => {
    it('validates supported document categories', () => {
      expect(DOCUMENT_CATEGORIES.length).toBe(9);
      expect(DOCUMENT_CATEGORIES.some((c) => c.id === 'patta_chitta')).toBe(true);
      expect(DOCUMENT_CATEGORIES.some((c) => c.id === 'encumbrance_certificate')).toBe(true);
      expect(DOCUMENT_CATEGORIES.some((c) => c.id === 'sale_deed')).toBe(true);
    });

    it('rejects unsupported file formats (e.g. executable, zip, docx)', () => {
      const badFile = { name: 'exploit.exe', type: 'application/x-msdownload', size: 5000 };
      expect(validateDocumentFile(badFile)).toContain('Invalid file type');
    });

    it('rejects files exceeding 10 MB limit', () => {
      const oversizedFile = { name: 'large_deed.pdf', type: 'application/pdf', size: 15 * 1024 * 1024 };
      expect(validateDocumentFile(oversizedFile)).toContain('exceeds maximum allowed size of 10 MB');
    });

    it('accepts valid PDF within size limit', () => {
      const validFile = { name: 'patta_doc.pdf', type: 'application/pdf', size: 2 * 1024 * 1024 };
      expect(validateDocumentFile(validFile)).toBeNull();
    });

    it('saves uploaded private document with unverified status and owner attribution', () => {
      const newDoc = uploadPrivateDocument(mockListing, mockOwner, {
        type: 'fmb_sketch',
        title: 'FMB Field Measurement Book SF 204',
        fileName: 'fmb_204.pdf',
        fileSize: '1.4 MB',
        mimeType: 'application/pdf',
      });

      expect(newDoc.id).toBeDefined();
      expect(newDoc.status).toBe('unverified');
      expect(newDoc.uploader_id).toBe(mockOwner.id);
      expect(newDoc.type).toBe('fmb_sketch');

      const allDocs = getListingDocuments(mockListing.id, mockOwner, mockListing);
      expect(allDocs.some((d) => d.id === newDoc.id)).toBe(true);
    });

    it('throws unauthorized error if unauthorized buyer attempts to upload', () => {
      expect(() => {
        uploadPrivateDocument(mockListing, mockBuyer, {
          type: 'other',
          title: 'Unauthorized File',
        });
      }).toThrow(/Unauthorized/i);
    });
  });

  describe('3. Document AI / OCR Extraction & Ground-Truth Separation', () => {
    it('strictly returns unavailable state when no OCR API key is configured (NEVER invents text)', () => {
      // In default test environment without VITE_OCR_API_KEY
      expect(isOcrConfigured()).toBe(false);

      const targetDoc = mockListing.documents[0];
      const result = analyzeDocument(targetDoc, mockListing);

      expect(result.status).toBe('unavailable');
      expect(result.isConfigured).toBe(false);
      expect(result.message).toBe(OCR_UNAVAILABLE_MESSAGE);
      expect(result.extractedText).toBeNull();
      expect(result.verifiedFacts).toBeNull();
      expect(result.alignment.length).toBe(0);
    });

    it('strictly separates machine-extracted text from verified ground truth when analysis is performed', () => {
      const targetDoc = mockListing.documents[0];
      // Execute with verified test fixture flag
      const result = analyzeDocument(targetDoc, mockListing, { forceMock: true });

      expect(result.status).toBe('analyzed');
      expect(result.isConfigured).toBe(true);

      // 1. Extracted Text (Unverified OCR Scan)
      const { extractedText } = result;
      expect(extractedText).toBeDefined();
      expect(extractedText.isVerifiedFact).toBe(false);
      expect(extractedText.statusLabel).toBe('Machine-Extracted (Unverified OCR)');
      expect(extractedText.confidence).toBeGreaterThan(0.9);
      expect(extractedText.rawScanSnippet).toBeDefined();
      expect(extractedText.fields.surveyNumber.raw).toBe('204/1B');

      // 2. Verified Cadastral Facts (Authoritative Registry)
      const { verifiedFacts } = result;
      expect(verifiedFacts).toBeDefined();
      expect(verifiedFacts.isVerifiedFact).toBe(true);
      expect(verifiedFacts.statusLabel).toBe('Authoritative Verified Ground Truth');
      expect(verifiedFacts.source).toContain('Tamil Nilam');
      expect(verifiedFacts.fields.surveyNumber).toBe(mockListing.survey_number);
      expect(verifiedFacts.fields.pattaNumber).toBe(mockListing.patta_number);

      // 3. Side-by-side alignment & discrepancy checks
      expect(result.alignment.length).toBeGreaterThan(0);
      const surveyAlignment = result.alignment.find((a) => a.field === 'Survey Number');
      expect(surveyAlignment.isMatch).toBe(true);
      expect(surveyAlignment.extracted).toBe('204/1B');
      expect(surveyAlignment.verified).toBe('204/1B');
    });
  });
});
