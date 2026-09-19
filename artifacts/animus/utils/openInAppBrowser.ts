import * as WebBrowser from 'expo-web-browser';

const HTTP_URL = /^https?:\/\/[^\s]+$/i;

export async function openInAppBrowser(url: string) {
  if (!HTTP_URL.test(url)) {
    throw new Error('Gimmi can only open HTTP or HTTPS links.');
  }

  await WebBrowser.openBrowserAsync(url, {
    controlsColor: '#007AFF',
    toolbarColor: '#FFFFFF',
    secondaryToolbarColor: '#F2F2F7',
    enableBarCollapsing: false,
    showTitle: true,
  });
}