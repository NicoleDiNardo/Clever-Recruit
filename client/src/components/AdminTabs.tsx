import { Tabs } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconUsers, IconShieldCheck, IconBuildingSkyscraper } from '@tabler/icons-react';

const TABS = [
  { value: '/admin/users', label: 'Users', icon: IconUsers },
  { value: '/admin/roles', label: 'Roles & permissions', icon: IconShieldCheck },
  { value: '/admin/organisation', label: 'Organisation', icon: IconBuildingSkyscraper },
];

/**
 * The three admin routes (users / roles / organisation) sync to a Tabs bar
 * rather than living behind three separate sidebar entries — the sidebar
 * keeps one "Admin" item, and this is how you get to the other two. Same
 * routed-tabs idea as Pipeline's ?jobId sync, just keyed on pathname.
 */
export function AdminTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Tabs value={location.pathname} onChange={(v) => v && navigate(v)} mb="lg">
      <Tabs.List>
        {TABS.map((t) => (
          <Tabs.Tab key={t.value} value={t.value} leftSection={<t.icon size={16} />}>
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
