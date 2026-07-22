/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Paperclip, Send } from "lucide-react";
import Image from "next/image";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";

function InboxPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const TOKEN = session?.user?.accessToken || "";

  const [selectedChat, setSelectedChat] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesRef = useRef<any[]>([]); // keep latest messages
  const [unreadCount, setUnreadCount] = useState<{ [key: string]: number }>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // -------------------- Fetch Conversations --------------------
  const { data: convRes } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/conversation`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const json = await res.json();
      return json.data;
    },
    enabled: !!userId,
  });

  const conversations = convRes || [];
  const selectedConversation = conversations[selectedChat];

  // -------------------- Fetch Messages --------------------
  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/${selectedConversation._id}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    const json = await res.json();
    setMessages(json.data);
    messagesRef.current = json.data; // sync ref
  }, [selectedConversation?._id, TOKEN]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // -------------------- Socket.IO --------------------
  useEffect(() => {
    if (!userId) return;

    socket.emit("addUser", userId);

    const handleReceiveMessage = (msg: any) => {
      if (msg.conversationId === selectedConversation?._id) {
        messagesRef.current = [...messagesRef.current, msg];
        setMessages([...messagesRef.current]);
      } else {
        setUnreadCount((prev) => ({
          ...prev,
          [msg.conversationId]: (prev[msg.conversationId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [userId, selectedConversation?._id]);

  // -------------------- Send Message --------------------
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.members.find((m: any) => m._id !== userId)?._id;
    const payload = {
      senderId: userId,
      receiverId,
      conversationId: selectedConversation._id,
      message: messageInput,
    };

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    socket.emit("sendMessage", payload);

    messagesRef.current = [...messagesRef.current, { ...payload, _id: Date.now().toString() }];
    setMessages([...messagesRef.current]);
    setMessageInput("");
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // -------------------- Handle Conversation Switch --------------------
  const handleSelectConversation = (index: number) => {
    setSelectedChat(index);
    setUnreadCount((prev) => ({
      ...prev,
      [conversations[index]?._id]: 0,
    }));
  };

  // -------------------- Auto-scroll --------------------
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <BreadcrumbHeader
        title="Inbox"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Inbox", href: "/inbox" },
        ]}
      />

      <div className="flex flex-col md:flex-row h-[80vh] container mx-auto py-6 md:py-9 px-4 sm:px-6 md:px-10 gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border border-gray-200 flex flex-col">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Berichten</h1>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek bericht ..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((c: any, i: number) => {
              const otherUser = c.members.find((m: any) => m._id !== userId);
              return (
                <button
                  key={c._id}
                  onClick={() => {
                    handleSelectConversation(i);
                    setTimeout(fetchMessages, 50);
                  }}
                  className={`w-full px-3 md:px-4 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 text-left ${
                    selectedChat === i ? "bg-green-50" : ""
                  }`}
                >
                  <Image
                    width={48}
                    height={48}
                    src={otherUser?.profileImage || "/noavatar.png"}
                    alt="avatar"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate text-sm md:text-base">
                      {otherUser?.firstName} {otherUser?.lastName}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{otherUser?.email}</p>
                  </div>
                  {unreadCount[c._id] > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 text-xs md:text-sm">
                      {unreadCount[c._id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          {selectedConversation && (
            <>
              <div className="p-4 md:p-6 border border-gray-200 bg-white flex items-center gap-3">
                <Image
                  width={48}
                  height={48}
                  src={selectedConversation.members.find((m: any) => m._id !== userId)?.profileImage || "/noavatar.png"}
                  alt="User"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
                <div className="truncate">
                  <h2 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {selectedConversation.members.find((m: any) => m._id !== userId)?.firstName}{" "}
                    {selectedConversation.members.find((m: any) => m._id !== userId)?.lastName}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {selectedConversation.members.find((m: any) => m._id !== userId)?.email}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
                {messages.map((m: any) => {
                  const isSender = m.senderId === userId || m.senderId?._id === userId;
                  return (
                    <div key={m._id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`${
                          isSender ? "bg-green-600 text-white" : "bg-gray-200 text-gray-900"
                        } rounded-lg px-3 md:px-4 py-2 max-w-xs md:max-w-sm break-words`}
                        ref={scrollRef}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 md:p-6 border border-gray-200 bg-white flex gap-2 md:gap-3">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Typ uw bericht..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-gray-100 rounded-full px-3 md:px-4 py-2 outline-none text-sm md:text-base"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxPage;
