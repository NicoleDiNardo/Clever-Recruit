import { Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Text, Avatar, ActionIcon, Indicator, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconSearch, IconBell, IconMoonStars } from '@tabler/icons-react';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 70,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: `linear-gradient(135deg, ${theme.colors.blue[5]} 0%, ${theme.colors.blue[7]} 100%)`,
          borderBottom: 'none',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {isMobile && (
              <Burger opened={mobileOpened} onClick={toggleMobile} color="white" size="sm" />
            )}
            <Group gap="xs">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="2" />
                <circle cx="14" cy="10" r="4" fill="white" />
                <path d="M7 22c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <Text fw={700} size="lg" c="white">
                Clever Recruit
              </Text>
            </Group>
          </Group>
          <Group gap="sm">
            <ActionIcon variant="subtle" color="white" size="lg">
              <IconSearch size={20} />
            </ActionIcon>
            <Indicator color="red" size={8} offset={4} processing>
              <ActionIcon variant="subtle" color="white" size="lg">
                <IconBell size={20} />
              </ActionIcon>
            </Indicator>
            <ActionIcon variant="subtle" color="white" size="lg">
              <IconMoonStars size={20} />
            </ActionIcon>
            <Avatar
              src={null}
              alt="User"
              radius="xl"
              size="sm"
              color="blue.2"
            >
              JC
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        <Sidebar onClose={closeMobile} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
