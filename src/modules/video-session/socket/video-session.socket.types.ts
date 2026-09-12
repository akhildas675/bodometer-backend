export interface VideoSdpOffer {
  type: "offer";
  sdp: string;
}

export interface VideoSdpAnswer {
  type: "answer";
  sdp: string;
}

export interface VideoIceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}