import type { Lang } from '../voiceTypes'
import type { VoiceDictionary } from './types'

export const voiceCopy: Record<Lang, VoiceDictionary> = {
  en: {
    listening: 'Listening…', understanding: 'Understanding…', executing: 'Working on that…', responding: 'ALAM is responding…', idle: 'Tap to speak', unsupported: "Voice control isn't supported on this browser. You can continue using ALAM normally.", denied: 'Microphone permission was denied. Allow microphone access for this site, then try again.', noSpeech: "I didn't hear anything. Please try again.", microphoneError: 'Your microphone could not be opened. Check that it is connected and not being used by another app.', networkError: 'The browser voice service could not connect. Check your internet connection and try again.', recognitionError: 'Voice recognition could not start. Check browser microphone permissions and try again.', notUnderstood: "Sorry, I didn't catch that. Try saying, show my active batches.", whatCanISay: 'Try saying: show my active batches, find buyers for this batch, or show the best route.', confirmCreate: (litres) => `I've prepared a new batch with ${litres.toLocaleString()} litres. Would you like me to save it?`, cancelled: 'Okay, I cancelled that.', confirmed: 'Done. The action is confirmed.',
  },
  ta: {
    listening: 'கேட்கிறேன்…', understanding: 'புரிந்துகொள்கிறேன்…', executing: 'அதைச் செய்கிறேன்…', responding: 'அளம் பதிலளிக்கிறது…', idle: 'பேச தொடவும்', unsupported: 'இந்த உலாவியில் குரல் கட்டுப்பாடு கிடைக்கவில்லை. அளத்தை வழக்கம்போல் பயன்படுத்தலாம்.', denied: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. இந்த தளத்திற்கான மைக்ரோஃபோன் அனுமதியை வழங்கி மீண்டும் முயற்சிக்கவும்.', noSpeech: 'எதுவும் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.', microphoneError: 'மைக்ரோஃபோனை திறக்க முடியவில்லை. அது இணைக்கப்பட்டுள்ளதா மற்றும் வேறு செயலியில் பயன்படுத்தப்படவில்லையா என்பதை சரிபார்க்கவும்.', networkError: 'உலாவி குரல் சேவையுடன் இணைக்க முடியவில்லை. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', recognitionError: 'குரல் அடையாளத்தை தொடங்க முடியவில்லை. உலாவி மைக்ரோஃபோன் அனுமதியை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', notUnderstood: 'மன்னிக்கவும், புரியவில்லை. “என் active batches காட்டு” என்று சொல்லிப் பாருங்கள்.', whatCanISay: '“என்னோட batches காட்டு”, “இந்த batch-க்கு buyers காட்டு”, அல்லது “best route காட்டு” என்று சொல்லலாம்.', confirmCreate: (litres) => `${litres.toLocaleString()} லிட்டர் புதிய தொகுதி தயார். இதை சேமிக்கலாமா?`, cancelled: 'சரி, அதை ரத்து செய்துவிட்டேன்.', confirmed: 'சரி. செயல் உறுதிசெய்யப்பட்டது.',
  },
}

