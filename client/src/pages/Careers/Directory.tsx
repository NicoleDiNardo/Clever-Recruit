import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  TextInput,
  Select,
  Stack,
  Card,
  Group,
  Badge,
  Skeleton,
  SimpleGrid,
} from '@mantine/core';
import { IconSearch, IconMapPin, IconBriefcase, IconBuilding } from '@tabler/icons-react';
import { mockJobs } from '../../data/mockData';
import { EmptyState } from '../../components/EmptyState';
import type { Job } from '../../types';

/** Public jobs directory — /careers. Only ever shows `open` jobs; draft and
 *  paused/closed roles never reach a candidate here (AUD-P1-03 / flow 4). */
export function Directory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const openJobs = useMemo(() => mockJobs.filter((j) => j.status === 'open'), []);

  const types = useMemo(
    () => Array.from(new Set(openJobs.map((j) => j.type).filter((t): t is string => Boolean(t)))),
    [openJobs]
  );

  const filtered = openJobs.filter((j) => {
    if (type && j.type !== type) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(s) ||
      j.company?.name.toLowerCase().includes(s) ||
      (j.location ?? '').toLowerCase().includes(s)
    );
  });

  return (
    <Container size="lg" px="md" py="xl">
      <Stack gap={4} mb="xl">
        <Title order={1}>Open roles</Title>
        <Text c="dimmed">
          {openJobs.length} open {openJobs.length === 1 ? 'role' : 'roles'} across our portfolio companies.
        </Text>
      </Stack>

      <Group mb="xl" grow>
        <TextInput
          placeholder="Search by title, company or location"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          aria-label="Search open roles"
        />
        <Select
          placeholder="All types"
          data={types}
          value={type}
          onChange={setType}
          clearable
          aria-label="Filter by job type"
        />
      </Group>

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={132} radius="md" />
          ))}
        </SimpleGrid>
      ) : openJobs.length === 0 ? (
        <EmptyState
          icon={IconBriefcase}
          title="No open roles right now"
          description="Check back soon — new roles are posted regularly."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="No roles match that search"
          description="Try a different term, or clear the filters to see all open roles."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch('');
            setType(null);
          }}
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {filtered.map((job: Job) => (
            <Card
              key={job.id}
              withBorder
              padding="lg"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/careers/${job.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/careers/${job.id}`);
              }}
              aria-label={`View ${job.title} at ${job.company?.name ?? 'this company'}`}
            >
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600}>{job.title}</Text>
                  {job.type && (
                    <Badge variant="light" color="blue" size="sm">
                      {job.type}
                    </Badge>
                  )}
                </Group>
                <Group gap={4}>
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt="" width={16} height={16} style={{ borderRadius: 4 }} />
                  ) : (
                    <IconBuilding size={14} color="gray" />
                  )}
                  <Text size="sm" c="dimmed">
                    {job.company?.name}
                  </Text>
                </Group>
                {job.location && (
                  <Group gap={4}>
                    <IconMapPin size={14} color="gray" />
                    <Text size="sm" c="dimmed">
                      {job.location}
                    </Text>
                  </Group>
                )}
                {job.salary && (
                  <Text size="sm" fw={500}>
                    {job.salary}
                  </Text>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
