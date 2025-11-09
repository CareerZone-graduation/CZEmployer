import { useState } from 'react';
import ConversationList from './ConversationList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example usage of ConversationList component
 * This demonstrates how to integrate the ConversationList into a chat interface
 */
const ConversationListExample = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleConversationSelect = (conversation) => {
    console.log('Selected conversation:', conversation);
    setSelectedConversation(conversation);
    // Here you would typically:
    // 1. Load the message thread for this conversation
    // 2. Mark messages as read
    // 3. Join the conversation room via Socket.io
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Interface Example</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversation List Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tin nhắn</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px]">
              <ConversationList
                selectedConversationId={selectedConversation?._id}
                onConversationSelect={handleConversationSelect}
              />
            </div>
          </CardContent>
        </Card>

        {/* Message Thread Area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConversation 
                ? `Trò chuyện với ${selectedConversation.participant1?.fullName || selectedConversation.participant2?.fullName}`
                : 'Chọn một cuộc trò chuyện'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Conversation ID: {selectedConversation._id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last message: {selectedConversation.lastMessage?.content || 'No messages yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Unread count: {selectedConversation.unreadCount || 0}
                </p>
                {/* MessageThread component would go here */}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                Chọn một cuộc trò chuyện để bắt đầu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationListExample;
