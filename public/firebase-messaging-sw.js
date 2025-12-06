/* global importScripts, firebase, clients */
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAz6_sm6rkwgMjSWlXpiFOqOAmW-pBlwR0",
  authDomain: "careerzone-53619.firebaseapp.com",
  projectId: "careerzone-53619",
  storageBucket: "careerzone-53619.firebasestorage.app",
  messagingSenderId: "911786085213",
  appId: "1:911786085213:web:0d19671640b5aa6cfcb6b4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Nhận background message
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    data: payload.data, // gắn data.url để xử lý khi click
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lắng nghe sự kiện click vào notification (phải khai báo ngay khi SW khởi tạo)
self.addEventListener("notificationclick", function (event) {
  console.log("On notification click: ", event.notification);
  event.notification.close();

  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  const targetUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
