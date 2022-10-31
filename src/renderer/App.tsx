import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  CopyButton,
  Group,
  MantineProvider,
  Modal,
  PasswordInput,
  Popover,
  Progress,
  Space,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  NotificationsProvider,
  showNotification,
} from '@mantine/notifications';
import {
  IconCheck,
  IconCopy,
  IconPassword,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons';
import { useEffect, useState } from 'react';
import './App.css';

interface AppProviderProps {
  children: React.ReactNode;
}

interface PasswordCardProps extends PasswordData {}

const AppProviders = ({ children }: AppProviderProps) => {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <NotificationsProvider>{children}</NotificationsProvider>
    </MantineProvider>
  );
};

export const PasswordCard = (props: PasswordCardProps) => {
  return (
    <Card radius="md" withBorder>
      <Group position="apart">
        <div>
          <Title order={3}>{props.website}</Title>
          <Space h="md" />
          <PasswordInput
            sx={{ width: '200px' }}
            value={props.password}
            readOnly
          />
        </div>
        <CopyButton value={props.password}>
          {({ copied, copy }) => (
            <>
              {copied &&
                showNotification({
                  title: 'Copied!',
                  message: 'Password copied to clipboard',
                  color: 'teal',
                  icon: <IconCheck size={16} />,
                })}
              <ActionIcon
                variant="filled"
                size="xl"
                onClick={copy}
                color="blue"
              >
                <IconCopy size={24} />
              </ActionIcon>
            </>
          )}
        </CopyButton>
      </Group>
    </Card>
  );
};

type PasswordData = {
  website: string;
  password: string;
};

function Main() {
  const [needMasterKey, setNeedMasterKey] = useState(true);
  const [masterKey, setMasterKey] = useState('');
  const [addPasswordClicked, setAddPasswordClicked] = useState(false);
  const [newWebsite, setNewWebsite] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwords, setPasswords] = useState<PasswordData[]>([]);

  function generatePassword() {
    var length = 24,
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=',
      retVal = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  function PasswordRequirement({
    meets,
    label,
  }: {
    meets: boolean;
    label: string;
  }) {
    return (
      <Text
        color={meets ? 'teal' : 'red'}
        sx={{ display: 'flex', alignItems: 'center' }}
        mt={7}
        size="sm"
      >
        {meets ? <IconCheck size={14} /> : <IconX size={14} />}{' '}
        <Box ml={10}>{label}</Box>
      </Text>
    );
  }

  function getStrength(password: string) {
    let multiplier = password.length > 7 ? 0 : 1;

    requirements.forEach((requirement) => {
      if (!requirement.re.test(password)) {
        multiplier += 1;
      }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
  }

  const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
  ];

  const [popoverOpened, setPopoverOpened] = useState(false);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(masterKey)}
    />
  ));
  const strength = getStrength(masterKey);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  async function createPassword(
    password: string,
    masterKey: string,
    website: string
  ) {
    const data = { password, masterKey, website };
    //@ts-ignore
    const c = await window.electron.createPassword(JSON.stringify(data));
    await getPasswords(masterKey);
  }
  async function getPasswords(masterKey: string) {
    if (!(strength >= 50)) {
      showNotification({
        title: 'Master key too weak',
        message: 'Master key must be at least 50% strong',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }
    const data = { masterKey };
    //@ts-ignore
    let d = await window.electron.getPasswords(JSON.stringify(data));
    d = JSON.parse(d);
    if (d.error) {
      showNotification({
        title: 'Error',
        message: d.error,
        color: 'red',
        icon: <IconX size={24} />,
      });
      return;
    }
    setNeedMasterKey(false);
    setPasswords(d);
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Modal opened={needMasterKey} onClose={() => {}} size="lg">
        <Stack>
          <Title>Enter your Master Key</Title>
          <Text>
            If this is your first time, create your own (strong) master key
            below. Or, enter the master key you used before.
          </Text>
          <Popover
            opened={popoverOpened}
            position="bottom"
            width="target"
            transition="pop"
          >
            <Popover.Target>
              <div
                onFocusCapture={() => setPopoverOpened(true)}
                onBlurCapture={() => setPopoverOpened(false)}
              >
                <PasswordInput
                  placeholder="Master Key"
                  onChange={(e) => setMasterKey(e.target.value)}
                />
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Progress
                color={color}
                value={strength}
                size={5}
                style={{ marginBottom: 10 }}
              />
              <PasswordRequirement
                label="Includes at least 8 characters"
                meets={masterKey.length > 7}
              />
              {checks}
            </Popover.Dropdown>
          </Popover>
        </Stack>
        <Space h="md" />
        <Center>
          <Button
            onClick={() => {
              getPasswords(masterKey);
            }}
          >
            Submit
          </Button>
        </Center>
      </Modal>
      <Modal
        opened={addPasswordClicked}
        onClose={() => setAddPasswordClicked(false)}
        size="lg"
      >
        <Stack>
          <Title>Add a new password</Title>
          <Text>Enter the website and password below.</Text>
          <Box>
            <Stack>
              <TextInput
                placeholder="Website"
                onChange={(e) => setNewWebsite(e.target.value)}
                label="Website"
              />
              <PasswordInput
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label="Password"
              />
              <Group position='center'>
                <Button
                  color="green"
                  leftIcon={<IconPlus size={24} />}
                  onClick={() => {
                    createPassword(newPassword, masterKey, newWebsite);
                    setAddPasswordClicked(false);
                  }}
                >
                  Add Password
                </Button>
                <Button
                  color="teal"
                  leftIcon={<IconPassword size={24} />}
                  onClick={() => setNewPassword(generatePassword())}
                >
                  Generate Password
                </Button>
              </Group>
            </Stack>
          </Box>
        </Stack>
      </Modal>
      <Center>
        <Title>Bubble</Title>
      </Center>
      <br />
      <Center>
        <Text size="sm">V0.1.3, expect bugs</Text>
      </Center>
      <Box sx={{ padding: '20px' }}>
        {passwords.length ? (
          <Stack>
            {passwords.map((data) => (
              <PasswordCard key={passwords.indexOf(data)} {...data} />
            ))}
          </Stack>
        ) : (
          <Center>
            <Text>No passwords yet!</Text>
          </Center>
        )}
      </Box>
      <Center>
        <Button
          onClick={() => {
            setAddPasswordClicked(true);
            setNewPassword('');
          }}
          color="green"
          leftIcon={<IconPlus size={24} />}
        >
          Add Password
        </Button>
      </Center>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
