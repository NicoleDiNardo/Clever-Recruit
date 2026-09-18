import { useState } from 'react';
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
  Button,
  Select,
  Textarea,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconMapPin,
  IconStar,
  IconStarFilled,
  IconBan,
} from '@tabler/icons-react';
import type { Candidate } from '../../types';
import {
  getEmploymentColor,
  getJobTitleColor,
  getStageColor,
} from '../../utils/statusColors';

interface CandidateDetailProps {
  candidate: Candidate;
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  /** Only recruiters/admins get these — see AUD-P0-01. Omitting a handler
   *  hides its control rather than rendering a button that does nothing. */
  onEdit?: () => void;
  onDelete?: () => void;
  onStageChange?: (stage: string) => void;
  /** Hiring-manager-specific actions — flows 13/14/17. */
  onShortlist?: () => void;
  onReject?: () => void;
  onAddFeedback?: (recommendation: 'yes' | 'no' | 'maybe', comment: string) => void;
}

const STAGE_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const RECOMMENDATION_OPTIONS = [
  { value: 'yes', label: 'Yes — move forward' },
  { value: 'maybe', label: 'Maybe — worth discussing' },
  { value: 'no', label: 'No — not a fit' },
];

const RECOMMENDATION_COLOR: Record<string, string> = { yes: 'green', maybe: 'yellow', no: 'red' };

