-- Add status to pages for individual page readiness
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready'));
