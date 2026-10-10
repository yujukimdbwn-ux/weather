// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBWCvRy5uBxNJKFGmuUDgSJAJdUVticTi4",
  authDomain: "weather-cd1d8.firebaseapp.com",
  projectId: "weather-cd1d8",
  storageBucket: "weather-cd1d8.firebasestorage.app",
  messagingSenderId: "585673035590",
  appId: "1:585673035590:web:ab3fccfbfaa94630815f47",
  measurementId: "G-PP6LG5ELE9"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리 (FCM SDK가 payload.notification이 있을 때는 자동으로 1번 띄우므로, 중복 띄우기 방지)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);
  if (!payload.notification) {
    const notificationTitle = payload.data?.title || '날씨 알림';
    const notificationOptions = {
      body: payload.data?.body || '날씨 정보를 확인하세요.',
      icon: '/icon.png',
      badge: '/icon.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
