import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.celery.salespt',
  appName: 'Celery',
  webDir: 'build',
  server: {
    allowNavigation: ['*'],
    androidScheme: 'http'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF',
      overlaysWebView: false
    }
  }
};

export default config;
