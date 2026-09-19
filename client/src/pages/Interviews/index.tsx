import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Group,
  Badge,
  Avatar,
  Box,
  Flex,
  Paper,
  Stack,
  Button,
  Drawer,
  Select,
  Alert,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconVideo,
  IconPhone,
  IconMapPin,
  IconCalendarEvent,
  IconX,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useInterviews } from '../../context/InterviewsContext';
import { useCandidates } from '../../context/CandidatesContext';
import { usePermissions } from '../../hooks/usePermissions';
import { mockJobs, mockUsers } from '../../data/mockData';
import type { Interview } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';

function typeIcon(type: Interview['type']) {
  switch (type) {
    case 'video':
      return <IconVideo size={14} />;
    case 'phone':
      return <IconPhone size={14} />;
    case 'onsite':
      return <IconMapPin size={14} />;
  }
}

function typeColor(type: Interview['type']) {
  switch (type) {
    case 'video':
      return 'blue';
    case 'phone':
      return 'teal';
    case 'onsite':
      return 'orange';
  }
}

function statusColor(interview: Interview) {
  if (interview.status === 'cancelled') return 'gray';
  if (interview.status === 'completed') {
    if (interview.outcome === 'advance') return 'green';
    if (interview.outcome === 'reject') return 'red';
    return 'yellow';
  }
  return 'blue';
}

