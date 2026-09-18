import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Switch,
  Badge,
  Avatar,
  ActionIcon,
  Table,
  Drawer,
  Stack,
  Pagination,
  Box,
  Flex,
  Menu,
  Modal,
  Select,
  Paper,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconSortAscending,
  IconSortDescending,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { CandidateDetail } from './CandidateDetail';
import { CreateCandidateForm } from './CreateCandidateForm';
import type { Candidate } from '../../types';
import { useEmbedMode } from '../../hooks/useEmbedMode';
import { useSearchParams } from 'react-router-dom';
import { useCandidates } from '../../context/CandidatesContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useUser } from '../../context/UserContext';
import {
  getStageColor,
  getStatusColor,
  getJobTitleColor,
} from '../../utils/statusColors';


const PIPELINE_STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export function Candidates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromUrl = searchParams.get('stage');
  const { candidates, setCandidates, updateCandidate, addCandidate, removeCandidate, resetCandidates } = useCandidates();
  const { can, role } = usePermissions();
  const { user: currentUser } = useUser();
  const canManage = can('candidates.manage');
  const [search, setSearch] = useState('');
  const [ownOnly, setOwnOnly] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<string | null>(stageFromUrl);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [filterOpened, { open: openFilter, close: closeFilter }] = useDisclosure(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null);
  const [rejectOpened, { open: openReject, close: closeReject }] = useDisclosure(false);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isEmbed = useEmbedMode();
  // Compact cards are a narrow-viewport affordance, not an embed one. The
  // embed is ~1200px wide on the case study page, which is where the dense
  // table earns its keep — keying this off isEmbed hid the table from every
  // reader of the case study.
  const showCompactList = isMobile;

  useEffect(() => {
    setFilterStage(stageFromUrl);
  }, [stageFromUrl]);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesOwner = !ownOnly || c.ownerId === '1';
    const matchesStatus = !filterStatus || c.status === filterStatus;
    const matchesStage = !filterStage || (c.stage ?? 'applied') === filterStage;
    const matchesRole = !filterRole || c.jobTitle === filterRole;
    return matchesSearch && matchesOwner && matchesStatus && matchesStage && matchesRole;
  });

  /* Role list comes from the data rather than a hardcoded enum, so it stays
     correct as candidates are added or edited. */
  const roleOptions = Array.from(
    new Set(candidates.map((c) => c.jobTitle).filter((t): t is string => Boolean(t)))
  )
    .sort()
    .map((title) => ({ value: title, label: title }));

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = (a as unknown as Record<string, unknown>)[sortBy] ?? '';
    const bVal = (b as unknown as Record<string, unknown>)[sortBy] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(sortedCandidates.length / pageSize));
  // page was never reset when a filter or the search changed, so narrowing 221
  // candidates to 3 while on page 6 sliced at offset 75 and rendered an empty
  // table — under a header reading "Candidates (3)", with the pagination
  // hidden because totalPages was 1, and no way back except clearing the search.
  const safePage = Math.min(page, totalPages);
  const paginatedCandidates = sortedCandidates.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectCandidate = (candidate: Candidate, index: number) => {
    setSelectedCandidate(candidate);
    setSelectedIndex(index);
    openDetail();
  };

  const handlePrevCandidate = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedCandidate(sortedCandidates[newIndex]);
    }
  };

  const handleNextCandidate = () => {
    if (selectedIndex < sortedCandidates.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedCandidate(sortedCandidates[newIndex]);
    }
  };

  const handleStageChange = (stage: string) => {
    if (!selectedCandidate) return;
    updateCandidate(selectedCandidate.id, { stage });
    const updated = { ...selectedCandidate, stage, updatedAt: new Date().toISOString() };
    setSelectedCandidate(updated);
    notifications.show({
      title: 'Stage updated',
      message: `${updated.firstName} ${updated.lastName} moved to ${PIPELINE_STAGES.find((s) => s.value === stage)?.label ?? stage}.`,
      color: 'blue',
      icon: <IconCheck size={16} />,
    });
  };

  /* Hiring managers can shortlist or reject without free run of every stage
     — AUD-P0-01's permission table. Shortlisting is non-destructive and
     applies immediately; rejecting is destructive-ish for the candidate's
     status page, so it goes through a confirm step plus a short undo
     window, per the edge-cases doc's "accidental rejection" entry. */
  const handleShortlistToggle = () => {
    if (!selectedCandidate) return;
    const next = !selectedCandidate.shortlisted;
    updateCandidate(selectedCandidate.id, { shortlisted: next });
    setSelectedCandidate({ ...selectedCandidate, shortlisted: next });
    notifications.show({
      message: next
        ? `${selectedCandidate.firstName} ${selectedCandidate.lastName} shortlisted for the recruiter's attention.`
        : `${selectedCandidate.firstName} ${selectedCandidate.lastName} removed from the shortlist.`,
      color: 'yellow',
    });
  };

  const confirmReject = () => {
    if (!candidateToReject) return;
    const previousStage = candidateToReject.stage;
    updateCandidate(candidateToReject.id, { stage: 'rejected' });
    if (selectedCandidate?.id === candidateToReject.id) {
      setSelectedCandidate({ ...selectedCandidate, stage: 'rejected' });
    }
    closeReject();
    const rejectedName = `${candidateToReject.firstName} ${candidateToReject.lastName}`;
    const toastId = notifications.show({
      title: 'Candidate rejected',
      message: (
        <Group gap={6} wrap="nowrap">
          <Text size="sm">{rejectedName} won't move forward on this role.</Text>
          <Text
            size="sm"
            fw={600}
            c="blue"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => {
              updateCandidate(candidateToReject.id, { stage: previousStage });
              if (selectedCandidate?.id === candidateToReject.id) {
                setSelectedCandidate({ ...selectedCandidate, stage: previousStage });
              }
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
    setCandidateToReject(null);
  };

  const handleAddFeedback = (recommendation: 'yes' | 'no' | 'maybe', comment: string) => {
    if (!selectedCandidate) return;
    const entry = {
      id: `f${Date.now()}`,
      recommendation,
      comment,
      authorId: currentUser.id,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date().toISOString(),
    };
    const feedback = [...(selectedCandidate.feedback ?? []), entry];
    updateCandidate(selectedCandidate.id, { feedback });
    setSelectedCandidate({ ...selectedCandidate, feedback });
    notifications.show({ message: 'Feedback shared with the recruiter.', color: 'blue' });
  };

  const clearStageFilter = () => {
    setFilterStage(null);
    setSearchParams({});
  };

  const handleCreateCandidate = (values: Record<string, unknown>) => {
    const newCandidate: Candidate = {
      id: String(Date.now()),
      firstName: values.firstName as string,
      lastName: values.lastName as string,
      email: values.email as string,
      phone: (values.phone as string) || '',
      avatar: undefined,
      jobTitle: (values.jobTitle as string) || undefined,
      score: (values.score as number) || undefined,
      status: (values.status as string) || 'active',
      stage: undefined,
      location: (values.location as string) || undefined,
      currentPosition: (values.currentPosition as string) || undefined,
      currentOrganization: (values.currentOrganization as string) || undefined,
      employmentStatus: (values.employmentStatus as string) || undefined,
      ownerId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addCandidate(newCandidate);
    closeCreate();
    notifications.show({
      title: 'Candidate Created',
      message: `${newCandidate.firstName} ${newCandidate.lastName} has been added.`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleEditCandidate = (values: Record<string, unknown>) => {
    if (!candidateToEdit) return;
    updateCandidate(candidateToEdit.id, {
      firstName: values.firstName as string,
      lastName: values.lastName as string,
      email: values.email as string,
      phone: (values.phone as string) || candidateToEdit.phone,
      jobTitle: (values.jobTitle as string) || candidateToEdit.jobTitle,
      score: (values.score as number) || candidateToEdit.score,
      status: (values.status as string) || candidateToEdit.status,
      location: (values.location as string) || candidateToEdit.location,
      currentPosition: (values.currentPosition as string) || candidateToEdit.currentPosition,
      currentOrganization: (values.currentOrganization as string) || candidateToEdit.currentOrganization,
      employmentStatus: (values.employmentStatus as string) || candidateToEdit.employmentStatus,
    });
    closeEditModal();
    notifications.show({
      title: 'Candidate Updated',
      message: `${values.firstName} ${values.lastName} has been updated.`,
      color: 'blue',
      icon: <IconCheck size={16} />,
    });
  };

  const handleDelete = () => {
    if (!candidateToDelete) return;
    removeCandidate(candidateToDelete.id);
    closeDelete();
    closeDetail();
    notifications.show({
      title: 'Candidate Deleted',
      message: `${candidateToDelete.firstName} ${candidateToDelete.lastName} has been removed.`,
      color: 'red',
      icon: <IconTrash size={16} />,
    });
    setCandidateToDelete(null);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <IconSortAscending size={14} />
    ) : (
      <IconSortDescending size={14} />
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="baseline">
            <Title order={1} size="h2" c="blue.7">
              Candidates
            </Title>
            <Text c="dimmed" size="sm">
              ({filteredCandidates.length})
            </Text>
          </Group>
          <Text c="dimmed" size="sm" mt={4}>
            Manage your candidates and their applications.
          </Text>
          {filterStage && (
            <Group gap="xs" mt="xs">
              <Badge variant="light" color="blue">
                Stage: {PIPELINE_STAGES.find((s) => s.value === filterStage)?.label ?? filterStage}
              </Badge>
              <Button variant="subtle" size="compact-xs" onClick={clearStageFilter}>
                Clear filter
              </Button>
            </Group>
          )}
        </div>
        {canManage && (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size={showCompactList ? 'sm' : 'md'}>
            {showCompactList ? 'Add' : 'Create new candidate'}
          </Button>
        )}
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        mb="md"
        wrap="wrap"
        gap="sm"
      >
        <TextInput
          aria-label="Search candidates"
          type="search"
          placeholder="Search"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={
            showCompactList
              ? { flex: '1 1 100%', minWidth: 0 }
              : { minWidth: 250, flex: isEmbed ? 1 : undefined }
          }
        />
        <Group gap="md" wrap="wrap">
          {!showCompactList && (
          <Switch
            label="Show only my candidates"
            checked={ownOnly}
            onChange={(e) => setOwnOnly(e.currentTarget.checked)}
            color="teal"
          />
          )}
          <Button variant="light" leftSection={<IconFilter size={16} />} onClick={openFilter} size={showCompactList ? 'sm' : 'md'}>
            {filterStatus ? `Filter: ${filterStatus}` : 'Open filters'}
          </Button>
          {filterStatus && (
            <ActionIcon variant="subtle" color="red" onClick={() => setFilterStatus(null)} size="sm" aria-label="Clear status filter">
              <IconX size={14} />
            </ActionIcon>
          )}
          {/* Edits persist to localStorage, so without this a visitor's second
              visit shows whatever the first one left behind. */}
          <Button
            variant="subtle"
            color="gray"
            size={showCompactList ? 'compact-sm' : 'compact-md'}
            onClick={() => {
              resetCandidates();
              setPage(1);
              notifications.show({ message: 'Demo data reset', color: 'blue' });
            }}
          >
            Reset demo data
          </Button>
        </Group>
      </Flex>

      {showCompactList ? (
        <Stack gap="sm" className="embed-candidate-cards">
          {paginatedCandidates.map((candidate, index) => (
            <Paper
              key={candidate.id}
              withBorder
              radius="md"
              p="sm"
              className="embed-candidate-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectCandidate(candidate, (page - 1) * pageSize + index)}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                  <Avatar src={candidate.avatar} radius="xl" size="md">
                    {candidate.firstName[0]}
                    {candidate.lastName[0]}
                  </Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm" truncate>
                      {candidate.firstName} {candidate.lastName}
                    </Text>
                    {candidate.jobTitle && (
                      <Text size="xs" c="dimmed" truncate>
                        {candidate.jobTitle}
                      </Text>
                    )}
                  </Box>
                </Group>
                <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                  <Badge variant="light" color={getStatusColor(candidate.status)} size="sm">
                    {candidate.status}
                  </Badge>
                  {candidate.score != null && (
                    <Text size="xs" c="dimmed">
                      {candidate.score}/100
                    </Text>
                  )}
                </Stack>
              </Group>
              <Badge
                variant="outline"
                color={getStageColor(candidate.stage ?? 'applied')}
                size="xs"
                mt="xs"
              >
                {candidate.stage ?? 'applied'}
              </Badge>
            </Paper>
          ))}
        </Stack>
      ) : (
      <Box style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('lastName')}
              >
                <Group gap={4}>
                  Candidate <SortIcon column="lastName" />
                </Group>
              </Table.Th>
              <Table.Th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('jobTitle')}
              >
                <Group gap={4}>
                  Job Title <SortIcon column="jobTitle" />
                </Group>
              </Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th style={{ whiteSpace: 'nowrap' }}>Phone</Table.Th>
              <Table.Th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('score')}
              >
                <Group gap={4}>
                  Score <SortIcon column="score" />
                </Group>
              </Table.Th>
              <Table.Th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('status')}
              >
                <Group gap={4}>
                  Status <SortIcon column="status" />
                </Group>
              </Table.Th>
              <Table.Th>Tools</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedCandidates.map((candidate, index) => (
              <Table.Tr
                key={candidate.id}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectCandidate(candidate, (page - 1) * pageSize + index)}
              >
                <Table.Td>
                  <Group gap="sm">
                    <Avatar src={candidate.avatar} radius="xl" size="md">
                      {candidate.firstName[0]}
                      {candidate.lastName[0]}
                    </Avatar>
                    <Text fw={500} size="sm">
                      {candidate.firstName} {candidate.lastName}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {candidate.jobTitle && (
                    <Badge
                      variant="light"
                      color={getJobTitleColor(candidate.jobTitle)}
                      size="sm"
                    >
                      {candidate.jobTitle}
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="blue.6">
                    {candidate.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                    {candidate.phone}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                    {candidate.score}
                    <Text span size="xs" c="dimmed">
                      /100
                    </Text>
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Badge
                      variant="light"
                      color={getStatusColor(candidate.status)}
                      size="sm"
                    >
                      {candidate.status}
                    </Badge>
                    {candidate.stage && (
                      <Badge
                        variant="light"
                        color={getStageColor(candidate.stage)}
                        size="sm"
                      >
                        {candidate.stage}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {canManage ? (
                    <Group gap={4} onClick={(e) => e.stopPropagation()}>
                      {/* Named per row: in a 221-row table, an unlabelled pencil
                          tells a screen-reader user nothing about which candidate
                          it edits. */}
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label={`Edit ${candidate.firstName} ${candidate.lastName}`}
                        onClick={() => {
                          setCandidateToEdit(candidate);
                          openEditModal();
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        aria-label={`Delete ${candidate.firstName} ${candidate.lastName}`}
                        onClick={() => {
                          setCandidateToDelete(candidate);
                          openDelete();
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                      <Menu shadow="md" width={160}>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label={`More actions for ${candidate.firstName} ${candidate.lastName}`}
                          >
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => {
                              setCandidateToEdit(candidate);
                              openEditModal();
                            }}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => {
                              setCandidateToDelete(candidate);
                              openDelete();
                            }}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  ) : (
                    candidate.shortlisted && (
                      <Badge size="xs" color="yellow" variant="light">
                        Shortlisted
                      </Badge>
                    )
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
      )}

      {/* There was no empty state: a search matching nothing rendered bare
          column headers, or on mobile nothing at all. */}
      {sortedCandidates.length === 0 && (
        <Flex direction="column" align="center" gap="sm" py={64}>
          <Text fw={600}>No candidates match those filters</Text>
          <Text size="sm" c="dimmed" ta="center" maw={360}>
            Try a different search term, or clear the filters to see all{' '}
            {candidates.length} candidates.
          </Text>
          <Button
            variant="light"
            mt="xs"
            onClick={() => {
              setSearch('');
              setFilterStatus(null);
              setFilterStage(null);
              setFilterRole(null);
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </Flex>
      )}

      {totalPages > 1 && (
        <Flex justify="center" mt="lg">
          <Pagination total={totalPages} value={safePage} onChange={setPage} />
        </Flex>
      )}

      {/* Detail Drawer */}
      <Drawer
        opened={detailOpened}
        onClose={closeDetail}
        position="right"
        size={isMobile ? '100%' : 'lg'}
        title={null}
        withCloseButton={false}
      >
        {selectedCandidate && (
          <CandidateDetail
            candidate={selectedCandidate}
            currentIndex={selectedIndex}
            total={sortedCandidates.length}
            onPrev={handlePrevCandidate}
            onNext={handleNextCandidate}
            onClose={closeDetail}
            onEdit={
              canManage
                ? () => {
                    setCandidateToEdit(selectedCandidate);
                    closeDetail();
                    openEditModal();
                  }
                : undefined
            }
            onDelete={
              canManage
                ? () => {
                    setCandidateToDelete(selectedCandidate);
                    openDelete();
                  }
                : undefined
            }
            onStageChange={canManage ? handleStageChange : undefined}
            onShortlist={role === 'hiring_manager' ? handleShortlistToggle : undefined}
            onReject={
              role === 'hiring_manager'
                ? () => {
                    setCandidateToReject(selectedCandidate);
                    openReject();
                  }
                : undefined
            }
            onAddFeedback={can('candidates.review') ? handleAddFeedback : undefined}
          />
        )}
      </Drawer>

      {/* Reject Confirmation — destructive-ish for the candidate, so it's
          confirmed, not instant, per the edge-cases doc. */}
      <Modal opened={rejectOpened} onClose={closeReject} title="Reject candidate" size="sm">
        <Text size="sm" mb="lg">
          Reject <strong>{candidateToReject?.firstName} {candidateToReject?.lastName}</strong> for this role? They'll see a
          respectful status update, and you'll have a few seconds to undo it after confirming.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeReject}>Cancel</Button>
          <Button color="red" onClick={confirmReject}>Reject</Button>
        </Group>
      </Modal>

      {/* Create Modal */}
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title="Create New Candidate"
        size="lg"
      >
        <CreateCandidateForm onClose={closeCreate} onSubmit={handleCreateCandidate} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editOpened}
        onClose={closeEditModal}
        title="Edit Candidate"
        size="lg"
      >
        {candidateToEdit && (
          <CreateCandidateForm
            onClose={closeEditModal}
            onSubmit={handleEditCandidate}
            initialValues={candidateToEdit}
          />
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal opened={filterOpened} onClose={closeFilter} title="Filter Candidates" size="sm">
        <Stack gap="md">
          <Select
            label="Status"
            placeholder="All statuses"
            data={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            clearable
          />
          <Select
            label="Pipeline stage"
            placeholder="All stages"
            data={PIPELINE_STAGES}
            value={filterStage}
            onChange={(val) => setFilterStage(val)}
            clearable
          />
          <Select
            label="Role"
            placeholder="All roles"
            data={roleOptions}
            value={filterRole}
            onChange={(val) => setFilterRole(val)}
            searchable
            clearable
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => { setFilterStatus(null); setFilterStage(null); setFilterRole(null); closeFilter(); }}>
              Clear All
            </Button>
            <Button onClick={closeFilter}>Apply</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Candidate" size="sm">
        <Text size="sm" mb="lg">
          Are you sure you want to delete <strong>{candidateToDelete?.firstName} {candidateToDelete?.lastName}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDelete}>Cancel</Button>
          <Button color="red" onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
    </Box>
  );
}