export function CandidateDetail({
  candidate,
  currentIndex,
  total,
  onPrev,
  onNext,
  onClose,
  onEdit,
  onDelete,
  onStageChange,
  onShortlist,
  onReject,
  onAddFeedback,
}: CandidateDetailProps) {
  const [recommendation, setRecommendation] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [comment, setComment] = useState('');

  const handleSubmitFeedback = () => {
    onAddFeedback?.(recommendation, comment);
    setComment('');
  };

  return (
    <Stack gap="md">
      <Flex justify="space-between" align="center">
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={onPrev} disabled={currentIndex === 0} aria-label="Previous candidate">
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text size="sm" c="dimmed">
            {currentIndex + 1}/{total}
          </Text>
          <ActionIcon variant="subtle" onClick={onNext} disabled={currentIndex === total - 1} aria-label="Next candidate">
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <ActionIcon variant="subtle" onClick={onClose} aria-label="Close candidate details">
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
            <Group gap="xs">
              <Title order={4}>
                {candidate.firstName} {candidate.lastName}
              </Title>
              {candidate.shortlisted && (
                <Badge color="yellow" variant="light" size="sm" leftSection={<IconStarFilled size={10} />}>
                  Shortlisted
                </Badge>
              )}
            </Group>
            {(onEdit || onDelete) && (
              <Group gap={4}>
                {onEdit && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={onEdit}
                    aria-label={`Edit ${candidate.firstName} ${candidate.lastName}`}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
                {onDelete && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="red"
                    onClick={onDelete}
                    aria-label={`Delete ${candidate.firstName} ${candidate.lastName}`}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            )}
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
                color={getEmploymentColor(candidate.employmentStatus)}
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
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Pipeline stage
        </Text>
        {onStageChange ? (
          <Select
            data={STAGE_OPTIONS}
            value={candidate.stage ?? 'applied'}
            onChange={(value) => value && onStageChange(value)}
            allowDeselect={false}
          />
        ) : (
          <Group gap="xs">
            <Badge variant="light" color={getStageColor(candidate.stage)} size="lg">
              {candidate.stage ?? 'applied'}
            </Badge>
            <Text size="xs" c="dimmed">
              Only recruiters and admins can move a candidate through stages directly.
            </Text>
          </Group>
        )}
      </Box>

      {(onShortlist || onReject) && (
        <Group gap="sm">
          {onShortlist && (
            <Button
              variant={candidate.shortlisted ? 'filled' : 'light'}
              color="yellow"
              size="xs"
              leftSection={candidate.shortlisted ? <IconStarFilled size={14} /> : <IconStar size={14} />}
              onClick={onShortlist}
            >
              {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
            </Button>
          )}
          {onReject && candidate.stage !== 'rejected' && (
            <Button variant="light" color="red" size="xs" leftSection={<IconBan size={14} />} onClick={onReject}>
              Reject
            </Button>
          )}
        </Group>
      )}

      <Divider />

      <Box>
        <Text size="xs" fw={600} c="dimmed">
          Owner
        </Text>
        <Group gap="xs" mt={4}>
          <Avatar size="xs" radius="xl" color="blue">
            {candidate.owner?.firstName?.[0] ?? 'J'}
            {candidate.owner?.lastName?.[0] ?? 'C'}
          </Avatar>
          <Text size="sm">
            {candidate.owner?.email ?? 'jenny@cleverrecruit.com'}
          </Text>
        </Group>
      </Box>

      <Divider />

      <Box>
        <Title order={4} mb="md">
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
          <Text size="sm" c="dimmed">No assignments yet</Text>
        )}
      </Box>

      <Divider />

      <Tabs defaultValue="notes">
        <Tabs.List>
          <Tabs.Tab value="notes">Notes</Tabs.Tab>
          <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
          <Tabs.Tab value="feedback">
            Feedback{candidate.feedback?.length ? ` (${candidate.feedback.length})` : ''}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="notes" pt="sm">
          <Stack gap="xs">
            <Card withBorder padding="sm">
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={500}>Initial screening completed</Text>
                <Text size="xs" c="dimmed">13/04/25 14:00</Text>
              </Group>
              <Text size="xs" c="dimmed">
                Candidate showed strong technical skills during the initial phone screen.
              </Text>
            </Card>
            <Card withBorder padding="sm">
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={500}>Resume reviewed</Text>
                <Text size="xs" c="dimmed">10/04/25 09:30</Text>
              </Group>
              <Text size="xs" c="dimmed">
                Good experience with relevant technologies. Moving forward.
              </Text>
            </Card>
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

        <Tabs.Panel value="feedback" pt="sm">
          <Stack gap="sm">
            {candidate.feedback && candidate.feedback.length > 0 ? (
              candidate.feedback.map((f) => (
                <Card key={f.id} withBorder padding="sm">
                  <Group justify="space-between" mb={4}>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{f.authorName}</Text>
                      <Badge size="xs" color={RECOMMENDATION_COLOR[f.recommendation]} variant="light">
                        {f.recommendation}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{new Date(f.createdAt).toLocaleDateString()}</Text>
                  </Group>
                  {f.comment && <Text size="xs" c="dimmed">{f.comment}</Text>}
                </Card>
              ))
            ) : (
              <Text size="sm" c="dimmed">No feedback yet.</Text>
            )}

            {onAddFeedback && (
              <Card withBorder padding="sm">
                <Text size="xs" fw={600} c="dimmed" mb={6}>
                  Leave feedback
                </Text>
                <Stack gap="xs">
                  <Select
                    aria-label="Recommendation"
                    data={RECOMMENDATION_OPTIONS}
                    value={recommendation}
                    onChange={(v) => v && setRecommendation(v as 'yes' | 'no' | 'maybe')}
                    allowDeselect={false}
                    size="xs"
                  />
                  <Textarea
                    aria-label="Feedback comment"
                    placeholder="Optional comment for the recruiter..."
                    value={comment}
                    onChange={(e) => setComment(e.currentTarget.value)}
                    minRows={2}
                    size="xs"
                  />
                  <Button size="xs" onClick={handleSubmitFeedback} style={{ alignSelf: 'flex-start' }}>
                    Submit feedback
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {(onEdit || onDelete) && (
        <>
          <Divider />
          <Group>
            {onEdit && (
              <Button variant="light" leftSection={<IconEdit size={16} />} onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="light" color="red" leftSection={<IconTrash size={16} />} onClick={onDelete}>
                Delete
              </Button>
            )}
          </Group>
        </>
      )}
    </Stack>
  );
}
