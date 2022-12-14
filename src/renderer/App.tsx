import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import packageJson from '../../package.json';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
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

interface deletePasswordData extends PasswordData {
  masterKey: string;
}

interface PasswordCardProps extends PasswordData {
  deleteFn: (data: deletePasswordData) => void;
  masterKey: string;
}

const AppProviders = ({ children }: AppProviderProps) => {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <NotificationsProvider>{children}</NotificationsProvider>
    </MantineProvider>
  );
};

export const PasswordCard = (props: PasswordCardProps) => {
  const [openDeletePwdModal, setOpenDeletePwdModal] = useState(false);
  const [confirmMasterKey, setConfirmMasterKey] = useState('');
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Modal
        title="Are you sure?"
        opened={openDeletePwdModal}
        onClose={() => setOpenDeletePwdModal(false)}
        size="sm"
      >
        <Text>
          Are you sure you want to delete this password? This action{' '}
          <b>cannot</b> be undone.
        </Text>
        <Space h="md" />
        <Stack>
          <PasswordInput
            label="Master Key"
            placeholder="Enter your Master Key to confirm"
            onChange={(e) => {
              setConfirmMasterKey(e.target.value);
            }}
          />
          <Checkbox
            label="I understand that this action cannot be undone"
            onChange={(e) => {
              setConfirm(e.target.checked);
            }}
          />
        </Stack>
        <Space h="md" />
        <Center>
          <Button
            color="red"
            disabled={!confirm || confirmMasterKey !== props.masterKey}
            leftIcon={<IconTrash size={24} />}
            onClick={() => {
              if (confirmMasterKey === props.masterKey && confirm) {
                props.deleteFn({
                  masterKey: props.masterKey,
                  nickname: props.nickname,
                  password: props.password,
                  website: props.website,
                });
                setOpenDeletePwdModal(false);
              } else {
                showNotification({
                  title: 'Error',
                  message: 'Master Key is incorrect or you did not confirm',
                  color: 'red',
                  icon: <IconX size={24} />,
                });
              }
            }}
          >
            Delete "{`${props.website} (${props.nickname})`}"
          </Button>
        </Center>
      </Modal>
      <Card radius="md" withBorder>
        <Group position="apart">
          <div>
            <Title order={3}>
              {props.website} {props.nickname && `(${props.nickname})`}
            </Title>
            <Space h="md" />
            <PasswordInput
              sx={{ width: '200px' }}
              value={props.password}
              readOnly
            />
          </div>
          <Group>
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
            <ActionIcon
              variant="filled"
              size="xl"
              onClick={() => {
                setOpenDeletePwdModal(true);
              }}
              color="red"
            >
              <IconTrash size={24} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>
    </>
  );
};

type PasswordData = {
  website: string;
  password: string;
  nickname?: string;
};

function Main() {
  const [needMasterKey, setNeedMasterKey] = useState(true);
  const [masterKey, setMasterKey] = useState('');
  const [addPasswordClicked, setAddPasswordClicked] = useState(false);
  const [newWebsite, setNewWebsite] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [openDeleteDataModal, setDeleteDataModal] = useState(false);
  const [deleteDataConfirm, setDeleteDataConfirm] = useState(false);
  const [deleteDataMK, setDeleteDataMK] = useState('');

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

  const deletePassword = async ({
    website,
    password,
    nickname,
    masterKey,
  }: deletePasswordData) => {
    const data = {
      website,
      password,
      masterKey,
      nickname,
    };
    //@ts-ignore
    let d = await window.electron.deletePassword(JSON.stringify(data));
    if (d.error) {
      showNotification({
        title: 'Error',
        message: d.error,
        color: 'red',
        icon: <IconX size={16} />,
      });
    } else {
      showNotification({
        title: 'Success',
        message: 'Password deleted',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
      getPasswords(masterKey);
    }
  };
  const emptyCreatePasswordArgs = () => {
    setNewWebsite('');
    setNewPassword('');
    setNewNickname('');
  };

  async function createPassword(
    password: string,
    masterKey: string,
    website: string,
    nickname?: string
  ) {
    const data = { password, masterKey, website, nickname };
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
            If this is your first time, create your own <b>strong</b> master key
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
        opened={openDeleteDataModal}
        onClose={() => setDeleteDataModal(false)}
        size="sm"
        title="Are you sure?"
      >
        <Stack>
          <Text>
            This will delete all of your passwords. This action <b>cannot</b> be
            undone.
          </Text>
          <PasswordInput
            onChange={(e) => setDeleteDataMK(e.target.value)}
            placeholder="Type your Master Key to confirm"
          />
        </Stack>
        <Space h="md" />
        <Checkbox
          checked={deleteDataConfirm}
          label="I understand that this action cannot be undone"
          onChange={(e) => {
            setDeleteDataConfirm(e.target.checked);
          }}
        />
        <Center>
          <Button
            leftIcon={<IconTrash size={24} />}
            color="red"
            disabled={!deleteDataConfirm || deleteDataMK !== masterKey}
            onClick={async () => {
              //@ts-ignore
              await window.electron.deleteAllPasswords();
              showNotification({
                title: 'Success',
                message: 'All passwords deleted',
                color: 'teal',
                icon: <IconCheck size={24} />,
              });
              getPasswords(masterKey);
              setDeleteDataModal(false);
            }}
          >
            Delete ALL of my Passwords
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
                withAsterisk
                placeholder="Website (url, email, etc)"
                onChange={(e) => setNewWebsite(e.target.value)}
                label="Website"
              />
              <TextInput
                label="Nickname"
                placeholder="Nickname (optional)"
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <PasswordInput
                withAsterisk
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label="Password"
              />
              <Group position="center">
                <Button
                  color="green"
                  leftIcon={<IconPlus size={24} />}
                  onClick={() => {
                    createPassword(
                      newPassword,
                      masterKey,
                      newWebsite,
                      newNickname
                    );
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
        <Text size="sm">V{packageJson.version}, expect bugs</Text>
      </Center>
      <Box sx={{ padding: '20px' }}>
        {passwords.length ? (
          <Stack>
            {passwords.map((data) => (
              <PasswordCard
                key={passwords.indexOf(data)}
                {...data}
                masterKey={masterKey}
                deleteFn={deletePassword}
              />
            ))}
          </Stack>
        ) : (
          <Center>
            <Text>No passwords yet!</Text>
          </Center>
        )}
      </Box>
      <Group position="center">
        <Button
          onClick={() => {
            setAddPasswordClicked(true);
            emptyCreatePasswordArgs();
          }}
          color="green"
          leftIcon={<IconPlus size={24} />}
        >
          Add Password
        </Button>
        <Button
          leftIcon={<IconTrash size={24} />}
          color="red"
          onClick={() => {
            setDeleteDataConfirm(false);
            setDeleteDataMK('');
            setDeleteDataModal(true);
          }}
        >
          Remove All Passwords
        </Button>
      </Group>
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
