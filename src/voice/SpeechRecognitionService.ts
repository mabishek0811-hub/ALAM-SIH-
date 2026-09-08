export type RecognitionStatus = 'listening' | 'result' | 'ended' | 'error'
export type RecognitionEvent = { status: RecognitionStatus; transcript?: string; error?: string; cancelled?: boolean; final?: boolean }

type BrowserRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}

type RecognitionConstructor = new () => BrowserRecognition

export class SpeechRecognitionService {
  private recognition: BrowserRecognition | null = null
  private supported = false
  private latestTranscript = ''
  private latestFinalTranscript = ''
  private listening = false
  private stopRequested = false

  constructor() {
    if (typeof window === 'undefined') return
    const browserWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition
    if (Recognition) {
      this.recognition = new Recognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.supported = true
    }
  }

  isSupported() { return this.supported }
  getLatestTranscript() { return this.latestTranscript }
  getLatestFinalTranscript() { return this.latestFinalTranscript }

  start(lang: 'en' | 'ta', onEvent: (event: RecognitionEvent) => void) {
    if (!this.recognition) { onEvent({ status: 'error', error: 'unsupported' }); return }
    if (this.listening) return
    this.latestTranscript = ''
    this.latestFinalTranscript = ''
    this.stopRequested = false
    this.listening = true
    this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN'
    this.recognition.onresult = (event) => {
      const results = Array.from(event.results)
      const transcript = results.map((result) => result[0].transcript).join(' ').trim()
      const finalTranscript = results.filter((result) => result.isFinal).map((result) => result[0].transcript).join(' ').trim()
      this.latestTranscript = transcript
      if (finalTranscript) this.latestFinalTranscript = finalTranscript
      onEvent({ status: 'result', transcript, final: Boolean(finalTranscript) })
    }
    this.recognition.onend = () => {
      this.listening = false
      onEvent({ status: 'ended', transcript: this.latestTranscript, cancelled: this.stopRequested })
    }
    this.recognition.onerror = (event) => {
      this.listening = false
      onEvent({ status: 'error', error: event.error, cancelled: this.stopRequested || event.error === 'aborted' })
    }
    try { this.recognition.start(); onEvent({ status: 'listening' }) } catch {
      this.listening = false
      onEvent({ status: 'error', error: 'start-failed' })
    }
  }

  stop() {
    if (!this.recognition || !this.listening) return
    this.stopRequested = true
    this.recognition.stop()
  }

  abort() {
    if (!this.recognition) return
    this.stopRequested = true
    this.listening = false
    this.recognition.onresult = null
    this.recognition.onend = null
    this.recognition.onerror = null
    this.recognition.abort()
  }
}