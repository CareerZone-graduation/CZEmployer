# Connection Error Handling and Retry Mechanism

## Overview

This document describes the connection error handling and retry mechanism implemented for the real-time messaging system.

## Features Implemented

### 1. Socket Connection Error Handling

**Location**: `fe-recruiter/src/services/socketService.js`

- **Exponential Backoff**: Automatic reconnection with exponential backoff delays (1s, 2s, 4s, 8s, max 30s)
- **Connection Events**: Comprehensive event handling for:
  - `connect` - Connection established
  - `connect_error` - Connection failed with retry info
  - `reconnect_attempt` - Reconnection attempt in progress
  - `reconnect` - Successfully reconnected
  - `reconnect_failed` - All reconnection attempts failed
  - `disconnect` - Connection lost

- **Event Data**: Connection error events now include:
  - `error` - The error object
  - `attempt` - Current attempt number
  - `nextDelay` - Next retry delay in milliseconds

### 2. Connection Status Indicator

**Location**: `fe-recruiter/src/components/chat/ChatInterface.jsx`

Visual indicators for connection states:

- **Connected** (Green): Shows WiFi icon with "Đã kết nối"
- **Connecting** (Gray): Shows spinner with "Đang kết nối..."
- **Reconnecting** (Amber): Shows spinner with attempt number and next retry delay
- **Disconnected** (Red): Shows WiFi-off icon with "Mất kết nối"

### 3. Connection Error Alerts

**Location**: `fe-recruiter/src/components/chat/ChatInterface.jsx`

Two types of alerts:

1. **Disconnected Alert** (Red):
   - Shows when connection is lost
   - Includes manual "Thử lại" button to force reconnection
   - Automatically attempts reconnection in background

2. **Reconnecting Alert** (Amber):
   - Shows during reconnection attempts
   - Displays current attempt number
   - Provides visual feedback that system is working

### 4. Failed Message Retry

**Location**: `fe-recruiter/src/components/chat/MessageThread.jsx`

- **Visual Indicators**:
  - Failed messages show red border and alert icon
  - "Thử lại" button appears next to failed messages
  - Sending status shows spinner icon
  - Sent status shows checkmark
  - Read status shows double checkmark

- **Retry Logic**:
  - Failed messages stored in component state
  - Retry button resends message via Socket.io
  - Message status updates in real-time
  - Failed messages persist until successfully sent or manually removed

### 5. Message Sync on Reconnect

**Location**: `fe-recruiter/src/components/chat/MessageThread.jsx`

- **Automatic Sync**: When connection is restored, automatically syncs missed messages
- **Sync Indicator**: Shows "Đang đồng bộ tin nhắn..." during sync
- **Duplicate Prevention**: Filters out duplicate messages
- **Auto-scroll**: Scrolls to show new synced messages

**Backend Support Required**: The backend needs to implement the `messages:sync` event handler:

```javascript
socket.on('messages:sync', async ({ conversationId, since }, callback) => {
  try {
    const messages = await ChatMessage.find({
      conversationId,
      createdAt: { $gt: new Date(since) }
    })
    .sort({ createdAt: 1 })
    .limit(100);
    
    callback({ success: true, messages });
  } catch (error) {
    callback({ success: false, message: error.message });
  }
});
```

## User Experience Flow

### Normal Operation
1. User opens chat interface
2. Connection established (green indicator)
3. Messages sent and received in real-time

### Connection Lost
1. Connection drops (red indicator appears)
2. Alert shows "Mất kết nối với máy chủ"
3. Automatic reconnection starts with exponential backoff
4. User can click "Thử lại" for immediate retry

### Reconnecting
1. Status changes to "Đang kết nối lại..."
2. Shows attempt number and next retry delay
3. Amber alert displays reconnection progress

### Connection Restored
1. Status changes to "Đã kết nối" (green)
2. Automatically syncs missed messages
3. Shows sync indicator during sync
4. User can continue messaging normally

### Message Send Failure
1. Message shows with "sending" status (spinner)
2. If send fails, message shows red border and alert icon
3. "Thử lại" button appears
4. User clicks retry to resend
5. Message updates to "sent" status on success

## Technical Details

### Exponential Backoff Configuration

```javascript
reconnectDelays = [1000, 2000, 4000, 8000, 30000]; // 1s, 2s, 4s, 8s, max 30s
maxReconnectAttempts = 10;
```

### Message Status States

- `sending` - Message being sent to server
- `sent` - Message delivered to server
- `failed` - Message send failed
- `read` - Message read by recipient

### Event Handler Registration

Components register event handlers using the service's convenience methods:

```javascript
socketService.onConnect(handleConnect);
socketService.onDisconnect(handleDisconnect);
socketService.onConnectionError(handleConnectionError);
socketService.onReconnecting(handleReconnecting);
socketService.onReconnect(handleReconnect);
socketService.onReconnectFailed(handleReconnectFailed);
```

## Testing Scenarios

1. **Normal Connection**: Verify green indicator and message sending
2. **Network Disconnect**: Disable network, verify red indicator and reconnection
3. **Message Send During Disconnect**: Send message while offline, verify retry button
4. **Reconnection**: Re-enable network, verify automatic reconnection and message sync
5. **Manual Retry**: Click "Thử lại" button, verify immediate reconnection attempt
6. **Failed Message Retry**: Click retry on failed message, verify resend

## Requirements Satisfied

- ✅ 8.1: Subscribe to Socket `connect_error` event in SocketService
- ✅ 8.2: Display connection status indicator in ChatInterface (connected, reconnecting, disconnected)
- ✅ 8.3: Show "Reconnecting..." message when connection lost
- ✅ 8.4: Implement exponential backoff for reconnection attempts
- ✅ 8.5: Subscribe to Socket `reconnect` event to sync missed messages
- ✅ 8.1: Add retry button on failed messages in MessageThread
- ✅ 8.2: Store failed messages in component state for retry
- ✅ 8.3: Resend failed message when retry button clicked

## Future Enhancements

1. **Offline Queue**: Store messages locally when offline and send when reconnected
2. **Network Status Detection**: Use browser Network Information API for better detection
3. **Retry Limit**: Limit number of retry attempts per message
4. **User Notification**: Show toast notifications for connection events
5. **Message Persistence**: Store messages in IndexedDB for offline access
