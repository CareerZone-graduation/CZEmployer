
import { useState } from "react"
import {Button} from "../components/ui/Button"
import {Input} from "../components/ui/Input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MoreVertical, Phone, Video, Paperclip } from "lucide-react"

const Messaging = () => {
  const [selectedChat, setSelectedChat] = useState(1)
  const [message, setMessage] = useState("")

  const conversations = [
    {
      id: 1,
      name: "Nguyen Van A",
      position: "Frontend Developer",
      lastMessage: "Thank you for considering my application",
      time: "2 min ago",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Tran Thi B",
      position: "Product Manager",
      lastMessage: "When can we schedule the interview?",
      time: "1 hour ago",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Le Van C",
      position: "UX Designer",
      lastMessage: "I have some questions about the role",
      time: "3 hours ago",
      unread: 1,
      online: true,
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "candidate",
      content: "Hello! I saw your job posting for Frontend Developer position.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "recruiter",
      content: "Hi! Thank you for your interest. I'd love to learn more about your experience.",
      time: "10:35 AM",
    },
    {
      id: 3,
      sender: "candidate",
      content:
        "I have 5 years of experience with React and TypeScript. I've worked on several large-scale applications.",
      time: "10:40 AM",
    },
    {
      id: 4,
      sender: "recruiter",
      content: "That sounds great! Would you be available for a quick call this week?",
      time: "10:45 AM",
    },
    {
      id: 5,
      sender: "candidate",
      content: "Thank you for considering my application. I'm available Tuesday or Wednesday afternoon.",
      time: "11:00 AM",
    },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic here
      setMessage("")
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  return (
    <div className="h-screen bg-white flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-black mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedChat(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat === conversation.id ? "bg-orange-50 border-orange-200" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback className="bg-green-700 text-white">
                      {conversation.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-black truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.position}</p>
                  <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <Badge className="bg-green-700 text-white text-xs">{conversation.unread}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {selectedConversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-black">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-600">{selectedConversation.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "recruiter" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === "recruiter" ? "bg-green-700 text-white" : "bg-gray-100 text-black"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "recruiter" ? "text-orange-100" : "text-gray-500"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-black mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messaging
