import type { Role, View } from '../voiceTypes'
import type { VoiceAction, VoiceCommand } from './types'
import type { Batch } from '../dataTypes'
import { responseFor } from './VoiceResponseGenerator'
import { answerGeneralQuestion } from './KnowledgeAnswerService'

export type VoiceRouterOptions = {
  role: Role
  lang: 'en' | 'ta'
  batches: Batch[]
  lastBatchId?: string
}

export async function routeVoiceCommand(command: VoiceCommand, options: VoiceRouterOptions): Promise<VoiceAction> {
  const batchId = command.batchId ?? options.lastBatchId ?? options.batches[0]?.id
  const batch = options.batches.find((item) => item.id === batchId)
  const count = options.batches.filter((item) => item.status === 'Listed' || item.status === 'Matched').length
  const requestLang = /[\u0B80-\u0BFF]/.test(command.rawText) || /\b(ena|enna|epdi|eppadi|ipo|irukku|kattu|venum|yaar|pannu|pannunga|bro)\b/i.test(command.rawText) ? 'ta' : options.lang
  const response = responseFor(command.intent, requestLang, { count, batchId, value: '₹1.18L', rawText: command.rawText })

  if (command.intent === 'GET_GOVERNMENT_METRICS') {
    if (options.role !== 'government') return { response: options.lang === 'ta' ? 'இந்த பகுதி அரசு பயனர்களுக்கு மட்டும்.' : 'The government dashboard is restricted to government users.' }
    return { role: 'government', view: 'overview', response: response ?? '' }
  }
  if (command.intent === 'CREATE_BATCH') return { openBatchForm: true, response: '', shouldSpeak: false }
  if (command.intent === 'GET_BATCH_DETAILS' || command.intent === 'RUN_ROUTING') return { view: 'routing', batchId: batch?.id, response: response ?? '' }
  if (command.intent === 'FIND_BUYERS') return { view: 'network', batchId: batch?.id, response: response ?? '' }
  if (command.intent === 'FIND_COMPATIBLE_BATCHES') return { view: 'aggregation', response: response ?? '' }
  if (command.intent === 'GET_BATCHES') return { view: 'batches', response: response ?? '' }
  if (command.intent === 'GET_ECONOMIC_VALUE') return { view: 'impact', response: response ?? '' }
  if (command.intent === 'GET_TRANSACTION_STATUS') return { view: 'network', response: options.lang === 'ta' ? 'உங்கள் சலுகைகள் மற்றும் பரிவர்த்தனை நிலையை காட்டுகிறேன்.' : 'Opening your offers and transaction status.' }
  if (command.intent === 'GENERAL_QUERY' || command.intent === 'UNKNOWN') {
    const localResponse = response ?? ''
    if (localResponse) return { view: 'overview', response: localResponse }
    const onlineResponse = await answerGeneralQuestion(command.rawText, requestLang)
    return { view: 'overview', response: onlineResponse ?? (localResponse || (requestLang === 'ta' ? 'மன்னிக்கவும், இதற்கான பதிலை இப்போது கண்டுபிடிக்க முடியவில்லை. வேறு விதமாக கேளுங்கள்.' : 'I could not find a reliable answer right now. Please try asking it another way.')) }
  }
  if (command.intent === 'NAVIGATE') return { view: command.view ?? 'overview', response: response ?? '' }
  return { response: response ?? '' }
}
