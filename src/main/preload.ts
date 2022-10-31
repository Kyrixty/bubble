import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';
('create-password');
('get-passwords');

contextBridge.exposeInMainWorld('electron', {
  createPassword: (args: unknown[]) => {
    return ipcRenderer.invoke('create-password', args);
  },
  getPasswords: (args: unknown[]) => {
    return ipcRenderer.invoke('get-passwords', args);
  },
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      return ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
