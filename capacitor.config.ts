import { CapacitorConfig } from '@capacitor/cli';

// APIルート（auth/status, payjp/checkout, payjp/verify）が存在するため
// output: 'export' 静的エクスポートは使用不可。
// Capacitorは Vercel のライブURLをロードする「WebView shell」方式で動作する。
const config: CapacitorConfig = {
  appId: 'app.vercel.jitama',
  appName: '字玉 JITAMA',
  webDir: 'out', // next build --static 用（現在は未使用・server.url 優先）
  server: {
    // Vercel のプロダクション URL をロードする
    url: 'https://jitama.vercel.app',
    cleartext: false, // HTTPS のみ許可
    allowNavigation: [
      'jitama.vercel.app',
      'api.pay.jp',       // PAY.JP 決済
    ],
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
