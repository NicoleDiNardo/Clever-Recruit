import { useState } from 'react';
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
  Drawer,
  Button,
  ActionIcon,
  Table,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconUsers,
  IconBriefcase,
  IconUserCheck,
  IconMail,
  IconPhone,
  IconCalendar,
  IconX,
} from '@tabler/icons-react';
import { mockUsers, mockCandidates } from '../../data/mockData';

interface TeamMember {
  user: typeof mockUsers[0];
  stats: {
    candidates: number;
    activeAssignments: number;
    placements: number;
  };
}

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: () => void;
}

function TeamMemberCard({ member, onClick }: TeamMemberCardProps) {
  const { user, stats } = member;
  const total = stats.candidates + stats.activeAssignments + stats.placements;
  return (
    <Card withBorder padding="lg" style={{ cursor: 'pointer' }} onClick={onClick}>
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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const teamStats: TeamMember[] = mockUsers.map((user) => {
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

  const handleCardClick = (member: TeamMember) => {
    setSelectedMember(member);
    openDrawer();
  };

  const memberCandidates = selectedMember
    ? mockCandidates.filter((c) => c.ownerId === selectedMember.user.id)
    : [];

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
        {teamStats.map((member) => (
          <TeamMemberCard
            key={member.user.id}
            member={member}
            onClick={() => handleCardClick(member)}
          />
        ))}
      </SimpleGrid>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        size={isMobile ? '100%' : 'md'}
        title={null}
        withCloseButton={false}
      >
        {selectedMember && (
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Team Member</Title>
              <ActionIcon variant="subtle" onClick={closeDrawer}>
                <IconX size={18} />
              </ActionIcon>
            </Group>

            <Group gap="md">
              <Avatar size={72} radius="xl" color="blue">
                {selectedMember.user.firstName[0]}
                {selectedMember.user.lastName[0]}
              </Avatar>
              <div>
                <Text fw={700} size="lg">
                  {selectedMember.user.firstName} {selectedMember.user.lastName}
                </Text>
                <Badge variant="light" color="blue" size="sm">
                  {selectedMember.user.role}
                </Badge>
              </div>
            </Group>

            <Divider />

            <Stack gap="xs">
              <Group gap="xs">
                <IconMail size={16} color="gray" />
                <Text size="sm">{selectedMember.user.email}</Text>
              </Group>
              <Group gap="xs">
                <IconPhone size={16} color="gray" />
                <Text size="sm">+1 (555) 000-0000</Text>
              </Group>
              <Group gap="xs">
                <IconCalendar size={16} color="gray" />
                <Text size="sm">Joined {new Date(selectedMember.user.createdAt).toLocaleDateString()}</Text>
              </Group>
            </Stack>

            <Divider />

            <SimpleGrid cols={3}>
              <Card withBorder p="sm" ta="center">
                <Text size="xl" fw={700} c="blue">{selectedMember.stats.candidates}</Text>
                <Text size="xs" c="dimmed">Candidates</Text>
              </Card>
              <Card withBorder p="sm" ta="center">
                <Text size="xl" fw={700} c="teal">{selectedMember.stats.activeAssignments}</Text>
                <Text size="xs" c="dimmed">Active</Text>
              </Card>
              <Card withBorder p="sm" ta="center">
                <Text size="xl" fw={700} c="green">{selectedMember.stats.placements}</Text>
                <Text size="xs" c="dimmed">Placed</Text>
              </Card>
            </SimpleGrid>

            <Divider />

            <Title order={5}>Managed Candidates</Title>
            {memberCandidates.length > 0 ? (
              <Table verticalSpacing="xs" striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Score</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {memberCandidates.map((c) => (
                    <Table.Tr key={c.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{c.firstName} {c.lastName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" size="xs" color={c.status === 'active' ? 'green' : 'gray'}>
                          {c.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{c.score}/100</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text size="sm" c="dimmed">No candidates assigned.</Text>
            )}
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
