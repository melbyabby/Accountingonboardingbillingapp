import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  FileText,
  Database,
  MessageSquare,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  fields: SetupField[];
}

interface SetupField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'textarea';
  value: string | boolean;
  options?: string[];
  helpText?: string;
}

export function AdminClientSetup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'practice-cs',
      title: 'Practice CS Setup',
      description: 'Create client record and attach standard projects',
      icon: Database,
      completed: false,
      fields: [
        { id: 'client-name', label: 'Client Name', type: 'text', value: 'John Doe' },
        {
          id: 'ssn-ein',
          label: 'SSN/EIN',
          type: 'text',
          value: '',
          helpText: 'Social Security Number or Employer ID Number',
        },
        { id: 'address', label: 'Address', type: 'textarea', value: '' },
        {
          id: 'client-type',
          label: 'Client Type',
          type: 'select',
          value: 'Individual',
          options: ['Individual', 'Business', 'Trust', 'Nonprofit'],
        },
        {
          id: 'attach-tax-return',
          label: 'Attach Tax Return Project',
          type: 'checkbox',
          value: true,
        },
        {
          id: 'attach-payroll',
          label: 'Attach Payroll Project',
          type: 'checkbox',
          value: false,
        },
        {
          id: 'attach-1099',
          label: 'Attach 1099 Prep Project',
          type: 'checkbox',
          value: false,
        },
        {
          id: 'attach-sales-tax',
          label: 'Attach Sales Tax Project',
          type: 'checkbox',
          value: false,
        },
      ],
    },
    {
      id: 'ultratax-cs',
      title: 'UltraTax CS Setup',
      description: 'Configure tax software and data sharing',
      icon: FileText,
      completed: false,
      fields: [
        {
          id: 'data-sharing',
          label: 'Data Sharing from Practice CS',
          type: 'checkbox',
          value: true,
          helpText: 'Pull core fields automatically',
        },
        {
          id: 'tax-year',
          label: 'Tax Year for First Engagement',
          type: 'select',
          value: '2024',
          options: ['2024', '2023', '2022'],
        },
        {
          id: 'price-per-form',
          label: 'Configure Price Per Form Defaults',
          type: 'checkbox',
          value: false,
          helpText: 'Optional: Pre-configure pricing structure',
        },
      ],
    },
    {
      id: 'liscio',
      title: 'Liscio Setup',
      description: 'Create portal contact and configure delivery',
      icon: MessageSquare,
      completed: false,
      fields: [
        {
          id: 'create-contact',
          label: 'Create Liscio Contact',
          type: 'checkbox',
          value: false,
        },
        {
          id: 'attach-entities',
          label: 'Attach Related Entities',
          type: 'textarea',
          value: '',
          helpText: 'Link multiple businesses/trusts to one login if applicable',
        },
        {
          id: 'delivery-method',
          label: 'Default Delivery Method',
          type: 'select',
          value: 'Portal',
          options: ['Portal', 'Paper Exception'],
        },
        {
          id: 'welcome-message',
          label: 'Send Welcome Message',
          type: 'textarea',
          value:
            'Welcome to our client portal! You can now securely message our team, upload documents, and review your tax returns.',
        },
      ],
    },
    {
      id: 'workpapers',
      title: 'Workpapers Setup',
      description: 'Create folders and organize uploaded documents',
      icon: FolderOpen,
      completed: false,
      fields: [
        {
          id: 'create-folder',
          label: 'Create 2024 Workpapers Folder',
          type: 'checkbox',
          value: false,
        },
        {
          id: 'auto-subfolders',
          label: 'Auto-create Standard Sub-folders',
          type: 'checkbox',
          value: true,
          helpText: 'W-2, 1099, K-1, Depreciation, etc.',
        },
        {
          id: 'imported-docs',
          label: 'Documents Imported from Client Intake',
          type: 'textarea',
          value: '- Last 2 years tax returns\n- W-2s and 1099s\n- Prior workpapers',
        },
      ],
    },
  ]);

  const [expandedStep, setExpandedStep] = useState<string>('practice-cs');

  const completedSteps = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const toggleStepComplete = (stepId: string) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const updateField = (stepId: string, fieldId: string, value: string | boolean) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              fields: step.fields.map((field) =>
                field.id === fieldId ? { ...field, value } : field
              ),
            }
          : step
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-slate-900 mb-2">Client Setup Checklist</h1>
          <p className="text-slate-600">John Doe - Individual Client</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900">Setup Progress</h2>
            <span className="text-slate-600">
              {completedSteps} of {totalSteps} complete
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === step.id;

            return (
              <div
                key={step.id}
                className={`bg-white rounded-lg border-2 transition-all ${
                  step.completed
                    ? 'border-green-500'
                    : isExpanded
                    ? 'border-blue-500'
                    : 'border-slate-200'
                }`}
              >
                {/* Step Header */}
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? '' : step.id)
                  }
                  className="w-full p-6 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      step.completed ? 'bg-green-500' : 'bg-slate-100'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {step.completed && (
                      <span className="text-sm text-green-600">Complete</span>
                    )}
                    <span className="text-slate-400">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {/* Step Fields */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-6">
                    <div className="space-y-4 mb-6">
                      {step.fields.map((field) => (
                        <div key={field.id}>
                          {field.type === 'text' && (
                            <div>
                              <Label htmlFor={field.id}>{field.label}</Label>
                              <Input
                                id={field.id}
                                value={field.value as string}
                                onChange={(e) =>
                                  updateField(step.id, field.id, e.target.value)
                                }
                                className="mt-2"
                              />
                              {field.helpText && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {field.helpText}
                                </p>
                              )}
                            </div>
                          )}

                          {field.type === 'select' && (
                            <div>
                              <Label htmlFor={field.id}>{field.label}</Label>
                              <select
                                id={field.id}
                                value={field.value as string}
                                onChange={(e) =>
                                  updateField(step.id, field.id, e.target.value)
                                }
                                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                              >
                                {field.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              {field.helpText && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {field.helpText}
                                </p>
                              )}
                            </div>
                          )}

                          {field.type === 'checkbox' && (
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <Checkbox
                                id={field.id}
                                checked={field.value as boolean}
                                onCheckedChange={(checked) =>
                                  updateField(step.id, field.id, checked === true)
                                }
                              />
                              <div className="flex-1">
                                <Label htmlFor={field.id} className="cursor-pointer">
                                  {field.label}
                                </Label>
                                {field.helpText && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    {field.helpText}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {field.type === 'textarea' && (
                            <div>
                              <Label htmlFor={field.id}>{field.label}</Label>
                              <Textarea
                                id={field.id}
                                value={field.value as string}
                                onChange={(e) =>
                                  updateField(step.id, field.id, e.target.value)
                                }
                                rows={3}
                                className="mt-2"
                              />
                              {field.helpText && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {field.helpText}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant={step.completed ? 'outline' : 'default'}
                        onClick={() => toggleStepComplete(step.id)}
                        className="gap-2"
                      >
                        {step.completed ? (
                          <>
                            <Circle className="w-4 h-4" />
                            Mark Incomplete
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                      <Button variant="outline">Save Draft</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete Button */}
        {completedSteps === totalSteps && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-slate-900">Setup Complete!</h3>
                  <p className="text-sm text-slate-600">
                    This client is ready for tax preparation
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
