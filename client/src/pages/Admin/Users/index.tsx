import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Button,
  Table,
  Avatar,
  Badge,
  Box,
  Flex,
  Modal,
  Stack,
  TextInput,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconCheck, IconUserPlus } from '@tabler/icons-react';
import { useOrgUsers } from '../../../context/OrgUsersContext';
import { useUser } from '../../../context/UserContext';
import type { Role } from '../../../types';
import { EmptyState } from '../../../components/EmptyState';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'hiring_manager', label: 'Hiring manager' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_LABEL: Record<Role, string> = {
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring manager',
  admin: 'Admin',
};

const ROLE_COLOR: Record<Role, string> = {
  recruiter: 'blue',
  hiring_manager: 'violet',
  admin: 'teal',
};

export function AdminUsers() {
  const { users, inviteUser, changeRole } = useOrgUsers();
  const { user: currentUser } = useUser();
  const [inviteOpened, { open: openInvite, close: closeInvite }] = useDisclosure(false);

  const inviteForm = useForm({
    initialValues: { email: '', role: 'recruiter' as Role },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email address'),
    },
  });

  const handleInvite = inviteForm.onSubmit((values) => {
    const result = inviteUser(values.email, values.role);
    if (!result.ok) {
      notifications.show({ title: "Couldn't send invite", message: result.reason, color: 'red' });
      return;
    }
    closeInvite();
    inviteForm.reset();
    notifications.show({
      title: 'Invitation ready',
      message: `In a live environment this would be emailed to ${values.email}. No real email is sent in this demo.`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  });

  const handleRoleChange = (userId: string, role: Role) => {
    const result = changeRole(userId, role);
    if (!result.ok) {
      notifications.show({ title: "Couldn't change role", message: result.reason, color: 'red' });
      return;
    }
    notifications.show({ title: 'Role updated', message: 'The change applies the next time they load the app.', color: 'blue' });
  };

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="baseline">
            <Title order={1} size="h2" c="blue.7">
              Users
            </Title>
            <Text c="dimmed" size="sm">
              ({users.length})
            </Text>
          </Group>
          <Text c="dimmed" size="sm" mt={4}>
            Manage who has access to Clever Recruit and what they can do.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openInvite}>
          Invite user
        </Button>
      </Flex>

      {users.length === 0 ? (
        <EmptyState
          icon={IconUserPlus}
          title="No one's been invited yet"
          description="Invite your first team member to get started."
          actionLabel="Invite user"
          onAction={openInvite}
        />
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar radius="xl" size="sm" color="blue">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {u.firstName} {u.lastName}
                        {u.id === currentUser.id && (
                          <Text span size="xs" c="dimmed">
                            {' '}
                            (you)
                          </Text>
                        )}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {u.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Select
                      aria-label={`Role for ${u.firstName} ${u.lastName}`}
                      data={ROLE_OPTIONS}
                      value={u.role}
                      onChange={(val) => val && handleRoleChange(u.id, val as Role)}
                      allowDeselect={false}
                      w={170}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={u.status === 'active' ? 'green' : 'yellow'} size="sm">
                      {u.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      <Modal opened={inviteOpened} onClose={closeInvite} title="Invite a team member" size="sm">
        <form onSubmit={handleInvite}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="name@company.com"
              required
              {...inviteForm.getInputProps('email')}
            />
            <Select
              label="Role"
              data={ROLE_OPTIONS}
              allowDeselect={false}
              {...inviteForm.getInputProps('role')}
            />
            <Text size="xs" c="dimmed">
              This demo doesn't send real email — the invite is recorded here as "Pending" so you can see the flow end to end.
            </Text>
            <Group justify="flex-end" mt="sm">
              <Button variant="light" onClick={closeInvite}>Cancel</Button>
              <Button type="submit">Send invite</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}

export { ROLE_LABEL, ROLE_COLOR };
