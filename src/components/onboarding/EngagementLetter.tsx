import { useState } from 'react';
import { DollarSign, FileText, CreditCard, Check, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { OnboardingData, ClientType } from '../ClientOnboarding';

interface EngagementLetterProps {
  clientType: ClientType;
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Service {
  id: string;
  name: string;
  baseFee: number;
  description: string;
  recommended?: boolean;
}

const servicesByType: Record<string, Service[]> = {
  individual: [
    {
      id: 'tax-prep',
      name: 'Individual Tax Return Preparation',
      baseFee: 750,
      description: 'Form 1040 with standard schedules',
      recommended: true,
    },
    {
      id: 'year-end-planning',
      name: 'Year-End Tax Planning',
      baseFee: 300,
      description: 'Strategic consultation for tax optimization',
    },
    {
      id: 'amended-return',
      name: 'Amended Return Prep',
      baseFee: 450,
      description: 'If corrections are needed',
    },
  ],
  business: [
    {
      id: 'business-return',
      name: 'Business Tax Return',
      baseFee: 950,
      description: 'Form 1120, 1120-S, or 1065',
      recommended: true,
    },
    {
      id: 'payroll',
      name: 'Payroll Processing',
      baseFee: 150,
      description: 'Monthly payroll service (per month)',
    },
    {
      id: 'sales-tax',
      name: 'Sales Tax Filings',
      baseFee: 100,
      description: 'Quarterly sales tax returns (per quarter)',
    },
    {
      id: '1099-prep',
      name: '1099 Preparation',
      baseFee: 200,
      description: 'Annual contractor reporting',
    },
    {
      id: 'bookkeeping',
      name: 'Monthly Bookkeeping',
      baseFee: 400,
      description: 'Full-service accounting (per month)',
    },
  ],
  trust: [
    {
      id: 'trust-return',
      name: 'Trust Tax Return (Form 1041)',
      baseFee: 1200,
      description: 'Including K-1 preparation for beneficiaries',
      recommended: true,
    },
    {
      id: 'estate-coordination',
      name: 'Estate Planning Coordination',
      baseFee: 500,
      description: 'Work with your estate attorney',
    },
  ],
  nonprofit: [
    {
      id: 'form-990',
      name: 'Form 990 Preparation',
      baseFee: 2500,
      description: 'Standard nonprofit tax return',
      recommended: true,
    },
    {
      id: 'form-990n',
      name: 'Form 990-N (E-Postcard)',
      baseFee: 250,
      description: 'For small nonprofits under $50k revenue',
    },
    {
      id: 'board-support',
      name: 'Board Meeting Support',
      baseFee: 400,
      description: 'Financial reporting and guidance',
    },
  ],
};

export function EngagementLetter({
  clientType,
  data,
  updateData,
  onNext,
  onBack,
}: EngagementLetterProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    data.selectedServices.length > 0
      ? data.selectedServices
      : servicesByType[clientType || 'individual']
          .filter((s) => s.recommended)
          .map((s) => s.id)
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const services = servicesByType[clientType || 'individual'] || [];
  const selectedServiceDetails = services.filter((s) => selectedServices.includes(s.id));
  const totalFee = selectedServiceDetails.reduce((sum, s) => sum + s.baseFee, 0);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSign = () => {
    if (!agreedToTerms || !signature) return;
    
    updateData({
      selectedServices,
      estimatedFee: totalFee,
      engagementSigned: true,
    });
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    onNext();
  };

  if (showPayment) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-slate-900 mb-2">Engagement Letter Signed!</h2>
            <p className="text-slate-600">
              Last step: Add your payment method for automated billing
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Why we collect payment details upfront:</strong> This allows us to
              bill you automatically when services are complete, reducing paperwork and
              ensuring faster service delivery.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="cursor-pointer">
                        Credit / Debit Card
                      </Label>
                    </div>
                    <p className="text-xs text-slate-600">
                      Visa, Mastercard, Amex, Discover
                    </p>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'ach'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setPaymentMethod('ach')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <RadioGroupItem value="ach" id="ach" />
                      <Label htmlFor="ach" className="cursor-pointer">
                        Bank Account (ACH)
                      </Label>
                    </div>
                    <p className="text-xs text-slate-600">Lower processing fees</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiration Date</Label>
                    <Input id="expiry" placeholder="MM/YY" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" className="mt-2" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'ach' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input
                    id="routing"
                    placeholder="123456789"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account Number</Label>
                  <Input
                    id="account"
                    placeholder="1234567890"
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-slate-900">Secure Payment</p>
                  <p className="text-slate-600">
                    Your payment information is encrypted and never stored on our servers
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Engagement
            </Button>
            <Button onClick={handlePaymentComplete} className="ml-auto">
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="mb-8">
          <h2 className="text-slate-900 mb-2">Services & Engagement Letter</h2>
          <p className="text-slate-600">
            Review your selected services, fees, and sign to proceed
          </p>
        </div>

        {/* Services Selection */}
        <div className="mb-8">
          <h3 className="text-slate-900 mb-4">Select Your Services</h3>
          <div className="space-y-3">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <div
                  key={service.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-slate-900">
                            {service.name}
                            {service.recommended && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-slate-900 shrink-0">
                          ${service.baseFee.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fee Summary */}
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900">Your Estimated Fee</h3>
            <div className="text-slate-900">
              ${totalFee.toLocaleString()}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            If your situation is significantly more complex than represented here, we'll
            confirm any fee adjustments before filing. You'll never be surprised.
          </p>
        </div>

        {/* Engagement Letter Summary */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="text-slate-900 mb-2">Engagement Letter Summary</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Scope of Work:</strong> We will prepare the selected tax
                  returns and provide related services as outlined above.
                </p>
                <p>
                  <strong>Your Responsibilities:</strong> Provide complete and accurate
                  information, respond to our requests in a timely manner, and review
                  returns before filing.
                </p>
                <p>
                  <strong>Our Responsibilities:</strong> Prepare your returns in
                  accordance with applicable tax laws, maintain confidentiality, and
                  communicate clearly about deadlines and requirements.
                </p>
                <p>
                  <strong>Fees:</strong> As outlined above. Additional services or
                  complexity may result in adjusted fees, which we'll discuss with you
                  first.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement & Signature */}
        <div className="mb-8 space-y-4">
          <div className="p-4 border-2 border-slate-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="terms" className="cursor-pointer text-sm">
                I have read and agree to the terms outlined in the engagement letter. I
                understand the scope of work, my responsibilities, and the fee structure.
              </Label>
            </div>
          </div>

          {agreedToTerms && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="signature">E-Signature</Label>
                <Input
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your full legal name to sign"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  By typing your name, you electronically sign this engagement letter
                </p>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                  className="mt-2 bg-slate-50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleSign}
            disabled={!agreedToTerms || !signature || selectedServices.length === 0}
            className="ml-auto gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Sign & Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
