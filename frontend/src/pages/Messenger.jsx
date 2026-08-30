import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  Smile,
  Sparkles,
  UserPlus,
  Video,
} from "lucide-react";
import Header from "../components/Header";
import MessageApi from "../api/messageApi";
import { createMessengerSocket } from "../lib/socket";
import { redirectToLogin } from "../lib/session";

const CallOverlay = lazy(() => import("../components/messenger/CallOverlay"));

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const getPartner = (conversation, currentUserId) =>
  conversation?.participants?.find((participant) => String(participant._id) !== String(currentUserId));

const avatarUrl = (user) =>
  user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=4f46e5&color=fff`;

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getRequestErrorMessage = (requestError, fallback) => {
  if (requestError.response?.data?.message) return requestError.response.data.message;
  if (["ERR_NETWORK", "ECONNABORTED"].includes(requestError.code) || requestError.message === "Network Error") {
    return "Could not reach the WebChat server. It may be waking up—please try again in a few seconds.";
  }
  return fallback;
};

const retryAfterServerWake = async (request) => {
  try {
    return await request();
  } catch (error) {
    const isNetworkError = ["ERR_NETWORK", "ECONNABORTED"].includes(error.code) || error.message === "Network Error";
    if (!isNetworkError) throw error;

    await new Promise((resolve) => window.setTimeout(resolve, 2_000));
    return request();
  }
};

const Messenger = () => {
  const currentUser = getStoredUser();
  const [socket] = useState(createMessengerSocket);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [callState, setCallState] = useState(null);
  const [callConfigured, setCallConfigured] = useState(null);
  const [error, setError] = useState("");
  const [acceptingCall, setAcceptingCall] = useState(false);
  const selectedRef = useRef(null);
  const typingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selectedConversation;
  }, [selectedConversation]);

  const loadConversations = useCallback(async () => {
    try {
      const [response, callConfigResponse] = await Promise.all([
        MessageApi.getConversations(),
        MessageApi.getCallConfiguration(),
      ]);
      setConversations(response.data.conversations || []);
      setCallConfigured(Boolean(callConfigResponse.data.configured));
      setError("");
    } catch (requestError) {
      console.error(requestError);
      setError("Could not load your conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const joinLiveKitCall = useCallback(async (call) => {
    setCallState({ call, phase: "connecting" });
    try {
      const response = await retryAfterServerWake(() => MessageApi.getCallToken(call._id));
      setCallState({ call, phase: "active", session: response.data });
    } catch (requestError) {
      setCallState({
        call,
        phase: "connecting",
        error: requestError.response?.data?.message || "Could not connect to the call.",
      });
    }
  }, []);

  useEffect(() => {
    socket.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = (connectionError) => {
      setConnected(false);
      if (["Authentication required", "Invalid or expired session", "User not found"].includes(connectionError.message)) {
        redirectToLogin();
      }
    };
    const onPresenceSnapshot = (userIds) => setOnlineUsers(new Set(userIds.map(String)));
    const onPresenceUpdate = ({ userId, online }) => {
      setOnlineUsers((current) => {
        const next = new Set(current);
        if (online) next.add(String(userId));
        else next.delete(String(userId));
        return next;
      });
    };
    const onMessage = (message) => {
      if (String(selectedRef.current?._id) === String(message.conversation)) {
        setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
        MessageApi.markRead(message.conversation).catch((requestError) => console.error(requestError));
      }
      loadConversations();
    };
    const onTypingStart = ({ conversationId, username }) => {
      if (String(selectedRef.current?._id) === String(conversationId)) setTypingUser(username);
    };
    const onTypingStop = ({ conversationId }) => {
      if (String(selectedRef.current?._id) === String(conversationId)) setTypingUser("");
    };
    const onMessagesRead = ({ conversationId, userId }) => {
      if (String(selectedRef.current?._id) !== String(conversationId)) return;
      setMessages((current) => current.map((message) => {
        if (String(message.sender?._id || message.sender) !== String(currentUser?._id)) return message;
        const readBy = (message.readBy || []).map(String);
        return readBy.includes(String(userId))
          ? message
          : { ...message, readBy: [...(message.readBy || []), userId] };
      }));
    };
    const onIncomingCall = (call) => setCallState({ call, phase: "incoming" });
    const onCallAccepted = (call) => {
      if (String(call.caller?._id) === String(currentUser?._id)) joinLiveKitCall(call);
    };
    const onCallRejected = () => window.setTimeout(() => setCallState(null), 700);
    const onCallEnded = () => setCallState(null);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("presence:snapshot", onPresenceSnapshot);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("message:new", onMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("messages:read", onMessagesRead);
    socket.on("call:incoming", onIncomingCall);
    socket.on("call:accepted", onCallAccepted);
    socket.on("call:rejected", onCallRejected);
    socket.on("call:ended", onCallEnded);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [currentUser?._id, joinLiveKitCall, loadConversations, socket]);

  useEffect(() => {
    const timer = window.setTimeout(loadConversations, 0);
    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await MessageApi.getUsers(search);
        setPeople(response.data.users || []);
      } catch (requestError) {
        console.error(requestError);
      }
    }, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const openConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setLoadingMessages(true);
    setTypingUser("");
    try {
      const response = await MessageApi.getMessages(conversation._id);
      setMessages(response.data.messages || []);
      socket.emit("conversation:join", { conversationId: conversation._id });
      await MessageApi.markRead(conversation._id);
      setConversations((current) => current.map((item) => item._id === conversation._id ? { ...item, unreadCount: 0 } : item));
    } catch (requestError) {
      console.error(requestError);
      setError("Could not open this conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const startConversation = async (user) => {
    try {
      const response = await MessageApi.createConversation(user._id);
      const conversation = response.data.conversation;
      setConversations((current) => [conversation, ...current.filter((item) => item._id !== conversation._id)]);
      setSearch("");
      openConversation(conversation);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not start the conversation.");
    }
  };

  const sendMessage = async () => {
    const content = messageText.trim();
    if (!content || !selectedConversation) return;
    setSending(true);
    socket.emit("typing:stop", { conversationId: selectedConversation._id });
    try {
      const response = await MessageApi.sendMessage(selectedConversation._id, content);
      const savedMessage = response.data.message;
      setMessages((current) => current.some((item) => item._id === savedMessage._id) ? current : [...current, savedMessage]);
      setMessageText("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const handleMessageChange = (value) => {
    setMessageText(value);
    if (!selectedConversation) return;
    socket.emit("typing:start", { conversationId: selectedConversation._id });
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit("typing:stop", { conversationId: selectedConversation._id });
    }, 1200);
  };

  const startCall = async (type) => {
    if (!selectedConversation) return;
    if (!callConfigured) {
      setError("LiveKit is not configured yet. Add the three LIVEKIT values to backend/.env.");
      return;
    }
    try {
      const response = await MessageApi.startCall(selectedConversation._id, type);
      setCallState({ call: response.data.call, phase: "outgoing" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not start the call.");
    }
  };

  const acceptCall = async () => {
    if (!callState?.call || acceptingCall) return;
    setAcceptingCall(true);
    try {
      const response = await retryAfterServerWake(() => MessageApi.respondToCall(callState.call._id, true));
      joinLiveKitCall(response.data.call);
    } catch (requestError) {
      setCallState((current) => ({
        ...current,
        error: getRequestErrorMessage(requestError, "Could not accept the call."),
      }));
    } finally {
      setAcceptingCall(false);
    }
  };

  const rejectCall = async () => {
    if (!callState?.call) return;
    try {
      await MessageApi.respondToCall(callState.call._id, false);
    } catch (requestError) {
      console.error(requestError);
    }
    setCallState(null);
  };

  const endCall = () => {
    if (callState?.call) {
      MessageApi.endCall(callState.call._id).catch((requestError) => console.error(requestError));
    }
    setCallState(null);
  };

  const partner = getPartner(selectedConversation, currentUser?._id);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl p-0 sm:p-4 lg:p-6">
        <div className="grid h-full overflow-hidden border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:border lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className={`${selectedConversation ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-r border-slate-100`}>
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-950">Messages</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><span className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-400"}`} />{connected ? "Connected" : "Reconnecting"}</p>
                </div>
                <span className="grid size-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><MessageCircle size={19} /></span>
              </div>
              <label className="relative mt-5 block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find people..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {search && <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">People</p>}
              {search ? people.map((user) => (
                <button key={user._id} type="button" onClick={() => startConversation(user)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-indigo-50">
                  <img src={avatarUrl(user)} alt="" className="size-11 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{user.username}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div>
                  <UserPlus size={17} className="text-indigo-500" />
                </button>
              )) : (
                <>
                  <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent conversations</p>
                  {loadingConversations ? <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-indigo-500" /></div> : conversations.map((conversation) => {
                    const user = getPartner(conversation, currentUser?._id);
                    const online = onlineUsers.has(String(user?._id));
                    return (
                      <button key={conversation._id} type="button" onClick={() => openConversation(conversation)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedConversation?._id === conversation._id ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                        <div className="relative shrink-0"><img src={avatarUrl(user)} alt="" className="size-12 rounded-2xl object-cover" />{online && <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-500" />}</div>
                        <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold text-slate-800">{user?.username}</p><span className="shrink-0 text-[10px] text-slate-400">{formatTime(conversation.lastMessageAt)}</span></div><p className="mt-1 truncate text-xs text-slate-400">{conversation.lastMessage?.content || "Start a conversation"}</p></div>
                        {conversation.unreadCount > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{conversation.unreadCount}</span>}
                      </button>
                    );
                  })}
                  {!loadingConversations && conversations.length === 0 && <div className="px-5 py-12 text-center"><Sparkles className="mx-auto text-indigo-400" /><p className="mt-3 text-sm font-bold text-slate-700">Start your first chat</p><p className="mt-1 text-xs leading-5 text-slate-400">Use the search box to find someone in the community.</p></div>}
                </>
              )}
            </div>
          </aside>

          <section className={`${selectedConversation ? "flex" : "hidden lg:flex"} min-h-0 flex-col bg-slate-50/60`}>
            {selectedConversation ? (
              <>
                <div className="flex h-18 items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
                  <button type="button" onClick={() => setSelectedConversation(null)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Back to conversations"><ArrowLeft size={19} /></button>
                  <div className="relative"><img src={avatarUrl(partner)} alt="" className="size-11 rounded-2xl object-cover" />{onlineUsers.has(String(partner?._id)) && <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-500" />}</div>
                  <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-extrabold text-slate-900">{partner?.username}</h2><p className="mt-0.5 text-xs text-slate-400">{typingUser ? `${typingUser} is typing...` : onlineUsers.has(String(partner?._id)) ? "Online now" : "Offline"}</p></div>
                  <button type="button" onClick={() => startCall("audio")} className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600" aria-label="Start audio call"><Phone size={18} /></button>
                  <button type="button" onClick={() => startCall("video")} className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100" aria-label="Start video call"><Video size={19} /></button>
                  <button type="button" className="hidden size-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 sm:grid" aria-label="Conversation options"><MoreHorizontal size={20} /></button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  {loadingMessages ? <div className="grid h-full place-items-center"><Loader2 className="animate-spin text-indigo-500" /></div> : messages.length === 0 ? <div className="grid h-full place-items-center text-center"><div><img src={avatarUrl(partner)} alt="" className="mx-auto size-20 rounded-[1.75rem] object-cover" /><h3 className="mt-4 font-extrabold text-slate-800">Say hello to {partner?.username}</h3><p className="mt-1 text-sm text-slate-400">This is the beginning of your conversation.</p></div></div> : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const mine = String(message.sender?._id || message.sender) === String(currentUser?._id);
                        return <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%] ${mine ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md border border-slate-100 bg-white text-slate-700"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-indigo-200" : "text-slate-400"}`}>{formatTime(message.createdAt)}{mine && <CheckCheck size={13} />}</div></div></div>;
                      })}
                      {typingUser && <div className="flex justify-start"><div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm"><span className="size-1.5 animate-bounce rounded-full bg-slate-400" /><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" /><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" /></div></div>}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
                  <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                    <button type="button" className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600" aria-label="Choose emoji"><Smile size={19} /></button>
                    <textarea rows="1" maxLength={2000} value={messageText} onChange={(event) => handleMessageChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder={connected ? "Write a message..." : "Reconnecting..."} className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400" />
                    <button type="button" onClick={sendMessage} disabled={sending || !messageText.trim()} className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40" aria-label="Send message">{sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid h-full place-items-center p-8 text-center"><div className="max-w-sm"><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-indigo-100 text-indigo-600"><MessageCircle size={28} /></span><h2 className="mt-5 text-xl font-extrabold text-slate-900">Your conversations live here</h2><p className="mt-2 text-sm leading-6 text-slate-400">Choose a recent chat or find someone new to start messaging.</p></div></div>
            )}
          </section>
        </div>
      </main>

      {error && <button type="button" onClick={() => setError("")} className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{error}</button>}
      {callState && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950"><Loader2 className="animate-spin text-white" /></div>}>
          <CallOverlay callState={callState} currentUserId={currentUser?._id} accepting={acceptingCall} onAccept={acceptCall} onReject={rejectCall} onEnd={endCall} />
        </Suspense>
      )}
    </div>
  );
};

export default Messenger;
