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
  Select,
  Paper,
  Stack,
  Menu,
  ActionIcon,
  Checkbox,
  Button,
  Divider,
  Anchor,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconDots,
  IconCheck,
  IconBan,
  IconStar,
  IconStarFilled,
  IconLayoutKanban,
  IconGripVertical,
  IconArrowLeft,
  IconUsers,
} from '@tabler/icons-react';
import { useCandidates } from '../../context/CandidatesContext';
import { usePermissions } from '../../hooks/usePermissions';
import { mockJobs } from '../../data/mockData';
import type { Candidate } from '../../types';
import { getStageColor, PIPELINE_STAGE_OPTIONS } from '../../utils/statusColors';
import { EmptyState } from '../../components/EmptyState';

/**
 * Board columns. Every stage a candidate can actually hold gets a column —
 * including 'rejected' and 'withdrawn' — rather than hiding terminal
 * candidates off-board, since the audit's acceptance criteria call for
 * seeing and moving candidates "across stages," not just the active ones.
 */
const BOARD_STAGES = PIPELINE_STAGE_OPTIONS;

function candidateName(c: Candidate) {
  return `${c.firstName} ${c.lastName}`;
}

/**
 * A candidate has no real foreign key to a Job in this dataset — Assignment
 * exists as a type but is never populated in mockData.ts. The Jobs list
 * page already established the only linkage that does exist: a
 * case-insensitive match of Candidate.jobTitle against Job.title (see
 * Jobs/index.tsx's candidateCounts). Reused here rather than inventing a
 * second, different linkage for this one page.
 */
function candidateMatchesJob(candidate: Candidate, jobTitle: string) {
  return (candidate.jobTitle ?? '').toUpperCase() === jobTitle.toUpperCase();
}

