import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  DollarSign,
  AlertCircle,
  TrendingUp,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

interface ServiceItem {
  id: string;
  name: string;
  pricePerForm: number;
  formCount: number;
  subtotal: number;
  complexity: 'standard' | 'moderate' | 'complex';
}

export function AdminBillingScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: '1',
      name: 'Form 1040 - Individual Return',
      pricePerForm: 500,
      formCount: 1,
      subtotal: 500,
      complexity: 'standard',
    },
    {
      id: '2',
      name: 'Schedule C - Business Income',
      pricePerForm: 250,
      formCount: 1,
      subtotal: 250,
      complexity: 'standard',
    },
  ]);

  const [adjustments, setAdjustments] = useState({
    discount: 0,
    discountReason: '',
    additionalFees: 0,
    additionalFeesReason: '',
  });

  const [priorYearFee, setPriorYearFee] = useState(750);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const subtotal = services.reduce((sum, s) => sum + s.subtotal, 0);
  const systemSuggestedFee = subtotal;
  const totalWithAdjustments =
    subtotal - adjustments.discount + adjustments.additionalFees;
  const discountPercentage = subtotal > 0 ? (adjustments.discount / subtotal) * 100 : 0;

  // Auto-check if approval needed (discount > 10%)
  const needsApproval = discountPercentage > 10;

  const updateService = (
    id: string,
    field: keyof ServiceItem,
    value: number | string
  ) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          if (field === 'pricePerForm' || field === 'formCount') {
            updated.subtotal = updated.pricePerForm * updated.formCount;
          }
          return updated;
        }
        return service;
      })
    );
  };

  const getComplexityBadge = (complexity: ServiceItem['complexity']) => {
    const colors = {
      standard: 'bg-green-100 text-green-700',
      moderate: 'bg-amber-100 text-amber-700',
      complex: 'bg-red-100 text-red-700',
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded ${colors[complexity]}`}
      >
        {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
      </span>
    );
  };

  const handleGenerateInvoice = () => {
    alert('Draft invoice generated! (In production, this would create an invoice in Practice CS)');
  };

  const handleSendProposal = () => {
    alert('Fee confirmation sent to client! (In production, this would trigger an email/portal notification)');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-slate-900 mb-2">Billing & Fee Recommendation</h1>
          <p className="text-slate-600">John Doe - Individual Client</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Fee Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Context */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-slate-900 mb-4">Client Context</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Client Type</p>
                  <p className="text-slate-900">Individual</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Prior Year Fee</p>
                  <p className="text-slate-900">${priorYearFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Complexity Tags</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Self-Employed
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Rental
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services & Pricing */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-slate-900 mb-4">Services & Price Per Form</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-slate-900 mb-1">{service.name}</h3>
                        {getComplexityBadge(service.complexity)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`price-${service.id}`} className="text-xs">
                          Price per Form
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            $
                          </span>
                          <Input
                            id={`price-${service.id}`}
                            type="number"
                            value={service.pricePerForm}
                            onChange={(e) =>
                              updateService(
                                service.id,
                                'pricePerForm',
                                Number(e.target.value)
                              )
                            }
                            className="pl-6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`count-${service.id}`} className="text-xs">
                          Form Count
                        </Label>
                        <Input
                          id={`count-${service.id}`}
                          type="number"
                          value={service.formCount}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              'formCount',
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Subtotal</Label>
                        <div className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                          ${service.subtotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-slate-900 mb-4">Fee Adjustments</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Courtesy Discount</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <Input
                        id="discount"
                        type="number"
                        value={adjustments.discount}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            discount: Number(e.target.value),
                          })
                        }
                        className="pl-6"
                      />
                    </div>
                    {discountPercentage > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        {discountPercentage.toFixed(1)}% discount
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="additional">Additional Fees</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <Input
                        id="additional"
                        type="number"
                        value={adjustments.additionalFees}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            additionalFees: Number(e.target.value),
                          })
                        }
                        className="pl-6"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="discount-reason">Reason for Adjustment</Label>
                  <Textarea
                    id="discount-reason"
                    value={adjustments.discountReason}
                    onChange={(e) =>
                      setAdjustments({
                        ...adjustments,
                        discountReason: e.target.value,
                      })
                    }
                    placeholder="e.g., Referral discount, complexity adjustment, multi-year client, etc."
                    rows={2}
                    className="mt-2"
                  />
                </div>

                {needsApproval && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-900">
                        <strong>Partner Approval Required</strong>
                      </p>
                      <p className="text-xs text-amber-800 mt-1">
                        Discount exceeds 10% threshold
                      </p>
                      <div className="mt-3">
                        <Checkbox
                          id="approval"
                          checked={requiresApproval}
                          onCheckedChange={(checked) =>
                            setRequiresApproval(checked === true)
                          }
                        />
                        <Label htmlFor="approval" className="ml-2 text-xs cursor-pointer">
                          Partner approval obtained
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Fee Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-slate-900 mb-4">Fee Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Service Subtotal</span>
                  <span className="text-slate-900">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                {adjustments.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount</span>
                    <span className="text-red-600">
                      -${adjustments.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                {adjustments.additionalFees > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Additional Fees</span>
                    <span className="text-green-600">
                      +${adjustments.additionalFees.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-900">Total Fee</span>
                    <span className="text-slate-900">
                      ${totalWithAdjustments.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-slate-900 mb-1">System Suggested</h3>
                  <p className="text-slate-900">
                    ${systemSuggestedFee.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Based on price-per-form template and selected services
              </p>
            </div>

            {/* Prior Year Comparison */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="text-slate-900 mb-3">Prior Year Comparison</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">2023 Fee</span>
                  <span className="text-slate-900">${priorYearFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">2024 Fee</span>
                  <span className="text-slate-900">
                    ${totalWithAdjustments.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-900">Change</span>
                    <span
                      className={
                        totalWithAdjustments > priorYearFee
                          ? 'text-red-600'
                          : 'text-green-600'
                      }
                    >
                      {totalWithAdjustments > priorYearFee ? '+' : ''}
                      {(
                        ((totalWithAdjustments - priorYearFee) / priorYearFee) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerateInvoice}
                className="w-full gap-2"
                disabled={needsApproval && !requiresApproval}
              >
                <FileText className="w-4 h-4" />
                Generate Draft Invoice
              </Button>
              <Button
                onClick={handleSendProposal}
                variant="outline"
                className="w-full gap-2"
                disabled={needsApproval && !requiresApproval}
              >
                <CheckCircle2 className="w-4 h-4" />
                Send Fee Confirmation to Client
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Payment method already on file from onboarding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
