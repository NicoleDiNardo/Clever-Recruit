import { Button, Flex, Text, ThemeIcon, Title } from '@mantine/core';
import { IconLockSquare } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface PermissionDeniedProps {
  message?: string;
}

/**
 * Shown in place of a route or an action a role isn't allowed, instead of a
 * blank page, a silent redirect, or a dead-looking disabled button. AUD-P0-01
 * acceptance criteria: every denial is a real, explained state.
 */
export function PermissionDenied({ message }: PermissionDeniedProps) {
  const navigate = useNavigate();
  return (
    <Flex direction="column" align="center" gap="sm" py={96}>
      <ThemeIcon size={56} radius="xl" variant="light" color="red">
        <IconLockSquare size={28} />
      </ThemeIcon>
      <Title order={3}>You don't have access to this page</Title>
      <Text size="sm" c="dimmed" ta="center" maw={420}>
        {message ?? "Your role doesn't include this area. If you think that's wrong, ask an admin to review your permissions."}
      </Text>
      <Button variant="light" mt="xs" onClick={() => navigate('/dashboard')}>
        Back to dashboard
      </Button>
    </Flex>
  );
}
