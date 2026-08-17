import { useState } from "react";
import {
  AudioConference,
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import { AlertTriangle, Check, Loader2, Phone, PhoneOff, Video } from "lucide-react";
import "@livekit/components-styles";
import "./call.css";

const getCallPartner = (call, currentUserId) => {
  if (!call) return null;
  const callerId = call.caller?._id || call.caller;
  return String(callerId) === String(currentUserId) ? call.receiver : call.caller;
};

const avatarUrl = (user) =>
  user?.profilePic ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=4f46e5&color=fff`;

const Avatar = ({ user, large = false }) => (
  <div className={`relative ${large ? "size-28" : "size-10"}`}>
    <div className="absolute inset-0 rounded-[2rem] bg-indigo-400/30 blur-xl" />
    <img
      src={avatarUrl(user)}
      alt=""
      className={`relative size-full object-cover ring-4 ring-white/10 ${large ? "rounded-[2rem]" : "rounded-2xl"}`}
    />
  </div>
);

const ActiveCall = ({ call, partner, session, onEnd }) => {
  const [mediaError, setMediaError] = useState("");
  const isVideo = call.type === "video";

  return (
    <div className="call-room relative h-full min-h-full w-full overflow-hidden bg-slate-950">
      <LiveKitRoom
        token={session.token}
        serverUrl={session.url}
        connect
        audio
        video={isVideo}
        onDisconnected={onEnd}
        onError={(error) => setMediaError(error.message || "Could not access your camera or microphone.")}
        className="h-full min-h-full w-full"
      >
        <div data-lk-theme="default" className="h-full min-h-full w-full">
          {isVideo ? <VideoConference className="h-full min-h-full w-full" /> : <AudioConference className="h-full min-h-full w-full" />}
          <RoomAudioRenderer />
        </div>
      </LiveKitRoom>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-950/90 via-slate-950/45 to-transparent p-4 sm:p-6">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white shadow-lg backdrop-blur-md">
          <Avatar user={partner} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{partner?.username || "WebChat user"}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" />Connected</p>
          </div>
        </div>
        <button type="button" onClick={onEnd} className="pointer-events-auto grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-slate-950/65 text-white shadow-lg backdrop-blur-md transition hover:bg-rose-500" aria-label="End call" title="End call">
          <PhoneOff size={19} />
        </button>
      </div>

      {mediaError && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/80 p-5 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-amber-300/20 bg-slate-900 p-6 text-center text-white shadow-2xl">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-400/15 text-amber-300"><AlertTriangle size={25} /></span>
            <h2 className="mt-4 text-lg font-extrabold">Camera or microphone unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{mediaError} Allow browser permissions, then try the call again.</p>
            <button type="button" onClick={onEnd} className="mt-5 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400">Close call</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CallOverlay = ({ callState, currentUserId, accepting, onAccept, onReject, onEnd }) => {
  if (!callState) return null;

  const { call, phase, session, error } = callState;
  const partner = getCallPartner(call, currentUserId);

  if (phase === "active" && session) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950">
        <ActiveCall call={call} partner={partner} session={session} onEnd={onEnd} />
      </div>
    );
  }

  const incoming = phase === "incoming";
  const connecting = phase === "connecting";
  const status = incoming ? `Incoming ${call.type} call` : connecting ? "Connecting securely" : "Calling";
  const message = error || (incoming ? "Would you like to answer?" : connecting ? "Preparing your camera and microphone..." : "Waiting for them to answer...");

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.28),transparent_42%),#080d20] p-4 text-white sm:p-6">
      <div className="absolute left-1/2 top-1/2 size-[min(80vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 text-center shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          <span className="flex items-center gap-2"><span className={`size-2 rounded-full ${incoming ? "animate-pulse bg-emerald-400" : "bg-indigo-400"}`} />WebChat call</span>
          <span className="flex items-center gap-1.5">{call.type === "video" ? <Video size={16} /> : <Phone size={16} />}{call.type}</span>
        </div>

        <div className="mt-8 flex justify-center"><div className="rounded-[2.4rem] border border-indigo-300/20 p-2"><Avatar user={partner} large /></div></div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">{status}</p>
        <h2 className="mt-2 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{partner?.username || "WebChat user"}</h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-400">{message}</p>

        <div className="mt-8 flex items-center justify-center gap-4 border-t border-white/10 pt-6">
          {incoming && (
            <button type="button" onClick={onAccept} disabled={accepting} className="grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-950 transition hover:scale-105 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60" aria-label="Accept call" title="Accept call">
              {accepting ? <Loader2 size={22} className="animate-spin" /> : call.type === "video" ? <Video size={22} /> : <Phone size={22} />}
            </button>
          )}
          <button type="button" onClick={incoming ? onReject : onEnd} className="grid size-14 place-items-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-950 transition hover:scale-105 hover:bg-rose-400" aria-label={incoming ? "Reject call" : "End call"} title={incoming ? "Reject call" : "End call"}>
            <PhoneOff size={22} />
          </button>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><Check size={13} className="text-emerald-400" />Private, encrypted connection</p>
      </div>
    </div>
  );
};

export default CallOverlay;
