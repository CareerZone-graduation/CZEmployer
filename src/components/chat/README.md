# Chat Components

This directory contains components for the real-time messaging system between recruiters and candidates.

## ConversationList

Displays all conversations sorted by most recent message with real-time updates via Socket.io.

### Features

- Fetches conversations using React Query with automatic caching
- Displays candidate avatar, name, last message preview, and timestamp
- Shows unread count badge for conversations with unread messages
- Highlights selected conversation
- Real-time updates when new messages arrive
- Automatically moves conversations to top when new message received
- Subscribes to Socket.io events for live updates

### Usage

```jsx
import { ConversationList } from '@/components/chat';

function ChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    // Load message thread for this conversation
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r">
        <ConversationList
          selectedConversationId={selectedConversation?._id}
          onConversationSelect={handleConversationSelect}
        />
      </div>
      <div className="flex-1">
        {/* MessageThread component will go here */}
      </div>
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedConversationId` | `string` | No | ID of currently selected conversation (for highlighting) |
| `onConversationSelect` | `function` | Yes | Callback when conversation is clicked, receives conversation object |

### Data Structure

The component expects conversations to have the following structure:

```javascript
{
  _id: string,
  participant1: {
    _id: string,
    fullName: string,
    avatar: string
  },
  participant2: {
    _id: string,
    fullName: string,
    avatar: string
  },
  lastMessage: {
    _id: string,
    content: string,
    senderId: string,
    createdAt: Date
  },
  lastMessageAt: Date,
  unreadCount: number,
  createdAt: Date
}
```

### Socket.io Events

The component listens to the following Socket.io events:

- `message:new` - Updates conversation list when new message arrives
- `chat:messageRead` - Clears unread count when messages are marked as read

### Dependencies

- `@tanstack/react-query` - For data fetching and caching
- `date-fns` - For timestamp formatting
- `socket.io-client` - For real-time updates
- `@/services/chatService` - API service for fetching conversations
- `@/services/socketService` - Socket.io service singleton

### States

- **Loading**: Shows skeleton loaders while fetching conversations
- **Error**: Displays error message if fetch fails
- **Empty**: Shows empty state when no conversations exist
- **Loaded**: Displays conversation list with real-time updates
