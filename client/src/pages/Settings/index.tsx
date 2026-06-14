import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Card,
  Stack,
  Box,
  Grid,
  TextInput,
  Button,
  Avatar,
  Switch,
  Select,
  Tabs,
  Divider,
  PasswordInput,
  Textarea,
  FileButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconUser,
  IconBell,
  IconLock,
  IconPalette,
  IconUpload,
  IconCheck,
} from '@tabler/icons-react';
import { useUser } from '../../context/UserContext';

export function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { user, updateProfile, setAvatar } = useUser();

  const profileForm = useForm({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      jobTitle: user.jobTitle,
      bio: user.bio,
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (v) => (v.length < 1 ? 'Current password is required' : null),
      newPassword: (v) => (v.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (v, values) =>
        v !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const [notifSettings, setNotifSettings] = useState({
    newApplications: true,
    interviewReminders: true,
    taskDueDates: true,
    weeklyReports: true,
    teamUpdates: false,
    realtimeUpdates: true,
    messageNotifs: true,
    systemAlerts: true,
  });

  const [appearance, setAppearance] = useState({
    theme: colorScheme,
    language: 'en',
    dateFormat: 'dd/mm/yyyy',
    timezone: 'europe-rome',
  });

  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  const handleProfileSave = profileForm.onSubmit((values) => {
    updateProfile(values);
    notifications.show({
      title: 'Profile Updated',
      message: 'Your profile information has been saved.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  });

  const handlePasswordUpdate = passwordForm.onSubmit(() => {
    notifications.show({
      title: 'Password Updated',
      message: 'Your password has been changed successfully.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
    passwordForm.reset();
  });

  const handleNotifSave = () => {
    notifications.show({
      title: 'Preferences Saved',
      message: 'Your notification preferences have been updated.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleAppearanceSave = () => {
    if (appearance.theme === 'dark' || appearance.theme === 'light') {
      setColorScheme(appearance.theme);
    } else {
      setColorScheme('auto');
    }
    notifications.show({
      title: 'Appearance Saved',
      message: 'Your appearance settings have been applied.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleRevokeSession = () => {
    notifications.show({
      title: 'Session Revoked',
      message: 'The device session has been terminated.',
      color: 'orange',
    });
  };

  const handleAvatarUpload = (file: File | null) => {
    setAvatar(file);
    if (file) {
      notifications.show({
        title: 'Photo Uploaded',
        message: `"${file.name}" has been set as your profile photo.`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }
  };

  return (
    <Box>
      <Title order={2} c="blue.7" mb={4}>
        Settings
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Manage your account preferences and configurations.
      </Text>

      <Tabs defaultValue="profile">
        <Tabs.List mb="lg">
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
            Notifications
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
            Security
          </Tabs.Tab>
          <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>
            Appearance
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder padding="lg">
                <form onSubmit={handleProfileSave}>
                  <Title order={4} mb="lg">
                    Personal Information
                  </Title>
                  <Group mb="lg">
                    <Avatar size={80} radius="xl" color="blue" src={user.avatar}>
                      {user.firstName[0]}{user.lastName[0]}
                    </Avatar>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        Profile Photo
                      </Text>
                      <Text size="xs" c="dimmed">
                        JPG, PNG or GIF. Max 2MB.
                      </Text>
                      <FileButton onChange={handleAvatarUpload} accept="image/*">
                        {(props) => (
                          <Button
                            {...props}
                            variant="light"
                            size="xs"
                            leftSection={<IconUpload size={14} />}
                          >
                            Upload Photo
                          </Button>
                        )}
                      </FileButton>
                    </Stack>
                  </Group>

                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput label="First Name" {...profileForm.getInputProps('firstName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Last Name" {...profileForm.getInputProps('lastName')} />
                    </Grid.Col>
                  </Grid>

                  <TextInput label="Email" mt="md" {...profileForm.getInputProps('email')} />
                  <TextInput label="Phone" mt="md" {...profileForm.getInputProps('phone')} />
                  <TextInput label="Job Title" mt="md" {...profileForm.getInputProps('jobTitle')} />
                  <Textarea label="Bio" minRows={3} mt="md" {...profileForm.getInputProps('bio')} />

                  <Group justify="flex-end" mt="xl">
                    <Button variant="light" onClick={() => profileForm.reset()}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </Group>
                </form>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder padding="lg">
                <Title order={5} mb="md">
                  Account Info
                </Title>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Role</Text>
                    <Text size="sm" fw={500}>Recruiter</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Status</Text>
                    <Text size="sm" fw={500} c="green">Active</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Joined</Text>
                    <Text size="sm" fw={500}>Jan 15, 2024</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Candidates</Text>
                    <Text size="sm" fw={500}>142</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Placements</Text>
                    <Text size="sm" fw={500}>28</Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Card withBorder padding="lg" maw={700}>
            <Title order={4} mb="lg">
              Notification Preferences
            </Title>
            <Stack gap="lg">
              <div>
                <Text size="sm" fw={600} mb="sm">
                  Email Notifications
                </Text>
                <Stack gap="sm">
                  <Switch
                    label="New candidate applications"
                    checked={notifSettings.newApplications}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, newApplications: e.currentTarget.checked }))}
                    description="Get notified when a candidate applies to your jobs"
                  />
                  <Switch
                    label="Interview reminders"
                    checked={notifSettings.interviewReminders}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, interviewReminders: e.currentTarget.checked }))}
                    description="Receive reminders 1 hour before scheduled interviews"
                  />
                  <Switch
                    label="Task due dates"
                    checked={notifSettings.taskDueDates}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, taskDueDates: e.currentTarget.checked }))}
                    description="Get notified when tasks are approaching their due date"
                  />
                  <Switch
                    label="Weekly reports"
                    checked={notifSettings.weeklyReports}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, weeklyReports: e.currentTarget.checked }))}
                    description="Receive a weekly summary of your recruitment activity"
                  />
                  <Switch
                    label="Team updates"
                    checked={notifSettings.teamUpdates}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, teamUpdates: e.currentTarget.checked }))}
                    description="Get notified about team member activity"
                  />
                </Stack>
              </div>

              <Divider />

              <div>
                <Text size="sm" fw={600} mb="sm">
                  Push Notifications
                </Text>
                <Stack gap="sm">
                  <Switch
                    label="Real-time candidate updates"
                    checked={notifSettings.realtimeUpdates}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, realtimeUpdates: e.currentTarget.checked }))}
                    description="Instant updates when candidates change status"
                  />
                  <Switch
                    label="Message notifications"
                    checked={notifSettings.messageNotifs}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, messageNotifs: e.currentTarget.checked }))}
                    description="Get notified for new messages"
                  />
                  <Switch
                    label="System alerts"
                    checked={notifSettings.systemAlerts}
                    onChange={(e) => setNotifSettings((s) => ({ ...s, systemAlerts: e.currentTarget.checked }))}
                    description="Important system updates and announcements"
                  />
                </Stack>
              </div>

              <Group justify="flex-end" mt="md">
                <Button onClick={handleNotifSave}>Save Preferences</Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="security">
          <Card withBorder padding="lg" maw={600}>
            <form onSubmit={handlePasswordUpdate}>
              <Title order={4} mb="lg">
                Change Password
              </Title>
              <Stack gap="md">
                <PasswordInput label="Current Password" {...passwordForm.getInputProps('currentPassword')} />
                <PasswordInput label="New Password" {...passwordForm.getInputProps('newPassword')} />
                <PasswordInput label="Confirm New Password" {...passwordForm.getInputProps('confirmPassword')} />
                <Group justify="flex-end" mt="md">
                  <Button type="submit">Update Password</Button>
                </Group>
              </Stack>
            </form>

            <Divider my="xl" />

            <Title order={4} mb="lg">
              Two-Factor Authentication
            </Title>
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  Enable 2FA
                </Text>
                <Text size="xs" c="dimmed">
                  Add an extra layer of security to your account
                </Text>
              </div>
              <Switch
                checked={twoFaEnabled}
                onChange={(e) => {
                  setTwoFaEnabled(e.currentTarget.checked);
                  notifications.show({
                    title: e.currentTarget.checked ? '2FA Enabled' : '2FA Disabled',
                    message: e.currentTarget.checked
                      ? 'Two-factor authentication is now active.'
                      : 'Two-factor authentication has been disabled.',
                    color: e.currentTarget.checked ? 'green' : 'orange',
                  });
                }}
              />
            </Group>

            <Divider my="xl" />

            <Title order={4} mb="lg">
              Sessions
            </Title>
            <Stack gap="sm">
              <Card withBorder padding="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>Current Session</Text>
                    <Text size="xs" c="dimmed">macOS - Chrome - Last active now</Text>
                  </div>
                  <Text size="xs" c="green" fw={500}>Active</Text>
                </Group>
              </Card>
              <Card withBorder padding="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>iPhone 17 Pro</Text>
                    <Text size="xs" c="dimmed">iOS - Safari - Last active 2 hours ago</Text>
                  </div>
                  <Button variant="subtle" size="xs" color="red" onClick={handleRevokeSession}>
                    Revoke
                  </Button>
                </Group>
              </Card>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="appearance">
          <Card withBorder padding="lg" maw={600}>
            <Title order={4} mb="lg">
              Appearance Settings
            </Title>
            <Stack gap="lg">
              <Select
                label="Theme"
                value={appearance.theme}
                onChange={(val) => setAppearance((s) => ({ ...s, theme: val || 'light' }))}
                data={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'System Default' },
                ]}
              />
              <Select
                label="Language"
                value={appearance.language}
                onChange={(val) => setAppearance((s) => ({ ...s, language: val || 'en' }))}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                ]}
              />
              <Select
                label="Date Format"
                value={appearance.dateFormat}
                onChange={(val) => setAppearance((s) => ({ ...s, dateFormat: val || 'dd/mm/yyyy' }))}
                data={[
                  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
                  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
                  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
                ]}
              />
              <Select
                label="Timezone"
                value={appearance.timezone}
                onChange={(val) => setAppearance((s) => ({ ...s, timezone: val || 'europe-rome' }))}
                data={[
                  { value: 'europe-rome', label: 'Europe/Rome (UTC+2)' },
                  { value: 'europe-london', label: 'Europe/London (UTC+1)' },
                  { value: 'us-eastern', label: 'US/Eastern (UTC-4)' },
                  { value: 'us-pacific', label: 'US/Pacific (UTC-7)' },
                ]}
              />
              <Group justify="flex-end" mt="md">
                <Button onClick={handleAppearanceSave}>Save Changes</Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
