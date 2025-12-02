import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { ClientType } from '../ClientOnboarding';

interface DocumentUploadProps {
  clientType: ClientType;
  documents: { [key: string]: { uploaded: boolean; fileName?: string } };
  updateDocuments: (docs: { [key: string]: { uploaded: boolean; fileName?: string } }) => void;
  onNext: () => void;
  onBack: () => void;
  clientId?: string;
}

interface DocumentRequest {
  id: string;
  name: string;
  reason: string;
  required: boolean;
}

const documentsByType: Record<string, DocumentRequest[]> = {
  individual: [
    {
      id: 'prior-returns',
      name: 'Last 2 Years of Tax Returns',
      reason: 'Helps us understand your tax history and carry-forward items',
      required: true,
    },
    {
      id: 'w2s',
      name: 'Prior Year W-2s, 1099s, K-1s',
      reason: 'Creates a better organizer and catches opportunities',
      required: true,
    },
    {
      id: 'workpapers',
      name: 'Prior Year Supporting Documents',
      reason: 'Deductions, credits, and other tax planning documentation',
      required: false,
    },
  ],
  business: [
    {
      id: 'business-returns',
      name: 'Last 2 Years of Business Tax Returns',
      reason: 'Understanding your business structure and tax positions',
      required: true,
    },
    {
      id: 'depreciation',
      name: 'Depreciation Schedule',
      reason: 'Track assets and maximize deductions',
      required: true,
    },
    {
      id: 'articles',
      name: 'Articles of Organization',
      reason: 'Verify entity structure and ownership',
      required: true,
    },
    {
      id: 'operating-agreement',
      name: 'Operating Agreement',
      reason: 'Understand member/shareholder arrangements',
      required: false,
    },
  ],
  trust: [
    {
      id: 'trust-returns',
      name: 'Prior Trust Tax Returns (Form 1041)',
      reason: 'Review prior year positions and distributions',
      required: true,
    },
    {
      id: 'trust-agreement',
      name: 'Trust Agreement',
      reason: 'Understand terms, beneficiaries, and distribution rules',
      required: true,
    },
    {
      id: 'beneficiary-info',
      name: 'Beneficiary Information Sheet',
      reason: 'Names, addresses, SSNs for K-1 preparation',
      required: true,
    },
  ],
  nonprofit: [
    {
      id: 'form-990',
      name: 'Prior Year Form 990 or 990-N',
      reason: 'Review prior year filing and maintain compliance',
      required: true,
    },
    {
      id: '501c3-letter',
      name: '501(c)(3) Determination Letter',
      reason: 'Verify tax-exempt status',
      required: true,
    },
    {
      id: 'board-list',
      name: 'Board Member List',
      reason: 'Required disclosure on Form 990',
      required: true,
    },
  ],
};

export function DocumentUpload({
  clientType,
  documents,
  updateDocuments,
  onNext,
  onBack,
  clientId,
}: DocumentUploadProps) {
  const [showDepreciationHelp, setShowDepreciationHelp] = useState(false);
  const [uploading, setUploading] = useState(false);

  const requiredDocs = documentsByType[clientType || 'individual'] || [];
  const uploadedCount = requiredDocs.filter((doc) => documents[doc.id]?.uploaded).length;
  const totalCount = requiredDocs.filter((doc) => doc.required).length;
  const progress = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  const handleFileSelect = async (docId: string, event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // If we have a clientId, upload to Supabase storage
      if (clientId) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${clientId}/${docId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('client-documents')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error('Failed to upload document');
          setUploading(false);
          return;
        }

        // Save document metadata to database
        const { error: dbError } = await supabase
          .from('documents')
          .insert([
            {
              client_id: clientId,
              document_type: docId,
              document_category: clientType,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              file_type: fileExt,
              is_required: requiredDocs.find((d) => d.id === docId)?.required || false,
            },
          ]);

        if (dbError) {
          console.error('Error saving document metadata:', dbError);
          toast.error('Failed to save document information');
          setUploading(false);
          return;
        }

        toast.success(`${file.name} uploaded successfully`);
      }

      // Update local state
      updateDocuments({
        ...documents,
        [docId]: {
          uploaded: true,
          fileName: file.name,
        },
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading');
    } finally {
      setUploading(false);
    }
  };

  const canProceed = requiredDocs
    .filter((doc) => doc.required)
    .every((doc) => documents[doc.id]?.uploaded);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="mb-8">
          <h2 className="text-slate-900 mb-2">Required Documents</h2>
          <p className="text-slate-600 text-sm mb-4">
            Upload these documents to help us serve you better
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                {uploadedCount} of {totalCount} required documents uploaded
              </span>
              <span className="text-slate-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Document Cards */}
        <div className="space-y-4">
          {requiredDocs.map((doc) => {
            const uploaded = documents[doc.id]?.uploaded;
            return (
              <div
                key={doc.id}
                className={`border-2 rounded-lg p-5 transition-all ${
                  uploaded
                    ? 'border-green-500 bg-green-50'
                    : doc.required
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg ${
                      uploaded ? 'bg-green-500' : 'bg-slate-100'
                    }`}
                  >
                    {uploaded ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-slate-900">
                          {doc.name}
                          {doc.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h3>
                        {uploaded && documents[doc.id]?.fileName && (
                          <p className="text-sm text-green-700 mt-1">
                            ✓ {documents[doc.id].fileName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`file-${doc.id}`}
                          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                            uploading
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : uploaded
                              ? 'bg-white border border-green-500 text-green-700 hover:bg-green-50'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : uploaded ? 'Replace' : 'Upload'}
                        </label>
                        <input
                          id={`file-${doc.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileSelect(doc.id, e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={uploading}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{doc.reason}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Depreciation Help for Business Clients */}
        {clientType === 'business' && !documents['depreciation']?.uploaded && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <button
              onClick={() => setShowDepreciationHelp(!showDepreciationHelp)}
              className="text-sm text-blue-900 hover:text-blue-700"
            >
              {showDepreciationHelp ? '▼' : '▶'} Don't have a depreciation schedule?
            </button>
            {showDepreciationHelp && (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>No problem! Here are your options:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Contact your prior accountant and request it</li>
                  <li>
                    Sign a release form so we can request it on your behalf
                  </li>
                  <li>We can recreate it (may incur additional fees)</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Drag & Drop Info */}
        <div className="mt-6 p-4 border-2 border-dashed border-slate-300 rounded-lg text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Accepted formats: PDF, Word, JPG, PNG
          </p>
          <p className="text-xs text-slate-500 mt-1">
            All documents are encrypted and stored securely
          </p>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
          <AlertCircle className="w-4 h-4" />
          <span>
            Estimated time to finish: {uploadedCount >= totalCount ? '0' : '5-10'} minutes
          </span>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed} className="ml-auto gap-2">
            {canProceed ? 'Continue' : `Upload ${totalCount - uploadedCount} More Required Documents`}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
