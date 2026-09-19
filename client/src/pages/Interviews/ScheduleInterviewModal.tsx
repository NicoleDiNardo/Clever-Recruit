import { useEffect, useMemo } from 'react';
import { Modal, Select, MultiSelect, Group, Button, Stack, Alert, Text } from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconClock, IconCheck } from '@tabler/icons-react';
import { useCandidates } from '../../context/CandidatesContext';
import { useInterviews } from '../../context/InterviewsContext';
import { mockJobs, mockUsers } from '../../data/mockData';
import { findJobByTitle } from '../../utils/jobMatch';
import { getLocationTimezone, ORG_TIMEZONE, timezonesDiffer, formatTzOffset } from '../../utils/timezones';
import type { Interview } from '../../types';

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
];

const TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'phone', label: 'Phone' },
  { value: 'onsite', label: 'Onsite' },
];

interface ScheduleInterviewModalProps {
  opened: boolean;
  onClose: () => void;
  /** Pre-fills and locks the candidate — the "schedule from a candidate's
   *  profile" path AUD-P1-02's acceptance criteria call for. Omitted when
   *  opened from Calendar or the Interviews list, where any candidate can
   *  be picked. */
  initialCandidateId?: string;
}

interface FormValues {
  candidateId: string;
  jobId: string;
  interviewerIds: string[];
  date: Date | null;
  time: string;
  durationMinutes: string;
  type: string;
}

const EMPTY_VALUES: FormValues = {
  candidateId: '',
  jobId: '',
  interviewerIds: [],
  date: null,
  time: '',
  durationMinutes: '45',
  type: 'video',
};

