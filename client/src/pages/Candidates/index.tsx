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
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { CandidateDetail } from './CandidateDetail';
import { CreateCandidateForm } from './CreateCandidateForm';
import { mockCandidates } from '../../data/mockData';
import type { Candidate } from '../../types';

export function Candidates() {
  const [search, setSearch] = useState('');
  const [ownOnly, setOwnOnly] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const filteredCandidates = mockCandidates.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
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
          style={{ minWidth: 250 }}
        />
        <Group gap="md">
          <Switch
            label="Show only my candidates"
            checked={ownOnly}
            onChange={(e) => setOwnOnly(e.currentTarget.checked)}
            color="teal"
          />
          <Button variant="light" leftSection={<IconFilter size={16} />}>
            Open filters
          </Button>
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
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" size="sm">
                      <IconTrash size={16} />
                    </ActionIcon>
                    <Menu shadow="md" width={160}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEdit size={14} />}>
                          Edit
                        </Menu.Item>
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red">
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
          />
        )}
      </Drawer>

      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title="Create New Candidate"
        size="lg"
      >
        <CreateCandidateForm onClose={closeCreate} />
      </Modal>
    </Box>
  );
}
