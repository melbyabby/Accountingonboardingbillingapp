# Integration & Workflow Settings Guide

This guide provides comprehensive information about all available integrations in the CPA Firm Client Onboarding application.

## Integration Categories

### 1. Practice Management Software

**Practice CS** (Thomson Reuters)
- Industry-standard practice management for CPA firms
- Manages client records, staff schedules, and workflow tracking
- API Access: Contact Thomson Reuters for API credentials
- Use Case: Auto-create client records when onboarding completes

**CCH Axcess Practice** (Wolters Kluwer)
- Cloud-based practice management solution
- Handles time tracking, billing, and client management
- API Access: Available through CCH ProSystem fx Portal
- Use Case: Sync client data and staff assignments

**Karbon**
- Modern, cloud-native practice management platform
- Strong workflow automation and team collaboration
- API Access: Available in Professional and Enterprise plans
- Use Case: Create client workspaces and assign team members

**TaxDome**
- All-in-one practice management with built-in client portal
- Includes CRM, workflow automation, and document management
- API Access: Available via TaxDome Developer Portal
- Use Case: Full client lifecycle management integration

**Canopy**
- Modern practice management focused on tax and accounting firms
- Workflow automation and client communication
- API Access: Contact Canopy for API documentation
- Use Case: Client onboarding automation and task tracking

**Financial Cents**
- Practice management for client accounting services (CAS)
- Billing, engagement letters, and client management
- API Access: Available through Financial Cents support
- Use Case: Sync engagement letters and billing data

---

### 2. Tax Preparation Software

**UltraTax CS** (Thomson Reuters)
- Professional tax preparation software for all entity types
- Integration with Practice CS and other CS Professional Suite products
- API Access: Contact Thomson Reuters for integration options
- Use Case: Auto-create tax clients and pre-populate client data

**ProSeries** (Intuit)
- Professional tax software for CPAs and tax professionals
- Supports individuals, businesses, estates, trusts, and nonprofits
- API Access: Limited API, contact Intuit Professional Tax
- Use Case: Client data synchronization

**Lacerte** (Intuit)
- Premium tax software with advanced features
- High-volume firms with complex returns
- API Access: Contact Intuit for integration possibilities
- Use Case: Import client information for tax preparation

**Drake Tax** (Drake Software)
- Affordable professional tax preparation software
- Known for unlimited e-filing and reliability
- API Access: Drake Import Format (DIF) file integration
- Use Case: Bulk import of client data

**ATX** (Wolters Kluwer)
- Professional tax software with workflow management
- Integration with other CCH products
- API Access: Available through CCH ProSystem fx
- Use Case: Client data synchronization and workflow automation

---

### 3. Document Management

**Workpapers CS** (Thomson Reuters)
- Audit and accounting workpaper management
- Integration with Practice CS and other CS products
- API Access: Contact Thomson Reuters for API access
- Use Case: Auto-file client documents and workpapers

**ShareFile** (Citrix)
- Secure file sharing and client portal
- Strong encryption and compliance features
- API Access: ShareFile API v3 available
- Use Case: Secure document storage and client file sharing

**SmartVault**
- Cloud document management for accounting firms
- QuickBooks and other accounting software integration
- API Access: Contact SmartVault for API documentation
- Use Case: Centralized document storage and retrieval

**SafeSend Returns**
- Tax return delivery with e-signature
- IRS-compliant document delivery
- API Access: Available through SafeSend support
- Use Case: Automated tax return delivery and signature collection

---

### 4. Client Portal & Communication

**Liscio**
- Modern client communication and collaboration platform
- Secure messaging, document exchange, and reminders
- API Access: Liscio API available (contact support)
- Use Case: Auto-invite clients to portal after engagement letter signing

**SafeSend Exchange**
- Client portal and document exchange
- Secure communication and file sharing
- API Access: Contact SafeSend for integration options
- Use Case: Client document requests and secure messaging

**TaxDome Portal**
- Built-in client portal within TaxDome
- Document sharing, e-signatures, and payment processing
- API Access: Available via TaxDome API
- Use Case: Complete client portal experience

---

### 5. Accounting Software

**QuickBooks Online** (Intuit)
- Leading cloud accounting software
- Real-time financial data access
- API Access: QuickBooks Online API v3 (OAuth 2.0)
- Use Case: Read-only access to client books for advisory services

**Xero**
- Cloud accounting platform popular internationally
- Strong API and third-party ecosystem
- API Access: Xero API (OAuth 2.0)
- Use Case: Access client financial data and transactions

**Sage**
- Sage Intacct and Sage 50 accounting solutions
- Mid-market to enterprise accounting
- API Access: Sage Intacct Web Services API
- Use Case: Financial data integration for larger clients

---

### 6. E-Signature Solutions

**DocuSign**
- Leading e-signature platform
- Legally binding signatures with audit trails
- API Access: DocuSign eSignature REST API
- Use Case: Automated engagement letter and document signing

**Adobe Sign**
- Adobe's e-signature solution
- Integration with Adobe Acrobat and Document Cloud
- API Access: Adobe Sign REST API
- Use Case: Document signing workflows

**RightSignature** (Citrix)
- Simple e-signature solution
- Easy-to-use interface for clients
- API Access: RightSignature API
- Use Case: Engagement letters and authorization forms

---

### 7. Payment Processing

