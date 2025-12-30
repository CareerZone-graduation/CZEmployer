import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import apiClient from './apiClient';

// IMPORTANT: Replace with your web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyAz6_sm6rkwgMjSWlXpiFOqOAmW-pBlwR0",
  authDomain: "careerzone-53619.firebaseapp.com",
  projectId: "careerzone-53619",
  storageBucket: "careerzone-53619.firebasestorage.app",
  messagingSenderId: "911786085213",
  appId: "1:911786085213:web:0d19671640b5aa6cfcb6b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Kiểm tra xem FCM có được hỗ trợ không (iOS Safari không hỗ trợ)
let messaging = null;
let fcmSupported = false;

// Hàm kiểm tra và khởi tạo messaging
const initMessaging = async () => {
  try {
    fcmSupported = await isSupported();
    if (fcmSupported) {
      messaging = getMessaging(app);
    } else {
      console.warn('Firebase Cloud Messaging is not supported on this browser (iOS Safari/Chrome)');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Messaging:', error);
    fcmSupported = false;
  }
  return fcmSupported;
};

// Khởi tạo ngay
const messagingPromise = initMessaging();

/**
 * Kiểm tra xem FCM có được hỗ trợ không
 */
export const isFCMSupported = () => fcmSupported;
export const waitForFCMInit = () => messagingPromise;

/**
 * Registers the device token with the backend server.
 * @param {string} token The FCM device token.
 */
const registerDeviceToken = async (token) => {
  try {
    await apiClient.post('/users/register-device', { token });
    console.log('Device token registered successfully with the backend.');
  } catch (error) {
    console.error('Failed to register device token with the backend:', error);
  }
};

/**
 * Unregisters the device token from the backend server.
 * @param {string} token The FCM device token.
 */
export const unregisterDeviceToken = async (token) => {
  try {
    await apiClient.post('/users/unregister-device', { token });
    console.log('Device token unregistered successfully from the backend.');
    // Remove from local storage
    localStorage.removeItem('fcm_token');
  } catch (error) {
    console.error('Failed to unregister device token from the backend:', error);
  }
};

/**
 * Checks if the device token is registered with the backend.
 * @param {string} token The FCM device token.
 * @returns {Promise<boolean>}
 */
export const checkDeviceRegistration = async (token) => {
  try {
    const response = await apiClient.post('/users/check-device', { token });
    return response.data?.isRegistered || false;
  } catch (error) {
    console.error('Failed to check device registration:', error);
    return false;
  }
};

/**
 * Requests permission to receive push notifications and returns the device token.
 * If a token is retrieved, it is also sent to the backend.
 * @returns {Promise<string|null>} The Firebase Cloud Messaging token.
 */
export const requestForToken = async () => {
  // Đợi FCM khởi tạo xong
  await messagingPromise;
  
  if (!fcmSupported || !messaging) {
    console.warn('FCM is not supported on this device');
    return null;
  }

  try {
    const currentToken = await getToken(messaging);
    if (currentToken) {
      console.log('FCM Token:', currentToken);

      // Kiểm tra xem token đã được gửi chưa (cache trong localStorage)
      const cachedToken = localStorage.getItem('fcm_token');

      if (cachedToken !== currentToken) {
        console.log('Token changed or first time, registering with backend...');
        await registerDeviceToken(currentToken);
        // Lưu token vào localStorage
        localStorage.setItem('fcm_token', currentToken);
      } else {
        console.log('Token already registered, skipping backend call.');
      }
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
    return currentToken;
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
    return null;
  }
};

export const getFCMMessaging = () => messaging;

/**
 * Sets up a listener for incoming foreground messages.
 * @param {function} callback The function to call with the message payload.
 * @returns {import('firebase/messaging').Unsubscribe} A function to unsubscribe the listener.
 */
export const setupOnMessageListener = (callback) => {
  if (!fcmSupported || !messaging) {
    console.warn('FCM is not supported, skipping message listener setup');
    return () => {}; // Return empty unsubscribe function
  }
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};
