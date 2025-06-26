"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TextInput, Button, Stack, ScrollArea, Group, Text, Title, Avatar } from "@mantine/core";
import api from "@/api"; 
import PrivateRoute from "@/components/PrivateRoute";

interface Message {
  sender__username: string;
  content: string;
  timestamp?: string;
}

interface chatDetails {
  mentee_name: string;
  mentor_name: string;
  mentor_avatar: string;
  topic: string;
}

interface usernames {
  mentee_username: string;
  mentor_username: string;
}

const ChatPage: React.FC = () => {
  const { roomId } = useParams() as { roomId: string };
  const username = localStorage.getItem("username");
  const [usernames, setUsernames] = useState<usernames>({
    mentee_username: "",
    mentor_username: "",
  })
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const role = localStorage.getItem("role");
  const [chatDetails, setChatDetails] = useState<chatDetails>({
    mentee_name: "",
    mentor_name: "",
    mentor_avatar: "",
    topic: "",
  })
  const router = useRouter();

  // Helper to format timestamps
  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Fetch chat history from the backend
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!roomId) return;

      try {
        const response = await api.get(`/chat/history/${roomId}/`);
        const data: Message[] = response.data;
        setChatHistory(data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchChatHistory();
  }, [roomId, messages]);

  // Connect to WebSocket on load
  useEffect(() => {
    if (!roomId) return;
    const fetchDetails = async () => {
      const chat_response = await api.get(`/chat/details/${roomId}/`)
      const username_response = await api.get(`/chat/usernames/${roomId}/`)
      const username_data : usernames = username_response.data;
      const chat_data : chatDetails = chat_response.data;
      const username = localStorage.getItem("username")
      if (
        username &&
        username_data.mentee_username &&
        username_data.mentor_username &&
        username !== username_data.mentee_username &&
        username !== username_data.mentor_username
      ) {
        if (newSocket.readyState === WebSocket.OPEN) {
          newSocket.close();
        }
        router.push('/appointments');
      }
      setChatDetails(chat_data)
      setUsernames(username_data)
      
    }
    const newSocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    fetchDetails();
        
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [roomId]);

  // Handle sending a message
  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message.trim()) {
      socket.send(JSON.stringify({ message, sender: username }));
      setMessage(""); // Clear input
    } else {
      console.warn("WebSocket is not ready to send messages");
    }
  };
  console.log(username, usernames.mentee_username, usernames.mentor_username)
  return (
    <PrivateRoute>
      <Stack>
        {/* Header */}
        <Group>
          {/* If the user is a mentee */}
          {role === "Mentee" && (
            <>
              <Avatar src={chatDetails.mentor_avatar} radius="lg" size={50} mr="md" />
              <div>
                <Text fz={18} fw={600}>{chatDetails.mentor_name}</Text>
                <Text size="xs" c="dimmed">
                  Topic: {chatDetails.topic}
                </Text>
              </div>
            </>
          )}
          
          {/* If the user is a mentor */}
          {role === "Mentor" && (
            <>
              <div>
                <Text fw={600}>{chatDetails.mentee_name}</Text>
                <Text size="xs" color="dimmed">
                  Topic: {chatDetails.topic}
                </Text>
              </div>
            </>
          )}
        </Group>

        {/* Chat Area */}
        <ScrollArea style={{ height: "calc(100vh - 150px)" }}>
          {/* Render chat history */}
          {chatHistory.map((msg, index) => (
            <div
              key={`history-${index}`}
              style={{
                display: "flex",
                justifyContent: msg.sender__username === username ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  maxWidth: "66%",
                  backgroundColor: msg.sender__username === username 
                    ? "#28a745" 
                    : "#007bff",           
                  color: "white",
                  padding: "10px",
                  borderRadius: msg.sender__username === username 
                    ? "12px 0px 12px 12px"  
                    : "0px 12px 12px 12px", 
                  wordWrap: "break-word",
                  marginRight: msg.sender__username === username ? "24px" : "0px", 
                }}
              
              >
                <Text style={{ fontWeight: "bold" }}>
                  {msg.sender__username === username ? "You" : msg.sender__username}
                </Text>
                <Text size="xs" style={{ color: "#ddd", marginBottom: "5px" }}>
                  {formatTimestamp(msg.timestamp)}
                </Text>
                <Text>{msg.content}</Text>
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Message Input */}
        <Group>
          <TextInput
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={sendMessage} variant="gradient" gradient={{from: "cyan", to: "blue"}} disabled={!message.trim()}>
            Send
          </Button>
        </Group>
      </Stack>
    </PrivateRoute>
  );
};

export default ChatPage;
