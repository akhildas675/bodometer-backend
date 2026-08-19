import { Socket } from "socket.io";

import { AccessTokenPayload, RefreshTokenPayload } from "@/modules/auth/interface/auth.interface";
import { Jwt } from "@/utils/jwt.utils";
import { Role } from "@/constants/constant.values.ts/roles";
import { SocketUser } from "./socket.types";

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      const name = parts.shift()!.trim();
      const val = parts.join("=").trim();
      if (name && val) {
        list[name] = decodeURIComponent(val);
      }
    }
  });
  return list;
}

export const authenticateSocket = (
  socket: Socket,
  next: (err?: Error) => void,
): void => {
  try {
    let token: string | undefined;

    if (socket.handshake.headers.cookie) {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      token = cookies.accessToken || cookies.refreshToken;
    }

    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token as string;
    }

    if (!token) {
      return next(new Error("Authentication required"));
    }

    let userId: string;
    let role: Role;

    try {
      const payload: AccessTokenPayload = Jwt.verifyAccess(token);
      userId = payload.sub;
      role = payload.role;
    } catch {
      const payload: RefreshTokenPayload = Jwt.verifyRefresh(token);
      userId = payload.sub;
      role = payload.role;
    }

    (socket.data as { user: SocketUser }).user = {
      userId,
      role,
    };

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error);

    next(new Error("Invalid or expired authentication token"));
  }
};