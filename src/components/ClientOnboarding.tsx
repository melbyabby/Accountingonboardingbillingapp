import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload, FileText, Users } from 'lucide-react';
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

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
  }, [onboardingData]);

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

  const handleComplete = () => {
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
