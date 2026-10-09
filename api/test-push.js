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

    const title = '☔ 테스트 알림';
    const body = '날씨 앱 푸시 알림 테스트입니다!';

    const result = await messaging.send({
      notification: { title, body },
      topic: 'weather-alerts'
    });

    console.log(`[TEST PUSH 발송 완료] 시각: ${new Date().toISOString()} | 제목: "${title}" | 본문: "${body}" | FCM 메시지ID: ${result}`);

    return res.status(200).json({ success: true, result, title, body });
  } catch (error) {
    console.error('테스트 푸시 오류:', error);
    return res.status(500).json({ error: error.message });
  }
}
