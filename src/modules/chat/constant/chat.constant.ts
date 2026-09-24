export const CHAT_TYPE={
  TEXT:"TEXT",
  IMAGE:"IMAGE",
  DOCUMENT:"DOCUMENT"
} as const

export type ChatType = typeof CHAT_TYPE[keyof typeof CHAT_TYPE]