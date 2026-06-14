import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Badge,
  Table,
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
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconCurrencyDollar,
  IconUsers,
  IconBuilding,
} from '@tabler/icons-react';
import { mockJobs, mockCompanies } from '../../data/mockData';
import type { Job } from '../../types';

export function Jobs() {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const filteredJobs = mockJobs.filter((j) => {
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
      default: return 'gray';
    }
  };

  const form = useForm({
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

  const handleCreateSubmit = form.onSubmit((values) => {
    console.log('Creating job:', values);
    closeCreate();
    form.reset();
  });

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="baseline">
            <Title order={2} c="blue.7">
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
        placeholder="Search jobs..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
        style={{ maxWidth: 400 }}
      />

      <Box style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Job Title</Table.Th>
              <Table.Th>Company</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Salary</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Candidates</Table.Th>
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
                  <Text fw={500} size="sm">
                    {job.title}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{job.company?.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {job.location}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue" size="sm">
                    {job.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{job.salary}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={getStatusColor(job.status)} size="sm">
                    {job.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray" size="sm">
                    {Math.floor(Math.random() * 20) + 3}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} onClick={(e) => e.stopPropagation()}>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" size="sm">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

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
                <IconBuilding size={16} color="gray" />
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
                {Math.floor(Math.random() * 20) + 3}
              </Text>
            </Card>

            <Group>
              <Button variant="light" leftSection={<IconEdit size={16} />}>
                Edit Job
              </Button>
              <Button variant="light" color="red" leftSection={<IconTrash size={16} />}>
                Close Job
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      <Modal opened={createOpened} onClose={closeCreate} title="Create New Job" size="lg">
        <form onSubmit={handleCreateSubmit}>
          <Stack gap="md">
            <TextInput
              label="Job Title"
              placeholder="e.g. Senior Software Engineer"
              required
              {...form.getInputProps('title')}
            />
            <Select
              label="Company"
              placeholder="Select company"
              required
              data={mockCompanies.map((c) => ({ value: c.id, label: c.name }))}
              {...form.getInputProps('companyId')}
            />
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Location"
                  placeholder="e.g. San Francisco, CA"
                  {...form.getInputProps('location')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Type"
                  data={['Full-time', 'Part-time', 'Contract', 'Internship']}
                  {...form.getInputProps('type')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Salary Range"
              placeholder="e.g. $120,000 - $160,000"
              {...form.getInputProps('salary')}
            />
            <Textarea
              label="Description"
              placeholder="Job description..."
              minRows={4}
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeCreate}>Cancel</Button>
              <Button type="submit">Create Job</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
