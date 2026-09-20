import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Title, Text, Stack, Card, Group, Button, ThemeIcon, CopyButton, ActionIcon, Tooltip, Code } from '@mantine/core';
import { IconCircleCheck, IconCopy, IconCheck, IconMoodSad } from '@tabler/icons-react';
import { useApplications } from '../../context/ApplicationsContext';
import { EmptyState } from '../../components/EmptyState';

/** Post-submit confirmation — /careers/apply/:applicationId/confirmation.
 *  Flow 8: a full page, not just a toast, since this is the candidate's
 *  moment of highest anxiety about whether the application actually went
 *  through. A stale/invalid id is its own error state, not a 404. */
export function Confirmation() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { applications } = useApplications();

  const application = applications.find((a) => a.id === applicationId);

  if (!application) {
    return (
      <Container size="sm" px="md" py="xl">
        <EmptyState
          icon={IconMoodSad}
          title="We couldn't find that application"
          description="This confirmation link may be out of date. If you just applied, check your email for the reference, or look up your status directly."
          actionLabel="Check application status"
          onAction={() => navigate('/careers/status')}
        />
      </Container>
    );
  }

  return (
    <Container size="sm" px="md" py="xl">
      <Card withBorder padding="xl">
        <Stack align="center" gap="xs" mb="lg">
          <ThemeIcon size={56} radius="xl" color="green" variant="light">
            <IconCircleCheck size={32} />
          </ThemeIcon>
          <Title order={1} size="h2" ta="center">Application submitted</Title>
          <Text c="dimmed" ta="center">
            Thanks, {application.applicantName.split(/\s+/)[0]} — your application for{' '}
            <strong>{application.jobTitle}</strong> was received on{' '}
            {new Date(application.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}.
          </Text>
        </Stack>

        <Card withBorder padding="md" mb="lg" bg="var(--mantine-color-gray-0)">
          <Text size="xs" c="dimmed" mb={4}>Your application reference — save this to check your status later</Text>
          <Group justify="space-between">
            <Code fz="sm">{application.id}</Code>
            <CopyButton value={application.id}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy reference'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Card>

        <Text size="sm" c="dimmed" mb="lg">
          What happens next: the hiring team will review your application. You can check where
          things stand at any time using your email and the reference above — no account needed.
        </Text>

        <Group justify="center">
          <Button component={Link} to="/careers" variant="light">
            Browse more roles
          </Button>
          <Button component={Link} to={`/careers/status/${application.id}`}>
            Check application status
          </Button>
        </Group>
      </Card>
    </Container>
  );
}
