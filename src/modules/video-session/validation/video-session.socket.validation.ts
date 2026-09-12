import { z } from "zod";

export const videoSessionIdSocketSchema = z.string().min(1);

export const videoSdpOfferSchema = z.object({
  type: z.literal("offer"),
  sdp: z.string().min(1),
});

export const videoSdpAnswerSchema = z.object({
  type: z.literal("answer"),
  sdp: z.string().min(1),
});

export const videoIceCandidateSchema = z.object({
  candidate: z.string(),
  sdpMid: z.string().nullish(),
  sdpMLineIndex: z.number().int().nullish(),
  usernameFragment: z.string().nullish(),
}).passthrough();