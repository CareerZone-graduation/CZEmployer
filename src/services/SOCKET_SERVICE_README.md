# SocketService Documentation

## Overview

The `SocketService` is a singleton class that manages real-time WebSocket connections using Socket.io for the recruiter application. It provides a clean API for messaging, typing indicators, presence updates, and automatic reconnection with exponential backoff.

## Features

- ✅ **Singleton Pattern**: Single instance shared across the application
- ✅ **JWT Authentication**: Automatic token-based authentication
- ✅ **Auto-Reconnect**: Exponential backoff (1s, 2s, 4s, 8s, max 30s)
- ✅ **Event Handlers**: Easy-to-use event listener registration
- ✅ **Message Management**: Send, receive, and track message status
- ✅ **Typing Indicators**: Real-time typing status
- ✅ **Presence Updates**: Online/offline status tracking
- ✅ **Error Handling**: Comprehensive error handling and callbacks

## Installation

The service is already installed with `socket.io-client`:

```bash
pnpm add socket.io-client
```

## Basic Usage

### 1. Import the Service

```javascript
import socketService from '@/services/socketService';
```

### 2. Connect to Socket Server

```javascript
// Connect with stored token (from localStorage)
await socketService.connect();

// Or connect with explicit token
await socketService.connect('your-jwt-token-here');
```

### 3. Setup Event Listeners

```javascript
// Listen for new messages
socketService.onNewMessage((message) => {
  console.log('New message:', message);
});

// Listen for typing indicators
socketService.onTypingStart((data) => {
  console.log('User typing:', data.userId);
});

socketService.onTypingStop((data) => {
  console.log('User stopped typing:', data.userId);
});
```

### 4. Join a Conversation

```javascript
socketService.joinConversation(conversationId);
```

### 5. Send a Message

```javascript
const tempId = `temp-${Date.now()}`;

try {
  const response = await socketService.sendMessage(
    conversationId,
    'Hello!',
    tempId
  );
  console.log('Message sent:', response.message);
} catch (error) {
  console.error('Failed to send:', error);
}
```

### 6. Disconnect

```javascript
socketService.disconnect();
```

## API Reference

### Connection Methods

#### `connect(token?: string): Promise<void>`

Establishes a Socket.io connection with JWT authentication.

**Parameters:**
- `token` (optional): JWT access token. If not provided, uses token from localStorage.

**Returns:** Promise that resolves when connected.

**Example:**
```javascript
await socketService.connect();
```

---

#### `disconnect(): void`

Disconnects from the Socket.io server gracefully and cleans up resources.

**Example:**
```javascript
socketService.disconnect();
```

---

#### `getConnectionStatus(): boolean`

Returns the current connection status.

**Returns:** `true` if connected, `false` otherwise.

**Example:**
```javascript
const isConnected = socketService.getConnectionStatus();
```

---

### Conversation Methods

#### `joinConversation(conversationId: string): void`

Joins a conversation room to receive real-time updates.

**Parameters:**
- `conversationId`: The conversation ID to join

**Example:**
```javascript
socketService.joinConversation('conv-123');
```

---

#### `leaveConversation(conversationId: string): void`

Leaves a conversation room.

**Parameters:**
- `conversationId`: The conversation ID to leave

**Example:**
```javascript
socketService.leaveConversation('conv-123');
```

---

### Message Methods

#### `sendMessage(conversationId, content, tempMessageId, type?, metadata?): Promise<object>`

Sends a message through Socket.io with callback confirmation.

**Parameters:**
- `conversationId` (string): Conversation ID
- `content` (string): Message content
- `tempMessageId` (string): Temporary ID for optimistic UI updates
- `type` (string, optional): Message type (default: 'text')
- `metadata` (object, optional): Additional metadata

**Returns:** Promise that resolves with server response containing the saved message.

**Example:**
```javascript
const tempId = `temp-${Date.now()}`;
const response = await socketService.sendMessage(
  'conv-123',
  'Hello!',
  tempId
);
console.log('Saved message:', response.message);
```

---

#### `markMessagesAsRead(messageIds: string[], senderId: string): void`

Marks messages as read.

**Parameters:**
- `messageIds`: Array of message IDs to mark as read
- `senderId`: ID of the original message sender

