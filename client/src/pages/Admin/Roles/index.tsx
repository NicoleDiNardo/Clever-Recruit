import { Box, Flex, Title, Text, Table, Badge, Alert, Anchor } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconInfoCircle } from '@tabler/icons-react';
import { AdminTabs } from '../../../components/AdminTabs';
import { ROLE_PERMISSIONS, PERMISSION_LABEL, type Permission } from '../../../hooks/usePermissions';
import type { Role } from '../../../types';

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: 'recruiter', label: 'Recruiter', color: 'blue' },
  { value: 'hiring_manager', label: 'Hiring manager', color: 'violet' },
  { value: 'admin', label: 'Admin', color: 'teal' },
];

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABEL) as Permission[];

/**
 * A reference, not a matrix editor — per the product definition, role
 * assignment happens on the user record in Admin > Users. This page answers
 * a different question ("what can each role actually do") from the same
 * ROLE_PERMISSIONS table usePermissions() checks against, so it can never
 * drift from what the app actually enforces.
 */
export function AdminRoles() {
  const navigate = useNavigate();

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Title order={1} size="h2" c="blue.7">
            Roles & permissions
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            What each role can do in Clever Recruit.
          </Text>
        </div>
      </Flex>

      <AdminTabs />

      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb="lg">
        This is a reference, not an editor. To change what role someone has, go to{' '}
        <Anchor size="sm" onClick={() => navigate('/admin/users')}>
          Admin &rsaquo; Users
        </Anchor>{' '}
        and change it on their record.
      </Alert>

      <Box style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Can do&hellip;</Table.Th>
              {ROLES.map((r) => (
                <Table.Th key={r.value} ta="center">
                  <Badge variant="light" color={r.color}>
                    {r.label}
                  </Badge>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ALL_PERMISSIONS.map((perm) => (
              <Table.Tr key={perm}>
                <Table.Td>{PERMISSION_LABEL[perm]}</Table.Td>
                {ROLES.map((r) => (
                  <Table.Td key={r.value} ta="center">
                    {ROLE_PERMISSIONS[r.value].includes(perm) ? (
                      <Text c="teal" fw={700}>
                        &#10003;
                      </Text>
                    ) : (
                      <Text c="dimmed">&mdash;</Text>
                    )}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
}
