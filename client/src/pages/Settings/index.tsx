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
import {
  IconUser,
  IconBell,
  IconLock,
  IconPalette,
  IconUpload,
} from '@tabler/icons-react';

export function Settings() {
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
                <Title order={4} mb="lg">
                  Personal Information
                </Title>
                <Group mb="lg">
                  <Avatar size={80} radius="xl" color="blue">
                    JC
                  </Avatar>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      Profile Photo
                    </Text>
                    <Text size="xs" c="dimmed">
                      JPG, PNG or GIF. Max 2MB.
                    </Text>
                    <FileButton onChange={() => {}} accept="image/*">
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
                    <TextInput label="First Name" defaultValue="Jenny" />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Last Name" defaultValue="Chen" />
                  </Grid.Col>
                </Grid>

                <TextInput
                  label="Email"
                  defaultValue="jenny@cleverrecruit.com"
                  mt="md"
                />
                <TextInput
                  label="Phone"
                  defaultValue="+1 (555) 123-4567"
                  mt="md"
                />
                <TextInput label="Job Title" defaultValue="Senior Recruiter" mt="md" />
                <Textarea
                  label="Bio"
                  defaultValue="Passionate recruiter with 5+ years of experience in tech talent acquisition."
                  minRows={3}
                  mt="md"
                />

                <Group justify="flex-end" mt="xl">
                  <Button variant="light">Cancel</Button>
                  <Button>Save Changes</Button>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder padding="lg">
                <Title order={5} mb="md">
                  Account Info
                </Title>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Role
                    </Text>
                    <Text size="sm" fw={500}>
                      Recruiter
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Status
                    </Text>
                    <Text size="sm" fw={500} c="green">
                      Active
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Joined
                    </Text>
                    <Text size="sm" fw={500}>
                      Jan 15, 2024
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Candidates
                    </Text>
                    <Text size="sm" fw={500}>
                      142
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Placements
                    </Text>
                    <Text size="sm" fw={500}>
                      28
                    </Text>
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
                    defaultChecked
                    description="Get notified when a candidate applies to your jobs"
                  />
                  <Switch
                    label="Interview reminders"
                    defaultChecked
                    description="Receive reminders 1 hour before scheduled interviews"
                  />
                  <Switch
                    label="Task due dates"
                    defaultChecked
                    description="Get notified when tasks are approaching their due date"
                  />
                  <Switch
                    label="Weekly reports"
                    defaultChecked
                    description="Receive a weekly summary of your recruitment activity"
                  />
                  <Switch
                    label="Team updates"
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
                    defaultChecked
                    description="Instant updates when candidates change status"
                  />
                  <Switch
                    label="Message notifications"
                    defaultChecked
                    description="Get notified for new messages"
                  />
                  <Switch
                    label="System alerts"
                    defaultChecked
                    description="Important system updates and announcements"
                  />
                </Stack>
              </div>

              <Group justify="flex-end" mt="md">
                <Button>Save Preferences</Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="security">
          <Card withBorder padding="lg" maw={600}>
            <Title order={4} mb="lg">
              Change Password
            </Title>
            <Stack gap="md">
              <PasswordInput label="Current Password" />
              <PasswordInput label="New Password" />
              <PasswordInput label="Confirm New Password" />
              <Group justify="flex-end" mt="md">
                <Button>Update Password</Button>
              </Group>
            </Stack>

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
              <Switch />
            </Group>

            <Divider my="xl" />

            <Title order={4} mb="lg">
              Sessions
            </Title>
            <Stack gap="sm">
              <Card withBorder padding="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Current Session
                    </Text>
                    <Text size="xs" c="dimmed">
                      macOS - Chrome - Last active now
                    </Text>
                  </div>
                  <Text size="xs" c="green" fw={500}>
                    Active
                  </Text>
                </Group>
              </Card>
              <Card withBorder padding="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      iPhone 17 Pro
                    </Text>
                    <Text size="xs" c="dimmed">
                      iOS - Safari - Last active 2 hours ago
                    </Text>
                  </div>
                  <Button variant="subtle" size="xs" color="red">
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
                defaultValue="light"
                data={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System Default' },
                ]}
              />
              <Select
                label="Language"
                defaultValue="en"
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                ]}
              />
              <Select
                label="Date Format"
                defaultValue="dd/mm/yyyy"
                data={[
                  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
                  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
                  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
                ]}
              />
              <Select
                label="Timezone"
                defaultValue="europe-rome"
                data={[
                  { value: 'europe-rome', label: 'Europe/Rome (UTC+2)' },
                  { value: 'europe-london', label: 'Europe/London (UTC+1)' },
                  { value: 'us-eastern', label: 'US/Eastern (UTC-4)' },
                  { value: 'us-pacific', label: 'US/Pacific (UTC-7)' },
                ]}
              />
              <Group justify="flex-end" mt="md">
                <Button>Save Changes</Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
