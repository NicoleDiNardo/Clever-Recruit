import {
  Stack,
  Group,
  Text,
  Avatar,
  Badge,
  Divider,
  ActionIcon,
  Tabs,
  Card,
  Title,
  Box,
  Flex,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconEdit,
  IconSettings,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';
import type { Candidate } from '../../types';

interface CandidateDetailProps {
  candidate: Candidate;
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function CandidateDetail({
  candidate,
  currentIndex,
  total,
  onPrev,
  onNext,
  onClose,
}: CandidateDetailProps) {
  const getJobTitleColor = (title?: string) => {
    if (!title) return 'gray';
    const t = title.toLowerCase();
    if (t.includes('engineer') || t.includes('software')) return 'cyan';
    if (t.includes('designer')) return 'violet';
    if (t.includes('manager')) return 'teal';
    return 'blue';
  };

  return (
    <Stack gap="md">
      <Flex justify="space-between" align="center">
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={onPrev} disabled={currentIndex === 0}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text size="sm" c="dimmed">
            {currentIndex + 1}/{total}
          </Text>
          <ActionIcon variant="subtle" onClick={onNext} disabled={currentIndex === total - 1}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Flex>

      <Flex gap="md" align="flex-start">
        <Avatar src={candidate.avatar} size={80} radius="xl">
          {candidate.firstName[0]}
          {candidate.lastName[0]}
        </Avatar>
        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between">
            <Title order={4}>
              {candidate.firstName} {candidate.lastName}
            </Title>
            <Group gap={4}>
              <ActionIcon variant="subtle" size="sm">
                <IconSettings size={16} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="sm">
                <IconEdit size={16} />
              </ActionIcon>
            </Group>
          </Group>
          {candidate.jobTitle && (
            <Badge variant="light" color={getJobTitleColor(candidate.jobTitle)} size="sm" w="fit-content">
              {candidate.jobTitle}
            </Badge>
          )}
          <Group gap="xs">
            <IconMail size={14} color="gray" />
            <Text size="xs" c="dimmed">
              {candidate.email}
            </Text>
          </Group>
          <Group gap="xs">
            <IconPhone size={14} color="gray" />
            <Text size="xs" c="dimmed">
              {candidate.phone}
            </Text>
          </Group>
          <Group gap="sm" mt={4}>
            {candidate.score && (
              <Badge variant="light" color="teal" size="sm">
                {candidate.score}/100
              </Badge>
            )}
            {candidate.location && (
              <Badge variant="light" color="gray" size="sm" leftSection={<IconMapPin size={10} />}>
                {candidate.location}
              </Badge>
            )}
            {candidate.employmentStatus && (
              <Badge
                variant="light"
                color={candidate.employmentStatus === 'Employed' ? 'green' : 'red'}
                size="sm"
              >
                {candidate.employmentStatus}
              </Badge>
            )}
          </Group>
        </Stack>
      </Flex>

      <Divider />

      <Box>
        <Group grow>
          <div>
            <Text size="xs" fw={600} c="dimmed">
              Current Position
            </Text>
            <Text size="sm">{candidate.currentPosition || '—'}</Text>
          </div>
          <div>
            <Text size="xs" fw={600} c="dimmed">
              Current Organization
            </Text>
            <Text size="sm">{candidate.currentOrganization || '—'}</Text>
          </div>
        </Group>
      </Box>

      <Box>
        <Text size="xs" fw={600} c="dimmed">
          Owner
        </Text>
        <Group gap="xs" mt={4}>
          <Avatar size="xs" radius="xl" color="blue">
            JC
          </Avatar>
          <Text size="sm">jenny@cleverrecruit.com</Text>
        </Group>
      </Box>

      <Divider />

      <Box>
        <Title order={5} c="blue.7" mb="sm">
          Assignments
        </Title>
        {candidate.assignments && candidate.assignments.length > 0 ? (
          <Stack gap="xs">
            {candidate.assignments.map((assignment) => (
              <Card key={assignment.id} withBorder padding="sm">
                <Group justify="space-between">
                  <Group gap="sm">
                    <Avatar size="sm" radius="sm" color="gray">
                      {assignment.company?.name?.[0] || 'C'}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {assignment.job?.title || 'Role'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {assignment.company?.name || 'Company Name'}
                      </Text>
                    </div>
                  </Group>
                  <Badge variant="light" size="xs">
                    {assignment.type || assignment.stage}
                  </Badge>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Stack gap="xs">
            <Card withBorder padding="sm">
              <Group justify="space-between">
                <Group gap="sm">
                  <Avatar size="sm" radius="sm" color="gray">
                    C
                  </Avatar>
                  <div>
                    <Text size="sm" fw={500}>Role</Text>
                    <Text size="xs" c="dimmed">Company Name</Text>
                  </div>
                </Group>
                <Badge variant="light" size="xs">Technical Assignment</Badge>
              </Group>
            </Card>
            <Card withBorder padding="sm">
              <Group justify="space-between">
                <Group gap="sm">
                  <Avatar size="sm" radius="sm" color="gray">
                    C
                  </Avatar>
                  <div>
                    <Text size="sm" fw={500}>Role</Text>
                    <Text size="xs" c="dimmed">Company Name</Text>
                  </div>
                </Group>
                <Badge variant="light" size="xs">Assigned</Badge>
              </Group>
            </Card>
          </Stack>
        )}
      </Box>

      <Divider />

      <Tabs defaultValue="notes">
        <Tabs.List>
          <Tabs.Tab value="notes">Notes</Tabs.Tab>
          <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="notes" pt="sm">
          <Stack gap="xs">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} withBorder padding="sm">
                <Group justify="space-between" mb={4}>
                  <Text size="sm" fw={500}>
                    Note Title
                  </Text>
                  <Text size="xs" c="dimmed">
                    13/04/25 14:00
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  This is a note
                </Text>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="tasks" pt="sm">
          <Stack gap="xs">
            <Card withBorder padding="sm">
              <Text size="sm" fw={500}>
                Follow up on technical assessment
              </Text>
              <Text size="xs" c="dimmed">
                Due: 20/04/25
              </Text>
            </Card>
            <Card withBorder padding="sm">
              <Text size="sm" fw={500}>
                Schedule final interview
              </Text>
              <Text size="xs" c="dimmed">
                Due: 25/04/25
              </Text>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
