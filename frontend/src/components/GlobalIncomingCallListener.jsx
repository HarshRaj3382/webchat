import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MessageApi from "../api/messageApi";
import { createMessengerSocket } from "../lib/socket";

const CallOverlay = lazy(() => import("./messenger/CallOverlay"));

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
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

const GlobalIncomingCallListener = () => {
  const location = useLocation();
  const currentUser = getStoredUser();
  const token = localStorage.getItem("token");
  const [socket] = useState(createMessengerSocket);
  const [callState, setCallState] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const joinLiveKitCall = useCallback(async (call) => {
    setCallState({ call, phase: "connecting" });
    try {
      const response = await retryAfterServerWake(() => MessageApi.getCallToken(call._id));
      setCallState({ call, phase: "active", session: response.data });
    } catch (error) {
      setCallState({
        call,
        phase: "connecting",
        error: error.response?.data?.message || "Could not connect to the call. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    // Messenger owns its own socket and call overlay. This listener keeps users
    // reachable while they are elsewhere in the app, including on the mobile feed.
    if (!token || !currentUser?._id || location.pathname === "/messages") {
      socket.disconnect();
      return undefined;
    }

    const onIncomingCall = (call) => {
      setCallState((current) => current || { call, phase: "incoming" });

      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification(`Incoming ${call.type} call`, {
          body: `${call.caller?.username || "Someone"} is calling you on WebChat.`,
          icon: "/favicon.svg",
          tag: `webchat-call-${call._id}`,
          requireInteraction: true,
        });
      }
    };
    const onCallAccepted = (call) => {
      if (String(call.caller?._id || call.caller) === String(currentUser._id)) joinLiveKitCall(call);
    };
    const onCallRejected = () => window.setTimeout(() => setCallState(null), 700);
    const onCallEnded = () => setCallState(null);

    socket.connect();
    socket.on("call:incoming", onIncomingCall);
    socket.on("call:accepted", onCallAccepted);
    socket.on("call:rejected", onCallRejected);
    socket.on("call:ended", onCallEnded);

    return () => {
      socket.off("call:incoming", onIncomingCall);
      socket.off("call:accepted", onCallAccepted);
      socket.off("call:rejected", onCallRejected);
      socket.off("call:ended", onCallEnded);
      socket.disconnect();
    };
  }, [currentUser?._id, joinLiveKitCall, location.pathname, socket, token]);

  const acceptCall = async () => {
    if (!callState?.call || accepting) return;
    setAccepting(true);
    try {
      const response = await retryAfterServerWake(() => MessageApi.respondToCall(callState.call._id, true));
      joinLiveKitCall(response.data.call);
    } catch (error) {
      setCallState((current) => ({
        ...current,
        error: error.response?.data?.message || "Could not accept the call. Please try again.",
      }));
    } finally {
      setAccepting(false);
    }
  };

  const rejectCall = async () => {
    if (!callState?.call) return;
    try {
      await MessageApi.respondToCall(callState.call._id, false);
    } finally {
      setCallState(null);
    }
  };

  const endCall = () => {
    if (callState?.call) MessageApi.endCall(callState.call._id).catch(() => {});
    setCallState(null);
  };

  const heartbeatCall = useCallback((callId) => {
    MessageApi.heartbeatCall(callId).catch(() => {});
  }, []);

  if (!callState) return null;

  return (
    <Suspense fallback={null}>
      <CallOverlay
        callState={callState}
        currentUserId={currentUser?._id}
        accepting={accepting}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onHeartbeat={heartbeatCall}
      />
    </Suspense>
  );
};

export default GlobalIncomingCallListener;
