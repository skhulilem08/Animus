import * as WebBrowser from 'expo-web-browser';

const HTTP_URL = /^https?:\/\/[^\s]+$/i;

export async function openInAppBrowser(url: string, accentColor = '#FF3B30') {
  if (!HTTP_URL.test(url)) {
    throw new Error('Gimmi can only open HTTP or HTTPS links.');
  }

  await WebBrowser.openBrowserAsync(url, {
    controlsColor: accentColor,
    toolbarColor: '#FFFFFF',
    secondaryToolbarColor: '#F2F2F7',
    enableBarCollapsing: false,
    showTitle: true,
  });
}