**LawPay**
- IOLTA-compliant payment processing for professionals
- Trusted by legal and accounting professionals
- API Access: Contact LawPay for API documentation
- Use Case: Online invoice payments and retainer processing

**Bill.com**
- Business payments and invoice management
- Accounts payable and receivable automation
- API Access: Bill.com API available
- Use Case: Client invoice payments and bill pay services

**Stripe**
- Powerful online payment processing
- Global payment support and strong API
- API Access: Stripe API (extensive documentation)
- Use Case: Online payments, subscriptions, and invoicing

**PayPal**
- Widely recognized online payment platform
- PayPal Business and Invoicing
- API Access: PayPal REST API
- Use Case: Client payments and recurring billing

---

### 8. Time & Billing

**QuickBooks Time** (formerly TSheets)
- Time tracking integrated with QuickBooks
- GPS tracking and project time allocation
- API Access: QuickBooks Time API
- Use Case: Track time for client projects and billing

**TSheets** (now QuickBooks Time)
- Employee time tracking and scheduling
- Mobile apps for time entry
- API Access: Same as QuickBooks Time
- Use Case: Staff time tracking for client work

**BQE Core**
- Professional services automation platform
- Time, expense, billing, and project management
- API Access: BQE Core API available
- Use Case: Complete time and billing integration

---

## Workflow Automation Options

### Auto-create in Practice CS
When a client completes onboarding, automatically create their record in Practice CS with all captured information.

### Auto-send to Liscio
After engagement letter is signed, automatically invite the client to your Liscio portal for ongoing communication.

### Auto-setup QuickBooks access
For business clients, automatically send QuickBooks Online connection request to access their books.

### Auto-generate engagement letter
After intake questionnaire is complete, automatically generate and send engagement letter for signature.

### Require DocuSign before proceeding
Block workflow progression until all required documents are signed via DocuSign integration.

### Auto-create billing entry
When client setup is complete, automatically create a billing entry for onboarding fees.

---

## Getting API Credentials

For most integrations, you'll need to:

1. **Contact the vendor** - Reach out to your software vendor's support team
2. **Request API access** - Ask for API credentials or developer portal access
3. **Review documentation** - Study the API documentation for authentication methods
4. **Generate keys** - Create API keys, OAuth credentials, or tokens
5. **Test connection** - Use the "Test Connection" button in settings to verify setup

### Common Authentication Methods

- **API Keys**: Simple key-based authentication (keep secure!)
- **OAuth 2.0**: Industry-standard for secure authorization
- **Username/Password**: Some legacy systems use basic auth
- **JWT Tokens**: Token-based authentication for modern APIs

---

## Security Best Practices

1. **Never share API credentials** - Keep credentials secure and private
2. **Use secure connections** - All integrations use HTTPS/TLS encryption
3. **Rotate credentials regularly** - Update API keys periodically
4. **Limit permissions** - Request minimum necessary API permissions
5. **Monitor usage** - Review integration logs for unusual activity
6. **Test thoroughly** - Use test/sandbox environments before production

---

## Integration Priorities by Firm Size

### Solo Practitioners & Small Firms (1-5 staff)
**Essential:**
- Tax Software (UltraTax CS, ProSeries, or Lacerte)
- E-Signature (DocuSign or Adobe Sign)
- Payment Processing (Stripe or PayPal)

**Nice to Have:**
- QuickBooks Online (for business clients)
- Liscio (client communication)

### Medium Firms (6-20 staff)
**Essential:**
- Practice Management (Practice CS, Karbon, or TaxDome)
- Tax Software (UltraTax CS, ProSeries, or Lacerte)
- E-Signature (DocuSign)
- Document Management (SmartVault or ShareFile)
- Payment Processing (LawPay or Bill.com)

**Nice to Have:**
- Liscio (client portal)
- QuickBooks Time (time tracking)
- QuickBooks Online/Xero (client books access)

### Large Firms (20+ staff)
**Essential:**
- Practice Management (Practice CS or CCH Axcess Practice)
- Tax Software (UltraTax CS or ATX)
- E-Signature (DocuSign)
- Document Management (ShareFile, SmartVault, or Workpapers CS)
- Client Portal (Liscio or SafeSend Exchange)
- Time & Billing (BQE Core or QuickBooks Time)
- Payment Processing (LawPay or Bill.com)

**Nice to Have:**
- Multiple accounting software integrations
- Multiple tax software options for different use cases

---

## Troubleshooting Common Integration Issues

### "Connection Failed" Error
- Verify API credentials are correct
- Check API URL/endpoint is accurate
- Ensure your IP isn't blocked by the vendor
- Confirm API access is enabled for your account

### "Unauthorized" Error
- API key may be expired or invalid
- OAuth token may need to be refreshed
- Check API permission scopes
- Verify authentication method is correct

### "Data Not Syncing"
- Check webhook URL is accessible
- Review integration logs for errors
- Confirm data mapping is correct
- Ensure required fields are populated

### Performance Issues
- Reduce frequency of API calls
- Implement caching where appropriate
- Use bulk operations instead of individual calls
- Check rate limiting policies

---

## Support Resources

For help with integrations:
1. Review vendor's API documentation
2. Contact vendor support teams
3. Check integration logs in settings
4. Test connections with provided tools
5. Reach out to your IT support or developer

Remember: Most software vendors are happy to help accounting firms integrate their products. Don't hesitate to reach out!
