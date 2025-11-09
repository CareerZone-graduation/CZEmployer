/**
 * SocketService Usage Examples
 * 
 * This file demonstrates how to use the SocketService singleton
 * for real-time messaging in the recruiter application.
 */

import socketService from './socketService';

// ============================================
// Example 1: Connect to Socket.io server
// ============================================
async function connectToSocket() {
  try {
    // Connect with stored token (from localStorage)
    await socketService.connect();
    console.log('Connected to socket server');
    
    // Or connect with explicit token
    // await socketService.connect('your-jwt-token-here');
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

// ============================================
// Example 2: Setup event listeners
// ============================================
function setupEventListeners() {
  // Listen for new messages
  socketService.onNewMessage((message) => {
    console.log('New message received:', message);
    // Update UI with new message
  });

  // Listen for message read receipts
  socketService.onMessageRead((data) => {
    console.log('Message read:', data);
    // Update message status in UI
  });

  // Listen for typing indicators
  socketService.onTypingStart((data) => {
    console.log('User is typing:', data.userId);
    // Show typing indicator in UI
  });

  socketService.onTypingStop((data) => {
    console.log('User stopped typing:', data.userId);
    // Hide typing indicator in UI
  });

  // Listen for user presence updates
  socketService.onUserPresence((data) => {
    console.log('User presence:', data);
    // Update online status in UI
  });

  // Listen for new conversations
  socketService.onConversationCreated((data) => {
    console.log('New conversation created:', data);
    // Add conversation to list
  });

  // Listen for connection events
  socketService.onConnect(() => {
    console.log('Socket connected');
    // Update connection status in UI
  });

  socketService.onDisconnect((reason) => {
    console.log('Socket disconnected:', reason);
    // Show disconnected status in UI
  });

  socketService.onReconnecting((attemptNumber) => {
    console.log('Reconnecting...', attemptNumber);
    // Show reconnecting status in UI
  });

  socketService.onReconnect((attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    // Update connection status in UI
  });

  socketService.onConnectionError((error) => {
    console.error('Connection error:', error);
    // Show error message in UI
  });
}

// ============================================
// Example 3: Join and leave conversations
// ============================================
function joinConversation(conversationId) {
  socketService.joinConversation(conversationId);
  console.log('Joined conversation:', conversationId);
}

function leaveConversation(conversationId) {
  socketService.leaveConversation(conversationId);
  console.log('Left conversation:', conversationId);
}

// ============================================
// Example 4: Send messages
// ============================================
async function sendMessage(conversationId, content) {
  try {
    // Generate temporary ID for optimistic UI update
    const tempMessageId = `temp-${Date.now()}`;
    
    // Send message
    const response = await socketService.sendMessage(
      conversationId,
      content,
      tempMessageId
    );
    
    console.log('Message sent successfully:', response.message);
    return response.message;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

// ============================================
// Example 5: Mark messages as read
// ============================================
function markMessagesAsRead(messageIds, senderId) {
  socketService.markMessagesAsRead(messageIds, senderId);
  console.log('Marked messages as read:', messageIds);
}

// ============================================
// Example 6: Typing indicators
// ============================================
let typingTimeout = null;

function handleTyping(conversationId) {
  // Start typing indicator
  socketService.startTyping(conversationId);
  
  // Clear previous timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  
  // Stop typing after 3 seconds of inactivity
  typingTimeout = setTimeout(() => {
    socketService.stopTyping(conversationId);
  }, 3000);
}

function handleStopTyping(conversationId) {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  socketService.stopTyping(conversationId);
}

// ============================================
// Example 7: Disconnect from socket
// ============================================
function disconnectFromSocket() {
  socketService.disconnect();
  console.log('Disconnected from socket server');
}

// ============================================
// Example 8: Check connection status
// ============================================
function checkConnectionStatus() {
  const isConnected = socketService.getConnectionStatus();
  console.log('Connection status:', isConnected ? 'Connected' : 'Disconnected');
  return isConnected;
}

// ============================================
// Example 9: Complete chat component lifecycle
// ============================================
class ChatComponent {
  constructor(conversationId) {
    this.conversationId = conversationId;
  }

  async mount() {
    // 1. Connect to socket
    await socketService.connect();
    
    // 2. Setup event listeners
    socketService.onNewMessage(this.handleNewMessage.bind(this));
    socketService.onTypingStart(this.handleTypingStart.bind(this));
    socketService.onTypingStop(this.handleTypingStop.bind(this));
    
    // 3. Join conversation room
    socketService.joinConversation(this.conversationId);
  }

  unmount() {
    // 1. Leave conversation room
    socketService.leaveConversation(this.conversationId);
    
    // 2. Remove event listeners (if needed)
    // Note: In most cases, you don't need to remove listeners
    // as they will be cleaned up when the socket disconnects
    
    // 3. Disconnect socket (only if no other components need it)
    // socketService.disconnect();
  }

  handleNewMessage(message) {
    console.log('New message in chat:', message);
    // Update chat UI
  }

  handleTypingStart(data) {
    console.log('User typing:', data.userId);
    // Show typing indicator
  }

  handleTypingStop(data) {
    console.log('User stopped typing:', data.userId);
    // Hide typing indicator
  }

  async sendMessage(content) {
    const tempId = `temp-${Date.now()}`;
    
    try {
      // Optimistic UI update
      this.addMessageToUI({
        _id: tempId,
        content,
        status: 'sending',
        createdAt: new Date()
      });
      
      // Send message
      const response = await socketService.sendMessage(
        this.conversationId,
        content,
        tempId
      );
      
      // Update UI with server response
      this.updateMessageInUI(tempId, response.message);
    } catch {
      // Show error in UI
      this.markMessageAsFailed(tempId);
    }
  }

  addMessageToUI(message) {
    console.log('Add message to UI:', message);
    // Implementation depends on your UI framework
  }

  updateMessageInUI(tempId, message) {
    console.log('Update message in UI:', tempId, message);
    // Implementation depends on your UI framework
  }

  markMessageAsFailed(tempId) {
    console.log('Mark message as failed:', tempId);
    // Implementation depends on your UI framework
  }
}

// ============================================
// Export examples for reference
// ============================================
export {
  connectToSocket,
  setupEventListeners,
  joinConversation,
  leaveConversation,
  sendMessage,
  markMessagesAsRead,
  handleTyping,
  handleStopTyping,
  disconnectFromSocket,
  checkConnectionStatus,
  ChatComponent
};
