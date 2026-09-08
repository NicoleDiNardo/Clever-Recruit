import { Button, Flex, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: Icon;
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Jobs, Companies and Reports rendered nothing when a search matched nothing —
 * bare column headers, or an empty void below a search box. Candidates had a
 * hand-rolled empty state; this is that block, shared.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Flex direction="column" align="center" gap="sm" py={64}>
      {Icon && (
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <Icon size={24} />
        </ThemeIcon>
      )}
      <Text fw={600}>{title}</Text>
      {description && (
        <Text size="sm" c="dimmed" ta="center" maw={360}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="light" mt="xs" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Flex>
  );
}
