// Firebase 초기화 및 FCM 설정
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBWCvRy5uBxNJKFGmuUDgSJAJdUVticTi4",
  authDomain: "weather-cd1d8.firebaseapp.com",
  projectId: "weather-cd1d8",
  storageBucket: "weather-cd1d8.firebasestorage.app",
  messagingSenderId: "585673035590",
  appId: "1:585673035590:web:ab3fccfbfaa94630815f47",
  measurementId: "G-PP6LG5ELE9"
};

const VAPID_KEY = "BHf8Em_KhTvJ1GKl7Rue98WHEzyjQJ_l8Dx3i2zzkDOUlx-pBFuvwwJTLMaVIlFlTbmSNGAinR2p01ApxJt42sU";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * 알림 권한 요청 후 FCM 토큰 획득, 서버에 토큰 등록
 */
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('알림 권한이 거부되었습니다.');
      return null;
    }

    // FCM 토큰 취득
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    });

    if (token) {
      console.log('FCM 토큰:', token);
      // 서버에 토큰 등록 (topic 구독)
      await subscribeToTopic(token);
    }
    return token;
  } catch (error) {
    console.error('FCM 토큰 취득 실패:', error);
    return null;
  }
}

/**
 * 서버에 FCM 토큰을 전송해 "weather-alerts" topic 구독
 */
async function subscribeToTopic(token) {
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    console.log('Topic 구독 결과:', data);
  } catch (err) {
    console.error('Topic 구독 실패:', err);
  }
}

/**
 * 포그라운드 메시지 수신 처리
 */
export function setupForegroundMessaging() {
  onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload);
    const { title, body } = payload.notification || {};
    if (title && Notification.permission === 'granted') {
      new Notification(title, {
        body: body || '',
        icon: '/icon.png'
      });
    }
  });
}
