import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Group,
  Card,
  Badge,
  Box,
  SimpleGrid,
  Grid,
  Button,
  ActionIcon,
  Stack,
  Timeline,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconVideo,
  IconPhone,
  IconMapPin,
  IconPlus,
} from '@tabler/icons-react';
import { useInterviews } from '../../context/InterviewsContext';
import { useCandidates } from '../../context/CandidatesContext';
import { usePermissions } from '../../hooks/usePermissions';
import { mockJobs } from '../../data/mockData';
import type { Interview } from '../../types';
import { ScheduleInterviewModal } from '../Interviews/ScheduleInterviewModal';
import { EmptyState } from '../../components/EmptyState';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTypeIcon(type: Interview['type']) {
  switch (type) {
    case 'video':
      return <IconVideo size={14} />;
    case 'phone':
      return <IconPhone size={14} />;
    case 'onsite':
      return <IconMapPin size={14} />;
  }
}

function getTypeColor(type: Interview['type']) {
  switch (type) {
    case 'video':
      return 'blue';
    case 'phone':
      return 'teal';
    case 'onsite':
      return 'orange';
  }
}

export function Calendar() {
  const navigate = useNavigate();
  const { interviews } = useInterviews();
  const { candidates } = useCandidates();
  const { can } = usePermissions();
  const canManage = can('interviews.manage');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleOpened, setScheduleOpened] = useState(false);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const now = new Date();
  const isCurrentMonth = currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear();
  const today = isCurrentMonth ? now.getDate() : -1;
  const days = getDaysInMonth();

  const active = useMemo(() => interviews.filter((i) => i.status !== 'cancelled'), [interviews]);

  // Derived from the interviews actually scheduled in the month currently
  // shown — the old page's dot-marker days were a hardcoded array that
  // never changed with the month, so paging to a different month kept
  // showing the same dots regardless of what was really scheduled there.
  const interviewDaysThisMonth = useMemo(() => {
    const set = new Set<number>();
    active.forEach((i) => {
      const d = new Date(i.scheduledAt);
      if (d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth()) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [active, currentMonth]);

  const enrich = (interview: Interview) => ({
    interview,
    candidate: candidates.find((c) => c.id === interview.candidateId),
    job: interview.jobId ? mockJobs.find((j) => j.id === interview.jobId) : undefined,
  });

  const todayInterviews = useMemo(
    () =>
      active
        .filter((i) => new Date(i.scheduledAt).toDateString() === now.toDateString())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .map(enrich),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, candidates]
  );

  const upcomingInterviews = useMemo(
    () =>
      active
        .filter((i) => new Date(i.scheduledAt) > now && new Date(i.scheduledAt).toDateString() !== now.toDateString())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 8)
        .map(enrich),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, candidates]
  );

  return (
    <Box>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={1} size="h2" c="blue.7">
            Calendar
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Manage your interviews and scheduled events.
          </Text>
        </div>
        {canManage && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setScheduleOpened(true)}>
            Schedule Interview
          </Button>
        )}
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" mb="lg">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <ActionIcon variant="subtle" onClick={handlePrevMonth} aria-label="Previous month">
                  <IconChevronLeft size={18} />
                </ActionIcon>
                <Title order={4}>{monthName}</Title>
                <ActionIcon variant="subtle" onClick={handleNextMonth} aria-label="Next month">
                  <IconChevronRight size={18} />
                </ActionIcon>
              </Group>
              <Button variant="light" size="xs" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
            </Group>

            <SimpleGrid cols={7} spacing="xs">
              {daysOfWeek.map((day) => (
                <Text key={day} ta="center" size="xs" fw={600} c="dimmed" mb="xs">
                  {day}
                </Text>
              ))}
              {days.map((day, i) => (
                <Box
                  key={i}
                  p="xs"
                  style={{
                    borderRadius: 'var(--mantine-radius-sm)',
                    textAlign: 'center',
                    background:
                      day === today
                        ? 'var(--mantine-color-blue-6)'
                        : day && interviewDaysThisMonth.has(day)
                          ? 'var(--mantine-color-blue-0)'
                          : undefined,
                    color: day === today ? 'white' : undefined,
                    minHeight: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {day && (
                    <>
                      <Text size="sm" fw={day === today ? 700 : 400}>
                        {day}
                      </Text>
                      {interviewDaysThisMonth.has(day) && day !== today && (
                        <Box
                          style={{
                            position: 'absolute',
                            bottom: 2,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: 'var(--mantine-color-blue-6)',
                          }}
                        />
                      )}
                    </>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          </Card>

          <Card withBorder padding="lg">
            <Title order={4} mb="md">
              Today's Interviews
            </Title>
            {todayInterviews.length === 0 ? (
              <EmptyState icon={IconCalendarEvent} title="No interviews today" />
            ) : (
              <Stack gap="sm">
                {todayInterviews.map(({ interview, candidate, job }) => (
                  <Card
                    key={interview.id}
                    withBorder
                    padding="sm"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <Box
                          style={{
                            width: 3,
                            height: 48,
                            borderRadius: 2,
                            background: `var(--mantine-color-${getTypeColor(interview.type)}-6)`,
                          }}
                        />
                        <div>
                          <Group gap="xs">
                            <Text size="sm" fw={600}>
                              {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown candidate'}
                            </Text>
                            <Badge variant="light" color={getTypeColor(interview.type)} size="xs" leftSection={getTypeIcon(interview.type)}>
                              {interview.type}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {job?.title ?? 'No matching job'}
                          </Text>
                        </div>
                      </Group>
                      <div style={{ textAlign: 'right' }}>
                        <Group gap={4}>
                          <IconClock size={12} color="gray" />
                          <Text size="sm" fw={500}>
                            {new Date(interview.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {interview.durationMinutes} min
                        </Text>
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={4} mb="md">
              Upcoming
            </Title>
            {upcomingInterviews.length === 0 ? (
              <Text size="sm" c="dimmed">
                Nothing scheduled ahead.
              </Text>
            ) : (
              <Timeline active={-1} bulletSize={28} lineWidth={2}>
                {upcomingInterviews.map(({ interview, candidate, job }) => (
                  <Timeline.Item
                    key={interview.id}
                    bullet={
                      <ThemeIcon size={28} radius="xl" color={getTypeColor(interview.type)} variant="light">
                        {getTypeIcon(interview.type)}
                      </ThemeIcon>
                    }
                    title={
                      <Text
                        size="sm"
                        fw={500}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/interviews/${interview.id}`)}
                      >
                        {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown candidate'}
                      </Text>
                    }
                  >
                    <Text size="xs" c="dimmed">
                      {job?.title ?? 'No matching job'}
                    </Text>
                    <Group gap={4} mt={4}>
                      <Badge variant="light" size="xs" color="gray">
                        {new Date(interview.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Badge>
                      <Badge variant="light" size="xs" color="gray">
                        {new Date(interview.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </Badge>
                    </Group>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <ScheduleInterviewModal opened={scheduleOpened} onClose={() => setScheduleOpened(false)} />
    </Box>
  );
}
