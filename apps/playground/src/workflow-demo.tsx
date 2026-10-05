import { useState } from 'react';
import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  DescriptionList,
  Pagination,
  Stack,
  Table,
  Text,
  TextField,
  Wizard,
} from '@gregui/react';

export function OnboardingDemo() {
  const [name, setName] = useState('');
  const [updates, setUpdates] = useState(false);
  const [fail, setFail] = useState(false);
  const [done, setDone] = useState(false);
  if (done)
    return (
      <Stack>
        <Alert tone="success" live title="Workspace ready">
          {name} is ready. This was a local demonstration; nothing was saved.
        </Alert>
        <Button variant="secondary" onClick={() => setDone(false)}>
          Start again
        </Button>
      </Stack>
    );
  return (
    <Stack>
      <Text tone="muted">
        Try the complete setup flow. Values survive Back and Continue; nothing is sent or stored.
      </Text>
      <Checkbox
        label="Simulate a save failure"
        checked={fail}
        onChange={(e) => setFail(e.target.checked)}
      />
      <Wizard
        label="Workspace setup"
        finishLabel="Create workspace"
        onComplete={async () => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          if (fail) throw new Error('Demo failure');
          setDone(true);
        }}
        steps={[
          {
            value: 'workspace',
            label: 'Your workspace',
            description: 'Start with a name.',
            content: (
              <TextField
                label="Workspace name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ),
          },
          {
            value: 'preferences',
            label: 'Preferences',
            description: 'Make it feel like yours.',
            content: (
              <Stack>
                <Checkbox
                  label="Product updates"
                  checked={updates}
                  onChange={(e) => setUpdates(e.target.checked)}
                />
                <Accordion
                  items={[
                    {
                      value: 'privacy',
                      title: 'How is this preference used?',
                      content: (
                        <Text>
                          This demo keeps the choice in memory only. Your app owns consent and
                          delivery.
                        </Text>
                      ),
                    },
                  ]}
                />
              </Stack>
            ),
          },
          {
            value: 'review',
            label: 'Review',
            description: 'Check your choices before creating.',
            content: (
              <DescriptionList
                items={[
                  { term: 'Workspace', description: name },
                  { term: 'Product updates', description: updates ? 'Enabled' : 'Disabled' },
                ]}
              />
            ),
          },
        ]}
      />
    </Stack>
  );
}

export function PaginatedListDemo() {
  const [page, setPage] = useState(1);
  const projects = [
    'Customer portal',
    'Team workspace',
    'Design library',
    'Help centre',
    'Mobile app',
    'Reporting',
    'Member area',
  ];
  return (
    <Stack>
      <Table
        caption="Project directory"
        columns={['Project', 'Status']}
        rows={projects.slice((page - 1) * 3, page * 3).map((name) => [name, 'Active'])}
      />
      <Pagination page={page} pageCount={Math.ceil(projects.length / 3)} onPageChange={setPage} />
    </Stack>
  );
}
