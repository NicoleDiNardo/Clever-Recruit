import { useState, useMemo } from 'react';
import {
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Badge,
  Table,
  Avatar,
  Drawer,
  Stack,
  Box,
  Flex,
  ActionIcon,
  Card,
  Modal,
  Grid,
  Select,
  Textarea,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconCurrencyDollar,
  IconUsers,
  IconBuilding,
  IconCheck,
  IconEye,
} from '@tabler/icons-react';
import { mockCompanies } from '../../data/mockData';
import type { Job } from '../../types';
import { mockJobs as initialJobs } from '../../data/mockData';
import { useCandidates } from '../../context/CandidatesContext';
import { EmptyState } from '../../components/EmptyState';
import { JobPreviewModal } from './JobPreviewModal';

export function Jobs() {
  const { candidates } = useCandidates();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // The "preview as a candidate would see it" step — AUD-P1-03. `previewJob`
  // is whatever's being looked at (an unsaved draft from the create/edit
  // form, or an already-saved job from the detail drawer); `previewSource`
  // decides which actions the preview modal offers.
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [previewSource, setPreviewSource] = useState<'create' | 'edit' | 'view' | null>(null);
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);

  const filteredJobs = jobs.filter((j) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(s) ||
      j.company?.name.toLowerCase().includes(s) ||
      (j.location && j.location.toLowerCase().includes(s))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'green';
      case 'closed': return 'red';
      case 'paused': return 'yellow';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const createForm = useForm({
    initialValues: {
      title: '',
      companyId: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      // New jobs start as drafts — AUD-P1-03. Only Publish (from the
      // preview step, or "Save as draft" here) decides otherwise.
      status: 'draft',
    },
    validate: {
      title: (v) => (v.length < 1 ? 'Title is required' : null),
      companyId: (v) => (v.length < 1 ? 'Company is required' : null),
    },
  });

  const editForm = useForm({
    initialValues: {
      title: '',
      companyId: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      status: 'open',
    },
    validate: {
      title: (v) => (v.length < 1 ? 'Title is required' : null),
      companyId: (v) => (v.length < 1 ? 'Company is required' : null),
    },
  });

  const buildJobFromCreateForm = (status: string): Job => {
    const values = createForm.values;
    const company = mockCompanies.find((c) => c.id === values.companyId);
    return {
      id: String(Date.now()),
      title: values.title,
      description: values.description,
      location: values.location,
      type: values.type,
      salary: values.salary,
      status,
      companyId: values.companyId,
      company,
      createdAt: new Date().toISOString(),
    };
  };

  const saveNewJob = (status: string) => {
    if (createForm.validate().hasErrors) return;
    const newJob = buildJobFromCreateForm(status);
    setJobs((prev) => [newJob, ...prev]);
    closeCreate();
    closePreview();
    createForm.reset();
    notifications.show({
      title: status === 'open' ? 'Job published' : 'Draft saved',
      message:
        status === 'open'
          ? `"${newJob.title}" is now live on the careers site.`
          : `"${newJob.title}" saved as a draft — it won't show up on the careers site until you publish it.`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleCreate = createForm.onSubmit(() => saveNewJob('draft'));

  const handlePreviewFromCreate = () => {
    if (createForm.validate().hasErrors) return;
    setPreviewJob(buildJobFromCreateForm(createForm.values.status));
    setPreviewSource('create');
    openPreview();
  };

  const handleOpenEdit = (job: Job) => {
    editForm.setValues({
      title: job.title,
      companyId: job.companyId || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      salary: job.salary || '',
      description: job.description || '',
      status: job.status,
    });
    setSelectedJob(job);
    openEdit();
  };

  const saveEdit = (status: string) => {
    if (!selectedJob || editForm.validate().hasErrors) return;
    const values = editForm.values;
    const company = mockCompanies.find((c) => c.id === values.companyId);
    const updated = { ...selectedJob, ...values, company, companyId: values.companyId, status };
    setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? updated : j)));
    setSelectedJob(updated);
    closeEdit();
    closePreview();
    notifications.show({
      title: status === 'open' && selectedJob.status !== 'open' ? 'Job published' : 'Job updated',
      message: `"${values.title}" has been updated successfully.`,
      color: 'blue',
      icon: <IconCheck size={16} />,
    });
  };

  const handleEditSubmit = editForm.onSubmit((values) => saveEdit(values.status));

  const handlePreviewFromEdit = () => {
    if (!selectedJob || editForm.validate().hasErrors) return;
    const values = editForm.values;
    const company = mockCompanies.find((c) => c.id === values.companyId);
    setPreviewJob({ ...selectedJob, ...values, company, companyId: values.companyId, status: values.status });
    setPreviewSource('edit');
    openPreview();
  };

  const handleCloseJob = (job: Job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'closed' } : j))
    );
    if (selectedJob?.id === job.id) {
      setSelectedJob({ ...job, status: 'closed' });
    }
    closeDetail();
    notifications.show({
      title: 'Job Closed',
      message: `"${job.title}" has been closed.`,
      color: 'orange',
    });
  };

  const handleDeleteJob = () => {
    if (!jobToDelete) return;
    setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
    closeDelete();
    closeDetail();
    notifications.show({
      title: 'Job Deleted',
      message: `"${jobToDelete.title}" has been deleted.`,
      color: 'red',
      icon: <IconTrash size={16} />,
    });
    setJobToDelete(null);
  };

  // This was Math.random() computed during render, so the Candidates badge on
  // every job row changed on each keystroke in the search box and every time a
  // drawer opened. Counting the real candidates is both stable and true.
  const candidateCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      const jobTitle = job.title.toUpperCase();
      counts[job.id] = candidates.filter(
        (c) => (c.jobTitle ?? '').toUpperCase() === jobTitle
      ).length;
    });
    return counts;
  }, [jobs, candidates]);

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="baseline">
            <Title order={1} size="h2" c="blue.7">
              Jobs
            </Title>
            <Text c="dimmed" size="sm">
              ({filteredJobs.length})
            </Text>
          </Group>
          <Text c="dimmed" size="sm" mt={4}>
            Manage job openings and track applications.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Create new job
        </Button>
      </Flex>

      <TextInput
        aria-label="Search jobs"
        type="search"
        placeholder="Search jobs..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
        maw={400}
      />

      <Box style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
        <Table striped highlightOnHover verticalSpacing="sm" miw={880}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Job Title</Table.Th>
              <Table.Th>Company</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th ta="right">Salary</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th ta="right">Candidates</Table.Th>
              <Table.Th>Tools</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredJobs.map((job) => (
              <Table.Tr
                key={job.id}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedJob(job);
                  openDetail();
                }}
              >
                <Table.Td>
                  <Text fw={500} size="sm" style={{ whiteSpace: 'nowrap' }}>
                    {job.title}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar
                      src={job.company?.logo}
                      alt=""
                      size={20}
                      radius={4}
                      color="blue"
                    >
                      {(job.company?.name || '?').charAt(0)}
                    </Avatar>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {job.company?.name}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {job.location}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue" size="sm" style={{ maxWidth: 'none' }}>
                    {job.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                    {job.salary}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={getStatusColor(job.status)} size="sm">
                    {job.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray" size="sm">
                    {candidateCounts[job.id] || 0}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={`Edit ${job.title}`}
                      onClick={() => handleOpenEdit(job)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      aria-label={`Close ${job.title}`}
                      onClick={() => {
                        setJobToDelete(job);
                        openDelete();
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {filteredJobs.length === 0 && (
        <EmptyState
          icon={IconBuilding}
          title="No jobs match that search"
          description={`Try a different term, or clear it to see all ${jobs.length} jobs.`}
          actionLabel="Clear search"
          onAction={() => setSearch('')}
        />
      )}

      {/* Detail Drawer */}
      <Drawer
        opened={detailOpened}
        onClose={closeDetail}
        position="right"
        size={isMobile ? '100%' : 'md'}
        title={null}
        withCloseButton
      >
        {selectedJob && (
          <Stack gap="md">
            <Title order={3}>{selectedJob.title}</Title>
            <Group gap="md">
              <Group gap={4}>
                {selectedJob.company?.logo ? (
                  <img src={selectedJob.company.logo} alt={selectedJob.company.name} width={18} height={18} style={{ borderRadius: 4 }} />
                ) : (
                  <IconBuilding size={16} color="gray" />
                )}
                <Text size="sm">{selectedJob.company?.name}</Text>
              </Group>
              <Group gap={4}>
                <IconMapPin size={16} color="gray" />
                <Text size="sm">{selectedJob.location}</Text>
              </Group>
            </Group>
            <Group gap="sm">
              <Badge color={getStatusColor(selectedJob.status)}>
                {selectedJob.status}
              </Badge>
              <Badge variant="light" color="blue">
                {selectedJob.type}
              </Badge>
            </Group>

            <Card withBorder>
              <Group gap={4} mb="xs">
                <IconCurrencyDollar size={16} />
                <Text size="sm" fw={500}>Salary Range</Text>
              </Group>
              <Text size="sm">{selectedJob.salary}</Text>
            </Card>

            <Card withBorder>
              <Text size="sm" fw={500} mb="xs">Description</Text>
              <Text size="sm" c="dimmed">{selectedJob.description}</Text>
            </Card>

            <Card withBorder>
              <Group gap={4} mb="xs">
                <IconUsers size={16} />
                <Text size="sm" fw={500}>Candidates Applied</Text>
              </Group>
              <Text size="lg" fw={700}>
                {candidateCounts[selectedJob.id] || 0}
              </Text>
            </Card>

            <Group>
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  closeDetail();
                  handleOpenEdit(selectedJob);
                }}
              >
                Edit Job
              </Button>
              <Button
                variant="light"
                leftSection={<IconEye size={16} />}
                onClick={() => {
                  setPreviewJob(selectedJob);
                  setPreviewSource('view');
                  openPreview();
                }}
              >
                Preview
              </Button>
              {selectedJob.status === 'draft' && (
                <Button
                  color="green"
                  onClick={() => {
                    setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? { ...j, status: 'open' } : j)));
                    setSelectedJob({ ...selectedJob, status: 'open' });
                    notifications.show({
                      title: 'Job published',
                      message: `"${selectedJob.title}" is now live on the careers site.`,
                      color: 'green',
                      icon: <IconCheck size={16} />,
                    });
                  }}
                >
                  Publish
                </Button>
              )}
              {selectedJob.status !== 'closed' && selectedJob.status !== 'draft' ? (
                <Button
                  variant="light"
                  color="orange"
                  onClick={() => handleCloseJob(selectedJob)}
                >
                  Close Job
                </Button>
              ) : selectedJob.status === 'closed' ? (
                <Button
                  variant="light"
                  color="green"
                  onClick={() => {
                    setJobs((prev) =>
                      prev.map((j) => (j.id === selectedJob.id ? { ...j, status: 'open' } : j))
                    );
                    setSelectedJob({ ...selectedJob, status: 'open' });
                    notifications.show({ title: 'Job Reopened', message: `"${selectedJob.title}" is now open.`, color: 'green' });
                  }}
                >
                  Reopen Job
                </Button>
              ) : null}
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  setJobToDelete(selectedJob);
                  openDelete();
                }}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      {/* Create Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Create New Job" size="lg">
        <form onSubmit={handleCreate}>
          <Stack gap="md">
            <TextInput
              label="Job Title"
              placeholder="e.g. Senior Software Engineer"
              required
              {...createForm.getInputProps('title')}
            />
            <Select
              label="Company"
              placeholder="Select company"
              required
              data={mockCompanies.map((c) => ({ value: c.id, label: c.name }))}
              {...createForm.getInputProps('companyId')}
            />
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Location"
                  placeholder="e.g. San Francisco, CA"
                  {...createForm.getInputProps('location')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Type"
                  data={['Full-time', 'Part-time', 'Contract', 'Internship']}
                  {...createForm.getInputProps('type')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Salary Range"
              placeholder="e.g. $120,000 - $160,000"
              {...createForm.getInputProps('salary')}
            />
            <Textarea
              label="Description"
              placeholder="Job description..."
              minRows={4}
              {...createForm.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={closeCreate}>Cancel</Button>
              <Button variant="light" onClick={handlePreviewFromCreate}>Preview</Button>
              <Button type="submit">Save as draft</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Job" size="lg">
        <form onSubmit={handleEditSubmit}>
          <Stack gap="md">
            <TextInput
              label="Job Title"
              placeholder="e.g. Senior Software Engineer"
              required
              {...editForm.getInputProps('title')}
            />
            <Select
              label="Company"
              placeholder="Select company"
              required
              data={mockCompanies.map((c) => ({ value: c.id, label: c.name }))}
              {...editForm.getInputProps('companyId')}
            />
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Location"
                  placeholder="e.g. San Francisco, CA"
                  {...editForm.getInputProps('location')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Type"
                  data={['Full-time', 'Part-time', 'Contract', 'Internship']}
                  {...editForm.getInputProps('type')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Salary Range"
              placeholder="e.g. $120,000 - $160,000"
              {...editForm.getInputProps('salary')}
            />
            <Select
              label="Status"
              data={[
                { value: 'draft', label: 'Draft (not visible to candidates)' },
                { value: 'open', label: 'Open' },
                { value: 'paused', label: 'Paused' },
                { value: 'closed', label: 'Closed' },
              ]}
              allowDeselect={false}
              {...editForm.getInputProps('status')}
            />
            <Textarea
              label="Description"
              placeholder="Job description..."
              minRows={4}
              {...editForm.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={closeEdit}>Cancel</Button>
              <Button variant="light" onClick={handlePreviewFromEdit}>Preview</Button>
              <Button type="submit">Save Changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Job" size="sm">
        <Text size="sm" mb="lg">
          Are you sure you want to delete <strong>"{jobToDelete?.title}"</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDelete}>Cancel</Button>
          <Button color="red" onClick={handleDeleteJob}>Delete</Button>
        </Group>
      </Modal>

      <JobPreviewModal
        job={previewJob}
        opened={previewOpened}
        onClose={closePreview}
        onSaveDraft={previewSource === 'create' ? () => saveNewJob('draft') : undefined}
        onPublish={
          previewSource === 'create'
            ? () => saveNewJob('open')
            : previewSource === 'edit'
              ? () => saveEdit('open')
              : previewSource === 'view' && previewJob?.status !== 'open'
                ? () => {
                    if (!previewJob) return;
                    setJobs((prev) => prev.map((j) => (j.id === previewJob.id ? { ...j, status: 'open' } : j)));
                    setSelectedJob((sel) => (sel && sel.id === previewJob.id ? { ...sel, status: 'open' } : sel));
                    closePreview();
                    notifications.show({
                      title: 'Job published',
                      message: `"${previewJob.title}" is now live on the careers site.`,
                      color: 'green',
                      icon: <IconCheck size={16} />,
                    });
                  }
                : undefined
        }
      />
    </Box>
  );
}
