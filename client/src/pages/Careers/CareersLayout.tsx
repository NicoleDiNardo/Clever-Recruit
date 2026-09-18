import { Outlet, Link } from 'react-router-dom';
import { Box, Group, Text, Anchor, Container, Divider } from '@mantine/core';
import { useMantineTheme } from '@mantine/core';

/**
 * The public shell for /careers/* — deliberately not AppShell/Sidebar (that's
 * the authenticated staff tool). A candidate never sees staff navigation.
 */
export function CareersLayout() {
  const theme = useMantineTheme();

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        style={{
          background: `linear-gradient(135deg, ${theme.colors.blue[5]} 0%, ${theme.colors.blue[7]} 100%)`,
        }}
      >
        <Container size="lg" px="md">
          <Group h={64} justify="space-between" wrap="nowrap">
            <Anchor component={Link} to="/careers" underline="never">
              <Group gap="xs" wrap="nowrap">
                <img src="/logo-mark.svg" alt="Clever Recruit" height={28} />
                <Text fw={700} size="lg" c="white">
                  Clever Recruit
                </Text>
              </Group>
            </Anchor>
            <Group gap="lg" wrap="nowrap">
              <Anchor component={Link} to="/careers" c="white" size="sm" underline="never">
                Open roles
              </Anchor>
              <Anchor component={Link} to="/careers/status" c="white" size="sm" underline="never">
                Check application status
              </Anchor>
              <Anchor component={Link} to="/login" c="white" size="sm" underline="never" fw={600}>
                Recruiter sign in
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>

      <Box style={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Divider />
      <Container size="lg" px="md" py="lg">
        <Text size="xs" c="dimmed" ta="center">
          Portfolio demo — applications submitted here are stored only in your browser and are
          never sent or emailed anywhere.
        </Text>
      </Container>
    </Box>
  );
}