export function ScheduleInterviewModal({ opened, onClose, initialCandidateId }: ScheduleInterviewModalProps) {
  const { candidates } = useCandidates();
  const { addInterview, findConflicts } = useInterviews();

  const form = useForm<FormValues>({
    initialValues: EMPTY_VALUES,
    validate: {
      candidateId: (v) => (v ? null : 'Select a candidate'),
      interviewerIds: (v) => (v.length > 0 ? null : 'Select at least one interviewer'),
      date: (v) => (v ? null : 'Pick a date'),
      time: (v) => (/^\d{2}:\d{2}$/.test(v) ? null : 'Pick a time'),
    },
  });

  // Reset (and re-derive the job from the candidate) every time the modal
  // opens fresh, rather than carrying over whatever was left from the last
  // time it was closed.
  useEffect(() => {
    if (!opened) return;
    const candidate = candidates.find((c) => c.id === initialCandidateId);
    form.setValues({
      ...EMPTY_VALUES,
      candidateId: initialCandidateId ?? '',
      jobId: findJobByTitle(candidate?.jobTitle, mockJobs)?.id ?? '',
    });
    // Only re-run when the modal's open state or target candidate changes —
    // not on every form keystroke, which would fight the person typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialCandidateId]);

  const selectedCandidate = candidates.find((c) => c.id === form.values.candidateId);

  const handleCandidateChange = (candidateId: string | null) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    form.setFieldValue('candidateId', candidateId ?? '');
    form.setFieldValue('jobId', findJobByTitle(candidate?.jobTitle, mockJobs)?.id ?? '');
  };

  const scheduledAt = useMemo(() => {
    if (!form.values.date || !/^\d{2}:\d{2}$/.test(form.values.time)) return null;
    const [h, m] = form.values.time.split(':').map(Number);
    const d = new Date(form.values.date);
    d.setHours(h, m, 0, 0);
    return d;
  }, [form.values.date, form.values.time]);

  const conflicts = scheduledAt
    ? findConflicts(form.values.interviewerIds, scheduledAt.toISOString(), Number(form.values.durationMinutes))
    : [];

  // Every mock interviewer shares ORG_TIMEZONE (see utils/timezones.ts) —
  // this only needs to check candidate-vs-org, not interviewer-by-interviewer.
  const candidateTz = getLocationTimezone(selectedCandidate?.location);
  const showTzMismatch =
    scheduledAt && candidateTz && form.values.interviewerIds.length > 0
      ? timezonesDiffer(candidateTz, ORG_TIMEZONE, scheduledAt)
      : false;

  const handleSubmit = form.onSubmit((values) => {
    if (!scheduledAt) return;
    // A double-booked interviewer is a warning, not a hard stop — flagged
    // as an assumption in user-flows.md's flow 15 and resolved that way
    // here, since real interview loops sometimes deliberately overlap
    // (a panel, a hiring manager sitting in on two shortlists back to
    // back). The Alert below already told the person before they got here.
    const interview: Interview = {
      id: `int-${Date.now()}`,
      candidateId: values.candidateId,
      jobId: values.jobId || undefined,
      interviewerIds: values.interviewerIds,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: Number(values.durationMinutes),
      type: values.type as Interview['type'],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    addInterview(interview);
    onClose();
    notifications.show({
      title: 'Interview scheduled',
      message: `${selectedCandidate ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}` : 'Candidate'} — ${scheduledAt.toLocaleDateString()} at ${values.time}.`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Schedule interview" size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Select
            label="Candidate"
            placeholder="Select a candidate"
            data={candidates.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
            searchable
            disabled={Boolean(initialCandidateId)}
            {...form.getInputProps('candidateId')}
            onChange={handleCandidateChange}
          />
          <Select
            label="Job"
            placeholder="No matching job — pick one"
            description={
              selectedCandidate && !form.values.jobId
                ? "Couldn't auto-match this candidate's job title to a listing."
                : undefined
            }
            data={mockJobs.map((j) => ({ value: j.id, label: j.title }))}
            searchable
            clearable
            {...form.getInputProps('jobId')}
          />
          <MultiSelect
            label="Interviewer(s)"
            placeholder="Select interviewer(s)"
            data={mockUsers.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
            searchable
            {...form.getInputProps('interviewerIds')}
          />
          <Group grow align="flex-start">
            <DateInput
              label="Date"
              placeholder="Pick a date"
              minDate={new Date()}
              valueFormat="MMM D, YYYY"
              {...form.getInputProps('date')}
            />
            <TimeInput label="Time" {...form.getInputProps('time')} />
          </Group>
          <Group grow>
            <Select label="Duration" data={DURATIONS} allowDeselect={false} {...form.getInputProps('durationMinutes')} />
            <Select label="Type" data={TYPES} allowDeselect={false} {...form.getInputProps('type')} />
          </Group>

          {conflicts.length > 0 && (
            <Alert color="orange" icon={<IconAlertTriangle size={16} />} title="Interviewer double-booked">
              <Stack gap={4}>
                {conflicts.map((c) => {
                  const busyInterviewer = mockUsers.find((u) => c.interviewerIds.includes(u.id));
                  return (
                    <Text key={c.id} size="sm">
                      {busyInterviewer ? `${busyInterviewer.firstName} ${busyInterviewer.lastName}` : 'This interviewer'}{' '}
                      already has an interview at {new Date(c.scheduledAt).toLocaleString()}. You can still schedule
                      this one, or pick a different time or interviewer.
                    </Text>
                  );
                })}
              </Stack>
            </Alert>
          )}

          {showTzMismatch && scheduledAt && candidateTz && (
            <Alert color="yellow" icon={<IconClock size={16} />} title="Time-zone difference">
              <Text size="sm">
                {selectedCandidate?.firstName} appears to be in a different time zone (
                {formatTzOffset(candidateTz, scheduledAt)}) than the interviewer ({formatTzOffset(ORG_TIMEZONE, scheduledAt)}
                ). Double-check this time works for both before sending the invite.
              </Text>
            </Alert>
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule{conflicts.length > 0 ? ' anyway' : ''}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
