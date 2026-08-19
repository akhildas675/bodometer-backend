import { Socket, SocketData } from "socket.io";

import { Role } from "@/constants/constant.values.ts/roles";

export interface SocketUser {
  userId: string;
  role: Role;
}

declare module "socket.io" {
  interface SocketData {
    user?: SocketUser;
  }
}

export interface AuthenticatedSocket extends Socket {
  data: SocketData;
}