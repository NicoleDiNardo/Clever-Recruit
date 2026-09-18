import { Stack, UnstyledButton, Text, rem, Divider } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { mainNavItems, bottomNavItems, visibleNavItems, type NavItem } from '../config/navigation';
import { usePermissions } from '../hooks/usePermissions';
import classes from './Sidebar.module.css';

interface NavItemProps {
  /**
   * Tabler's icons accept `stroke` as number | string; typing it as `number`
   * here made every icon in the nav a type error the Vite build never
   * surfaced, because vite build does not typecheck.
   */
  icon: React.ComponentType<{ size?: number | string; stroke?: number | string }>;
  label: string;
  path: string;
  active?: boolean;
  onClick: () => void;
}

function NavItemButton({ icon: Icon, label, active, onClick }: NavItemProps) {
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

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = usePermissions();

  const visibleMain: NavItem[] = visibleNavItems(mainNavItems, role);
  const visibleBottom: NavItem[] = visibleNavItems(bottomNavItems, role);

  return (
    <nav className={classes.navbar} aria-label="Main navigation">
      <Stack gap={rem(4)} mt="md" px="sm" style={{ flex: 1 }}>
        {visibleMain.map((item) => (
          <NavItemButton
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
        {visibleBottom.map((item) => (
          <NavItemButton
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
