import { useEffect, useState, useRef } from "react";
import { getOrderMessagesRequest, sendMessageRequest } from "../../api/message.api";
import { useAppContext } from "../../hooks/useAppContext";

export function OrderChatDrawer({ orderId, orderNumber, recipientId, onClose }) {
  const { user, notify } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getOrderMessagesRequest(orderId);
      setMessages(res.messages || []);
    } catch (err) {
      if (!silent) notify(err.message || "Failed to load messages.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load and polling
  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await sendMessageRequest(orderId, text.trim(), recipientId);
      setMessages((prev) => [...prev, res.message]);
      setText("");
    } catch (err) {
      notify(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop area click to close */}
      <div className="flex-grow cursor-pointer" onClick={onClose} />

      {/* Drawer content panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-100 relative z-55">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange/5">
          <div>
            <h3 className="text-sm font-bold text-gray-900 m-0">💬 Order Chat</h3>
            <p className="text-[10px] text-gray-500 m-0">Order Ref: #{orderNumber || orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-black focus:outline-none h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {loading ? (
            <p className="text-center text-xs text-gray-500 animate-pulse my-8">Loading message history...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <span className="text-3xl">💬</span>
              <p className="text-xs font-semibold">No messages yet.</p>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto">Send a message to start communicating about this order.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender === user.id || m.sender?._id === user.id || m.sender === user._id || m.sender?._id === user._id;
              return (
                <div
                  key={m.id || m._id}
                  className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <span className="text-[9px] text-gray-400 font-bold mb-1 px-1">
                    {isMe ? "You" : m.senderName || "Merchant"}
                  </span>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-gradient-to-br from-amber-600 to-[#c4622d] text-white rounded-tr-none font-medium"
                        : "bg-white border border-gray-150 text-gray-800 rounded-tl-none font-semibold"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1 font-semibold">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-150 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              className="flex-1 border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] resize-none h-10 bg-gray-50"
              placeholder="Type your message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              required
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-4 h-10 bg-[#c4622d] hover:bg-[#e07a4a] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0 border-0 animate-fade-in"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
