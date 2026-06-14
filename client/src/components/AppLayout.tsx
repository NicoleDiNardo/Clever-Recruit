import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppShell, Burger, Group, Text, Avatar, ActionIcon, Indicator,
  useMantineTheme, useMantineColorScheme, NavLink, Stack, rem, Divider,
  Modal, TextInput, Popover, ScrollArea, Badge, Box, Menu,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useUser } from '../context/UserContext';
import {
  IconDashboard,
  IconUsers,
  IconBriefcase,
  IconBuilding,
  IconUsersGroup,
  IconCalendarEvent,
  IconChartBar,
  IconSettings,
  IconSearch,
  IconBell,
  IconMoonStars,
  IconSun,
  IconUserPlus,
  IconCalendar,
  IconMessage,
  IconCheck,
  IconLogout,
  IconSettings as IconSettingsIcon,
  IconUser as IconUserIcon,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const mainNavItems = [
  { icon: IconDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: IconUsers, label: 'Candidates', path: '/candidates' },
  { icon: IconBriefcase, label: 'Jobs', path: '/jobs' },
  { icon: IconBuilding, label: 'Companies', path: '/companies' },
  { icon: IconUsersGroup, label: 'Team', path: '/team' },
  { icon: IconCalendarEvent, label: 'Calendar', path: '/calendar' },
  { icon: IconChartBar, label: 'Reports', path: '/reports' },
];

const bottomNavItems = [
  { icon: IconSettings, label: 'Settings', path: '/settings' },
];

const initialNotifications = [
  { id: 1, title: 'New candidate applied', description: 'Sarah Connor applied for Senior Developer', time: '5 min ago', read: false, icon: IconUserPlus },
  { id: 2, title: 'Interview scheduled', description: 'Interview with John Smith tomorrow at 10:00 AM', time: '1 hour ago', read: false, icon: IconCalendar },
  { id: 3, title: 'New message', description: 'HR Team left a comment on the job posting', time: '3 hours ago', read: true, icon: IconMessage },
  { id: 4, title: 'Task completed', description: 'Background check for Mike Johnson is done', time: 'Yesterday', read: true, icon: IconCheck },
];

const searchablePages = [
  { label: 'Dashboard', path: '/dashboard', icon: IconDashboard },
  { label: 'Candidates', path: '/candidates', icon: IconUsers },
  { label: 'Jobs', path: '/jobs', icon: IconBriefcase },
  { label: 'Companies', path: '/companies', icon: IconBuilding },
  { label: 'Team', path: '/team', icon: IconUsersGroup },
  { label: 'Calendar', path: '/calendar', icon: IconCalendarEvent },
  { label: 'Reports', path: '/reports', icon: IconChartBar },
  { label: 'Settings', path: '/settings', icon: IconSettings },
];

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [searchOpened, { open: openSearch, close: closeSearch }] = useDisclosure(false);
  const [notifOpened, setNotifOpened] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifList, setNotifList] = useState(initialNotifications);
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const unreadCount = notifList.filter((n) => !n.read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  const markAsRead = (id: number) => {
    setNotifList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredPages = searchablePages.filter((page) =>
    page.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { sm: 70, base: 250 },
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
                src="/logo-mark.svg"
                alt="Clever Recruit"
                height={32}
              />
              <Text fw={700} size="lg" c="white">
                Clever Recruit
              </Text>
            </Group>
          </Group>
          <Group gap="sm">
            <ActionIcon variant="subtle" color="white" size="lg" onClick={openSearch}>
              <IconSearch size={20} />
            </ActionIcon>
            <Popover opened={notifOpened} onChange={setNotifOpened.toggle} position="bottom-end" width={360} shadow="lg">
              <Popover.Target>
                <Indicator color="red" size={8} offset={4} processing disabled={unreadCount === 0}>
                  <ActionIcon variant="subtle" color="white" size="lg" onClick={setNotifOpened.toggle}>
                    <IconBell size={20} />
                  </ActionIcon>
                </Indicator>
              </Popover.Target>
              <Popover.Dropdown p={0}>
                <Group justify="space-between" p="sm" pb="xs">
                  <Text fw={600} size="sm">Notifications</Text>
                  <Group gap="xs">
                    {unreadCount > 0 && <Badge size="sm" variant="light">{unreadCount} new</Badge>}
                    {unreadCount > 0 && (
                      <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={markAllRead}>
                        Mark all read
                      </Text>
                    )}
                  </Group>
                </Group>
                <Divider />
                <ScrollArea.Autosize mah={320}>
                  {notifList.map((notif) => (
                    <Box
                      key={notif.id}
                      p="sm"
                      style={{
                        borderBottom: '1px solid var(--mantine-color-default-border)',
                        backgroundColor: notif.read ? undefined : 'var(--mantine-color-blue-0)',
                        cursor: 'pointer',
                      }}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <Group gap="sm" wrap="nowrap">
                        <ActionIcon variant="light" color={notif.read ? 'gray' : 'blue'} size="lg" radius="xl">
                          <notif.icon size={16} />
                        </ActionIcon>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={notif.read ? 400 : 600} truncate>
                            {notif.title}
                          </Text>
                          <Text size="xs" c="dimmed" truncate>
                            {notif.description}
                          </Text>
                          <Text size="xs" c="dimmed" mt={2}>
                            {notif.time}
                          </Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                </ScrollArea.Autosize>
              </Popover.Dropdown>
            </Popover>
            <ActionIcon variant="subtle" color="white" size="lg" onClick={() => toggleColorScheme()}>
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoonStars size={20} />}
            </ActionIcon>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Avatar
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  radius="xl"
                  size="sm"
                  color="blue.2"
                  style={{ cursor: 'pointer' }}
                >
                  {user.firstName[0]}{user.lastName[0]}
                </Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user.firstName} {user.lastName}</Menu.Label>
                <Menu.Item leftSection={<IconUserIcon size={14} />} onClick={() => navigate('/settings')}>
                  My Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettingsIcon size={14} />} onClick={() => navigate('/settings')}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => { logout(); navigate('/login'); }}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        {isMobile ? (
          <Stack gap={0} style={{ height: '100%' }}>
            <Stack gap={4} p="sm" style={{ flex: 1 }}>
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<item.icon size={20} stroke={1.5} />}
                  active={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    closeMobile();
                  }}
                  variant="light"
                />
              ))}
            </Stack>
            <Divider />
            <Stack gap={4} p="sm">
              {bottomNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<item.icon size={20} stroke={1.5} />}
                  active={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    closeMobile();
                  }}
                  variant="light"
                />
              ))}
            </Stack>
          </Stack>
        ) : (
          <Sidebar onClose={closeMobile} />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <Modal
        opened={searchOpened}
        onClose={closeSearch}
        title={<Group gap="xs"><Text fw={600}>Quick Navigation</Text><Badge size="xs" variant="light" color="gray">⌘K</Badge></Group>}
        size="sm"
        overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
      >
        <TextInput
          placeholder="Search pages..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="sm"
          autoFocus
        />
        <Stack gap={4}>
          {filteredPages.map((page) => (
            <NavLink
              key={page.path}
              label={page.label}
              leftSection={<page.icon size={18} stroke={1.5} />}
              active={location.pathname === page.path}
              onClick={() => {
                navigate(page.path);
                closeSearch();
                setSearchQuery('');
              }}
              variant="light"
            />
          ))}
          {filteredPages.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No results found
            </Text>
          )}
        </Stack>
      </Modal>
    </AppShell>
  );
}
