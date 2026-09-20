import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Stack, TextInput, Button, Card, Alert, Badge, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconSearch } from '@tabler/icons-react';
import { useApplications } from '../../context/ApplicationsContext';
import { useCandidates } from '../../context/CandidatesContext';
import { getPublicStatusLabel, getPublicStatusColor } from '../../utils/applicationStatus';
import type { Application } from '../../types';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Status lookup — /careers/status and /careers/status/:applicationId.
 *  Flow 9. Deliberately requires both email and reference even when the
 *  reference arrives in the URL (from the confirmation page's own link) —
 *  a guessable id alone shouldn't be enough to see someone's status. A
 *  wrong combination gives one generic "couldn't find a match" message,
 *  never a distinct "wrong email" vs "wrong reference" — that would let
 *  someone confirm an email exists in the system. */
export function Status() {
  const { applicationId: prefillId } = useParams<{ applicationId?: string }>();
  const { findByEmailAndId } = useApplications();
  const { candidates } = useCandidates();
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<Application | 'not-found' | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      reference: prefillId ?? '',
    },
    validate: {
      email: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email address'),
      reference: (v) => (v.trim().length < 3 ? 'Enter your application reference' : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    setSearching(true);
    setResult(null);
    setTimeout(() => {
      const match = findByEmailAndId(values.email, values.reference);
      setResult(match ?? 'not-found');
      setSearching(false);
    }, 400);
  });

  const candidate = typeof result === 'object' && result ? candidates.find((c) => c.id === result.candidateId) : undefined;

  return (
    <Container size="sm" px="md" py="xl">
      <Stack gap={4} mb="xl">
        <Title order={1} size="h2">Check your application status</Title>
        <Text c="dimmed" size="sm">
          Enter the email you applied with and your application reference — no account needed.
        </Text>
      </Stack>

      <Card withBorder padding="lg" mb="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              disabled={searching}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Application reference"
              placeholder="app-xxxxxxx"
              required
              disabled={searching}
              {...form.getInputProps('reference')}
            />
            <Group justify="flex-end">
              <Button type="submit" leftSection={<IconSearch size={16} />} loading={searching}>
                Check status
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>

      {result === 'not-found' && (
        <Alert icon={<IconInfoCircle size={16} />} color="gray">
          We couldn't find a matching application. Double-check the email and reference — both
          need to match exactly what you used when you applied.
        </Alert>
      )}

      {typeof result === 'object' && result && (
        <Card withBorder padding="lg">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">{result.jobTitle}</Text>
            <Group>
              <Badge size="lg" variant="light" color={getPublicStatusColor(candidate?.stage)}>
                {getPublicStatusLabel(candidate?.stage)}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">
              Applied {new Date(result.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </Text>
          </Stack>
        </Card>
      )}
    </Container>
  );
}
