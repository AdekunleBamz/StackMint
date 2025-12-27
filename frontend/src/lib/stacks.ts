import { AppConfig, showConnect, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: 'StacksMint',
  icon: 'https://stacksmint.app/logo.png',
};

export function connectWallet(callback: () => void) {
  showConnect({
    appDetails,
    onFinish: callback,
    userSession,
  });
}

export function disconnectWallet() {
  userSession.signUserOut();
}

export function isConnected() {
  return userSession.isUserSignedIn();
}

export function getUserAddress() {
  if (!isConnected()) return null;
  const userData = userSession.loadUserData();
  return userData.profile.stxAddress.mainnet;
}
