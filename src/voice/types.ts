import type { Lang, Role, View } from '../voiceTypes'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'executing' | 'speaking' | 'error'
export type VoiceIntent = 'NAVIGATE' | 'GET_BATCHES' | 'GET_BATCH_DETAILS' | 'CREATE_BATCH' | 'FIND_BUYERS' | 'FIND_COMPATIBLE_BATCHES' | 'RUN_ROUTING' | 'GET_ECONOMIC_VALUE' | 'GET_TRANSACTION_STATUS' | 'GET_GOVERNMENT_METRICS' | 'GET_TIME' | 'GET_DATE' | 'GENERAL_QUERY' | 'HELP' | 'STOP' | 'CANCEL' | 'CONFIRM' | 'UNKNOWN'

export type VoiceCommand = {
  intent: VoiceIntent
  rawText: string
  batchId?: string
  view?: View
  litres?: number
}

export type ConversationContext = {
  lastIntent?: VoiceIntent
  lastBatchId?: string
  lastView?: View
  awaitingConfirmation?: { intent: VoiceIntent; litres?: number }
}

export type VoiceAction = {
  view?: View
  role?: Role
  batchId?: string
  openBatchForm?: boolean
  response: string
  shouldSpeak?: boolean
}
export type VoiceActionResult = VoiceAction | Promise<VoiceAction>

export type VoiceDictionary = {
  listening: string
  understanding: string
  executing: string
  responding: string
  idle: string
  unsupported: string
  denied: string
  noSpeech: string
  microphoneError: string
  networkError: string
  recognitionError: string
  notUnderstood: string
  whatCanISay: string
  confirmCreate: (litres: number) => string
  cancelled: string
  confirmed: string
}
