-- Drop the existing DELETE policy on submissions that's causing the error
DROP POLICY IF EXISTS "Inbox owners can delete submissions" ON submissions;

-- Recreate the correct policy without referencing non-existent columns
CREATE POLICY "Inbox owners can delete submissions" ON submissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );
