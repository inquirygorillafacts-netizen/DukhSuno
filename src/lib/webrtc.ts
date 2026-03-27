import { ref, push, set, onValue, off, onChildAdded, remove } from 'firebase/database';
import { rtdb } from './firebase';
import { useAuthStore } from '@/stores/auth-store';

export interface WebRTCHandler {
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  localStream: MediaStream;
  remoteStream: MediaStream;
}

// ─── Constraints for HD Audio & Video ───
export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: 'user',
};

const DEFAULT_ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

export async function getProductionIceServers() {
  try {
    const resp = await fetch('/api/webrtc/ice-servers');
    const data = await resp.json();
    return data.iceServers || DEFAULT_ICE;
  } catch (err) {
    return DEFAULT_ICE;
  }
}

// ─── Initialize Peer Connection ───
function createPeerConnection(
  sessionId: string, 
  isCaller: boolean, 
  iceServers: any[],
  onEmojiReceived: (emoji: string) => void,
  onConnected: () => void
): WebRTCHandler {
  const pc = new RTCPeerConnection({ iceServers });
  const localStream = new MediaStream();
  const remoteStream = new MediaStream();
  let dataChannel: RTCDataChannel | undefined;

  // Handle Connection State
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'connected') {
      onConnected();
    }
  };
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // ICE Candidates
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      const path = isCaller ? 'callerCandidates' : 'calleeCandidates';
      push(ref(rtdb, `sessions/${sessionId}/signaling/${path}`), e.candidate.toJSON());
    }
  };

  // DataChannel for Emojis
  if (isCaller) {
    dataChannel = pc.createDataChannel('emojis');
    setupDataChannel(dataChannel, onEmojiReceived);
  } else {
    pc.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel(dataChannel, onEmojiReceived);
    };
  }

  return { pc, dataChannel, localStream, remoteStream };
}

function setupDataChannel(channel: RTCDataChannel, onEmojiReceived: (emoji: string) => void) {
  channel.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'emoji') {
      onEmojiReceived(data.value);
    }
  };
}

// ─── START CALL (Caller) ───
export async function startCall(
  sessionId: string, 
  onEmojiReceived: (emoji: string) => void,
  onConnected: () => void
): Promise<WebRTCHandler> {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) throw new Error('Unauthorized');

  const iceServers = await getProductionIceServers();
  const handler = createPeerConnection(sessionId, true, iceServers, onEmojiReceived, onConnected);
  const { pc } = handler;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
    handler.localStream.addTrack(track);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await set(ref(rtdb, `sessions/${sessionId}/signaling/offer`), { type: offer.type, sdp: offer.sdp });

  onValue(ref(rtdb, `sessions/${sessionId}/signaling/answer`), async (snapshot) => {
    if (snapshot.exists() && !pc.remoteDescription) {
      await pc.setRemoteDescription(new RTCSessionDescription(snapshot.val()));
    }
  });

  onChildAdded(ref(rtdb, `sessions/${sessionId}/signaling/calleeCandidates`), (snapshot) => {
    if (snapshot.exists()) {
      pc.addIceCandidate(new RTCIceCandidate(snapshot.val()));
    }
  });

  return handler;
}

// ─── ANSWER CALL (Callee) ───
export async function answerCall(
  sessionId: string, 
  onEmojiReceived: (emoji: string) => void,
  onConnected: () => void
): Promise<WebRTCHandler> {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) throw new Error('Unauthorized');

  const iceServers = await getProductionIceServers();
  const handler = createPeerConnection(sessionId, false, iceServers, onEmojiReceived, onConnected);
  const { pc } = handler;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
    handler.localStream.addTrack(track);
  });

  onValue(ref(rtdb, `sessions/${sessionId}/signaling/offer`), async (snapshot) => {
    if (snapshot.exists() && !pc.remoteDescription) {
      await pc.setRemoteDescription(new RTCSessionDescription(snapshot.val()));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await set(ref(rtdb, `sessions/${sessionId}/signaling/answer`), { type: answer.type, sdp: answer.sdp });
    }
  }, { onlyOnce: true });

  onChildAdded(ref(rtdb, `sessions/${sessionId}/signaling/callerCandidates`), (snapshot) => {
    if (snapshot.exists()) {
      pc.addIceCandidate(new RTCIceCandidate(snapshot.val()));
    }
  });

  return handler;
}

export async function upgradeToVideo(sessionId: string, handler: WebRTCHandler, isCaller: boolean): Promise<void> {
  const { pc, localStream } = handler;
  const videoStream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS });
  const videoTrack = videoStream.getVideoTracks()[0];
  
  pc.addTrack(videoTrack, videoStream);
  localStream.addTrack(videoTrack);

  if (isCaller) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await set(ref(rtdb, `sessions/${sessionId}/signaling/upgradeOffer`), { type: offer.type, sdp: offer.sdp });

    onValue(ref(rtdb, `sessions/${sessionId}/signaling/upgradeAnswer`), async (snapshot) => {
      if (snapshot.exists() && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(snapshot.val()));
      }
    }, { onlyOnce: true });
  }
}

export function setupUpgradeListener(sessionId: string, handler: WebRTCHandler, isCaller: boolean) {
  if (!isCaller) {
    onValue(ref(rtdb, `sessions/${sessionId}/signaling/upgradeOffer`), async (snapshot) => {
      if (snapshot.exists() && handler.pc.signalingState === 'stable') {
        const offer = snapshot.val();
        await handler.pc.setRemoteDescription(new RTCSessionDescription(offer));

        if (handler.localStream.getVideoTracks().length === 0) {
           const videoStream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS });
           const videoTrack = videoStream.getVideoTracks()[0];
           handler.pc.addTrack(videoTrack, videoStream);
           handler.localStream.addTrack(videoTrack);
        }

        const answer = await handler.pc.createAnswer();
        await handler.pc.setLocalDescription(answer);
        await set(ref(rtdb, `sessions/${sessionId}/signaling/upgradeAnswer`), { type: answer.type, sdp: answer.sdp });
      }
    });
  }
}

export async function endCall(sessionId: string, handler: WebRTCHandler | null) {
  if (handler) {
    handler.localStream.getTracks().forEach((t) => t.stop());
    handler.pc.close();
  }
  off(ref(rtdb, `sessions/${sessionId}/signaling`));
  try {
    await remove(ref(rtdb, `sessions/${sessionId}`));
  } catch (err) {
    console.error('Error cleaning up signaling data:', err);
  }
}
