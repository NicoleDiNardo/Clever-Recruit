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
    const aVal = (a as Record<string, unknown>)[sortBy] ?? '';
    const bVal = (b as Record<string, unknown>)[sortBy] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const pageSize = 15;
  const totalPages = Math.ceil(sortedCandidates.length / pageSize);
  const paginatedCandidates = sortedCandidates.slice((page - 1) * pageSize, page * pageSize);

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

  const getJobTitleColor = (title?: string) => {
    if (!title) return 'gray';
    const t = title.toLowerCase();
    if (t.includes('engineer') || t.includes('software')) return 'cyan';
    if (t.includes('designer')) return 'violet';
    if (t.includes('manager')) return 'teal';
    return 'blue';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      default: return 'blue';
    }
  };

  const getStageColor = (stage?: string) => {
    if (!stage) return 'gray';
    switch (stage.toLowerCase()) {
      case 'interview': return 'blue';
      case 'rejected': return 'red';
      case 'hired': return 'green';
      case 'offer': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="baseline">
            <Title order={2} c="blue.7">
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
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size={showCompactList ? 'sm' : 'md'}>
          {showCompactList ? 'Add' : 'Create new candidate'}
        </Button>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        mb="md"
        wrap="wrap"
        gap="sm"
      >
        <TextInput
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
            <ActionIcon variant="subtle" color="red" onClick={() => setFilterStatus(null)} size="sm">
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
        <Table striped highlightOnHover verticalSpacing="xs">
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
                  <Group gap={4} onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
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
                      onClick={() => {
                        setCandidateToDelete(candidate);
                        openDelete();
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                    <Menu shadow="md" width={160}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="sm">
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
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
      )}

      {totalPages > 1 && (
        <Flex justify="center" mt="lg">
          <Pagination total={totalPages} value={page} onChange={setPage} />
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
            onEdit={() => {
              setCandidateToEdit(selectedCandidate);
              closeDetail();
              openEditModal();
            }}
            onDelete={() => {
              setCandidateToDelete(selectedCandidate);
              openDelete();
            }}
            onStageChange={handleStageChange}
          />
        )}
      </Drawer>

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
