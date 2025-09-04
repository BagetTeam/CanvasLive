import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/entities/ChatMessage";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";

type ChatPanelPayload = {
    room: 
}

export default function ChatPanel({ room, isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    getUser();
  }, []);

  // Load and poll for messages
  useEffect(() => {
    if (!room?.id || !isOpen) return;

    const loadMessages = async () => {
      try {
        const roomMessages = await ChatMessage.filter(
          { room_id: room.id },
          "-created_date",
          50
        );
        setMessages(roomMessages.reverse());
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();

    // Poll for new messages every 3 seconds
    pollingRef.current = setInterval(loadMessages, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [room?.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !room?.id || !user || isLoading) return;

    setIsLoading(true);
    try {
      await ChatMessage.create({
        room_id: room.id,
        message: newMessage.trim(),
        sender_name: user.full_name || user.email,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Toggle button */}
      <Button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-10 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-red-600 hover:bg-red-700"
            : "bg-cyan-600 hover:bg-cyan-700"
        }`}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 flex flex-col z-20 shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Room Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-1">{room?.name}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                      {message.sender_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-cyan-400 text-sm font-medium">
                      {message.sender_name}
                    </span>
                    <span className="text-gray-400 text-xs ml-auto">
                      {new Date(message.created_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-100 text-sm">{message.message}</p>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-700"
            >
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isLoading}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
