import { useEffect, useRef, useState } from 'react'
import { Check, HelpCircle, Mic, Pause, Play, Square, X } from 'lucide-react'
import type { Lang } from '../voiceTypes'
import type { VoiceActionResult, VoiceCommand, VoiceState } from './types'
import { SpeechRecognitionService } from './SpeechRecognitionService'
import { TextToSpeechService } from './TextToSpeechService'
import { ConversationContext } from './ConversationContext'
import { parseVoiceIntent } from './VoiceIntentParser'
import { voiceCopy } from './VoiceResponseGenerator'

export type VoiceAssistantProps = {
  lang: Lang
  onClose: () => void
  onExecute: (command: VoiceCommand) => VoiceActionResult
}

export function VoiceAssistant({ lang, onClose, onExecute }: VoiceAssistantProps) {
  const recognition = useRef(new SpeechRecognitionService()).current
  const speech = useRef(new TextToSpeechService()).current
  const conversation = useRef(new ConversationContext()).current
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [permissionMessage, setPermissionMessage] = useState('')
  const [conversationLanguage, setConversationLanguage] = useState<Lang>(lang)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const recognitionFailed = useRef(false)
  const finalResultHandled = useRef(false)
  const liveConversation = useRef(true)
  const startListeningRef = useRef<() => void>(() => undefined)
  const copy = voiceCopy[lang]

  useEffect(() => () => { recognition.abort(); speech.stop() }, [recognition, speech])

  const speakResponse = (text: string) => {
    setResponse(text)
    if (text) setMessages((current) => [...current, { role: 'assistant', text }])
    if (!text) { setState('idle'); return }
    speech.speak(text, conversationLanguage, () => setState('speaking'), () => {
      setState('idle')
      if (liveConversation.current) window.setTimeout(() => startListeningRef.current(), 250)
    })
  }

  const executeTranscript = async (spokenText: string) => {
    if (!spokenText.trim()) { setState('error'); setPermissionMessage(copy.noSpeech); return }
    setState('processing')
    const detectedLanguage: Lang = /[\u0B80-\u0BFF]/.test(spokenText) || /\b(ena|enna|epdi|eppadi|ipo|irukku|kattu|venum|yaar|pannu|pannunga|bro)\b/i.test(spokenText) ? 'ta' : conversationLanguage
    setConversationLanguage(detectedLanguage)
    const command = parseVoiceIntent(spokenText, detectedLanguage)
    setTranscript(spokenText)
    setMessages((current) => [...current, { role: 'user', text: spokenText }])
    if (command.intent === 'STOP') { liveConversation.current = false; speech.stop(); recognition.stop(); setState('idle'); return }
    if (command.intent === 'HELP') { speakResponse(copy.whatCanISay); return }
    if (command.intent === 'CANCEL') { conversation.takeConfirmation(); speakResponse(copy.cancelled); return }
    if (command.intent === 'CONFIRM') {
      const pending = conversation.takeConfirmation()
      if (pending) { setState('executing'); const action = await onExecute({ intent: pending.intent, rawText: spokenText, litres: pending.litres }); speakResponse(action.response); return }
    }
    if (command.intent === 'CREATE_BATCH' && command.litres) {
      conversation.setConfirmation({ intent: command.intent, litres: command.litres })
      speakResponse(copy.confirmCreate(command.litres))
      return
    }
    conversation.remember(command)
    setState('executing')
    const action = await onExecute(command)
    if (action.openBatchForm) { setState('idle'); onClose(); return }
    speakResponse(action.response)
  }

  const startListening = () => {
    liveConversation.current = true
    setPermissionMessage('')
    setTranscript('')
    setResponse('')
    if (!recognition.isSupported()) { setState('error'); setPermissionMessage(copy.unsupported); return }
    recognitionFailed.current = false
    finalResultHandled.current = false
    setState('listening')
    recognition.start(conversationLanguage, (event) => {
      if (event.status === 'listening') setState('listening')
      if (event.status === 'result' && event.transcript) {
        setTranscript(event.transcript)
        if (event.final && !finalResultHandled.current) {
          finalResultHandled.current = true
          recognition.stop()
          void executeTranscript(event.transcript)
        }
      }
      if (event.status === 'ended') {
        if (finalResultHandled.current) return
        const finalTranscript = (recognition.getLatestFinalTranscript() || (event.cancelled ? event.transcript : '') || '').trim()
        if (recognitionFailed.current) return
        if (finalTranscript) {
          void executeTranscript(finalTranscript)
          return
        }
        if (event.cancelled) {
          setState('idle')
          return
        }
        if (!finalTranscript) {
          if (liveConversation.current) {
            setState('listening')
            window.setTimeout(() => startListeningRef.current(), 150)
          } else {
            setState('error')
            setPermissionMessage(copy.noSpeech)
          }
        }
      }
      if (event.status === 'error') {
        if (event.cancelled || event.error === 'aborted') {
          setState('idle')
          setPermissionMessage('')
          return
        }
        if (event.error === 'no-speech' && liveConversation.current) {
          setState('listening')
          window.setTimeout(() => startListeningRef.current(), 150)
          return
        }
        recognitionFailed.current = true
        setState('error')
        setPermissionMessage(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? `${copy.denied} Chrome: click the lock icon beside the address bar, allow Microphone, then reload.` : event.error === 'no-speech' ? copy.noSpeech : event.error === 'audio-capture' ? copy.microphoneError : event.error === 'network' ? copy.networkError : copy.recognitionError)
      }
    })
  }
  startListeningRef.current = startListening

  const stateLabel = state === 'listening' ? copy.listening : state === 'processing' ? copy.understanding : state === 'executing' ? copy.executing : state === 'speaking' ? copy.responding : state === 'error' ? 'Voice control' : copy.idle
  const ui = lang === 'ta' ? { said: 'நீங்கள் சொன்னது', stop: 'கேட்பதை நிறுத்து', speak: 'பேச தொடவும்', retry: 'மீண்டும் முயற்சி', what: 'என்ன சொல்லலாம்?', nav: 'வழிசெலுத்தல்', bittern: 'பிடர்ன்', routing: 'வழித்தடம்', buyers: 'வாங்குபவர்கள்', confirm: 'உறுதிப்படுத்தல்', foot: 'குரல் அடையாளம் உலாவியைப் பயன்படுத்துகிறது; மைக்ரோஃபோன் அனுமதி தேவைப்படலாம்.' } : { said: 'You said', stop: 'Stop listening', speak: 'Tap to speak', retry: 'Try again', what: 'What can I say?', nav: 'NAVIGATION', bittern: 'BITTERN', routing: 'ROUTING', buyers: 'BUYERS', confirm: 'CONFIRMATION', foot: 'Speech recognition uses your browser and may require microphone permission.' }
  const stopListening = () => { liveConversation.current = false; recognition.stop(); speech.stop(); setState('idle'); setPermissionMessage('') }
  return <div className="modal-backdrop voice-backdrop"><div className="voice-assistant"><button className="icon-button close-voice" onClick={() => { liveConversation.current = false; recognition.abort(); speech.stop(); onClose() }} aria-label="Close voice assistant"><X size={19} /></button><div className={`assistant-orb ${state}`}><Mic size={34} /></div><div className="eyebrow">{conversationLanguage === 'ta' ? 'அளம் குரல்' : 'ALAM VOICE'}</div><h2>{stateLabel}</h2><div className="voice-language-toggle"><button className={conversationLanguage === 'en' ? 'selected' : ''} onClick={() => setConversationLanguage('en')}>English</button><button className={conversationLanguage === 'ta' ? 'selected' : ''} onClick={() => setConversationLanguage('ta')}>தமிழ்</button></div>{messages.length > 0 && <div className="voice-chat-history">{messages.slice(-6).map((message, index) => <div className={`voice-chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'user' ? ui.said : 'ALAM'}</span><p>{message.text}</p></div>)}</div>}{permissionMessage && <p className="voice-error">{permissionMessage}</p>}<div className="voice-main-actions">{state === 'listening' ? <button className="stop-listening" onClick={stopListening}><Square size={16} />{ui.stop}</button> : <button className="start-listening" onClick={startListening}><Mic size={17} />{state === 'idle' ? ui.speak : ui.retry}</button>}{state === 'speaking' && <div className="speech-controls"><button onClick={() => speech.pause()} aria-label="Pause speaking"><Pause size={15} /></button><button onClick={() => speech.resume()} aria-label="Resume speaking"><Play size={15} /></button><button onClick={() => { liveConversation.current = false; speech.stop(); setState('idle') }} aria-label="Stop speaking"><Square size={15} /></button></div>}</div><button className="what-can-i-say" onClick={() => setShowExamples(!showExamples)}><HelpCircle size={15} />{ui.what}</button>{showExamples && <div className="voice-examples"><span>{ui.nav}</span><p>“Open my dashboard.”</p><span>{ui.bittern}</span><p>“என்னோட batches காட்டு.”</p><span>{ui.routing}</span><p>“Show me the best route.”</p><span>{ui.buyers}</span><p>“இந்த batch-க்கு buyer காட்டு.”</p><span>{ui.confirm}</span><p>“Create a batch with 5,000 litres.”</p></div>}<small className="voice-footnote">{ui.foot}</small></div></div>
}
