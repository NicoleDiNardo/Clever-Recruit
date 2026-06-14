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
              <img
                src="/logo.svg"
                alt="Clever Recruit"
                height={36}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
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
