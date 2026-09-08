import { Button, Flex, Stack, Text, Title } from '@mantine/core';
import { IconMoodSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

/**
 * There was no catch-all route, so any unmatched URL — a typo, a stale
 * bookmark, /candidate/5 instead of /candidates — rendered nothing at all:
 * not even the header or sidebar, just a blank white page with no way back.
 */
export function NotFound() {
  const navigate = useNavigate();

  return (
    <Flex align="center" justify="center" mih="60vh">
      <Stack align="center" gap="sm" maw={420}>
        <IconMoodSearch size={44} stroke={1.5} />
        <Title order={3}>Page not found</Title>
        <Text size="sm" c="dimmed" ta="center">
          We couldn&apos;t find that page. It may have moved, or the link may be
          out of date.
        </Text>
        <Button mt="xs" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </Stack>
    </Flex>
  );
}
