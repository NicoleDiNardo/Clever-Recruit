import { Box, Flex, Title, Text, Card, Stack, TextInput, Button, Avatar, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { AdminTabs } from '../../../components/AdminTabs';
import { useOrgSettings } from '../../../context/OrgSettingsContext';

/**
 * Minimal by design — name and logo only. Full organisation-settings and
 * an audit log are [Future scope] in the product definition; building more
 * here would be scope without payoff for a demo with no real org tier.
 */
export function AdminOrganisation() {
  const { settings, updateSettings } = useOrgSettings();

  const form = useForm({
    initialValues: { name: settings.name, logoUrl: settings.logoUrl },
    validate: {
      name: (v) => (v.trim().length === 0 ? "Organisation name can't be empty" : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    updateSettings({ name: values.name.trim(), logoUrl: values.logoUrl.trim() });
    notifications.show({
      title: 'Saved',
      message: 'Organisation settings updated.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  });

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
        <div>
          <Title order={1} size="h2" c="blue.7">
            Organisation
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Name and logo shown across Clever Recruit.
          </Text>
        </div>
      </Flex>

      <AdminTabs />

      <Card withBorder maw={480}>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group>
              <Avatar src={form.values.logoUrl || undefined} radius="md" size={56}>
                {form.values.name.slice(0, 1).toUpperCase()}
              </Avatar>
              <Text size="sm" c="dimmed">
                Preview — falls back to an initial when no logo URL is set.
              </Text>
            </Group>
            <TextInput
              label="Organisation name"
              placeholder="Your organisation"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Logo URL"
              placeholder="https://…/logo.png"
              description="A hosted image URL — there's no file upload in this demo."
              {...form.getInputProps('logoUrl')}
            />
            <Group justify="flex-end">
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