export function responseFor(intent: string, lang: Lang, details?: { count?: number; batchId?: string; value?: string; rawText?: string }) {
  const now = new Date()
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(now)
  const date = new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long' }).format(now)
  const tamilRequest = /enna|mani|ipo|vanakkam|eppadi|tamil|தமிழ்|மணி|நேரம்|வணக்கம்|எப்படி/i.test(details?.rawText ?? '')
  if (lang === 'ta') {
    if (intent === 'GET_TIME') return `இப்போது நேரம் ${time}.`
    if (intent === 'GET_DATE') return `இன்றைய தேதி ${date}.`
    if (intent === 'GET_BATCHES') return `உங்களிடம் ${details?.count ?? 3} செயலில் உள்ள பிடர்ன் தொகுதிகள் உள்ளன.`
    if (intent === 'RUN_ROUTING') return `${details?.batchId ?? 'இந்த தொகுதி'}க்கான சிறந்த வழியை காட்டுகிறேன். மெக்னீசியம் மீட்பு பரிந்துரைக்கப்படுகிறது.`
    if (intent === 'FIND_BUYERS') return `${details?.batchId ?? 'இந்த தொகுதிக்கு'} பொருத்தமான வாங்குபவர்களை காட்டுகிறேன்.`
    if (intent === 'FIND_COMPATIBLE_BATCHES') return 'பொருத்தமான தொகுதிகளை கண்டறிந்து காட்டுகிறேன்.'
    if (intent === 'GET_ECONOMIC_VALUE') return `மதிப்பிடப்பட்ட கூடுதல் மதிப்பு ${details?.value ?? '₹1.18L'}. இது விளக்க மதிப்பீடு.`
    if (intent === 'GET_GOVERNMENT_METRICS') return 'அரசு நுண்ணறிவு டாஷ்போர்டை திறக்கிறேன்.'
    if (intent === 'GENERAL_QUERY') return generalTamilResponse(details?.rawText)
    if (intent === 'NAVIGATE') return 'உங்கள் அளம் டாஷ்போர்டை திறக்கிறேன்.'
  }
  if (intent === 'GET_TIME') return tamilRequest ? `இப்போது நேரம் ${time}.` : `The current time in India is ${time}.`
  if (intent === 'GET_DATE') return tamilRequest ? `இன்றைய தேதி ${new Intl.DateTimeFormat('ta-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long' }).format(now)}.` : `Today is ${date}.`
  if (intent === 'GET_BATCHES') return `You have ${details?.count ?? 3} active bittern batches.`
  if (intent === 'RUN_ROUTING') return `Showing the best route for ${details?.batchId ?? 'this batch'}. Magnesium recovery is recommended.`
  if (intent === 'FIND_BUYERS') return `Showing compatible buyers for ${details?.batchId ?? 'this batch'}.`
  if (intent === 'FIND_COMPATIBLE_BATCHES') return 'I found compatible batches and opened the aggregation view.'
  if (intent === 'GET_ECONOMIC_VALUE') return `Your estimated additional value is ${details?.value ?? '₹1.18L'}. This is an illustrative estimate.`
  if (intent === 'GET_GOVERNMENT_METRICS') return 'Opening the government intelligence dashboard.'
  if (intent === 'GENERAL_QUERY') {
    const text = (details?.rawText ?? '').toLowerCase()
    if (/prime minister|pm of india|பிரதமர்|பிரதம மந்திரி/.test(text)) return 'The Prime Minister of India is Narendra Modi.'
    if (/capital of india|இந்தியாவின் தலைநகர்|தலைநகர் என்ன/.test(text)) return 'The capital of India is New Delhi.'
    if (/president of india|இந்தியாவின் குடியரசுத் தலைவர்/.test(text)) return 'The President of India is Droupadi Murmu.'
    if (/chief minister|cm of tamil nadu|முதலமைச்சர்|சீப் மினிஸ்டர்|தமிழ்நாடு.*(யாரு|யார்)|தமிழ்நாடோட/.test(text)) return 'The Chief Minister of Tamil Nadu is M. K. Stalin.'
    if (/^(hello|hi|hey|hello hello|hi hi|hey hey|vanakkam)\b/i.test(text)) return 'Hello! I am ALAM. How can I help you?'
    if (/how are you|how do you feel/i.test(text)) return 'I am doing well and ready to help. You can ask me about ALAM, your batches, routes, buyers, or general questions.'
    if (/who are you|what are you/i.test(text)) return 'I am ALAM, your resource intelligence voice assistant.'
    return tamilRequest ? generalTamilResponse(details?.rawText) : 'ALAM is a bittern resource intelligence assistant. I can help with general questions, batches, route recommendations, buyer matching, value insights, and government data.'
  }
  if (intent === 'NAVIGATE') return 'Opening your ALAM dashboard.'
  return undefined
}

function generalTamilResponse(rawText = '') {
  const text = rawText.toLowerCase()
  if (/prime minister|pm of india|பிரதமர்|பிரதம மந்திரி/.test(text)) return 'இந்தியாவின் பிரதமர் நரேந்திர மோடி.'
  if (/capital of india|இந்தியாவின் தலைநகர்|தலைநகர் என்ன/.test(text)) return 'இந்தியாவின் தலைநகர் புதுடெல்லி.'
  if (/president of india|இந்தியாவின் குடியரசுத் தலைவர்/.test(text)) return 'இந்தியாவின் குடியரசுத் தலைவர் திரௌபதி முர்மு.'
  if (/chief minister|cm of tamil nadu|முதலமைச்சர்|சீப் மினிஸ்டர்|தமிழ்நாடு.*(யாரு|யார்)|தமிழ்நாடோட/.test(text)) return 'தமிழ்நாட்டின் முதலமைச்சர் மு.க. ஸ்டாலின்.'
  if (/hello|hi|hey|vanakkam|வணக்கம்/.test(text)) return 'வணக்கம்! நான் அளம். உங்களுக்கு எப்படி உதவலாம்?'
  if (/how are you|eppadi irukka|எப்படி இருக்க/.test(text)) return 'நான் நன்றாக இருக்கிறேன். உங்கள் பிடர்ன் தொகுதிகள், வாங்குபவர்கள், வழித்தடம் மற்றும் பரிவர்த்தனைகளில் உதவலாம்.'
  if (/who are you|what are you|யார்|நீங்கள் என்ன/.test(text)) return 'நான் அளம், பிடர்ன் வளங்களை தொழில்துறை பயன்பாட்டுடன் இணைக்கும் குரல் உதவியாளர்.'
  return 'நான் அளம், பிடர்ன் வள மேலாண்மை உதவியாளர். தொகுதிகள், வழித்தடம், வாங்குபவர்கள், மதிப்பு மற்றும் அரசு தரவை நான் உதவலாம்.'
}
