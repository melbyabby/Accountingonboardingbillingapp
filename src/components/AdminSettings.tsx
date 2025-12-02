import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Building2,
  FileText,
  FolderOpen,
  DollarSign,
  PenTool,
  CreditCard,
  Clock,
  Calculator
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';

interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
  webhookUrl?: string;
  additionalSettings?: Record<string, string>;
}

interface WorkflowSettings {
  companyName?: string;
  integrations: {
    // Practice Management
    practiceCS: IntegrationConfig;
    cchAxcessPractice: IntegrationConfig;
    karbon: IntegrationConfig;
    taxDome: IntegrationConfig;
    canopy: IntegrationConfig;
    financialCents: IntegrationConfig;
    
    // Tax Software
    ultraTaxCS: IntegrationConfig;
    proSeries: IntegrationConfig;
    lacerte: IntegrationConfig;
    drakeTax: IntegrationConfig;
    atx: IntegrationConfig;
    
    // Document Management
    workpapersCS: IntegrationConfig;
    shareFile: IntegrationConfig;
    smartVault: IntegrationConfig;
    safeSendReturns: IntegrationConfig;
    
    // Accounting
    quickBooksOnline: IntegrationConfig;
    xero: IntegrationConfig;
    sage: IntegrationConfig;
    freshBooks: IntegrationConfig;
    
    // E-Signature
    docuSign: IntegrationConfig;
    adobeSign: IntegrationConfig;
    rightSignature: IntegrationConfig;
    
    // Payment Processing
    lawPay: IntegrationConfig;
    billCom: IntegrationConfig;
    stripe: IntegrationConfig;
    paypal: IntegrationConfig;
    
    // Time & Billing
    quickBooksTime: IntegrationConfig;
    tSheets: IntegrationConfig;
    bqeCore: IntegrationConfig;
  };
  workflowSteps: {
    autoCreateInPracticeCS: boolean;
    autoSendToLiscio: boolean;
    autoSetupQuickBooks: boolean;
    autoGenerateEngagementLetter: boolean;
    requireDocuSignBeforeProceeding: boolean;
    autoCreateBillingEntry: boolean;
  };
}

const integrationCategories = [
  {
    name: 'Practice Management',
    icon: Building2,
    integrations: [
      { key: 'practiceCS', label: 'Practice CS', description: 'Thomson Reuters practice management', domain: 'thomsonreuters.com' },
      { key: 'cchAxcessPractice', label: 'CCH Axcess Practice', description: 'Wolters Kluwer practice management', domain: 'wolterskluwer.com' },
      { key: 'karbon', label: 'Karbon', description: 'Modern practice management platform', domain: 'karbonhq.com' },
      { key: 'taxDome', label: 'TaxDome', description: 'All-in-one practice management', domain: 'taxdome.com' },
      { key: 'canopy', label: 'Canopy', description: 'Practice management for tax & accounting', domain: 'getcanopy.com' },
      { key: 'financialCents', label: 'Financial Cents', description: 'Client accounting services platform', domain: 'financialcents.com' },
    ],
  },
  {
    name: 'Tax Software',
    icon: FileText,
    integrations: [
      { key: 'ultraTaxCS', label: 'UltraTax CS', description: 'Thomson Reuters tax preparation', domain: 'thomsonreuters.com' },
      { key: 'proSeries', label: 'ProSeries', description: 'Intuit professional tax software', domain: 'intuit.com' },
      { key: 'lacerte', label: 'Lacerte', description: 'Intuit premium tax software', domain: 'intuit.com' },
      { key: 'drakeTax', label: 'Drake Tax', description: 'Drake Software tax preparation', domain: 'drakesoftware.com' },
      { key: 'atx', label: 'ATX', description: 'Wolters Kluwer tax software', domain: 'wolterskluwer.com' },
    ],
  },
  {
    name: 'Document Management',
    icon: FolderOpen,
    integrations: [
      { key: 'workpapersCS', label: 'Workpapers CS', description: 'Thomson Reuters workpaper management', domain: 'thomsonreuters.com' },
      { key: 'shareFile', label: 'ShareFile', description: 'Citrix secure file sharing', domain: 'sharefile.com' },
      { key: 'smartVault', label: 'SmartVault', description: 'Cloud document management', domain: 'smartvault.com' },
      { key: 'safeSendReturns', label: 'SafeSend Returns', description: 'Tax return delivery & e-signature', domain: 'safesend.com' },
    ],
  },
  {
    name: 'Accounting',
    icon: Calculator,
    integrations: [
      { key: 'quickBooksOnline', label: 'QuickBooks Online', description: 'Intuit cloud accounting', domain: 'quickbooks.intuit.com' },
      { key: 'xero', label: 'Xero', description: 'Cloud accounting platform', domain: 'xero.com' },
      { key: 'sage', label: 'Sage', description: 'Sage accounting solutions', domain: 'sage.com' },
      { key: 'freshBooks', label: 'FreshBooks', description: 'Cloud accounting for small business', domain: 'freshbooks.com' },
    ],
  },
  {
    name: 'E-Signature',
    icon: PenTool,
    integrations: [
      { key: 'docuSign', label: 'DocuSign', description: 'Electronic signature platform', domain: 'docusign.com' },
      { key: 'adobeSign', label: 'Adobe Sign', description: 'Adobe e-signature solution', domain: 'adobe.com' },
      { key: 'rightSignature', label: 'RightSignature', description: 'Citrix e-signature service', domain: 'rightsignature.com' },
    ],
  },
  {
    name: 'Payment Processing',
    icon: CreditCard,
    integrations: [
      { key: 'lawPay', label: 'LawPay', description: 'Professional payment processing', domain: 'lawpay.com' },
      { key: 'billCom', label: 'Bill.com', description: 'Business payments platform', domain: 'bill.com' },
      { key: 'stripe', label: 'Stripe', description: 'Online payment processing', domain: 'stripe.com' },
      { key: 'paypal', label: 'PayPal', description: 'PayPal business payments', domain: 'paypal.com' },
    ],
  },
  {
    name: 'Time & Billing',
    icon: Clock,
    integrations: [
      { key: 'quickBooksTime', label: 'QuickBooks Time', description: 'Time tracking for accounting', domain: 'quickbooks.intuit.com' },
      { key: 'tSheets', label: 'TSheets', description: 'Employee time tracking', domain: 'quickbooks.intuit.com' },
      { key: 'bqeCore', label: 'BQE Core', description: 'Professional services automation', domain: 'bqe.com' },
    ],
  },
];