**Example:**
```javascript
socketService.markMessagesAsRead(['msg-1', 'msg-2'], 'user-123');
```

---

### Typing Indicator Methods

#### `startTyping(conversationId: string): void`

Emits a typing start event to other participants.

**Parameters:**
- `conversationId`: The conversation ID

**Example:**
```javascript
socketService.startTyping('conv-123');
```

---

#### `stopTyping(conversationId: string): void`

Emits a typing stop event to other participants.

**Parameters:**
- `conversationId`: The conversation ID

**Example:**
```javascript
socketService.stopTyping('conv-123');
```

---

### Event Listener Methods

#### `onNewMessage(callback: (message) => void): void`

Registers a callback for new message events.

**Example:**
```javascript
socketService.onNewMessage((message) => {
  console.log('New message:', message);
});
```

---

#### `onMessageRead(callback: (data) => void): void`

Registers a callback for message read receipt events.

**Example:**
```javascript
socketService.onMessageRead((data) => {
  console.log('Messages read:', data.messageIds);
});
```

---

#### `onTypingStart(callback: (data) => void): void`

Registers a callback for typing start events.

**Example:**
```javascript
socketService.onTypingStart((data) => {
  console.log('User typing:', data.userId);
});
```

---

#### `onTypingStop(callback: (data) => void): void`

Registers a callback for typing stop events.

**Example:**
```javascript
socketService.onTypingStop((data) => {
  console.log('User stopped typing:', data.userId);
});
```

---

#### `onUserPresence(callback: (data) => void): void`

Registers a callback for user presence updates (online/offline).

**Example:**
```javascript
socketService.onUserPresence((data) => {
  console.log('User presence:', data.userId, data.isOnline);
});
```

---

#### `onConversationCreated(callback: (data) => void): void`

Registers a callback for new conversation creation events.

**Example:**
```javascript
socketService.onConversationCreated((data) => {
  console.log('New conversation:', data.conversationId);
});
```

---

#### Connection Event Listeners

```javascript
socketService.onConnect(() => {
  console.log('Connected');
});

socketService.onDisconnect((reason) => {
  console.log('Disconnected:', reason);
});

socketService.onReconnecting((attemptNumber) => {
  console.log('Reconnecting...', attemptNumber);
});

socketService.onReconnect((attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});

socketService.onConnectionError((error) => {
  console.error('Connection error:', error);
});

socketService.onReconnectFailed(() => {
  console.error('Reconnection failed');
});

socketService.onChatError((error) => {
  console.error('Chat error:', error);
});
```

---

## React Component Integration

### Example: Chat Component

```javascript
import { useEffect, useState } from 'react';
import socketService from '@/services/socketService';

function ChatComponent({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to socket
    const connectSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        
        // Join conversation
        socketService.joinConversation(conversationId);
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };

    connectSocket();

    // Setup event listeners
    socketService.onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.onTypingStart((data) => {
      setIsTyping(true);
    });

    socketService.onTypingStop((data) => {
      setIsTyping(false);
    });

    socketService.onDisconnect(() => {
      setIsConnected(false);
    });

    socketService.onReconnect(() => {
      setIsConnected(true);
      // Rejoin conversation after reconnect
      socketService.joinConversation(conversationId);
    });

    // Cleanup
    return () => {
      socketService.leaveConversation(conversationId);
      // Note: Don't disconnect here if other components need the socket
    };
  }, [conversationId]);

  const sendMessage = async (content) => {
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update
    setMessages(prev => [...prev, {
      _id: tempId,
      content,
      status: 'sending',
      createdAt: new Date()
    }]);

    try {
      const response = await socketService.sendMessage(
        conversationId,
        content,
        tempId
      );
      
      // Update with server response
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? response.message : msg
        )
      );
    } catch (error) {
      // Mark as failed
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  };

  const handleTyping = () => {
    socketService.startTyping(conversationId);
    
    // Auto-stop after 3 seconds
    setTimeout(() => {
      socketService.stopTyping(conversationId);
    }, 3000);
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>
        {messages.map(msg => (
          <div key={msg._id}>{msg.content}</div>
        ))}
      </div>
      {isTyping && <div>User is typing...</div>}
      <input 
        onChange={handleTyping}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.target.value);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
```

