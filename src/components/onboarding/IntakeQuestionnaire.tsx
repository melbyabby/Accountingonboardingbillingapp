import { useState } from 'react';
import { OnboardingData } from '../ClientOnboarding';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface IntakeQuestionnaireProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IntakeQuestionnaire({
  data,
  updateData,
  onNext,
  onBack,
}: IntakeQuestionnaireProps) {
  const [section, setSection] = useState<'contact' | 'screening' | 'specific'>('contact');

  const handleContactChange = (field: string, value: string) => {
    updateData({
      contactInfo: {
        ...data.contactInfo,
        [field]: value,
      },
    });
  };

  const handleScreeningChange = (field: string, value: boolean | string) => {
    updateData({
      screening: {
        ...data.screening,
        [field]: value,
      },
    });
  };

  const canProceed = () => {
    if (section === 'contact') {
      return (
        data.contactInfo.name &&
        data.contactInfo.email &&
        data.contactInfo.phone &&
        data.contactInfo.address
      );
    }
    return true;
  };

  const handleNext = () => {
    if (section === 'contact') {
      setSection('screening');
    } else if (section === 'screening') {
      if (data.clientType === 'individual') {
        onNext();
      } else {
        setSection('specific');
      }
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (section === 'specific') {
      setSection('screening');
    } else if (section === 'screening') {
      setSection('contact');
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        {/* Section Progress */}
        <div className="flex gap-2 mb-8">
          <div
            className={`h-1 flex-1 rounded ${
              section === 'contact' ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          />
          <div
            className={`h-1 flex-1 rounded ${
              section === 'screening' ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          />
          {data.clientType !== 'individual' && (
            <div
              className={`h-1 flex-1 rounded ${
                section === 'specific' ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          )}
        </div>

        {/* Contact Information */}
        {section === 'contact' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-slate-900 mb-1">Contact Information</h2>
              <p className="text-slate-600 text-sm">How can we reach you?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Full Name / Business Name</Label>
                <Input
                  id="name"
                  value={data.contactInfo.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.contactInfo.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.contactInfo.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={data.contactInfo.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              {data.clientType === 'individual' && (
                <div className="md:col-span-2">
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <RadioGroup
                    value={data.contactInfo.filingStatus || ''}
                    onValueChange={(value) => handleContactChange('filingStatus', value)}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household', 'Qualifying Widow(er)'].map(
                        (status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <RadioGroupItem value={status} id={status} />
                            <Label htmlFor={status} className="text-sm cursor-pointer">
                              {status}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <RadioGroup
                  value={data.contactInfo.preferredContact}
                  onValueChange={(value) => handleContactChange('preferredContact', value)}
                >
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['Email', 'Phone', 'Portal Messages', 'Text via App'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={method.toLowerCase()}
                          id={`contact-${method}`}
                        />
                        <Label htmlFor={`contact-${method}`} className="text-sm cursor-pointer">
                          {method}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="referralSource">How did you hear about us?</Label>
                <Input
                  id="referralSource"
                  value={data.contactInfo.referralSource}
                  onChange={(e) => handleContactChange('referralSource', e.target.value)}
                  placeholder="Referral, Google search, friend, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Screening Questions */}
        {section === 'screening' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-slate-900 mb-1">Tax Background</h2>
              <p className="text-slate-600 text-sm">
                Help us understand your tax situation
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="delinquent"
                    checked={data.screening.delinquentReturns}
                    onCheckedChange={(checked) =>
                      handleScreeningChange('delinquentReturns', checked === true)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="delinquent" className="cursor-pointer">
                      I have delinquent tax returns (unfiled returns from prior years)
                    </Label>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      We can help you get caught up
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="notices"
                    checked={data.screening.irsNotices}
                    onCheckedChange={(checked) =>
                      handleScreeningChange('irsNotices', checked === true)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="notices" className="cursor-pointer">
                      I have received IRS notices or have tax problems
                    </Label>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      We'll address these proactively
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="bankruptcies"
                    checked={data.screening.bankruptcies}
                    onCheckedChange={(checked) =>
                      handleScreeningChange('bankruptcies', checked === true)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="bankruptcies" className="cursor-pointer">
                      I have prior bankruptcies or lawsuits
                    </Label>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      This helps us plan appropriately
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="priorAccountant">
                  Anything we should know about your prior accountant relationship?
                </Label>
                <Textarea
                  id="priorAccountant"
                  value={data.screening.priorAccountantIssues}
                  onChange={(e) =>
                    handleScreeningChange('priorAccountantIssues', e.target.value)
                  }
                  placeholder="Optional - any challenges or specific things you're looking for in our service"
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This is confidential and helps us serve you better
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Type-Specific Questions */}
        {section === 'specific' && data.clientType === 'business' && (
          <BusinessSpecificQuestions data={data} updateData={updateData} />
        )}

        {section === 'specific' && data.clientType === 'trust' && (
          <TrustSpecificQuestions data={data} updateData={updateData} />
        )}

        {section === 'specific' && data.clientType === 'nonprofit' && (
          <NonprofitSpecificQuestions data={data} updateData={updateData} />
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()} className="ml-auto gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BusinessSpecificQuestions({ data, updateData }: any) {
  const handleChange = (field: string, value: any) => {
    updateData({
      businessInfo: {
        ...data.businessInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Business Details</h2>
        <p className="text-slate-600 text-sm">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entityType">Entity Type</Label>
          <Input
            id="entityType"
            value={data.businessInfo?.entityType || ''}
            onChange={(e) => handleChange('entityType', e.target.value)}
            placeholder="LLC, S-Corp, C-Corp, Partnership, Sole Prop"
          />
        </div>

        <div>
          <Label htmlFor="yearFormed">Year Formed</Label>
          <Input
            id="yearFormed"
            value={data.businessInfo?.yearFormed || ''}
            onChange={(e) => handleChange('yearFormed', e.target.value)}
            placeholder="2020"
          />
        </div>
      </div>

      <div>
        <Label className="mb-3 block">What services do you need?</Label>
        <div className="space-y-3">
          {[
            { key: 'bookkeepingNeeds', label: 'Bookkeeping / Accounting' },
            { key: 'payrollNeeds', label: 'Payroll Processing' },
            { key: 'salesTaxNeeds', label: 'Sales Tax Filings' },
            { key: 'needs1099Prep', label: '1099 Preparation' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Checkbox
                id={key}
                checked={data.businessInfo?.[key] || false}
                onCheckedChange={(checked) => handleChange(key, checked === true)}
              />
              <Label htmlFor={key} className="cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustSpecificQuestions({ data, updateData }: any) {
  const handleChange = (field: string, value: any) => {
    updateData({
      trustInfo: {
        ...data.trustInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Trust Details</h2>
        <p className="text-slate-600 text-sm">Tell us about the trust</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="trustType">Type of Trust</Label>
          <Input
            id="trustType"
            value={data.trustInfo?.trustType || ''}
            onChange={(e) => handleChange('trustType', e.target.value)}
            placeholder="Revocable, Irrevocable, Grantor, etc."
          />
        </div>

        <div>
          <Label htmlFor="yearEstablished">Year Established</Label>
          <Input
            id="yearEstablished"
            value={data.trustInfo?.yearEstablished || ''}
            onChange={(e) => handleChange('yearEstablished', e.target.value)}
            placeholder="2018"
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-slate-700">
          We'll collect detailed beneficiary information (names, addresses, SSNs) during the
          document upload phase.
        </p>
      </div>
    </div>
  );
}

function NonprofitSpecificQuestions({ data, updateData }: any) {
  const handleChange = (field: string, value: any) => {
    updateData({
      nonprofitInfo: {
        ...data.nonprofitInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Nonprofit Details</h2>
        <p className="text-slate-600 text-sm">Tell us about your organization</p>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Checkbox
            id="has501c3"
            checked={data.nonprofitInfo?.has501c3 || false}
            onCheckedChange={(checked) => handleChange('has501c3', checked === true)}
          />
          <div className="flex-1">
            <Label htmlFor="has501c3" className="cursor-pointer">
              We have 501(c)(3) tax-exempt status
            </Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="typicalRevenue">Typical Annual Revenue</Label>
        <Input
          id="typicalRevenue"
          value={data.nonprofitInfo?.typicalRevenue || ''}
          onChange={(e) => handleChange('typicalRevenue', e.target.value)}
          placeholder="Under $50k, $50k-$200k, $200k+, etc."
        />
        <p className="text-xs text-slate-500 mt-1">
          Helps us determine 990, 990-EZ, or 990-N requirements
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-slate-700">
          We'll collect board member details during the document upload phase.
        </p>
      </div>
    </div>
  );
}
