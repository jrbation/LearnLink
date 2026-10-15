"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  User,
  Users,
} from "lucide-react";

interface Props {
  parents: any[];
  initialMessages: any[];
  currentUserId: string;
}

export function TeacherMessagesClient({ parents, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedParentId, setSelectedParentId] = useState<string>(
    parents[0]?.id || ""
  );

  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedParent = parents.find((p) => p.id === selectedParentId);

  const thread = messages.filter(
    (m) =>
      (m.senderId === currentUserId && m.recipientId === selectedParentId) ||
      (m.senderId === selectedParentId && m.recipientId === currentUserId)
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedParentId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedParentId,
          subject: subject.trim() || "Teacher Update",
          message: messageText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setMessages([...messages, data.message]);
      setMessageText("");
      setSubject("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary-600" />
          Parent Communications & Messages
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Send progress updates, answer questions, and communicate directly with parents of your students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Parents List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Connected Parents ({parents.length})
            </h3>
          </div>

          {parents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No parents currently linked to enrolled students.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {parents.map((parent) => {
                const isSelected = selectedParentId === parent.id;
                return (
                  <button
                    key={parent.id}
                    onClick={() => setSelectedParentId(parent.id)}
                    className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                      isSelected
                        ? "bg-primary-50/70 border-l-4 border-primary-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                      {parent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{parent.name}</h4>
                      <p className="text-[10px] text-slate-400">{parent.className}</p>
                      <p className="text-[9px] text-primary-600 font-medium">Child: {parent.childName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Messages Thread */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden min-h-[500px]">
          {selectedParent ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Conversation with {selectedParent.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Parent of {selectedParent.childName} ({selectedParent.email})
                  </p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[380px]">
                {thread.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No message history with {selectedParent.name} yet. Send an update below.
                  </div>
                ) : (
                  thread.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-4 rounded-2xl text-xs space-y-1 shadow-2xs ${
                            isMe
                              ? "bg-primary-600 text-white rounded-br-xs"
                              : "bg-slate-100 text-slate-900 rounded-bl-xs"
                          }`}
                        >
                          {msg.subject && (
                            <span className={`block font-bold text-[11px] ${isMe ? "text-primary-100" : "text-slate-600"}`}>
                              {msg.subject}
                            </span>
                          )}
                          <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compose Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <input
                  type="text"
                  placeholder="Subject (e.g. Student Progress Update)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field w-full text-xs py-2 px-3 bg-white rounded-xl border border-slate-200"
                />
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    required
                    placeholder="Type your message to the parent..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="input-field flex-1 text-xs py-2 px-3 bg-white rounded-xl border border-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !messageText.trim()}
                    className="btn-primary text-xs px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">
              Select a parent from the directory to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