export function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<WorkflowSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const accessToken = sessionStorage.getItem('access_token') || '';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://tcmmddpcihkohnytxmeh.supabase.co/functions/v1/make-server-657f9657/settings',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching settings:', result.error);
        // Initialize with default settings
        setSettings(getDefaultSettings());
        return;
      }

      setSettings(result.settings || getDefaultSettings());
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = (): WorkflowSettings => ({
    integrations: {
      practiceCS: { enabled: false },
      cchAxcessPractice: { enabled: false },
      karbon: { enabled: false },
      taxDome: { enabled: false },
      canopy: { enabled: false },
      financialCents: { enabled: false },
      ultraTaxCS: { enabled: false },
      proSeries: { enabled: false },
      lacerte: { enabled: false },
      drakeTax: { enabled: false },
      atx: { enabled: false },
      workpapersCS: { enabled: false },
      shareFile: { enabled: false },
      smartVault: { enabled: false },
      safeSendReturns: { enabled: false },
      quickBooksOnline: { enabled: false },
      xero: { enabled: false },
      sage: { enabled: false },
      freshBooks: { enabled: false },
      docuSign: { enabled: false },
      adobeSign: { enabled: false },
      rightSignature: { enabled: false },
      lawPay: { enabled: false },
      billCom: { enabled: false },
      stripe: { enabled: false },
      paypal: { enabled: false },
      quickBooksTime: { enabled: false },
      tSheets: { enabled: false },
      bqeCore: { enabled: false },
    },
    workflowSteps: {
      autoCreateInPracticeCS: false,
      autoSendToLiscio: false,
      autoSetupQuickBooks: false,
      autoGenerateEngagementLetter: true,
      requireDocuSignBeforeProceeding: false,
      autoCreateBillingEntry: false,
    },
  });

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch(
        'https://tcmmddpcihkohnytxmeh.supabase.co/functions/v1/make-server-657f9657/settings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ settings }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Error saving settings:', result.error);
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (integrationKey: string) => {
    setTestingConnection(integrationKey);
    // Simulate API connection test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestingConnection(null);
    toast.success(`${integrationKey} connection test successful`);
  };

  const toggleIntegration = (key: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        [key]: {
          ...settings.integrations[key as keyof typeof settings.integrations],
          enabled: !settings.integrations[key as keyof typeof settings.integrations].enabled,
        },
      },
    });
  };

  const updateIntegrationConfig = (key: string, field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        [key]: {
          ...settings.integrations[key as keyof typeof settings.integrations],
          [field]: value,
        },
      },
    });
  };

  const toggleWorkflowStep = (key: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      workflowSteps: {
        ...settings.workflowSteps,
        [key]: !settings.workflowSteps[key as keyof typeof settings.workflowSteps],
      },
    });
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Button
                variant="ghost"
                className="gap-2 mb-3 -ml-2"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8 text-blue-600" />
                <h1 className="text-slate-900">Workflow & Integration Settings</h1>
              </div>
              <p className="text-slate-600">
                Configure integrations and automation workflows for client onboarding
              </p>
            </div>
            <Button onClick={saveSettings} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="workflow">Workflow Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-slate-900 mb-1">Company Information</h2>
              <p className="text-slate-600 text-sm mb-6">
                Configure your firm's basic information displayed to clients
              </p>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="e.g., Smith & Associates CPA"
                    value={settings.companyName || ''}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    This name will appear in the header and throughout the client portal
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            {integrationCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={category.name} className="p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CategoryIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-slate-900">{category.name}</h2>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 ml-14">
                    Connect your {category.name.toLowerCase()} tools
                  </p>

                  <div className="space-y-4">
                    {category.integrations.map((integration) => {
                      const config =
                        settings.integrations[
                          integration.key as keyof typeof settings.integrations
                        ];
                      const isEnabled = config.enabled;

                      return (
                        <div
                          key={integration.key}
                          className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Company Logo */}
                              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <img
                                  src={`https://logo.clearbit.com/${integration.domain}`}
                                  alt={`${integration.label} logo`}
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    // Fallback if logo fails to load
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling;
                                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                  }}
                                />
                                <span className="text-sm text-slate-600 hidden items-center justify-center w-full h-full">
                                  {integration.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-slate-900">{integration.label}</h3>
                                  {isEnabled ? (
                                    <Badge className="bg-green-100 text-green-700">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Connected
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Disconnected
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600">{integration.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleIntegration(integration.key)}
                            />
                          </div>

                          {isEnabled && (
                            <div className="pt-3 border-t border-slate-200 space-y-3 ml-13">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`${integration.key}-apiKey`} className="text-sm">
                                    API Key / Credentials
                                  </Label>
                                  <Input
                                    id={`${integration.key}-apiKey`}
                                    type="password"
                                    placeholder="Enter API key..."
                                    value={config.apiKey || ''}
                                    onChange={(e) =>
                                      updateIntegrationConfig(
                                        integration.key,
                                        'apiKey',
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`${integration.key}-apiUrl`} className="text-sm">
                                    API URL / Instance
                                  </Label>
                                  <Input
                                    id={`${integration.key}-apiUrl`}
                                    type="url"
                                    placeholder="https://api.example.com"
                                    value={config.apiUrl || ''}
                                    onChange={(e) =>
                                      updateIntegrationConfig(
                                        integration.key,
                                        'apiUrl',
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`${integration.key}-webhook`} className="text-sm">
                                  Webhook URL (Optional)
                                </Label>
                                <Input
                                  id={`${integration.key}-webhook`}
                                  type="url"
                                  placeholder="https://your-app.com/webhooks/..."
                                  value={config.webhookUrl || ''}
                                  onChange={(e) =>
                                    updateIntegrationConfig(
                                      integration.key,
                                      'webhookUrl',
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(integration.label)}
                                disabled={testingConnection === integration.label}
                                className="gap-2"
                              >
                                {testingConnection === integration.label ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Testing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    Test Connection
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-slate-900 mb-1">Automated Workflow Steps</h2>
              <p className="text-slate-600 text-sm mb-6">
                Configure which actions should happen automatically during client onboarding
              </p>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Auto-create in Practice CS</h3>
                    <p className="text-sm text-slate-600">
                      Automatically create a new client record in Practice CS when onboarding is
                      complete
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflowSteps.autoCreateInPracticeCS}
                    onCheckedChange={() => toggleWorkflowStep('autoCreateInPracticeCS')}
                  />
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Auto-send to Liscio</h3>
                    <p className="text-sm text-slate-600">
                      Automatically invite client to Liscio portal after engagement letter is
                      signed
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflowSteps.autoSendToLiscio}
                    onCheckedChange={() => toggleWorkflowStep('autoSendToLiscio')}
                  />
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Auto-setup QuickBooks access</h3>
                    <p className="text-sm text-slate-600">
                      Automatically request QuickBooks Online access for business clients
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflowSteps.autoSetupQuickBooks}
                    onCheckedChange={() => toggleWorkflowStep('autoSetupQuickBooks')}
                  />
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Auto-generate engagement letter</h3>
                    <p className="text-sm text-slate-600">
                      Automatically generate and send engagement letter after intake questionnaire
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflowSteps.autoGenerateEngagementLetter}
                    onCheckedChange={() => toggleWorkflowStep('autoGenerateEngagementLetter')}
                  />
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Require DocuSign before proceeding</h3>
                    <p className="text-sm text-slate-600">
                      Block workflow progression until all documents are signed via DocuSign
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflowSteps.requireDocuSignBeforeProceeding}
                    onCheckedChange={() => toggleWorkflowStep('requireDocuSignBeforeProceeding')}
                  />
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Auto-create billing entry</h3>
                    <p className="text-sm text-slate-600">
                      Automatically create a billing/fee entry when client setup is complete
                    </p>
                  </div>
                  <Switch
                    checked={settings.workflowSteps.autoCreateBillingEntry}
                    onCheckedChange={() => toggleWorkflowStep('autoCreateBillingEntry')}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-slate-900 mb-2">Integration Tips</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>
                      • Enable only the integrations you actively use to keep workflows simple
                    </li>
                    <li>
                      • Test connections after configuring API credentials to ensure proper setup
                    </li>
                    <li>
                      • Webhook URLs allow real-time sync between systems (configure in your
                      integration's settings)
                    </li>
                    <li>
                      • Automated workflows can be overridden manually for specific clients when
                      needed
                    </li>
                    <li>
                      • Contact your software vendor for API credentials and documentation
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}