-- Add allow_multiple_files column to inboxes table
ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS allow_multiple_files BOOLEAN DEFAULT false;

-- Update existing inboxes to have allow_multiple_files set to false
UPDATE inboxes SET allow_multiple_files = false WHERE allow_multiple_files IS NULL;
