import {
  Title,
  Text,
  Grid,
  Card,
  Group,
  ThemeIcon,
  Stack,
  Progress,
  Badge,
  Avatar,
  Box,
  Paper,
  RingProgress,
  SimpleGrid,
} from '@mantine/core';
import {
  IconUsers,
  IconBriefcase,
  IconCalendarEvent,
  IconUserCheck,
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change: number;
}

function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const isPositive = change > 0;
  return (
    <Card withBorder padding="lg">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {title}
          </Text>
          <Title order={2} mt={4}>
            {value}
          </Title>
        </div>
        <ThemeIcon size={48} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
      <Group gap={4} mt="md">
        {isPositive ? (
          <IconArrowUpRight size={16} color="var(--mantine-color-teal-6)" />
        ) : (
          <IconArrowDownRight size={16} color="var(--mantine-color-red-6)" />
        )}
        <Text size="sm" c={isPositive ? 'teal' : 'red'} fw={500}>
          {Math.abs(change)}%
        </Text>
        <Text size="xs" c="dimmed">
          vs last month
        </Text>
      </Group>
    </Card>
  );
}

const pipelineStages = [
  { stage: 'Applied', count: 245, color: 'blue' },
  { stage: 'Screening', count: 128, color: 'cyan' },
  { stage: 'Interview', count: 86, color: 'teal' },
  { stage: 'Assessment', count: 42, color: 'yellow' },
  { stage: 'Offer', count: 18, color: 'orange' },
  { stage: 'Hired', count: 12, color: 'green' },
];

const recentActivity = [
  {
    id: '1',
    type: 'candidate_added',
    description: 'Robert Wolf was added as a new candidate',
    timestamp: '2 hours ago',
    user: { firstName: 'Jenny', lastName: 'Chen' },
  },
  {
    id: '2',
    type: 'interview_scheduled',
    description: 'Interview scheduled with Jill Lenon for Senior Engineer role',
    timestamp: '4 hours ago',
    user: { firstName: 'Mark', lastName: 'Williams' },
  },
  {
    id: '3',
    type: 'status_changed',
    description: 'Noah Brown moved to Rejected stage',
    timestamp: '6 hours ago',
    user: { firstName: 'Sarah', lastName: 'Johnson' },
  },
  {
    id: '4',
    type: 'note_added',
    description: 'Note added to Sophia Martinez profile',
    timestamp: '8 hours ago',
    user: { firstName: 'Jenny', lastName: 'Chen' },
  },
  {
    id: '5',
    type: 'job_created',
    description: 'New job posted: Frontend Engineer at Microsoft',
    timestamp: '1 day ago',
    user: { firstName: 'David', lastName: 'Kim' },
  },
];

export function Dashboard() {
  const totalPipeline = pipelineStages.reduce((sum, s) => sum + s.count, 0);

  return (
    <Box>
      <Title order={2} c="blue.7" mb={4}>
        Dashboard
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Welcome back! Here's an overview of your recruitment activity.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <StatCard
          title="Total Candidates"
          value="17,952"
          icon={<IconUsers size={24} />}
          color="blue"
          change={12}
        />
        <StatCard
          title="Active Jobs"
          value="24"
          icon={<IconBriefcase size={24} />}
          color="teal"
          change={8}
        />
        <StatCard
          title="Interviews This Week"
          value="18"
          icon={<IconCalendarEvent size={24} />}
          color="yellow"
          change={-5}
        />
        <StatCard
          title="Placements This Month"
          value="7"
          icon={<IconUserCheck size={24} />}
          color="green"
          change={23}
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder padding="lg">
            <Title order={4} mb="md">
              Recruitment Pipeline
            </Title>
            <Stack gap="sm">
              {pipelineStages.map((stage) => (
                <div key={stage.stage}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={500}>
                      {stage.stage}
                    </Text>
                    <Group gap="xs">
                      <Text size="sm" fw={600}>
                        {stage.count}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ({Math.round((stage.count / totalPipeline) * 100)}%)
                      </Text>
                    </Group>
                  </Group>
                  <Progress
                    value={(stage.count / totalPipeline) * 100}
                    color={stage.color}
                    size="lg"
                    radius="xl"
                  />
                </div>
              ))}
            </Stack>

            <Group justify="center" mt="lg">
              <RingProgress
                size={140}
                thickness={14}
                roundCaps
                sections={pipelineStages.map((s) => ({
                  value: (s.count / totalPipeline) * 100,
                  color: `var(--mantine-color-${s.color}-6)`,
                }))}
                label={
                  <Text ta="center" size="lg" fw={700}>
                    {totalPipeline}
                  </Text>
                }
              />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={4} mb="md">
              Recent Activity
            </Title>
            <Stack gap="md">
              {recentActivity.map((activity) => (
                <Group key={activity.id} gap="sm" align="flex-start" wrap="nowrap">
                  <Avatar size="sm" radius="xl" color="blue">
                    {activity.user.firstName[0]}
                    {activity.user.lastName[0]}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" lineClamp={2}>
                      {activity.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {activity.timestamp}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
