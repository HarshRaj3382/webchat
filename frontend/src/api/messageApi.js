import API from "./authApi";

const MessageApi = {
  getUsers: (search = "") => API.get("users", { params: { search } }),
  getConversations: () => API.get("conversations"),
  createConversation: (userId) => API.post("conversations", { userId }),
  getMessages: (conversationId, before) =>
    API.get(`messages/${conversationId}`, { params: before ? { before } : {} }),
  sendMessage: (conversationId, content) => API.post(`messages/${conversationId}`, { content }),
  markRead: (conversationId) => API.put(`messages/${conversationId}/read`),
  getCallConfiguration: () => API.get("calls/config"),
  startCall: (conversationId, type) => API.post("calls", { conversationId, type }),
  respondToCall: (callId, accepted) => API.patch(`calls/${callId}/respond`, { accepted }),
  endCall: (callId) => API.patch(`calls/${callId}/end`),
  heartbeatCall: (callId) => API.patch(`calls/${callId}/heartbeat`),
  getCallToken: (callId) => API.post(`calls/${callId}/token`),
};

export default MessageApi;
