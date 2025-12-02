import { Check, MessageSquare, Upload, FileCheck, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Managing Partner',
    specialty: 'Tax strategy & complex returns',
    contact: 'Email or portal messages',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    name: 'Michael Chen',
    role: 'Senior Tax Preparer',
    specialty: 'Business returns & payroll',
    contact: 'Portal messages preferred',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Tax Associate',
    specialty: 'Individual returns & planning',
    contact: 'Email or phone',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    name: 'David Kim',
    role: 'Client Success Manager',
    specialty: 'Questions & document coordination',
    contact: 'Phone or portal - fastest response',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-sm border border-blue-100 p-8 mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-slate-900 mb-3">Welcome to Our Firm!</h1>
          <p className="text-slate-600 text-lg">
            You're all set. We're excited to work with you.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-slate-200">
          <h2 className="text-slate-900 mb-4">What Happens Next</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600">1</span>
              </div>
              <h3 className="text-slate-900 mb-2">We Review Your Info</h3>
              <p className="text-sm text-slate-600">
                Our team will review your documents and may reach out with questions
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600">2</span>
              </div>
              <h3 className="text-slate-900 mb-2">We Prepare Your Return</h3>
              <p className="text-sm text-slate-600">
                You'll receive updates via your portal as we work
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600">3</span>
              </div>
              <h3 className="text-slate-900 mb-2">Review & E-Sign</h3>
              <p className="text-sm text-slate-600">
                We'll send your completed return for review and electronic filing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet Your Team */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-2">Meet Your Team</h2>
          <p className="text-slate-600">
            We believe in being accessible. Don't hesitate to reach out to any team member.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="p-5 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-slate-900 mb-0.5">{member.name}</h3>
                  <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                  <p className="text-sm text-slate-600 mb-2">{member.specialty}</p>
                  <p className="text-xs text-slate-500">
                    <strong>Best way to reach:</strong> {member.contact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>During tax season:</strong> Your fastest help will usually come from our
            team members, not just the partner. They're empowered to answer questions and
            keep your work moving. Don't wait — reach out anytime!
          </p>
        </div>
      </div>

      {/* Your Portal */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-2">Your Client Portal (Liscio)</h2>
          <p className="text-slate-600">
            Everything you need, all in one secure place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-slate-900 mb-2">Secure Messaging</h3>
            <p className="text-sm text-slate-600">
              Send and receive messages with your team — no more email chains
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Upload className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-slate-900 mb-2">Upload Documents</h3>
            <p className="text-sm text-slate-600">
              Securely share tax documents, receipts, and other files
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <FileCheck className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-slate-900 mb-2">Review & E-Sign</h3>
            <p className="text-sm text-slate-600">
              Review your completed tax return and sign electronically
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={onComplete} size="lg" className="gap-2">
            Go to My Portal
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-xs text-slate-500 mt-3">
            You'll receive a separate email with your Liscio login details
          </p>
        </div>
      </div>
    </div>
  );
}
