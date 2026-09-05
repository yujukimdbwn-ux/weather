// api/test-push.js - 즉시 테스트 푸시 전송 (FCM)
async function initFirebaseAdmin() {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getMessaging } = await import('firebase-admin/messaging');

  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }

  return getMessaging();
}

export default async function handler(req, res) {
  try {
    const messaging = await initFirebaseAdmin();

    const result = await messaging.send({
      notification: {
        title: '☔ 테스트 알림',
        body: '날씨 앱 푸시 알림 테스트입니다!'
      },
      topic: 'weather-alerts'
    });

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('테스트 푸시 오류:', error);
    return res.status(500).json({ error: error.message });
  }
}
