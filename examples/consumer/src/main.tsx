import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  LocaleProvider,
  Container,
  Card,
  Stack,
  PageHeader,
  TextField,
  Button,
  Status,
  Dialog,
  DialogClose,
  Text,
  Inline,
} from '@gregui/react';
import { createTheme } from '@gregui/tokens';
import '@gregui/react/styles.css';
function Consumer() {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <LocaleProvider>
      <ThemeProvider theme={createTheme('elevated')}>
        <Container>
          <PageHeader
            eyebrow="Independent consuming app"
            title="Your next app starts here."
            description="This application imports the built gregUI packages and contains no presentation CSS."
          />
          <Card>
            <Stack>
              <TextField
                label="Project name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
              <Inline>
                <Button disabled={!name.trim()} onClick={() => setSaved(true)}>
                  Create project
                </Button>
                <Dialog
                  trigger={<Button variant="secondary">About this example</Button>}
                  title="One shared foundation"
                  description="The consuming app owns its behavior. gregUI owns its presentation."
                  footer={
                    <DialogClose>
                      <Button>Close</Button>
                    </DialogClose>
                  }
                >
                  <Text>
                    Install the packages, import the stylesheet once and compose your interface.
                  </Text>
                </Dialog>
              </Inline>
              <Status>{saved ? `Project “${name}” created for this session.` : ''}</Status>
            </Stack>
          </Card>
        </Container>
      </ThemeProvider>
    </LocaleProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Consumer />);
