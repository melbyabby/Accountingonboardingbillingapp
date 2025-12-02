import { useState } from 'react';
import { Shield, Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface PowerOfAttorneyProps {
  poaGranted: boolean;
  updatePOA: (granted: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PowerOfAttorney({
  poaGranted,
  updatePOA,
  onNext,
  onBack,
}: PowerOfAttorneyProps) {
  const [wantsToGrant, setWantsToGrant] = useState(poaGranted);
  const [signature, setSignature] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGrant = () => {
    if (wantsToGrant && signature) {
      updatePOA(true);
    }
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-slate-900 mb-2">IRS Power of Attorney</h2>
          <p className="text-slate-600">
            Grant us authorization to work with the IRS on your behalf
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h3 className="text-slate-900 mb-4">Why This Helps You</h3>
          <div className="space-y-3">
            {[
              'Pull IRS transcripts directly, speeding up your work',
              'Respond to IRS notices without delays',
              'Handle correspondence efficiently during tax season',
              'Access your account information when needed',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Option to Grant */}
        <div className="mb-8">
          <div className="p-5 border-2 border-slate-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="grant-poa"
                checked={wantsToGrant}
                onCheckedChange={(checked) => setWantsToGrant(checked === true)}
              />
              <div className="flex-1">
                <Label htmlFor="grant-poa" className="cursor-pointer text-slate-900">
                  Yes, I want to grant Power of Attorney now (Recommended)
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  You can revoke this at any time
                </p>
              </div>
            </div>

            {wantsToGrant && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-sm text-slate-900 mb-3">
                    What you're authorizing:
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    <li>
                      Represent you before the IRS for tax matters related to Form 1040,
                      1120, 1065, 1041, or other returns we prepare
                    </li>
                    <li>Receive and inspect confidential tax information</li>
                    <li>Sign agreements and consents on your behalf</li>
                    <li>Execute waivers and closing agreements</li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="poa-signature">E-Signature</Label>
                  <Input
                    id="poa-signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your full legal name"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    By typing your name, you agree to the terms of the Power of Attorney
                  </p>
                </div>

                <div>
                  <Label htmlFor="poa-date">Date</Label>
                  <Input
                    id="poa-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>

          {!wantsToGrant && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="mb-1">You can skip this for now.</p>
                <p>
                  However, this may slow down our ability to serve you, and we'll need to
                  request it later if IRS issues arise.
                </p>
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
            onClick={handleGrant}
            disabled={wantsToGrant && !signature}
            className="ml-auto gap-2"
          >
            {wantsToGrant ? 'Grant & Continue' : 'Skip for Now'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