export function Pipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { candidates, updateCandidate } = useCandidates();
  const { can, role } = usePermissions();
  const canManage = can('candidates.manage');
  const canReviewOnly = role === 'hiring_manager';

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragCandidateId, setDragCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const job = useMemo(() => (jobId ? mockJobs.find((j) => j.id === jobId) : undefined), [jobId]);

  // A jobId was given in the URL but doesn't match any job — distinct from
  // the job existing with zero candidates (handled further down as the
  // whole-board empty state).
  const jobNotFound = Boolean(jobId) && !job;

  const scopedCandidates = useMemo(() => {
    if (!jobId) return candidates;
    if (!job) return [];
    return candidates.filter((c) => candidateMatchesJob(c, job.title));
  }, [candidates, jobId, job]);

  const selectedCandidates = useMemo(
    () => scopedCandidates.filter((c) => selectedIds.has(c.id)),
    [scopedCandidates, selectedIds]
  );

  const columns = useMemo(() => {
    const map = new Map<string, Candidate[]>();
    BOARD_STAGES.forEach((s) => map.set(s.value, []));
    scopedCandidates.forEach((c) => {
      const stage = c.stage ?? 'applied';
      const bucket = map.get(stage) ?? map.get('applied')!;
      bucket.push(c);
    });
    return map;
  }, [scopedCandidates]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const moveOne = (candidate: Candidate, stage: string, { silent = false }: { silent?: boolean } = {}) => {
    if (candidate.stage === stage) return;
    updateCandidate(candidate.id, { stage });
    if (!silent) {
      notifications.show({
        message: `${candidateName(candidate)} moved to ${BOARD_STAGES.find((s) => s.value === stage)?.label ?? stage}.`,
        color: 'blue',
        icon: <IconCheck size={16} />,
      });
    }
  };

  const rejectOne = (candidate: Candidate) => {
    if (candidate.stage === 'rejected') return;
    const previousStage = candidate.stage;
    updateCandidate(candidate.id, { stage: 'rejected' });
    const toastId = notifications.show({
      title: 'Candidate rejected',
      message: (
        <Group gap={6} wrap="nowrap">
          <Text size="sm">{candidateName(candidate)} won't move forward on this role.</Text>
          <Text
            size="sm"
            fw={600}
            c="blue"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => {
              updateCandidate(candidate.id, { stage: previousStage });
              notifications.hide(toastId);
            }}
          >
            Undo
          </Text>
        </Group>
      ),
      color: 'red',
      autoClose: 7000,
    });
  };

  const toggleShortlist = (candidate: Candidate) => {
    const next = !candidate.shortlisted;
    updateCandidate(candidate.id, { shortlisted: next });
    notifications.show({
      message: next
        ? `${candidateName(candidate)} shortlisted for the recruiter's attention.`
        : `${candidateName(candidate)} removed from the shortlist.`,
      color: 'yellow',
    });
  };

  // A bulk move that would affect nobody (everyone selected is already at
  // the target stage) is disabled with a reason rather than silently
  // running and changing nothing — AUD-P1-01's "bulk action affecting zero
  // records" state.
  const bulkMoveCount = (stage: string) => selectedCandidates.filter((c) => c.stage !== stage).length;

  const handleBulkMove = (stage: string) => {
    const targets = selectedCandidates.filter((c) => c.stage !== stage);
    if (targets.length === 0) return;
    targets.forEach((c) => moveOne(c, stage, { silent: true }));
    notifications.show({
      message: `${targets.length} candidate${targets.length === 1 ? '' : 's'} moved to ${
        BOARD_STAGES.find((s) => s.value === stage)?.label ?? stage
      }.`,
      color: 'blue',
      icon: <IconCheck size={16} />,
    });
    clearSelection();
  };

  const handleBulkReject = () => {
    const targets = selectedCandidates.filter((c) => c.stage !== 'rejected');
    if (targets.length === 0) return;
    const undoMap = targets.map((c) => ({ id: c.id, previousStage: c.stage }));
    targets.forEach((c) => updateCandidate(c.id, { stage: 'rejected' }));
    const toastId = notifications.show({
      title: `${targets.length} candidate${targets.length === 1 ? '' : 's'} rejected`,
      message: (
        <Group gap={6} wrap="nowrap">
          <Text size="sm">They won't move forward on this role.</Text>
          <Text
            size="sm"
            fw={600}
            c="blue"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => {
              undoMap.forEach(({ id, previousStage }) => updateCandidate(id, { stage: previousStage }));
              notifications.hide(toastId);
            }}
          >
            Undo
          </Text>
        </Group>
      ),
      color: 'red',
      autoClose: 7000,
    });
    clearSelection();
  };

  const handleDrop = (stage: string) => {
    setDragOverStage(null);
    if (!canManage || !dragCandidateId) return;
    const candidate = scopedCandidates.find((c) => c.id === dragCandidateId);
    setDragCandidateId(null);
    if (!candidate) return;
    moveOne(candidate, stage);
  };

  if (jobNotFound) {
    return (
      <EmptyState
        icon={IconLayoutKanban}
        title="Job not found"
        description="This job may have been removed. Check the Jobs list for the current roles."
        actionLabel="Back to Pipeline"
        onAction={() => navigate('/pipeline')}
      />
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          {job && (
            <Anchor
              component="button"
              type="button"
              size="sm"
              c="dimmed"
              onClick={() => navigate('/pipeline')}
              mb={4}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <IconArrowLeft size={14} /> All jobs
            </Anchor>
          )}
          <Title order={2}>{job ? `Pipeline · ${job.title}` : 'Pipeline'}</Title>
          <Text c="dimmed" size="sm">
            {job
              ? `Candidates for this role, grouped by stage.`
              : 'Every candidate across every job, grouped by stage.'}
          </Text>
        </div>
        <Select
          placeholder="Filter by job"
          data={[{ value: '', label: 'All jobs' }, ...mockJobs.map((j) => ({ value: j.id, label: j.title }))]}
          value={job?.id ?? ''}
          onChange={(value) => navigate(value ? `/pipeline/${value}` : '/pipeline')}
          w={260}
          clearable={false}
        />
      </Flex>

      {canReviewOnly && (
        <Text size="xs" c="dimmed" mb="md">
          Viewing as hiring manager — you can shortlist or reject a candidate; free stage moves are recruiter/admin
          only.
        </Text>
      )}

      {selectedIds.size > 0 && (
        <Paper withBorder p="sm" mb="md" radius="md" style={{ position: 'sticky', top: 0, zIndex: 5 }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap="sm">
            <Text size="sm" fw={600}>
              {selectedIds.size} selected
            </Text>
            <Group gap="xs">
              {canManage && (
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <Button size="xs" variant="light">
                      Move to...
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {BOARD_STAGES.map((s) => {
                      const count = bulkMoveCount(s.value);
                      return (
                        <Menu.Item
                          key={s.value}
                          disabled={count === 0}
                          onClick={() => handleBulkMove(s.value)}
                        >
                          {s.label}
                          {count === 0 && (
                            <Text span size="xs" c="dimmed" ml={6}>
                              (no change)
                            </Text>
                          )}
                        </Menu.Item>
                      );
                    })}
                  </Menu.Dropdown>
                </Menu>
              )}
              {(canManage || canReviewOnly) && (
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconBan size={14} />}
                  disabled={selectedCandidates.every((c) => c.stage === 'rejected')}
                  onClick={handleBulkReject}
                >
                  Reject
                </Button>
              )}
              <Button size="xs" variant="subtle" color="gray" onClick={clearSelection}>
                Clear
              </Button>
            </Group>
          </Flex>
        </Paper>
      )}

      {scopedCandidates.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title={job ? `No candidates for ${job.title} yet` : 'No candidates yet'}
          description={
            job
              ? 'Once someone applies to this role, or a recruiter adds them here, they will show up on this board.'
              : 'Candidates will appear here once they apply or are added from the Candidates page.'
          }
        />
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Flex gap="md" align="flex-start" style={{ minWidth: BOARD_STAGES.length * 260 }}>
            {BOARD_STAGES.map((stage) => {
              const cards = columns.get(stage.value) ?? [];
              const isDragOver = dragOverStage === stage.value;
              return (
                <Paper
                  key={stage.value}
                  withBorder
                  radius="md"
                  p="xs"
                  w={260}
                  bg={isDragOver ? 'var(--mantine-color-blue-0)' : undefined}
                  onDragOver={(e) => {
                    if (!canManage) return;
                    e.preventDefault();
                    setDragOverStage(stage.value);
                  }}
                  onDragLeave={() => setDragOverStage((s) => (s === stage.value ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(stage.value);
                  }}
                >
                  <Group justify="space-between" mb="xs" px={4}>
                    <Group gap={6}>
                      <Badge variant="dot" color={getStageColor(stage.value)} size="sm">
                        {stage.label}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {cards.length}
                    </Text>
                  </Group>

                  {cards.length === 0 ? (
                    <Box
                      py="md"
                      px={6}
                      style={{ border: '1px dashed var(--mantine-color-gray-4)', borderRadius: 8 }}
                    >
                      <Text size="xs" c="dimmed" ta="center">
                        No candidates in {stage.label}
                      </Text>
                    </Box>
                  ) : (
                    <Stack gap={6}>
                      {cards.map((candidate) => {
                        const initials = `${candidate.firstName?.[0] ?? ''}${candidate.lastName?.[0] ?? ''}`;
                        const checked = selectedIds.has(candidate.id);
                        return (
                          <Paper
                            key={candidate.id}
                            withBorder
                            radius="sm"
                            p="xs"
                            draggable={canManage}
                            onDragStart={() => setDragCandidateId(candidate.id)}
                            onDragEnd={() => {
                              setDragCandidateId(null);
                              setDragOverStage(null);
                            }}
                            style={{ cursor: canManage ? 'grab' : 'default' }}
                          >
                            <Flex justify="space-between" align="flex-start" gap={4}>
                              <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                                <Checkbox
                                  size="xs"
                                  checked={checked}
                                  onChange={() => toggleSelected(candidate.id)}
                                  aria-label={`Select ${candidateName(candidate)}`}
                                  mt={2}
                                />
                                <Avatar size="sm" radius="xl" color="blue" src={candidate.avatar}>
                                  {initials || '?'}
                                </Avatar>
                                <Box style={{ minWidth: 0 }}>
                                  <Text fw={600} size="xs" truncate>
                                    {candidateName(candidate)}
                                  </Text>
                                  {!job && candidate.jobTitle && (
                                    <Text size="xs" c="dimmed" truncate>
                                      {candidate.jobTitle}
                                    </Text>
                                  )}
                                </Box>
                              </Group>
                              <Group gap={2} wrap="nowrap">
                                {candidate.shortlisted && (
                                  <ThemeIcon size="xs" variant="transparent" color="yellow">
                                    <IconStarFilled size={12} />
                                  </ThemeIcon>
                                )}
                                {canManage && (
                                  <Box style={{ cursor: 'grab' }} aria-hidden>
                                    <IconGripVertical size={14} color="var(--mantine-color-gray-5)" />
                                  </Box>
                                )}
                                <Menu shadow="md" position="bottom-end" withinPortal>
                                  <Menu.Target>
                                    <ActionIcon
                                      variant="subtle"
                                      color="gray"
                                      size="sm"
                                      aria-label={`Actions for ${candidateName(candidate)}`}
                                    >
                                      <IconDots size={14} />
                                    </ActionIcon>
                                  </Menu.Target>
                                  <Menu.Dropdown>
                                    {canManage && (
                                      <>
                                        <Menu.Label>Move to...</Menu.Label>
                                        {BOARD_STAGES.filter((s) => s.value !== (candidate.stage ?? 'applied')).map(
                                          (s) => (
                                            <Menu.Item key={s.value} onClick={() => moveOne(candidate, s.value)}>
                                              {s.label}
                                            </Menu.Item>
                                          )
                                        )}
                                        <Menu.Divider />
                                      </>
                                    )}
                                    {canReviewOnly && (
                                      <Menu.Item
                                        leftSection={
                                          candidate.shortlisted ? (
                                            <IconStarFilled size={14} />
                                          ) : (
                                            <IconStar size={14} />
                                          )
                                        }
                                        onClick={() => toggleShortlist(candidate)}
                                      >
                                        {candidate.shortlisted ? 'Remove from shortlist' : 'Shortlist'}
                                      </Menu.Item>
                                    )}
                                    {(canManage || canReviewOnly) && candidate.stage !== 'rejected' && (
                                      <Menu.Item
                                        color="red"
                                        leftSection={<IconBan size={14} />}
                                        onClick={() => rejectOne(candidate)}
                                      >
                                        Reject
                                      </Menu.Item>
                                    )}
                                  </Menu.Dropdown>
                                </Menu>
                              </Group>
                            </Flex>
                            {candidate.score != null && (
                              <>
                                <Divider my={6} />
                                <Text size="xs" c="dimmed">
                                  Score: {candidate.score}/100
                                </Text>
                              </>
                            )}
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </Flex>
        </Box>
      )}
    </Box>
  );
}
