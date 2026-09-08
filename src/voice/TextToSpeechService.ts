import type { Lang } from '../voiceTypes'

export class TextToSpeechService {
  isSupported() { return 'speechSynthesis' in window }

  speak(text: string, lang: Lang, onStart?: () => void, onEnd?: () => void) {
    if (!this.isSupported()) { onEnd?.(); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const containsTamil = /[\u0B80-\u0BFF]/.test(text)
    utterance.lang = lang === 'ta' || containsTamil ? 'ta-IN' : 'en-IN'
    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  }

  pause() { window.speechSynthesis.pause() }
  resume() { window.speechSynthesis.resume() }
  stop() { window.speechSynthesis.cancel() }
}
