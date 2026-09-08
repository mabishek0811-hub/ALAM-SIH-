import type { VoiceCommand, VoiceIntent } from './types'
import type { Lang, View } from '../voiceTypes'

const normalize = (text: string) => text.toLowerCase().replace(/[?.,!]/g, ' ').replace(/\s+/g, ' ').trim()
const has = (text: string, words: string[]) => words.some((word) => text.includes(word))

export function parseVoiceIntent(input: string, lang: Lang): VoiceCommand {
  const rawText = input.trim()
  const text = normalize(rawText)
  const batchMatch = text.match(/bt[- ]?(\d{3,5})/i)
  const litresMatch = text.match(/(\d[\d,]*)\s*(?:litres|liters|l|லிட்டர்)/i)
  const batchId = batchMatch ? `BT-${batchMatch[1]}` : undefined
  const litres = litresMatch ? Number(litresMatch[1].replace(/,/g, '')) : undefined
  const multilingual = lang === 'ta' || /ennaoda|enoda|indha|kattu|find pannu|open pannu|route edhu|buyers|batch/i.test(text)
  let intent: VoiceIntent = 'UNKNOWN'
  let view: View | undefined

  if (has(text, ['cancel', 'வேண்டாம்', 'ரத்து'])) intent = 'CANCEL'
  else if (has(text, ['yes', 'save it', 'confirm', 'சரி', 'ஆம்', 'சேமி'])) intent = 'CONFIRM'
  else if (has(text, ['stop speaking', 'stop', 'நிறுத்து'])) intent = 'STOP'
  else if (has(text, ['what can i say', 'help', 'உதவி', 'என்ன சொல்லலாம்'])) intent = 'HELP'
  else if (has(text, ['government dashboard', 'government metrics', 'அரசு dashboard', 'அரசு டாஷ்போர்டு'])) { intent = 'GET_GOVERNMENT_METRICS'; view = 'overview' }
  else if (has(text, ['what time', 'time now', 'time is it', 'time enna', 'mani enna', 'ipo mani', 'நேரம் என்ன', 'மணி என்ன', 'இப்போது மணி'])) intent = 'GET_TIME'
  else if (has(text, ['what date', 'today date', 'date today', 'date enna', 'இன்று என்ன தேதி', 'தேதி என்ன'])) intent = 'GET_DATE'
  else if (has(text, ['create', 'new batch', 'add batch', 'புதிய batch', 'தொகுதி சேர்க்க'])) intent = 'CREATE_BATCH'
  else if (has(text, ['buyer', 'buyers', 'buyers find', 'buyers காட்டு', 'buyer யார்'])) { intent = 'FIND_BUYERS'; view = 'network' }
  else if (has(text, ['compatible batches', 'compatible batch', 'பொருத்தமான', 'பொருத்தம்'])) { intent = 'FIND_COMPATIBLE_BATCHES'; view = 'aggregation' }
  else if (has(text, ['best route', 'highest value route', 'route edhu', 'வழி', 'வழித்தட'])) { intent = 'RUN_ROUTING'; view = 'routing' }
  else if (has(text, ['estimated additional value', 'highest value', 'how much value', 'value எவ்வளவு'])) intent = 'GET_ECONOMIC_VALUE'
  else if (has(text, ['transaction', 'offer', 'pending offers', 'பரிவர்த்தனை'])) { intent = 'GET_TRANSACTION_STATUS'; view = 'network' }
  else if (has(text, ['dashboard', 'home', 'overview', 'முகப்பு'])) { intent = 'NAVIGATE'; view = 'overview' }
  else if (has(text, ['hello', 'hi', 'hey', 'vanakkam', 'வணக்கம்', 'how are you', 'eppadi irukka', 'what is', 'who is', 'why', 'how', 'when', 'where', 'what do you do', 'what are you', 'who are you', 'what can you do', 'prime minister', 'pm of india', 'capital of india', 'president of india', 'weather', 'செய்தி', 'பிரதமர்', 'இந்தியாவின் பிரதமர்', 'முதலமைச்சர்', 'சீப் மினிஸ்டர்', 'யாரு', 'யார்', 'தமிழ்நாடு', 'தமிழ்நாடோட', 'என்ன', 'ஏன்', 'எப்படி', 'எப்போது', 'எங்கே', 'நீங்கள்', 'தயவுசெய்து', 'செய்ய முடியுமா'])) intent = 'GENERAL_QUERY'
  else if (has(text, ['bittern', 'batch', 'batches', 'என்னோட', 'எவ்வளவு'])) { intent = 'GET_BATCHES'; view = 'batches' }

  if (multilingual && intent === 'UNKNOWN') {
    if (has(text, ['batch', 'batches', 'bittern'])) { intent = 'GET_BATCHES'; view = 'batches' }
    else if (has(text, ['what', 'how', 'who', 'why', 'என்ன', 'எப்படி', 'யார்', 'ஏன்'])) { intent = 'GENERAL_QUERY' }
  }
  return { intent, rawText, batchId, litres, view }
}
