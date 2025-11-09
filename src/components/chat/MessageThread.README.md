# MessageThread Component

## Overview
The MessageThread component displays messages in a conversation with real-time updates, optimistic UI, infinite scroll, and typing indicators.

## Features Implemented

### ✅ Core Features
1. **Message Display**
   - Messages displayed in chronological order
   - Sender alignment (left for received, right for sent)
   - Message timestamps with smart formatting (today, yesterday, date)
   - Message status indicators (sending, sent, read)

2. **Real-time Communication**
   - Socket.io integration for real-time message updates
   - Automatic message receipt when new messages arrive
   - Typing indicators when recipient is typing
   - Message read receipts

3. **Optimistic UI**
   - Messages displayed immediately with "sending" status
   - Status updated to "sent" after server confirmation
   - Failed messages marked with error indicator
   - Retry button for failed messages

4. **Infinite Scroll**
   - Load older messages on scroll to top
   - Pagination with 50 messages per page
   - Loading indicator while fetching more messages
   - Maintains scroll position after loading

5. **Message Input**
   - Text input field with send button
   - Enter key to send (Shift+Enter for new line)
   - Disabled state while sending
   - Typing indicator emission (stops after 3 seconds of inactivity)

6. **Auto-scroll**
   - Automatically scrolls to bottom on new messages
   - Preserves scroll position when loading older messages
   - Smart scroll behavior (only auto-scroll for new messages)

## Props

```jsx
{
  conversationId: string,      // Required - Conversation ID
  recipientId: string,          // Required - Recipient user ID
  recipientName: string,        // Required - Recipient display name
  recipientAvatar: string       // Required - Recipient avatar URL
}
```

## Usage Example

```jsx
import { MessageThread } from '@/components/chat';

function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  return (
    <div className="flex h-screen">
      <ConversationList 
        onConversationSelect={setSelectedConversation}
      />
      
      {selectedConversation && (
        <MessageThread
          conversationId={selectedConversation._id}
          recipientId={selectedConversation.otherParticipant._id}
          recipientName={selectedConversation.otherParticipant.fullName}
          recipientAvatar={selectedConversation.otherParticipant.avatar}
        />
      )}
    </div>
  );
}
```

## State Management

### Local State
- `messages`: Array of message objects
- `messageInput`: Current input value
- `isSending`: Boolean for send button state
- `failedMessages`: Map of failed messages for retry
- `page`: Current pagination page
- `hasMore`: Boolean indicating more messages available
- `isLoadingMore`: Boolean for loading indicator
- `isTyping`: Boolean for recipient typing indicator

### Redux State
- `currentUser`: Current authenticated user from auth slice

### React Query
- `messages` query: Fetches messages with pagination
- Auto-refetch on window focus
- 30-second stale time

## Socket.io Events

### Emitted Events
- `conversation:join`: Join conversation room on mount
- `conversation:leave`: Leave conversation room on unmount
- `message:send`: Send new message
- `chat:typing:start`: Start typing indicator
- `chat:typing:stop`: Stop typing indicator

### Listened Events
- `message:new`: New message received
- `chat:messageRead`: Message read receipt
- `chat:typing:start`: Recipient started typing
- `chat:typing:stop`: Recipient stopped typing

## Message Status Flow

1. **Sending**: Message created with optimistic UI
2. **Sent**: Server confirms message saved
3. **Read**: Recipient has read the message
4. **Failed**: Message send failed (with retry option)

## Styling

Uses Tailwind CSS with shadcn/ui components:
- `Avatar`: User avatars
- `Button`: Send button and retry button
- `Input`: Message input field
- `ScrollArea`: Scrollable message container
- `Skeleton`: Loading state placeholders

## Error Handling

1. **Network Errors**: Failed messages stored for retry
2. **Socket Disconnection**: Handled by SocketService auto-reconnect
3. **API Errors**: Error state with retry button
4. **Invalid Data**: Graceful fallbacks for missing data

## Performance Optimizations

1. **Pagination**: Load 50 messages at a time
2. **Memoization**: useCallback for event handlers
3. **Debouncing**: Typing indicator stops after 3 seconds
4. **Optimistic Updates**: Immediate UI feedback
5. **Smart Scrolling**: Only auto-scroll for new messages

## Accessibility

- Semantic HTML structure
- Keyboard navigation (Enter to send)
- ARIA labels on interactive elements
- Focus management for input field

## Requirements Satisfied

✅ **Requirement 3.2**: Real-time message send/receive via Socket.io
✅ **Requirement 3.3**: Display messages in chronological order with sender alignment
✅ **Requirement 3.4**: Optimistic UI with status indicators
✅ **Requirement 3.5**: Auto-scroll to bottom on new messages
✅ **Requirement 5.3**: Message input with send functionality
✅ **Infinite Scroll**: Load older messages on scroll up

## Dependencies

- React 19.1.0
- @tanstack/react-query 5.90.5
- socket.io-client 4.8.1
- date-fns 4.1.0
- lucide-react 0.525.0
- @radix-ui components (via shadcn/ui)

## Future Enhancements

- [ ] File attachments support
- [ ] Message reactions (emoji)
- [ ] Message editing and deletion
- [ ] Voice messages
- [ ] Image preview in messages
- [ ] Link previews
- [ ] Message search
- [ ] Message forwarding