function statusLabel(interview: Interview) {
  if (interview.status === 'cancelled') return 'Cancelled';
  if (interview.status === 'completed') {
    if (interview.outcome === 'advance') return 'Completed — advancing';
    if (interview.outcome === 'reject') return 'Completed — not moving forward';
    return 'Completed';
  }
  return 'Scheduled';
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const dayLabel = isToday
    ? 'Today'
    : isTomorrow
      ? 'Tomorrow'
      : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${dayLabel} · ${timeLabel}`;
}

export function Interviews() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { interviews, updateInterview } = useInterviews();
  const { candidates } = useCandidates();
  const { can } = usePermissions();
  const canManage = can('interviews.manage');

  const [scheduleOpened, setScheduleOpened] = useState(false);
  const [outcomeDraft, setOutcomeDraft] = useState<string | null>(null);

  const enriched = useMemo(
    () =>
      interviews.map((i) => ({
        interview: i,
        candidate: candidates.find((c) => c.id === i.candidateId),
        job: i.jobId ? mockJobs.find((j) => j.id === i.jobId) : undefined,
        interviewers: mockUsers.filter((u) => i.interviewerIds.includes(u.id)),
      })),
    [interviews, candidates]
  );

  const sorted = useMemo(
    () => [...enriched].sort((a, b) => new Date(a.interview.scheduledAt).getTime() - new Date(b.interview.scheduledAt).getTime()),
    [enriched]
  );

  const now = new Date();
  const upcoming = sorted.filter((e) => new Date(e.interview.scheduledAt) >= now && e.interview.status !== 'cancelled');
  const past = sorted
    .filter((e) => new Date(e.interview.scheduledAt) < now || e.interview.status !== 'scheduled')
    .filter((e) => !upcoming.includes(e))
    .reverse();

  const selected = interviewId ? enriched.find((e) => e.interview.id === interviewId) : undefined;
  const interviewNotFound = Boolean(interviewId) && !selected;

  const openDrawer = (id: string) => navigate(`/interviews/${id}`);
  const closeDrawer = () => {
    setOutcomeDraft(null);
    navigate('/interviews');
  };

  const handleMarkCompleted = () => {
    if (!selected) return;
    updateInterview(selected.interview.id, { status: 'completed', outcome: 'undecided' });
    notifications.show({ message: 'Interview marked completed.', color: 'blue', icon: <IconCheck size={16} /> });
  };

  const handleSetOutcome = (outcome: string | null) => {
    if (!selected || !outcome) return;
    updateInterview(selected.interview.id, { outcome: outcome as Interview['outcome'] });
    setOutcomeDraft(null);
    notifications.show({ message: 'Outcome recorded.', color: 'blue', icon: <IconCheck size={16} /> });
  };

  const handleCancel = () => {
    if (!selected) return;
    updateInterview(selected.interview.id, { status: 'cancelled' });
    notifications.show({ message: 'Interview cancelled.', color: 'gray' });
    closeDrawer();
  };

  const renderRow = (entry: (typeof enriched)[number]) => {
    const { interview, candidate, job, interviewers } = entry;
    const name = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown candidate';
    const initials = candidate ? `${candidate.firstName[0] ?? ''}${candidate.lastName[0] ?? ''}` : '?';
    return (
      <Paper key={interview.id} withBorder radius="md" p="sm" style={{ cursor: 'pointer' }} onClick={() => openDrawer(interview.id)}>
        <Flex justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Avatar radius="xl" color="blue" size="sm">
              {initials}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text fw={600} size="sm" truncate>
                {name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {job?.title ?? 'No matching job'} · {interviewers.map((u) => u.firstName).join(', ') || 'Unassigned'}
              </Text>
            </Box>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Badge variant="light" color={typeColor(interview.type)} leftSection={typeIcon(interview.type)}>
              {interview.type}
            </Badge>
            <Badge variant="dot" color={statusColor(interview)}>
              {statusLabel(interview)}
            </Badge>
            <Text size="sm" c="dimmed" w={140} ta="right">
              {formatWhen(interview.scheduledAt)}
            </Text>
          </Group>
        </Flex>
      </Paper>
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Title order={2}>Interviews</Title>
          <Text c="dimmed" size="sm">
            Every interview across every candidate, scheduled and past.
          </Text>
        </div>
        {canManage && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setScheduleOpened(true)}>
            Schedule interview
          </Button>
        )}
      </Flex>

      {interviewNotFound && (
        <Alert color="gray" icon={<IconInfoCircle size={16} />} mb="md">
          That interview couldn't be found — it may have been removed.
        </Alert>
      )}

      {interviews.length === 0 ? (
        <EmptyState
          icon={IconCalendarEvent}
          title="No interviews scheduled"
          description="Once a recruiter schedules one — from here or from a candidate's profile — it'll show up here and on Calendar."
          actionLabel={canManage ? 'Schedule interview' : undefined}
          onAction={canManage ? () => setScheduleOpened(true) : undefined}
        />
      ) : (
        <Stack gap="xl">
          <Stack gap="xs">
            <Text fw={600} size="sm" c="dimmed">
              UPCOMING ({upcoming.length})
            </Text>
            {upcoming.length === 0 ? (
              <Text size="sm" c="dimmed">
                Nothing scheduled ahead.
              </Text>
            ) : (
              <Stack gap="xs">{upcoming.map(renderRow)}</Stack>
            )}
          </Stack>

          {past.length > 0 && (
            <Stack gap="xs">
              <Text fw={600} size="sm" c="dimmed">
                PAST ({past.length})
              </Text>
              <Stack gap="xs">{past.map(renderRow)}</Stack>
            </Stack>
          )}
        </Stack>
      )}

      <Drawer opened={Boolean(selected)} onClose={closeDrawer} position="right" size="md" title="Interview details">
        {selected && (
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="sm">
                <Avatar radius="xl" color="blue">
                  {selected.candidate
                    ? `${selected.candidate.firstName[0] ?? ''}${selected.candidate.lastName[0] ?? ''}`
                    : '?'}
                </Avatar>
                <div>
                  <Text fw={700}>
                    {selected.candidate ? `${selected.candidate.firstName} ${selected.candidate.lastName}` : 'Unknown candidate'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selected.job?.title ?? 'No matching job'}
                  </Text>
                </div>
              </Group>
              <Badge variant="dot" color={statusColor(selected.interview)}>
                {statusLabel(selected.interview)}
              </Badge>
            </Group>

            <Divider />

            <Group grow>
              <Box>
                <Text size="xs" fw={600} c="dimmed">
                  When
                </Text>
                <Text size="sm">{new Date(selected.interview.scheduledAt).toLocaleString()}</Text>
              </Box>
              <Box>
                <Text size="xs" fw={600} c="dimmed">
                  Duration
                </Text>
                <Text size="sm">{selected.interview.durationMinutes} min</Text>
              </Box>
            </Group>
            <Group grow>
              <Box>
                <Text size="xs" fw={600} c="dimmed">
                  Type
                </Text>
                <Badge variant="light" color={typeColor(selected.interview.type)} leftSection={typeIcon(selected.interview.type)}>
                  {selected.interview.type}
                </Badge>
              </Box>
              <Box>
                <Text size="xs" fw={600} c="dimmed">
                  Interviewer(s)
                </Text>
                <Text size="sm">{selected.interviewers.map((u) => `${u.firstName} ${u.lastName}`).join(', ') || 'Unassigned'}</Text>
              </Box>
            </Group>

            {canManage && selected.interview.status === 'scheduled' && (
              <>
                <Divider />
                <Group>
                  <Button size="xs" variant="light" leftSection={<IconCheck size={14} />} onClick={handleMarkCompleted}>
                    Mark completed
                  </Button>
                  <Button size="xs" variant="light" color="red" leftSection={<IconX size={14} />} onClick={handleCancel}>
                    Cancel interview
                  </Button>
                </Group>
              </>
            )}

            {canManage && selected.interview.status === 'completed' && (
              <>
                <Divider />
                <Select
                  label="Outcome"
                  data={[
                    { value: 'advance', label: 'Advance candidate' },
                    { value: 'reject', label: 'Not moving forward' },
                    { value: 'undecided', label: 'Undecided' },
                  ]}
                  value={outcomeDraft ?? selected.interview.outcome ?? 'undecided'}
                  onChange={(v) => {
                    setOutcomeDraft(v);
                    handleSetOutcome(v);
                  }}
                  allowDeselect={false}
                />
              </>
            )}
          </Stack>
        )}
      </Drawer>

      <ScheduleInterviewModal opened={scheduleOpened} onClose={() => setScheduleOpened(false)} />
    </Box>
  );
}
