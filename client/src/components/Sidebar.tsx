import { Stack, UnstyledButton, Text, rem, Divider } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconUsers,
  IconBriefcase,
  IconBuilding,
  IconUsersGroup,
  IconCalendarEvent,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';
import classes from './Sidebar.module.css';

interface NavItemProps {
  icon: React.FC<{ size?: number | string; stroke?: number }>;
  label: string;
  path: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.link}
      data-active={active || undefined}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={20} stroke={1.5} />
      <Text component="span" size="xs" fw={500} className={classes.label}>
        {label}
      </Text>
    </UnstyledButton>
  );
}

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

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={classes.navbar} aria-label="Main navigation">
      <Stack gap={rem(4)} mt="md" px="sm" style={{ flex: 1 }}>
        {mainNavItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          />
        ))}
      </Stack>
      <Divider mx="sm" />
      <Stack gap={rem(4)} mb="md" mt="sm" px="sm">
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          />
        ))}
      </Stack>
    </nav>
  );
}
