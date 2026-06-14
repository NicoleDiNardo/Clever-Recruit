import {
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { Candidate } from '../../types';

interface CreateCandidateFormProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, unknown>) => void;
  initialValues?: Candidate;
}

export function CreateCandidateForm({ onClose, onSubmit, initialValues }: CreateCandidateFormProps) {
  const form = useForm({
    initialValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      jobTitle: initialValues?.jobTitle || '',
      score: initialValues?.score || 0,
      status: initialValues?.status || 'active',
      location: initialValues?.location || '',
      currentPosition: initialValues?.currentPosition || '',
      currentOrganization: initialValues?.currentOrganization || '',
      employmentStatus: initialValues?.employmentStatus || '',
    },
    validate: {
      firstName: (v) => (v.length < 1 ? 'First name is required' : null),
      lastName: (v) => (v.length < 1 ? 'Last name is required' : null),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      onClose();
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              {...form.getInputProps('firstName')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              {...form.getInputProps('lastName')}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Email"
          placeholder="email@example.com"
          required
          {...form.getInputProps('email')}
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="+44 (452) 886 09 12"
              {...form.getInputProps('phone')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Location"
              placeholder="City, Country"
              {...form.getInputProps('location')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Job Title"
              placeholder="e.g. Software Engineer"
              {...form.getInputProps('jobTitle')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Score"
              placeholder="0-100"
              min={0}
              max={100}
              {...form.getInputProps('score')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Current Position"
              placeholder="Current role"
              {...form.getInputProps('currentPosition')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Current Organization"
              placeholder="Company name"
              {...form.getInputProps('currentOrganization')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Status"
              data={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              {...form.getInputProps('status')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Employment Status"
              data={[
                { value: 'Employed', label: 'Employed' },
                { value: 'Unemployed', label: 'Unemployed' },
                { value: 'Freelance', label: 'Freelance' },
              ]}
              {...form.getInputProps('employmentStatus')}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initialValues ? 'Save Changes' : 'Create Candidate'}</Button>
        </Group>
      </Stack>
    </form>
  );
}
