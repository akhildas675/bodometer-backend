import { Socket } from "socket.io";

import container from "@/container/container";
import { SocketUser } from "@/infrastructure/socket/socket.types";

import { IVideoSessionService } from "../interface/video.session-service.interface";
import { VIDEO_SESSION_TYPES } from "../video-session.types";
import {
  VideoIceCandidate,
  VideoSdpAnswer,
  VideoSdpOffer,
} from "./video-session.socket.types";
import {
  videoIceCandidateSchema,
  videoSdpAnswerSchema,
  videoSdpOfferSchema,
  videoSessionIdSocketSchema,
} from "../validation/video-session.socket.validation";

export const registerVideoSessionSocketHandlers = (socket: Socket): void => {
  const user = socket.data.user as SocketUser | undefined;

  if (!user) {
    return;
  }

  const { userId } = user;

  const videoSessionService = container.get<IVideoSessionService>(
    VIDEO_SESSION_TYPES.VideoSessionService,
  );

  let activeVideoSessionId: string | undefined;

  socket.on(
    "video:join-session",
    async (videoSessionId: string): Promise<void> => {
      try {
        const parsedSessionId =
          videoSessionIdSocketSchema.safeParse(videoSessionId);

        if (!parsedSessionId.success) {
          socket.emit("video:error", {
            event: "video:join-session",
            message: "Invalid video session ID.",
          });

          return;
        }

        const validVideoSessionId = parsedSessionId.data;

        const session = await videoSessionService.getVideoSessionById(
          validVideoSessionId,
          userId,
        );

        const updatedSession =
          await videoSessionService.markParticipantJoined(
            validVideoSessionId,
            userId,
          );

        const room = `video:session:${validVideoSessionId}`;

        await socket.join(room);

        activeVideoSessionId = validVideoSessionId;

        console.log(
          `User ${userId} joined video session room: ${room}`,
        );

        socket.to(room).emit("video:participant-joined", {
          participantId: userId,
          session: updatedSession,
        });
      } catch (error) {
        console.error(
          `Failed to join video session ${videoSessionId}:`,
          error,
        );

        socket.emit("video:error", {
          event: "video:join-session",
          message: "Unable to join video session.",
        });
      }
    },
  );

  socket.on(
    "video:leave-session",
    async (videoSessionId: string): Promise<void> => {
      try {
        const parsedSessionId =
          videoSessionIdSocketSchema.safeParse(videoSessionId);

        if (!parsedSessionId.success) {
          socket.emit("video:error", {
            event: "video:leave-session",
            message: "Invalid video session ID.",
          });

          return;
        }

        const validVideoSessionId = parsedSessionId.data;

        const session = await videoSessionService.getVideoSessionById(
          validVideoSessionId,
          userId,
        );

        const updatedSession =
          await videoSessionService.markParticipantLeft(
            validVideoSessionId,
            userId,
          );

        const room = `video:session:${validVideoSessionId}`;

        await socket.leave(room);

        if (activeVideoSessionId === validVideoSessionId) {
          activeVideoSessionId = undefined;
        }

        console.log(
          `User ${userId} left video session room: ${room}`,
        );

        socket.to(room).emit("video:participant-left", {
          participantId: userId,
          session: updatedSession,
        });
      } catch (error) {
        console.error(
          `Failed to leave video session ${videoSessionId}:`,
          error,
        );

        socket.emit("video:error", {
          event: "video:leave-session",
          message: "Unable to leave video session.",
        });
      }
    },
  );

  socket.on(
    "video:offer",
    async (
      videoSessionId: string,
      offer: VideoSdpOffer,
    ): Promise<void> => {
      try {
        const parsedSessionId =
          videoSessionIdSocketSchema.safeParse(videoSessionId);

        if (!parsedSessionId.success) {
          socket.emit("video:error", {
            event: "video:offer",
            message: "Invalid video session ID.",
          });

          return;
        }

        const parsedOffer = videoSdpOfferSchema.safeParse(offer);

        if (!parsedOffer.success) {
          socket.emit("video:error", {
            event: "video:offer",
            message: "Invalid video offer.",
          });

          return;
        }

        const validVideoSessionId = parsedSessionId.data;

        await videoSessionService.getVideoSessionById(
          validVideoSessionId,
          userId,
        );

        if (activeVideoSessionId !== validVideoSessionId) {
          socket.emit("video:error", {
            event: "video:offer",
            message: "Socket is not connected to this video session.",
          });

          return;
        }

        const room = `video:session:${validVideoSessionId}`;

        socket.to(room).emit("video:offer", {
          participantId: userId,
          offer: parsedOffer.data,
        });
      } catch (error) {
        console.error(
          `Failed to forward video offer for session ${videoSessionId}:`,
          error,
        );

        socket.emit("video:error", {
          event: "video:offer",
          message: "Unable to send video offer.",
        });
      }
    },
  );

  socket.on(
    "video:answer",
    async (
      videoSessionId: string,
      answer: VideoSdpAnswer,
    ): Promise<void> => {
      try {
        const parsedSessionId =
          videoSessionIdSocketSchema.safeParse(videoSessionId);

        if (!parsedSessionId.success) {
          socket.emit("video:error", {
            event: "video:answer",
            message: "Invalid video session ID.",
          });

          return;
        }

        const parsedAnswer = videoSdpAnswerSchema.safeParse(answer);

        if (!parsedAnswer.success) {
          socket.emit("video:error", {
            event: "video:answer",
            message: "Invalid video answer.",
          });

          return;
        }

        const validVideoSessionId = parsedSessionId.data;

        await videoSessionService.getVideoSessionById(
          validVideoSessionId,
          userId,
        );

        if (activeVideoSessionId !== validVideoSessionId) {
          socket.emit("video:error", {
            event: "video:answer",
            message: "Socket is not connected to this video session.",
          });

          return;
        }

        const room = `video:session:${validVideoSessionId}`;

        socket.to(room).emit("video:answer", {
          participantId: userId,
          answer: parsedAnswer.data,
        });
      } catch (error) {
        console.error(
          `Failed to forward video answer for session ${videoSessionId}:`,
          error,
        );

        socket.emit("video:error", {
          event: "video:answer",
          message: "Unable to send video answer.",
        });
      }
    },
  );

  socket.on(
    "video:ice-candidate",
    async (
      videoSessionId: string,
      candidate: VideoIceCandidate,
    ): Promise<void> => {
      try {
        const parsedSessionId =
          videoSessionIdSocketSchema.safeParse(videoSessionId);

        if (!parsedSessionId.success) {
          socket.emit("video:error", {
            event: "video:ice-candidate",
            message: "Invalid video session ID.",
          });

          return;
        }

        const parsedCandidate =
          videoIceCandidateSchema.safeParse(candidate);

        if (!parsedCandidate.success) {
          socket.emit("video:error", {
            event: "video:ice-candidate",
            message: "Invalid ICE candidate.",
          });

          return;
        }

        const validVideoSessionId = parsedSessionId.data;

        await videoSessionService.getVideoSessionById(
          validVideoSessionId,
          userId,
        );

        if (activeVideoSessionId !== validVideoSessionId) {
          socket.emit("video:error", {
            event: "video:ice-candidate",
            message: "Socket is not connected to this video session.",
          });

          return;
        }

        const room = `video:session:${validVideoSessionId}`;

        socket.to(room).emit("video:ice-candidate", {
          participantId: userId,
          candidate: parsedCandidate.data,
        });
      } catch (error) {
        console.error(
          `Failed to forward ICE candidate for session ${videoSessionId}:`,
          error,
        );

        socket.emit("video:error", {
          event: "video:ice-candidate",
          message: "Unable to send ICE candidate.",
        });
      }
    },
  );

  socket.on("disconnect", (reason: string): void => {
    if (activeVideoSessionId) {
      console.log(
        `User ${userId} disconnected from video session ${activeVideoSessionId} | Socket: ${socket.id} | Reason: ${reason}`,
      );

      return;
    }

    console.log(
      `User ${userId} disconnected from socket: ${socket.id} | Reason: ${reason}`,
    );
  });
};