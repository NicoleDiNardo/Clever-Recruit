import { useState } from 'react';
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
import { mockCandidates as initialCandidates } from '../../data/mockData';
import type { Candidate } from '../../types';
import { useEmbedMode } from '../../hooks/useEmbedMode';

export function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [search, setSearch] = useState('');
  const [ownOnly, setOwnOnly] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isEmbed = useEmbedMode();

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesOwner = !ownOnly || c.ownerId === '1';
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesOwner && matchesStatus;
  });

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
    setCandidates((prev) => [newCandidate, ...prev]);
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
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateToEdit.id
          ? {
              ...c,
              firstName: values.firstName as string,
              lastName: values.lastName as string,
              email: values.email as string,
              phone: (values.phone as string) || c.phone,
              jobTitle: (values.jobTitle as string) || c.jobTitle,
              score: (values.score as number) || c.score,
              status: (values.status as string) || c.status,
              location: (values.location as string) || c.location,
              currentPosition: (values.currentPosition as string) || c.currentPosition,
              currentOrganization: (values.currentOrganization as string) || c.currentOrganization,
              employmentStatus: (values.employmentStatus as string) || c.employmentStatus,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
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
    setCandidates((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
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
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Create new candidate
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
          style={{ minWidth: isEmbed ? 0 : 250, flex: isEmbed ? 1 : undefined, width: isEmbed ? '100%' : undefined }}
        />
        <Group gap="md">
          <Switch
            label="Show only my candidates"
            checked={ownOnly}
            onChange={(e) => setOwnOnly(e.currentTarget.checked)}
            color="teal"
          />
          <Button variant="light" leftSection={<IconFilter size={16} />} onClick={openFilter}>
            {filterStatus ? `Filter: ${filterStatus}` : 'Open filters'}
          </Button>
          {filterStatus && (
            <ActionIcon variant="subtle" color="red" onClick={() => setFilterStatus(null)} size="sm">
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
      </Flex>

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
              <Table.Th>Phone Number</Table.Th>
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
                  <Text size="sm">{candidate.phone}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{candidate.score} out of 100</Text>
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
          <Group justify="flex-end">
            <Button variant="light" onClick={() => { setFilterStatus(null); closeFilter(); }}>
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
