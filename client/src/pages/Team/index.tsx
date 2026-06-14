import {
  Title,
  Text,
  Group,
  Avatar,
  Card,
  SimpleGrid,
  Box,
  Badge,
  Stack,
  Progress,
  Divider,
} from '@mantine/core';
import {
  IconUsers,
  IconBriefcase,
  IconUserCheck,
  IconMail,
} from '@tabler/icons-react';
import { mockUsers, mockCandidates } from '../../data/mockData';

interface TeamMemberCardProps {
  user: typeof mockUsers[0];
  stats: {
    candidates: number;
    activeAssignments: number;
    placements: number;
  };
}

function TeamMemberCard({ user, stats }: TeamMemberCardProps) {
  const total = stats.candidates + stats.activeAssignments + stats.placements;
  return (
    <Card withBorder padding="lg">
      <Group gap="md" mb="md">
        <Avatar size={56} radius="xl" color="blue">
          {user.firstName[0]}
          {user.lastName[0]}
        </Avatar>
        <div>
          <Text fw={600} size="md">
            {user.firstName} {user.lastName}
          </Text>
          <Badge variant="light" color="blue" size="sm">
            {user.role}
          </Badge>
        </div>
      </Group>

      <Group gap={4} mb="md">
        <IconMail size={14} color="gray" />
        <Text size="xs" c="dimmed">
          {user.email}
        </Text>
      </Group>

      <Divider mb="md" />

      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap={4}>
            <IconUsers size={14} />
            <Text size="xs">Candidates Managed</Text>
          </Group>
          <Text size="sm" fw={600}>
            {stats.candidates}
          </Text>
        </Group>

        <Group justify="space-between">
          <Group gap={4}>
            <IconBriefcase size={14} />
            <Text size="xs">Active Assignments</Text>
          </Group>
          <Text size="sm" fw={600}>
            {stats.activeAssignments}
          </Text>
        </Group>

        <Group justify="space-between">
          <Group gap={4}>
            <IconUserCheck size={14} />
            <Text size="xs">Placements</Text>
          </Group>
          <Text size="sm" fw={600}>
            {stats.placements}
          </Text>
        </Group>
      </Stack>

      <Divider my="sm" />

      <Text size="xs" c="dimmed" mb={4}>
        Workload
      </Text>
      <Progress
        value={Math.min((total / 30) * 100, 100)}
        color={total > 25 ? 'red' : total > 15 ? 'yellow' : 'teal'}
        size="sm"
        radius="xl"
      />
    </Card>
  );
}

export function Team() {
  const teamStats = mockUsers.map((user) => {
    const candidates = mockCandidates.filter((c) => c.ownerId === user.id).length;
    return {
      user,
      stats: {
        candidates,
        activeAssignments: Math.floor(candidates * 0.6),
        placements: Math.floor(candidates * 0.2),
      },
    };
  });

  return (
    <Box>
      <Group gap="sm" align="baseline" mb={4}>
        <Title order={2} c="blue.7">
          Team
        </Title>
        <Text c="dimmed" size="sm">
          ({mockUsers.length})
        </Text>
      </Group>
      <Text c="dimmed" size="sm" mb="xl">
        Your recruitment team members and their performance.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
        {teamStats.map(({ user, stats }) => (
          <TeamMemberCard key={user.id} user={user} stats={stats} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
