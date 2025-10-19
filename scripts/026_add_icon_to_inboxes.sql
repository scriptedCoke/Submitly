-- Add icon column to inboxes table
ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'sparkles';

-- Update existing inboxes to have the default icon
UPDATE inboxes SET icon = 'sparkles' WHERE icon IS NULL;
