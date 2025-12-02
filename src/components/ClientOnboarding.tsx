import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { ClientTypeSelection } from './onboarding/ClientTypeSelection';
import { IntakeQuestionnaire } from './onboarding/IntakeQuestionnaire';
import { DocumentUpload } from './onboarding/DocumentUpload';
import { PowerOfAttorney } from './onboarding/PowerOfAttorney';
import { EngagementLetter } from './onboarding/EngagementLetter';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { ProgressStepper } from './onboarding/ProgressStepper';

export type ClientType = 'individual' | 'business' | 'trust' | 'nonprofit' | null;

export interface OnboardingData {
  clientType: ClientType;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    filingStatus?: string;
    preferredContact: string;
    referralSource: string;
  };
  screening: {
    delinquentReturns: boolean;
    irsNotices: boolean;
    bankruptcies: boolean;
    priorAccountantIssues: string;
  };
  businessInfo?: {
    entityType: string;
    yearFormed: string;
    bookkeepingNeeds: boolean;
    payrollNeeds: boolean;
    salesTaxNeeds: boolean;
    needs1099Prep: boolean;
  };
  trustInfo?: {
    trustType: string;
    yearEstablished: string;
    beneficiaries: Array<{ name: string; address: string; ssn: string }>;
  };
  nonprofitInfo?: {
    has501c3: boolean;
    boardMembers: Array<{ name: string; role: string }>;
    typicalRevenue: string;
  };
  documents: {
    [key: string]: { uploaded: boolean; fileName?: string };
  };
  poaGranted: boolean;
  engagementSigned: boolean;
  selectedServices: string[];
  estimatedFee: number;
}

const steps = [
  { id: 1, name: 'Client Type', icon: Users },
  { id: 2, name: 'Your Information', icon: FileText },
  { id: 3, name: 'Documents', icon: Upload },
  { id: 4, name: 'Authorization', icon: FileText },
  { id: 5, name: 'Engagement & Billing', icon: CheckCircle2 },
  { id: 6, name: 'Welcome', icon: CheckCircle2 },
];

export function ClientOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [clientId, setClientId] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    clientType: null,
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      preferredContact: 'email',
      referralSource: '',
    },
    screening: {
      delinquentReturns: false,
      irsNotices: false,
      bankruptcies: false,
      priorAccountantIssues: '',
    },
    documents: {},
    poaGranted: false,
    engagementSigned: false,
    selectedServices: [],
    estimatedFee: 0,
  });

  // Auto-save to localStorage and Supabase
  useEffect(() => {
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    saveOnboardingDataToSupabase();
  }, [onboardingData]);

  const saveOnboardingDataToSupabase = async () => {
    try {
      // Create or update client if we have contact info
      if (onboardingData.contactInfo.name && onboardingData.contactInfo.email) {
        let cId = clientId;

        // If no client ID yet, create a new client
        if (!cId) {
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert([
              {
                name: onboardingData.contactInfo.name,
                type: onboardingData.clientType,
                status: 'new',
                setup_progress: 0,
                created_by: (await supabase.auth.getUser()).data.user?.id,
              },
            ])
            .select()
            .single();

          if (clientError) {
            console.error('Error creating client:', clientError);
            return;
          }

          cId = newClient.id;
          setClientId(cId);
        }

        // Check if onboarding response exists for this client
        const { data: existingResponse } = await supabase
          .from('onboarding_responses')
          .select('id')
          .eq('client_id', cId)
          .single();

        const responseData = {
          contact_name: onboardingData.contactInfo.name,
          contact_email: onboardingData.contactInfo.email,
          contact_phone: onboardingData.contactInfo.phone,
          contact_address: onboardingData.contactInfo.address,
          filing_status: onboardingData.contactInfo.filingStatus,
          preferred_contact_method: onboardingData.contactInfo.preferredContact,
          referral_source: onboardingData.contactInfo.referralSource,
          has_delinquent_returns: onboardingData.screening.delinquentReturns,
          has_irs_notices: onboardingData.screening.irsNotices,
          has_bankruptcies: onboardingData.screening.bankruptcies,
          prior_accountant_issues: onboardingData.screening.priorAccountantIssues,
          business_entity_type: onboardingData.businessInfo?.entityType,
          business_year_formed: onboardingData.businessInfo?.yearFormed,
          business_needs_bookkeeping: onboardingData.businessInfo?.bookkeepingNeeds,
          business_needs_payroll: onboardingData.businessInfo?.payrollNeeds,
          business_needs_sales_tax: onboardingData.businessInfo?.salesTaxNeeds,
          business_needs_1099_prep: onboardingData.businessInfo?.needs1099Prep,
          trust_type: onboardingData.trustInfo?.trustType,
          trust_year_established: onboardingData.trustInfo?.yearEstablished,
          nonprofit_has_501c3: onboardingData.nonprofitInfo?.has501c3,
          nonprofit_typical_revenue: onboardingData.nonprofitInfo?.typicalRevenue,
          power_of_attorney_signed: onboardingData.poaGranted,
          engagement_letter_signed: onboardingData.engagementSigned,
          selected_services: onboardingData.selectedServices,
          step_completed: currentStep,
        };

        if (existingResponse) {
          // Update existing response
          const { error: responseError } = await supabase
            .from('onboarding_responses')
            .update(responseData)
            .eq('client_id', cId);
          if (responseError) {
            console.error('Error saving onboarding response:', responseError);
          }
        } else {
          // Create new response
          const { error: responseError } = await supabase
            .from('onboarding_responses')
            .insert([{ client_id: cId, ...responseData }]);
          if (responseError) {
            console.error('Error saving onboarding response:', responseError);
          }
        }
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    try {
      // Final save to mark onboarding as complete
      if (clientId) {
        await supabase
          .from('onboarding_responses')
          .update({
            step_completed: 6,
            completed_at: new Date().toISOString()
          })
          .eq('client_id', clientId);

        // Update client status to in-progress
        await supabase
          .from('clients')
          .update({ status: 'in-progress' })
          .eq('id', clientId);
      }

      toast.success('Welcome! Your onboarding is complete.');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error completing onboarding');
    }

    navigate('/portal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-slate-900 mb-2">Become a Client</h1>
          <p className="text-slate-600">
            A simple, secure process to get started with our firm
          </p>
        </div>

        {/* Progress Stepper */}
        {currentStep > 1 && (
          <ProgressStepper steps={steps} currentStep={currentStep} />
        )}

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <ClientTypeSelection
              selectedType={onboardingData.clientType}
              onSelect={(type) => {
                updateData({ clientType: type });
                nextStep();
              }}
            />
          )}

          {currentStep === 2 && (
            <IntakeQuestionnaire
              data={onboardingData}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <DocumentUpload
              clientType={onboardingData.clientType}
              documents={onboardingData.documents}
              updateDocuments={(docs) => updateData({ documents: docs })}
              onNext={nextStep}
              onBack={prevStep}
              clientId={clientId || undefined}
            />
          )}

          {currentStep === 4 && (
            <PowerOfAttorney
              poaGranted={onboardingData.poaGranted}
              updatePOA={(granted) => updateData({ poaGranted: granted })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 5 && (
            <EngagementLetter
              clientType={onboardingData.clientType}
              data={onboardingData}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 6 && (
            <WelcomeScreen onComplete={handleComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
