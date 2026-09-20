import { Modal, Group, Button, ScrollArea } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import type { Job } from '../../types';
import { JobPostingView } from '../../components/JobPostingView';

interface JobPreviewModalProps {
  job: Job | null;
  opened: boolean;
  onClose: () => void;
  /** Save with status 'open' — omitted (view-only) when previewing a job
   *  that's already published, where there's nothing left to publish. */
  onPublish?: () => void;
  /** Save with status 'draft', without publishing. */
  onSaveDraft?: () => void;
}

/**
 * AUD-P1-03's required preview step — "can be previewed in the
 * candidate-facing layout before publishing." This renders the exact same
 * JobPostingView component the real /careers/:jobId page uses, fed a job
 * that may not be saved yet, so what's shown here is never a second,
 * hand-built mockup that could say something different from what actually
 * ships. The public page's own header/footer chrome isn't reproduced here,
 * since this preview opens from inside the authenticated app — the content
 * card is the part that answers "what will a candidate see."
 */
export function JobPreviewModal({ job, opened, onClose, onPublish, onSaveDraft }: JobPreviewModalProps) {
  if (!job) return null;
  return (
    <Modal opened={opened} onClose={onClose} title="Candidate preview" size="lg">
      <ScrollArea.Autosize mah={480} mb="md">
        <JobPostingView job={job} mode="preview" />
      </ScrollArea.Autosize>
      <Group justify="flex-end">
        <Button variant="subtle" color="gray" onClick={onClose}>
          Back to edit
        </Button>
        {onSaveDraft && (
          <Button variant="light" onClick={onSaveDraft}>
            Save as draft
          </Button>
        )}
        {onPublish && (
          <Button leftSection={<IconCheck size={16} />} onClick={onPublish}>
            Publish
          </Button>
        )}
      </Group>
    </Modal>
  );
}
