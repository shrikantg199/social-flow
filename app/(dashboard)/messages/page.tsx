"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    name: string;
    profilePicture: string;
  }[];
  lastMessageAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  text: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { currentUser, loading: userLoading } = useCurrentUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const directUserId = searchParams ? searchParams.get("userId") : null;

  const fetchConversations = async (): Promise<Conversation[]> => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
      return data;
    }
    return [];
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations().then((convos) => {
        if (directUserId && directUserId !== currentUser._id) {
          let convo = convos.find((c: Conversation) =>
            c.participants.some((p) => p._id === directUserId)
          );
          if (convo) {
            setSelectedConversation(convo);
            fetchMessages(convo._id);
            socketRef.current?.emit("joinConversation", convo._id);
          } else {
            fetch("/api/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recipientId: directUserId }),
            })
              .then((res) => res.json())
              .then((newConvo: Conversation) => {
                setConversations((prev) => [newConvo, ...prev]);
                setSelectedConversation(newConvo);
                fetchMessages(newConvo._id);
                socketRef.current?.emit("joinConversation", newConvo._id);
              });
          }
        }
      });
      const socketInstance = io({ path: "/api/socket" });
      socketRef.current = socketInstance;
      socketInstance.on("connect", () => {
        console.log("Socket connected");
      });
      socketInstance.on("newMessage", (message: Message) => {
        if (message.conversationId === selectedConversation?._id) {
          setMessages((prev) => [...prev, message]);
        }
        fetchConversations();
      });
      return () => {
        socketInstance.disconnect();
      };
    }
    // eslint-disable-next-line
  }, [currentUser, selectedConversation?._id, directUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
    socketRef.current?.emit("joinConversation", conversation._id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const res = await fetch(
      `/api/conversations/${selectedConversation._id}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessage }),
      }
    );

    if (res.ok) {
      const sentMessage = await res.json();
      socketRef.current?.emit("sendMessage", sentMessage);
      setNewMessage("");
      fetchConversations();
    }
  };

  if (userLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] border rounded-lg overflow-hidden shadow-lg mt-20">
      <aside className="w-1/3 border-r bg-slate-50 dark:bg-slate-800">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Chats</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((convo) => {
            if (!Array.isArray(convo.participants)) return null;
            const otherParticipant = convo.participants.find(
              (p) => p._id !== currentUser?._id
            );
            return (
              <div
                key={convo._id}
                className={`p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  selectedConversation?._id === convo._id
                    ? "bg-slate-200 dark:bg-slate-600"
                    : ""
                }`}
                onClick={() => handleSelectConversation(convo)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={otherParticipant?.profilePicture} />
                    <AvatarFallback>
                      {otherParticipant?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{otherParticipant?.name}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="w-2/3 flex flex-col bg-white dark:bg-slate-900">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    Array.isArray(selectedConversation.participants)
                      ? selectedConversation.participants.find(
                          (p) => p._id !== currentUser?._id
                        )?.profilePicture
                      : undefined
                  }
                />
                <AvatarFallback>
                  {Array.isArray(selectedConversation.participants)
                    ? selectedConversation.participants
                        .find((p) => p._id !== currentUser?._id)
                        ?.name?.charAt(0)
                    : ""}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {
                  selectedConversation.participants.find(
                    (p) => p._id !== currentUser?._id
                  )?.name
                }
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex gap-2 ${
                    msg.sender._id === currentUser?._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {msg.sender._id !== currentUser?._id && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={msg.sender.profilePicture} />
                      <AvatarFallback>
                        {msg.sender.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender._id === currentUser?._id
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-70 block text-right mt-1">
                      {format(new Date(msg.createdAt), "p")}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <Button type="submit">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
