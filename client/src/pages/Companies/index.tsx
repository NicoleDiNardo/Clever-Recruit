import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Badge,
  Avatar,
  Card,
  SimpleGrid,
  Box,
  Flex,
  Drawer,
  Stack,
  Divider,
  Modal,
  Grid,
  Select,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconSearch,
  IconPlus,
  IconMapPin,
  IconWorld,
  IconBriefcase,
  IconUsers,
  IconBuilding,
} from '@tabler/icons-react';
import { mockCompanies, mockJobs } from '../../data/mockData';
import type { Company } from '../../types';

export function Companies() {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const filteredCompanies = mockCompanies.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      (c.industry && c.industry.toLowerCase().includes(s)) ||
      (c.location && c.location.toLowerCase().includes(s))
    );
  });

  const getOpenJobs = (companyId: string) =>
    mockJobs.filter((j) => j.companyId === companyId && j.status === 'open').length;

  const form = useForm({
    initialValues: {
      name: '',
      industry: '',
      website: '',
      location: '',
      size: '',
    },
    validate: {
      name: (v) => (v.length < 1 ? 'Company name is required' : null),
    },
  });

  const handleCreateSubmit = form.onSubmit((values) => {
    console.log('Creating company:', values);
    closeCreate();
    form.reset();
  });

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="baseline">
            <Title order={2} c="blue.7">
              Companies
            </Title>
            <Text c="dimmed" size="sm">
              ({filteredCompanies.length})
            </Text>
          </Group>
          <Text c="dimmed" size="sm" mt={4}>
            Manage your client companies and their job openings.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Add company
        </Button>
      </Flex>

      <TextInput
        placeholder="Search companies..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="lg"
        style={{ maxWidth: 400 }}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
        {filteredCompanies.map((company) => (
          <Card
            key={company.id}
            withBorder
            padding="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedCompany(company);
              openDetail();
            }}
          >
            <Group gap="md" mb="md">
              <Avatar size={48} radius="md" color="blue" variant="light">
                {company.name[0]}
              </Avatar>
              <div>
                <Text fw={600} size="md">
                  {company.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {company.industry}
                </Text>
              </div>
            </Group>
            <Stack gap="xs">
              <Group gap={4}>
                <IconMapPin size={14} color="gray" />
                <Text size="xs" c="dimmed">
                  {company.location}
                </Text>
              </Group>
              <Group gap={4}>
                <IconUsers size={14} color="gray" />
                <Text size="xs" c="dimmed">
                  {company.size} employees
                </Text>
              </Group>
            </Stack>
            <Divider my="sm" />
            <Group justify="space-between">
              <Group gap={4}>
                <IconBriefcase size={14} />
                <Text size="xs" fw={500}>
                  {getOpenJobs(company.id)} open positions
                </Text>
              </Group>
              <Badge variant="light" color="blue" size="sm">
                Active
              </Badge>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Drawer
        opened={detailOpened}
        onClose={closeDetail}
        position="right"
        size={isMobile ? '100%' : 'md'}
        title={null}
        withCloseButton
      >
        {selectedCompany && (
          <Stack gap="md">
            <Group gap="md">
              <Avatar size={64} radius="md" color="blue" variant="light">
                {selectedCompany.name[0]}
              </Avatar>
              <div>
                <Title order={3}>{selectedCompany.name}</Title>
                <Text size="sm" c="dimmed">
                  {selectedCompany.industry}
                </Text>
              </div>
            </Group>

            <Divider />

            <Stack gap="sm">
              <Group gap="xs">
                <IconMapPin size={16} color="gray" />
                <Text size="sm">{selectedCompany.location}</Text>
              </Group>
              <Group gap="xs">
                <IconWorld size={16} color="gray" />
                <Text size="sm" c="blue.6">
                  {selectedCompany.website}
                </Text>
              </Group>
              <Group gap="xs">
                <IconUsers size={16} color="gray" />
                <Text size="sm">{selectedCompany.size} employees</Text>
              </Group>
              <Group gap="xs">
                <IconBriefcase size={16} color="gray" />
                <Text size="sm">{getOpenJobs(selectedCompany.id)} open positions</Text>
              </Group>
            </Stack>

            <Divider />

            <Title order={5}>Open Jobs</Title>
            <Stack gap="xs">
              {mockJobs
                .filter((j) => j.companyId === selectedCompany.id && j.status === 'open')
                .map((job) => (
                  <Card key={job.id} withBorder padding="sm">
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={500}>
                          {job.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {job.location} - {job.type}
                        </Text>
                      </div>
                      <Badge variant="light" color="green" size="xs">
                        Open
                      </Badge>
                    </Group>
                  </Card>
                ))}
              {mockJobs.filter((j) => j.companyId === selectedCompany.id && j.status === 'open')
                .length === 0 && (
                <Text size="sm" c="dimmed">
                  No open positions
                </Text>
              )}
            </Stack>
          </Stack>
        )}
      </Drawer>

      <Modal opened={createOpened} onClose={closeCreate} title="Add New Company" size="lg">
        <form onSubmit={handleCreateSubmit}>
          <Stack gap="md">
            <TextInput
              label="Company Name"
              placeholder="e.g. Acme Inc."
              required
              {...form.getInputProps('name')}
            />
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Industry"
                  placeholder="Select industry"
                  data={['Technology', 'FinTech', 'Healthcare', 'Entertainment', 'Travel', 'E-commerce', 'Education']}
                  {...form.getInputProps('industry')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Company Size"
                  placeholder="Select size"
                  data={['1-50', '51-200', '201-1,000', '1,001-5,000', '5,000-10,000', '10,000+']}
                  {...form.getInputProps('size')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Location"
              placeholder="e.g. San Francisco, CA"
              {...form.getInputProps('location')}
            />
            <TextInput
              label="Website"
              placeholder="https://example.com"
              {...form.getInputProps('website')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeCreate}>Cancel</Button>
              <Button type="submit">Add Company</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
