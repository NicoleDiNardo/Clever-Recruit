import { Stack, Tooltip, UnstyledButton, rem, Divider } from '@mantine/core';
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
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={24} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
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
    <nav className={classes.navbar}>
      <Stack align="center" gap={rem(8)} mt="md" style={{ flex: 1 }}>
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
      <Stack align="center" gap={rem(8)} mb="md" mt="sm">
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