---

## Auto-Reconnection

The service implements automatic reconnection with exponential backoff:

- **Attempt 1**: 1 second delay
- **Attempt 2**: 2 seconds delay
- **Attempt 3**: 4 seconds delay
- **Attempt 4**: 8 seconds delay
- **Attempt 5+**: 30 seconds delay (max)

Maximum reconnection attempts: 10

### Handling Reconnection

```javascript
socketService.onReconnecting((attemptNumber) => {
  // Show "Reconnecting..." UI
  console.log(`Reconnecting... attempt ${attemptNumber}`);
});

socketService.onReconnect((attemptNumber) => {
  // Hide "Reconnecting..." UI
  // Rejoin conversations
  console.log(`Reconnected after ${attemptNumber} attempts`);
  socketService.joinConversation(conversationId);
});

socketService.onReconnectFailed(() => {
  // Show error message
  console.error('Failed to reconnect. Please refresh the page.');
});
```

---

## Error Handling

### Connection Errors

```javascript
socketService.onConnectionError((error) => {
  console.error('Connection error:', error);
  // Show error notification to user
});
```

### Message Send Errors

```javascript
try {
  await socketService.sendMessage(conversationId, content, tempId);
} catch (error) {
  console.error('Failed to send message:', error);
  // Show retry button in UI
}
```

### Chat Errors

```javascript
socketService.onChatError((error) => {
  console.error('Chat error:', error);
  // Handle specific error codes
  if (error.reasonCode === 'NO_ACCESS') {
    // Show unlock profile modal
  }
});
```

---

## Best Practices

1. **Single Connection**: Use the singleton instance across your app. Don't create multiple connections.

2. **Cleanup**: Always leave conversation rooms when unmounting components:
   ```javascript
   useEffect(() => {
     socketService.joinConversation(conversationId);
     return () => socketService.leaveConversation(conversationId);
   }, [conversationId]);
   ```

3. **Optimistic Updates**: Show messages immediately before server confirmation for better UX.

4. **Error Recovery**: Implement retry mechanisms for failed messages.

5. **Typing Indicators**: Auto-stop typing after 3 seconds of inactivity.

6. **Reconnection**: Rejoin conversation rooms after reconnection.

7. **Token Management**: Ensure token is valid before connecting. Reconnect if token is refreshed.

---

## Troubleshooting

### Connection fails with "No authentication token"

**Solution**: Ensure user is logged in and token is stored in localStorage.

```javascript
import { getAccessToken } from '@/utils/token';

const token = getAccessToken();
if (!token) {
  // Redirect to login
}
await socketService.connect(token);
```

### Messages not received

**Solution**: Ensure you've joined the conversation room.

```javascript
socketService.joinConversation(conversationId);
```

### Reconnection not working

**Solution**: Check network connectivity and server status. The service will automatically retry up to 10 times.

### Events not firing

**Solution**: Ensure event listeners are registered before events occur.

```javascript
// Register listeners BEFORE connecting
socketService.onNewMessage(handleNewMessage);
await socketService.connect();
```

---

## Requirements Fulfilled

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 3.1**: Establishes Socket.io connection when chat interface opens
- ✅ **Requirement 3.2**: Emits messages through Socket connection with content, recipient ID, and timestamp
- ✅ **Requirement 3.6**: Disconnects Socket connection gracefully when chat interface closes
- ✅ **Requirement 8.1**: Attempts to reconnect automatically with exponential backoff
- ✅ **Requirement 8.2**: Displays connection status indicator (via callbacks)
- ✅ **Requirement 8.3**: Syncs missed messages when connection restored (via event listeners)

---

## Related Files

- **Service**: `fe-recruiter/src/services/socketService.js`
- **Examples**: `fe-recruiter/src/services/socketService.example.js`
- **Token Utils**: `fe-recruiter/src/utils/token.js`
- **Backend Socket**: `be/src/socket/index.js`

---

## Support

For issues or questions, refer to:
- Backend socket implementation: `be/src/socket/index.js`
- Socket.io documentation: https://socket.io/docs/v4/
- Design document: `.kiro/specs/recruiter-candidate-messaging/design.md`
