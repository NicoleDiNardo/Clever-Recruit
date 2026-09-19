import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Stack, Skeleton, Anchor } from '@mantine/core';
import { IconArrowLeft, IconLock, IconMoodSad } from '@tabler/icons-react';
import { mockJobs } from '../../data/mockData';
import { EmptyState } from '../../components/EmptyState';
import { JobPostingView } from '../../components/JobPostingView';

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
        <Stack mt="md">
          <JobPostingView
            job={job}
            mode="live"
            onApply={() => navigate(`/careers/${job.id}/apply`)}
            onCheckStatus={() => navigate('/careers/status')}
          />
        </Stack>
      )}
    </Container>
  );
}
