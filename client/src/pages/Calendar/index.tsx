import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Card,
  Badge,
  Avatar,
  Stack,
  Box,
  SimpleGrid,
  Grid,
  Button,
  ActionIcon,
  Divider,
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
  IconUser,
} from '@tabler/icons-react';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const todayInterviews = [
  {
    id: '1',
    time: '09:00',
    duration: '45 min',
    candidate: 'Robert Wolf',
    role: 'Senior Software Engineer',
    company: 'Google',
    type: 'video',
    interviewer: 'Jenny Chen',
  },
  {
    id: '2',
    time: '11:30',
    duration: '60 min',
    candidate: 'Jill Lenon',
    role: 'Backend Engineer',
    company: 'Meta',
    type: 'video',
    interviewer: 'Mark Williams',
  },
  {
    id: '3',
    time: '14:00',
    duration: '30 min',
    candidate: 'Sophia Martinez',
    role: 'Engineering Manager',
    company: 'Stripe',
    type: 'phone',
    interviewer: 'Jenny Chen',
  },
  {
    id: '4',
    time: '16:00',
    duration: '45 min',
    candidate: 'Liam Johnson',
    role: 'Tech Lead',
    company: 'Microsoft',
    type: 'onsite',
    interviewer: 'Sarah Johnson',
  },
];

const upcomingInterviews = [
  {
    id: '5',
    date: 'Tomorrow',
    time: '10:00',
    candidate: 'Mason Lee',
    role: 'Data Manager',
    company: 'Samsung',
    type: 'video',
  },
  {
    id: '6',
    date: 'Tomorrow',
    time: '14:30',
    candidate: 'Emma Thompson',
    role: 'Operations Manager',
    company: 'Netflix',
    type: 'phone',
  },
  {
    id: '7',
    date: 'Wed, Jun 18',
    time: '09:00',
    candidate: 'Noah Brown',
    role: 'Project Manager',
    company: 'Shopify',
    type: 'video',
  },
  {
    id: '8',
    date: 'Thu, Jun 19',
    time: '11:00',
    candidate: 'Ava Garcia',
    role: 'HR Manager',
    company: 'Klarna',
    type: 'onsite',
  },
  {
    id: '9',
    date: 'Fri, Jun 20',
    time: '15:00',
    candidate: 'Ethan Wilson',
    role: 'DevOps Manager',
    company: 'Grab',
    type: 'video',
  },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'video':
      return <IconVideo size={14} />;
    case 'phone':
      return <IconPhone size={14} />;
    case 'onsite':
      return <IconMapPin size={14} />;
    default:
      return <IconCalendarEvent size={14} />;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'video':
      return 'blue';
    case 'phone':
      return 'teal';
    case 'onsite':
      return 'orange';
    default:
      return 'gray';
  }
}

export function Calendar() {
  const [currentMonth] = useState(new Date());

  const monthName = currentMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

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

  const today = new Date().getDate();
  const days = getDaysInMonth();
  const interviewDays = [14, 15, 16, 18, 19, 20, 22, 25];

  return (
    <Box>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2} c="blue.7">
            Calendar
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Manage your interviews and scheduled events.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Schedule Interview</Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" mb="lg">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <ActionIcon variant="subtle">
                  <IconChevronLeft size={18} />
                </ActionIcon>
                <Title order={4}>{monthName}</Title>
                <ActionIcon variant="subtle">
                  <IconChevronRight size={18} />
                </ActionIcon>
              </Group>
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
                        : day && interviewDays.includes(day)
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
                      {interviewDays.includes(day) && day !== today && (
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
            <Stack gap="sm">
              {todayInterviews.map((interview) => (
                <Card key={interview.id} withBorder padding="sm">
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
                            {interview.candidate}
                          </Text>
                          <Badge
                            variant="light"
                            color={getTypeColor(interview.type)}
                            size="xs"
                            leftSection={getTypeIcon(interview.type)}
                          >
                            {interview.type}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {interview.role} at {interview.company}
                        </Text>
                      </div>
                    </Group>
                    <div style={{ textAlign: 'right' }}>
                      <Group gap={4}>
                        <IconClock size={12} color="gray" />
                        <Text size="sm" fw={500}>
                          {interview.time}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {interview.duration}
                      </Text>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={4} mb="md">
              Upcoming
            </Title>
            <Timeline active={-1} bulletSize={28} lineWidth={2}>
              {upcomingInterviews.map((interview) => (
                <Timeline.Item
                  key={interview.id}
                  bullet={
                    <ThemeIcon
                      size={28}
                      radius="xl"
                      color={getTypeColor(interview.type)}
                      variant="light"
                    >
                      {getTypeIcon(interview.type)}
                    </ThemeIcon>
                  }
                  title={
                    <Text size="sm" fw={500}>
                      {interview.candidate}
                    </Text>
                  }
                >
                  <Text size="xs" c="dimmed">
                    {interview.role} at {interview.company}
                  </Text>
                  <Group gap={4} mt={4}>
                    <Badge variant="light" size="xs" color="gray">
                      {interview.date}
                    </Badge>
                    <Badge variant="light" size="xs" color="gray">
                      {interview.time}
                    </Badge>
                  </Group>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
