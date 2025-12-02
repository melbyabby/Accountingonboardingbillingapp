import { User, Building2, FileText, Heart } from 'lucide-react';
import { ClientType } from '../ClientOnboarding';

interface ClientTypeSelectionProps {
  selectedType: ClientType;
  onSelect: (type: ClientType) => void;
}

const clientTypes = [
  {
    type: 'individual' as ClientType,
    icon: User,
    title: 'Individual',
    description: 'Personal tax returns, investment income, retirement planning',
    examples: 'W-2s, 1099s, Schedule C, rental properties',
  },
  {
    type: 'business' as ClientType,
    icon: Building2,
    title: 'Business',
    description: 'Corporations, partnerships, LLCs, sole proprietors',
    examples: '1120, 1120-S, 1065, Schedule C, payroll, sales tax',
  },
  {
    type: 'trust' as ClientType,
    icon: FileText,
    title: 'Trust',
    description: 'Revocable, irrevocable, grantor, and complex trusts',
    examples: 'Form 1041, K-1s, estate planning coordination',
  },
  {
    type: 'nonprofit' as ClientType,
    icon: Heart,
    title: 'Nonprofit',
    description: '501(c)(3) organizations, foundations, associations',
    examples: 'Form 990, 990-N, compliance, board support',
  },
];

export function ClientTypeSelection({ selectedType, onSelect }: ClientTypeSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
        <h2 className="text-slate-900 mb-3">How This Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              1
            </div>
            <div>
              <div className="text-slate-900">Share Info</div>
              <div className="text-slate-600">Tell us about yourself</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              2
            </div>
            <div>
              <div className="text-slate-900">Upload Docs</div>
              <div className="text-slate-600">Prior returns & records</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              3
            </div>
            <div>
              <div className="text-slate-900">Review & Sign</div>
              <div className="text-slate-600">Confirm fees & engagement</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              4
            </div>
            <div>
              <div className="text-slate-900">Get Portal Access</div>
              <div className="text-slate-600">Secure communication hub</div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Type Selection */}
      <div>
        <h2 className="text-slate-900 mb-6 text-center">What type of client are you?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientTypes.map(({ type, icon: Icon, title, description, examples }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`p-6 rounded-lg border-2 transition-all text-left hover:border-blue-500 hover:shadow-md ${
                selectedType === type
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    selectedType === type ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      selectedType === type ? 'text-white' : 'text-slate-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-600 text-sm mb-2">{description}</p>
                  <p className="text-xs text-slate-500">{examples}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
