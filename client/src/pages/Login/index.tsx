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
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length < 1 ? 'Password is required' : null),
    },
  });

  const handleSubmit = form.onSubmit(() => {
    localStorage.setItem('token', 'demo-token');
    navigate('/dashboard');
  });

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
            <img src="/logo-mark.png" alt="Clever Recruit" height={40} />
            <Text fw={700} size="xl" c="blue.7">
              Clever Recruit
            </Text>
          </Group>
        </Center>

        <Title order={2} ta="center" mb={4}>
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
          <Button variant="light" color="gray">
            Google
          </Button>
          <Button variant="light" color="gray">
            Microsoft
          </Button>
        </Group>

        <Text ta="center" mt="lg" size="sm" c="dimmed">
          Don't have an account?{' '}
          <Anchor size="sm" c="blue.6">
            Contact Admin
          </Anchor>
        </Text>
      </Card>
    </Box>
  );
}
