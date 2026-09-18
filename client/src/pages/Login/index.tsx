import {
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Card,
  Stack,
  Box,
  Checkbox,
  Anchor,
  Group,
  Divider,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const DEMO_ACCOUNTS = [
  { userId: '1', label: 'Jenny — Recruiter', description: 'Full access: jobs, candidates, pipeline.' },
  { userId: '5', label: 'Alex — Hiring manager', description: 'Reviews, shortlists and leaves feedback.' },
  { userId: '3', label: 'Sarah — Admin', description: 'Everything a recruiter has, plus user management.' },
];

export function Login() {
  const navigate = useNavigate();
  const { login, loginAs, isAuthenticated } = useUser();

  const form = useForm({
    initialValues: {
      email: 'jenny@cleverrecruit.com',
      password: 'password',
      remember: false,
    },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length < 1 ? 'Password is required' : null),
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = form.onSubmit((values) => {
    login(values.email, values.password);
    navigate('/dashboard');
  });

  const handleDemoRole = (userId: string, label: string) => {
    loginAs(userId);
    notifications.show({ title: 'Signed in', message: `Continuing as ${label}.`, color: 'blue' });
    navigate('/dashboard');
  };

  const handleSso = (provider: string) => {
    login(`jenny@cleverrecruit.com`, 'demo');
    notifications.show({
      title: 'Signed in',
      message: `Demo sign-in via ${provider} complete.`,
      color: 'blue',
    });
    navigate('/dashboard');
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e7f5ff 0%, #d0ebff 50%, #a5d8ff 100%)',
        padding: 16,
      }}
    >
      <Card
        shadow="xl"
        padding={40}
        radius="lg"
        w="100%"
        maw={440}
      >
        <Center mb="xl">
          <Group gap="xs">
            <img src="/logo-mark.svg" alt="Clever Recruit" height={40} style={{ filter: 'brightness(0) saturate(100%) invert(37%) sepia(93%) saturate(1352%) hue-rotate(196deg) brightness(96%) contrast(91%)' }} />
            <Text fw={700} size="xl" c="blue.7">
              Clever Recruit
            </Text>
          </Group>
        </Center>

        <Title order={1} size="h2" ta="center" mb={4}>
          Welcome back
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          Sign in to your Clever Recruit account
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              size="md"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              {...form.getInputProps('password')}
            />
            <Group justify="space-between">
              <Checkbox
                label="Remember me"
                size="sm"
                {...form.getInputProps('remember', { type: 'checkbox' })}
              />
              <Anchor size="sm" c="blue.6">
                Forgot password?
              </Anchor>
            </Group>
            <Button type="submit" fullWidth size="md" mt="sm">
              Sign In
            </Button>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />

        <Group grow>
          <Button variant="light" color="gray" onClick={() => handleSso('Google')}>
            Google
          </Button>
          <Button variant="light" color="gray" onClick={() => handleSso('Microsoft')}>
            Microsoft
          </Button>
        </Group>

        <Text ta="center" mt="lg" size="sm" c="dimmed">
          Don't have an account?{' '}
          <Anchor size="sm" c="blue.6">
            Contact Admin
          </Anchor>
        </Text>

        <Divider label="Try a role — this portfolio demo has no real accounts" labelPosition="center" my="lg" />

        <Stack gap="xs">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.userId}
              variant="default"
              fullWidth
              h="auto"
              py={8}
              onClick={() => handleDemoRole(account.userId, account.label)}
            >
              <Group justify="space-between" wrap="nowrap" w="100%">
                <Box ta="left">
                  <Text size="sm" fw={600}>{account.label}</Text>
                  <Text size="xs" c="dimmed" fw={400}>{account.description}</Text>
                </Box>
                <Text size="xs" c="dimmed">Sign in →</Text>
              </Group>
            </Button>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
