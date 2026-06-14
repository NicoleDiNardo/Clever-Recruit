import {
  Title,
  Text,
  Group,
  Card,
  Badge,
  Stack,
  Box,
  Grid,
  Progress,
  RingProgress,
  SimpleGrid,
  Table,
  ThemeIcon,
  Divider,
  Select,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBriefcase,
  IconClock,
  IconUserCheck,
  IconTarget,
  IconChartBar,
} from '@tabler/icons-react';

const hiringFunnel = [
  { stage: 'Applications Received', count: 1240, percentage: 100, color: 'blue' },
  { stage: 'Screening Passed', count: 680, percentage: 55, color: 'cyan' },
  { stage: 'Phone Interview', count: 340, percentage: 27, color: 'teal' },
  { stage: 'Technical Assessment', count: 180, percentage: 15, color: 'green' },
  { stage: 'Final Interview', count: 95, percentage: 8, color: 'yellow' },
  { stage: 'Offer Extended', count: 42, percentage: 3, color: 'orange' },
  { stage: 'Hired', count: 28, percentage: 2, color: 'red' },
];

const sourceBreakdown = [
  { source: 'LinkedIn', count: 420, percentage: 34, color: 'blue' },
  { source: 'Company Website', count: 285, percentage: 23, color: 'teal' },
  { source: 'Referrals', count: 248, percentage: 20, color: 'green' },
  { source: 'Job Boards', count: 162, percentage: 13, color: 'yellow' },
  { source: 'Agencies', count: 125, percentage: 10, color: 'orange' },
];

const topPerformers = [
  { name: 'Jenny Chen', placements: 12, interviews: 45, ratio: '27%' },
  { name: 'Mark Williams', placements: 9, interviews: 38, ratio: '24%' },
  { name: 'Sarah Johnson', placements: 7, interviews: 28, ratio: '25%' },
  { name: 'David Kim', placements: 5, interviews: 22, ratio: '23%' },
];

const monthlyMetrics = [
  { month: 'Jan', applications: 180, hires: 4 },
  { month: 'Feb', applications: 220, hires: 5 },
  { month: 'Mar', applications: 310, hires: 7 },
  { month: 'Apr', applications: 280, hires: 6 },
  { month: 'May', applications: 350, hires: 8 },
  { month: 'Jun', applications: 290, hires: 6 },
];

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend: number;
}

function MetricCard({ title, value, subtitle, icon, color, trend }: MetricCardProps) {
  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="xs">
        <ThemeIcon size={40} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <Group gap={4}>
          {trend > 0 ? (
            <IconTrendingUp size={16} color="var(--mantine-color-teal-6)" />
          ) : (
            <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />
          )}
          <Text size="xs" c={trend > 0 ? 'teal' : 'red'} fw={600}>
            {Math.abs(trend)}%
          </Text>
        </Group>
      </Group>
      <Text size="xl" fw={700}>
        {value}
      </Text>
      <Text size="xs" c="dimmed" fw={500} tt="uppercase">
        {title}
      </Text>
      <Text size="xs" c="dimmed" mt={2}>
        {subtitle}
      </Text>
    </Card>
  );
}

export function Reports() {
  return (
    <Box>
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2} c="blue.7">
            Reports & Analytics
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Track recruitment performance and hiring metrics.
          </Text>
        </div>
        <Select
          defaultValue="this-month"
          data={[
            { value: 'this-week', label: 'This Week' },
            { value: 'this-month', label: 'This Month' },
            { value: 'this-quarter', label: 'This Quarter' },
            { value: 'this-year', label: 'This Year' },
          ]}
          w={160}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <MetricCard
          title="Time to Hire"
          value="23 days"
          subtitle="Average across all positions"
          icon={<IconClock size={20} />}
          color="blue"
          trend={-8}
        />
        <MetricCard
          title="Offer Acceptance Rate"
          value="87%"
          subtitle="42 offers / 36 accepted"
          icon={<IconUserCheck size={20} />}
          color="teal"
          trend={5}
        />
        <MetricCard
          title="Cost Per Hire"
          value="$4,200"
          subtitle="Including all sources"
          icon={<IconTarget size={20} />}
          color="yellow"
          trend={-12}
        />
        <MetricCard
          title="Open Positions"
          value="24"
          subtitle="6 filled this month"
          icon={<IconBriefcase size={20} />}
          color="green"
          trend={15}
        />
      </SimpleGrid>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={4} mb="lg">
              Hiring Funnel
            </Title>
            <Stack gap="md">
              {hiringFunnel.map((stage, index) => (
                <div key={stage.stage}>
                  <Group justify="space-between" mb={4}>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {stage.stage}
                      </Text>
                      <Badge variant="light" size="xs" color={stage.color}>
                        {stage.count}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {stage.percentage}%
                      {index > 0 && (
                        <Text span c="dimmed" size="xs">
                          {' '}
                          ({Math.round((stage.count / hiringFunnel[index - 1].count) * 100)}%
                          conversion)
                        </Text>
                      )}
                    </Text>
                  </Group>
                  <Progress
                    value={stage.percentage}
                    color={stage.color}
                    size="md"
                    radius="xl"
                  />
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={4} mb="lg">
              Source Breakdown
            </Title>
            <Group justify="center" mb="lg">
              <RingProgress
                size={160}
                thickness={20}
                roundCaps
                sections={sourceBreakdown.map((s) => ({
                  value: s.percentage,
                  color: `var(--mantine-color-${s.color}-6)`,
                }))}
                label={
                  <Stack gap={0} align="center">
                    <Text size="xl" fw={700}>
                      1,240
                    </Text>
                    <Text size="xs" c="dimmed">
                      Total
                    </Text>
                  </Stack>
                }
              />
            </Group>
            <Stack gap="xs">
              {sourceBreakdown.map((source) => (
                <Group key={source.source} justify="space-between">
                  <Group gap="xs">
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: `var(--mantine-color-${source.color}-6)`,
                      }}
                    />
                    <Text size="sm">{source.source}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" fw={600}>
                      {source.count}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({source.percentage}%)
                    </Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg">
            <Title order={4} mb="md">
              Monthly Hiring Trends
            </Title>
            <Stack gap="sm">
              {monthlyMetrics.map((m) => (
                <div key={m.month}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={500}>
                      {m.month} 2025
                    </Text>
                    <Group gap="md">
                      <Text size="xs" c="dimmed">
                        {m.applications} apps
                      </Text>
                      <Badge variant="light" color="green" size="xs">
                        {m.hires} hires
                      </Badge>
                    </Group>
                  </Group>
                  <Group gap={4}>
                    <Progress
                      value={(m.applications / 400) * 100}
                      color="blue"
                      size="sm"
                      radius="xl"
                      style={{ flex: 1 }}
                    />
                  </Group>
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg">
            <Title order={4} mb="md">
              Top Recruiters
            </Title>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Recruiter</Table.Th>
                  <Table.Th>Placements</Table.Th>
                  <Table.Th>Interviews</Table.Th>
                  <Table.Th>Success Rate</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topPerformers.map((p, i) => (
                  <Table.Tr key={p.name}>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="light" size="xs" color="blue" circle>
                          {i + 1}
                        </Badge>
                        <Text size="sm" fw={500}>
                          {p.name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600} c="teal">
                        {p.placements}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{p.interviews}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="green" size="sm">
                        {p.ratio}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
