import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Card,
  Skeleton,
  Anchor,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconMapPin, IconBuilding, IconCurrencyDollar, IconLock, IconMoodSad } from '@tabler/icons-react';
import { mockJobs } from '../../data/mockData';
import { EmptyState } from '../../components/EmptyState';

/** Public job detail — /careers/:jobId. Flow 5. A closed/paused role shows a
 *  clear "no longer accepting applications" state, distinct from a job that
 *  never existed (bad/old link) — both are real states here, not a 404. */
export function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [jobId]);

  const job = mockJobs.find((j) => j.id === jobId);

  return (
    <Container size="sm" px="md" py="xl">
      <Anchor component={Link} to="/careers" size="sm" mb="lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <IconArrowLeft size={14} /> Back to open roles
      </Anchor>

      {loading ? (
        <Stack gap="md" mt="lg">
          <Skeleton height={32} width="60%" />
          <Skeleton height={16} width="40%" />
          <Skeleton height={120} />
        </Stack>
      ) : !job ? (
        <EmptyState
          icon={IconMoodSad}
          title="We couldn't find that role"
          description="It may have been removed, or the link might be incorrect."
          actionLabel="Browse open roles"
          onAction={() => navigate('/careers')}
        />
      ) : job.status !== 'open' ? (
        <EmptyState
          icon={IconLock}
          title="This role is no longer accepting applications"
          description={`"${job.title}" isn't open right now. Take a look at our other open roles instead.`}
          actionLabel="Browse open roles"
          onAction={() => navigate('/careers')}
        />
      ) : (
        <Stack gap="lg" mt="md">
          <Stack gap={4}>
            <Title order={1} size="h2">{job.title}</Title>
            <Group gap="md" mt={4}>
              <Group gap={4}>
                {job.company?.logo ? (
                  <img src={job.company.logo} alt="" width={18} height={18} style={{ borderRadius: 4 }} />
                ) : (
                  <IconBuilding size={16} color="gray" />
                )}
                <Text size="sm">{job.company?.name}</Text>
              </Group>
              {job.location && (
                <Group gap={4}>
                  <IconMapPin size={16} color="gray" />
                  <Text size="sm">{job.location}</Text>
                </Group>
              )}
            </Group>
            <Group gap="xs" mt="xs">
              {job.type && <Badge variant="light" color="blue">{job.type}</Badge>}
              <Badge variant="light" color="green">Open</Badge>
            </Group>
          </Stack>

          {job.salary && (
            <Card withBorder padding="md">
              <Group gap={4} mb={4}>
                <IconCurrencyDollar size={16} />
                <Text size="sm" fw={500}>Salary range</Text>
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

          <Divider />

          <Group>
            <Button size="md" onClick={() => navigate(`/careers/${job.id}/apply`)}>
              Apply for this role
            </Button>
            <Button
              size="md"
              variant="subtle"
              onClick={() => navigate('/careers/status')}
            >
              Already applied? Check status
            </Button>
          </Group>
        </Stack>
      )}
    </Container>
  );
}
