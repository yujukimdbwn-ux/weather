// api/subscribe.js - FCM 토큰을 weather-alerts Topic에 구독
// Firebase Admin SDK (서비스 계정 환경변수 필요)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Firebase Admin SDK 동적 import (서버사이드)
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');

    // 이미 초기화된 앱이 있으면 재사용
    if (!getApps().length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({ credential: cert(serviceAccount) });
    }

    const messaging = getMessaging();
    await messaging.subscribeToTopic([token], 'weather-alerts');

    return res.status(200).json({ success: true, message: 'weather-alerts topic 구독 완료' });
  } catch (error) {
    console.error('Topic 구독 오류:', error);
    return res.status(500).json({ error: error.message });
  }
}
