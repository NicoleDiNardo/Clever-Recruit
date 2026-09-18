import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  TextInput,
  Textarea,
  FileInput,
  Button,
  Group,
  Anchor,
  Alert,
  Card,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconUpload, IconInfoCircle, IconFile, IconMoodSad } from '@tabler/icons-react';
import { mockJobs } from '../../data/mockData';
import { useApplications } from '../../context/ApplicationsContext';
import { useCandidates } from '../../context/CandidatesContext';
import { EmptyState } from '../../components/EmptyState';
import type { Application, Candidate } from '../../types';

const MAX_CV_BYTES = 5 * 1024 * 1024;
const ACCEPTED_CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[+()\d\s-]{7,}$/;

/** The application form — /careers/:jobId/apply. Flows 6 and 7. Only ever
 *  reachable with a jobId (no context-less /apply route), matching the IA
 *  doc's redirect-to-job-detail rule for a bare form. */
export function Apply() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { addApplication, findExisting } = useApplications();
  const { addCandidate } = useCandidates();
  const [submitting, setSubmitting] = useState(false);
  const [duplicateOf, setDuplicateOf] = useState<Application | null>(null);

  const job = mockJobs.find((j) => j.id === jobId);

  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      coverNote: '',
      cv: null as File | null,
    },
    validate: {
      fullName: (v) => (v.trim().length < 2 ? 'Enter your full name' : null),
      email: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email address'),
      phone: (v) => (v.trim().length === 0 || PHONE_RE.test(v.trim()) ? null : 'Enter a valid phone number'),
      cv: (v) => {
        if (!v) return 'Attach your CV to apply';
        if (!ACCEPTED_CV_TYPES.includes(v.type)) return 'Accepted file types: PDF, DOC, DOCX';
        if (v.size > MAX_CV_BYTES) return 'File is too large — the limit is 5MB';
        return null;
      },
    },
  });

  if (!job) {
    return (
      <Container size="sm" px="md" py="xl">
        <EmptyState
          icon={IconMoodSad}
          title="We couldn't find that role"
          description="It may have been removed, or the link might be incorrect."
          actionLabel="Browse open roles"
          onAction={() => navigate('/careers')}
        />
      </Container>
    );
  }

  if (job.status !== 'open') {
    return (
      <Container size="sm" px="md" py="xl">
        <EmptyState
          title="This role is no longer accepting applications"
          description={`"${job.title}" isn't open right now.`}
          actionLabel="Browse open roles"
          onAction={() => navigate('/careers')}
        />
      </Container>
    );
  }

  const handleSubmit = form.onSubmit((values) => {
    const existing = findExisting(job.id, values.email);
    if (existing) {
      setDuplicateOf(existing);
      return;
    }

    setSubmitting(true);
    // No real backend in this demo (client-only, see product-definition.md) —
    // this simulates the request latency a real submit would have, so the
    // loading/disabled state is genuine rather than instant-and-fake.
    setTimeout(() => {
      const [firstName, ...rest] = values.fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || '—';
      const candidateId = `applicant-${Date.now()}`;
      const applicationId = `app-${Date.now().toString(36)}`;
      const now = new Date().toISOString();

      const candidate: Candidate = {
        id: candidateId,
        firstName,
        lastName,
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        jobTitle: job.title,
        status: 'active',
        stage: 'applied',
        location: job.location,
        createdAt: now,
        updatedAt: now,
        notes: values.coverNote.trim()
          ? [
              {
                id: `note-${Date.now()}`,
                title: 'Cover note (submitted with application)',
                content: values.coverNote.trim(),
                candidateId,
                authorId: candidateId,
                createdAt: now,
              },
            ]
          : [],
      };
      addCandidate(candidate);

      const application: Application = {
        id: applicationId,
        candidateId,
        jobId: job.id,
        jobTitle: job.title,
        applicantName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        coverNote: values.coverNote.trim() || undefined,
        cvFileName: values.cv?.name,
        createdAt: now,
      };
      addApplication(application);

      setSubmitting(false);
      navigate(`/careers/apply/${applicationId}/confirmation`);
    }, 600);
  });

  return (
    <Container size="sm" px="md" py="xl">
      <Anchor component={Link} to={`/careers/${job.id}`} size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <IconArrowLeft size={14} /> Back to {job.title}
      </Anchor>

      <Stack gap={4} mt="lg" mb="xl">
        <Title order={1} size="h2">Apply for {job.title}</Title>
        <Text c="dimmed" size="sm">{job.company?.name}{job.location ? ` · ${job.location}` : ''}</Text>
      </Stack>

      {duplicateOf && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="lg" title="You've already applied to this role">
          <Stack gap="xs">
            <Text size="sm">
              We found an existing application from this email for this role, submitted{' '}
              {new Date(duplicateOf.createdAt).toLocaleDateString()}.
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => navigate('/careers/status')}>
                Check its status
              </Button>
              <Button size="xs" variant="subtle" onClick={() => setDuplicateOf(null)}>
                Use a different email
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      <Card withBorder padding="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Full name"
              placeholder="Jordan Lee"
              required
              disabled={submitting}
              {...form.getInputProps('fullName')}
            />
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              disabled={submitting}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Phone"
              placeholder="+1 (555) 123-4567"
              disabled={submitting}
              {...form.getInputProps('phone')}
            />
            <FileInput
              label="CV / résumé"
              placeholder="Upload a PDF, DOC or DOCX (max 5MB)"
              leftSection={<IconUpload size={16} />}
              required
              disabled={submitting}
              clearable
              accept=".pdf,.doc,.docx"
              {...form.getInputProps('cv')}
            />
            {form.values.cv && !form.errors.cv && (
              <Group gap={4} mt={-8}>
                <IconFile size={14} color="var(--mantine-color-teal-6)" />
                <Text size="xs" c="dimmed">
                  {form.values.cv.name} · {(form.values.cv.size / 1024 / 1024).toFixed(1)}MB
                </Text>
              </Group>
            )}
            <Textarea
              label="Cover note"
              description="Optional — anything you'd like the recruiter to know."
              minRows={4}
              disabled={submitting}
              {...form.getInputProps('coverNote')}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="light" component={Link} to={`/careers/${job.id}`} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit application
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
