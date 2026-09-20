import { Stack, Group, Title, Text, Badge, Card, Divider, Button, Alert } from '@mantine/core';
import { IconMapPin, IconBuilding, IconCurrencyDollar, IconEye } from '@tabler/icons-react';
import type { Job } from '../types';

function statusBadgeColor(status: string) {
  switch (status) {
    case 'open':
      return 'green';
    case 'paused':
      return 'yellow';
    case 'closed':
      return 'red';
    default:
      return 'gray';
  }
}

interface JobPostingViewProps {
  job: Job;
  /** 'live': the real /careers/:jobId page — Apply and Check status work.
   *  'preview': shown to staff from the Jobs page, before or instead of
   *  publishing — Apply is replaced with a notice, and the real status
   *  badge is shown (draft/paused/closed) instead of always "Open", since
   *  a preview is the one place this content renders for a job that isn't
   *  actually open yet. */
  mode: 'live' | 'preview';
  onApply?: () => void;
  onCheckStatus?: () => void;
}

/**
 * The candidate-facing content for one job posting — title, company,
 * location, type, salary, description. Pulled out of Careers/JobDetail.tsx
 * so the Jobs page's "preview as a candidate would see it" (AUD-P1-03) is
 * the same real component the public site renders, not a second mockup
 * that could drift from it.
 */
export function JobPostingView({ job, mode, onApply, onCheckStatus }: JobPostingViewProps) {
  return (
    <Stack gap="lg">
      {mode === 'preview' && (
        <Alert icon={<IconEye size={16} />} color="blue" variant="light">
          This is what a candidate would see on the public careers site. Applying is disabled here.
        </Alert>
      )}

      <Stack gap={4}>
        <Title order={1} size="h2">
          {job.title || 'Untitled role'}
        </Title>
        <Group gap="md" mt={4}>
          <Group gap={4}>
            {job.company?.logo ? (
              <img src={job.company.logo} alt="" width={18} height={18} style={{ borderRadius: 4 }} />
            ) : (
              <IconBuilding size={16} color="gray" />
            )}
            <Text size="sm">{job.company?.name ?? 'No company selected'}</Text>
          </Group>
          {job.location && (
            <Group gap={4}>
              <IconMapPin size={16} color="gray" />
              <Text size="sm">{job.location}</Text>
            </Group>
          )}
        </Group>
        <Group gap="xs" mt="xs">
          {job.type && (
            <Badge variant="light" color="blue">
              {job.type}
            </Badge>
          )}
          <Badge variant="light" color={statusBadgeColor(job.status)}>
            {mode === 'live' ? 'Open' : job.status}
          </Badge>
        </Group>
      </Stack>

      {job.salary && (
        <Card withBorder padding="md">
          <Group gap={4} mb={4}>
            <IconCurrencyDollar size={16} />
            <Text size="sm" fw={500}>
              Salary range
            </Text>
          </Group>
          <Text size="sm">{job.salary}</Text>
        </Card>
      )}

      <Stack gap="xs">
        <Text fw={500}>About the role</Text>
        <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
          {job.description || 'No description provided.'}
        </Text>
      </Stack>

      {mode === 'live' && (
        <>
          <Divider />
          <Group>
            <Button size="md" onClick={onApply}>
              Apply for this role
            </Button>
            <Button size="md" variant="subtle" onClick={onCheckStatus}>
              Already applied? Check status
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
}
