"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConversations, useDeleteConversation } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
interface Conversation {
  id: string;
  client_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  messages: { count: number };
}
interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  kb_match_id?: string;
  created_at: string;
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [conversationDetails, setConversationDetails] = useState<{
    conversation: Conversation;
    messages: Message[];
  } | null>(null);
  // Check if password is stored in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_password");
    if (stored) {
      setAdminPassword(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_password", adminPassword);
    }
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword("");
    localStorage.removeItem("admin_password");
  };

  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
  } = useConversations(isAuthenticated ? adminPassword : "");

  const deleteConversation = useDeleteConversation();

  const handleDeleteConversation = async (id: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversation.mutateAsync({
          id,
          adminPassword,
        });
        if (selectedConversation === id) {
          setSelectedConversation(null);
          setConversationDetails(null);
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  const loadConversationDetails = async (id: string) => {
    try {
      const response = await fetch(
        `/api/conversations?id=${id}&admin_password=${encodeURIComponent(
          adminPassword
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();
      setConversationDetails(data);
      setSelectedConversation(id);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  console.log(conversationDetails);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Password</label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Conversations Admin</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      {error && (
        <Card className="p-4 mb-4 border-red-200 bg-red-50">
          <p className="text-red-800">Error: {error.message}</p>
        </Card>
      )}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p>Loading conversations...</p>
        </Card>
      ) : (
        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversationsData?.conversations?.map(
                (conversation: Conversation) => (
                  <TableRow
                    key={conversation.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => loadConversationDetails(conversation.id)}
                  >
                    <TableCell className="font-medium">
                      {" "}
                      {conversation.title}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {conversation.client_id.substring(0, 12)}...
                    </TableCell>
                    <TableCell>{conversation.model}</TableCell>
                    <TableCell>{conversation.messages.count}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(conversation.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Card>
      )}
      <Dialog
        open={!!selectedConversation}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedConversation(null);
            setConversationDetails(null);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{conversationDetails?.conversation.title}</DialogTitle>
          </DialogHeader>

          {conversationDetails && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>
                  Client: {conversationDetails.conversation.client_id}
                </span>
                <span>Model: {conversationDetails.conversation.model}</span>
                <span>
                  Created:{" "}
                  {new Date(
                    conversationDetails.conversation.created_at
                  ).toLocaleString()}
                </span>
              </div>
              <div className="space-y-4">
                {conversationDetails.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-muted ml-8"
                        : "bg-primary/10 mr-8"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={
                          message.role === "user" ? "default" : "secondary"
                        }
                      >
                        {message.role === "user" ? "User" : "Assistant"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.kb_match_id && (
                      <p className="text-xs text-muted-foreground mt-2">
                        KB Match: {message.kb_match_id}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
