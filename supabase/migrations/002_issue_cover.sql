-- Add cover_url to issues for AI-generated covers
ALTER TABLE issues ADD COLUMN IF NOT EXISTS cover_url TEXT;
