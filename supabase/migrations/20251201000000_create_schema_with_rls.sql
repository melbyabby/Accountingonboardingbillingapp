-- =====================================================
-- Accounting Onboarding & Billing App - Database Schema
-- Created: 2025-12-01
-- Description: Creates all necessary tables with Row Level Security
-- =====================================================

-- ==================== CLIENTS TABLE ====================
-- Stores client information
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type TEXT NOT NULL CHECK (type IN ('individual', 'business', 'trust', 'nonprofit')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'ready', 'complete')),
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    setup_progress INTEGER DEFAULT 0 CHECK (setup_progress >= 0 AND setup_progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    onboarded_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_by for faster queries
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_clients_assigned_to ON public.clients(assigned_to);
CREATE INDEX idx_clients_status ON public.clients(status);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all clients (for admin dashboard)
CREATE POLICY "Allow authenticated users to read clients"
    ON public.clients
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert clients they create
CREATE POLICY "Allow authenticated users to create clients"
    ON public.clients
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Allow users to update clients they created or are assigned to
CREATE POLICY "Allow users to update their clients"
    ON public.clients
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by OR auth.uid() = assigned_to)
    WITH CHECK (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Policy: Allow users to delete clients they created
CREATE POLICY "Allow users to delete their clients"
    ON public.clients
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- ==================== ONBOARDING_RESPONSES TABLE ====================
-- Stores client responses to onboarding questionnaires
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    question_key TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, question_key)
);

CREATE INDEX idx_onboarding_responses_client_id ON public.onboarding_responses(client_id);

-- Enable RLS on onboarding_responses table
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read responses for clients they can access
CREATE POLICY "Allow users to read onboarding responses"
    ON public.onboarding_responses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = onboarding_responses.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to insert responses for their clients
CREATE POLICY "Allow users to create onboarding responses"
    ON public.onboarding_responses
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to update responses for their clients
CREATE POLICY "Allow users to update onboarding responses"
    ON public.onboarding_responses
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = onboarding_responses.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to delete responses for their clients
CREATE POLICY "Allow users to delete onboarding responses"
    ON public.onboarding_responses
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = onboarding_responses.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );


-- ==================== DOCUMENTS TABLE ====================
-- Stores uploaded documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    document_type TEXT CHECK (document_type IN ('id', 'tax_return', 'financial_statement', 'engagement_letter', 'power_of_attorney', 'other')),
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read documents for their clients
CREATE POLICY "Allow users to read documents"
    ON public.documents
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = documents.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to upload documents for their clients
CREATE POLICY "Allow users to create documents"
    ON public.documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = uploaded_by
        AND EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to delete documents for their clients
CREATE POLICY "Allow users to delete documents"
    ON public.documents
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = documents.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );


-- ==================== BILLING TABLE ====================
-- Stores billing information and invoices
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    due_date DATE,
    paid_date DATE,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_client_id ON public.billing(client_id);
CREATE INDEX idx_billing_status ON public.billing(status);
CREATE INDEX idx_billing_created_by ON public.billing(created_by);

-- Enable RLS on billing table
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read billing for their clients
CREATE POLICY "Allow users to read billing"
    ON public.billing
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = billing.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to create billing for their clients
CREATE POLICY "Allow users to create billing"
    ON public.billing
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to update billing for their clients
CREATE POLICY "Allow users to update billing"
    ON public.billing
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = billing.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to delete billing for their clients
CREATE POLICY "Allow users to delete billing"
    ON public.billing
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = billing.client_id
            AND clients.created_by = auth.uid()
        )
    );


-- ==================== NOTES TABLE ====================
-- Stores notes and comments about clients
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_client_id ON public.notes(client_id);
CREATE INDEX idx_notes_created_by ON public.notes(created_by);

-- Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read notes for their clients
CREATE POLICY "Allow users to read notes"
    ON public.notes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = notes.client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to create notes for their clients
CREATE POLICY "Allow users to create notes"
    ON public.notes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = client_id
            AND (clients.created_by = auth.uid() OR clients.assigned_to = auth.uid())
        )
    );

-- Policy: Allow users to update their own notes
CREATE POLICY "Allow users to update their notes"
    ON public.notes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- Policy: Allow users to delete their own notes
CREATE POLICY "Allow users to delete their notes"
    ON public.notes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- ==================== FUNCTIONS ====================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_responses_updated_at BEFORE UPDATE ON public.onboarding_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==================== COMMENTS ====================
COMMENT ON TABLE public.clients IS 'Stores client information for the accounting firm';
COMMENT ON TABLE public.onboarding_responses IS 'Stores client responses to onboarding questionnaires';
COMMENT ON TABLE public.documents IS 'Stores metadata for uploaded documents';
COMMENT ON TABLE public.billing IS 'Stores billing and invoice information';
COMMENT ON TABLE public.notes IS 'Stores notes and comments about clients';
