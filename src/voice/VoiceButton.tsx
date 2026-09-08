import { Mic } from 'lucide-react'
import type { Lang } from '../voiceTypes'

export function VoiceButton({ lang, onClick }: { lang: Lang; onClick: () => void }) {
  const label = lang === 'ta' ? 'அளம் குரல்' : 'ALAM Voice'
  return <button className="floating-voice" onClick={onClick} aria-label={label}><Mic size={21} /><span>{label}</span></button>
}
