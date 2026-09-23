export const CHAT_TYPES={
  TEXT:"TEXT",
  IMAGE:"IMAGE",
  DOCUMENT:"DOCUMENT"
} as const

export type ChatTypes = typeof CHAT_TYPES[keyof typeof CHAT_TYPES]