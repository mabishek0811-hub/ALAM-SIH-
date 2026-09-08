import type { Lang } from '../voiceTypes'

const searchEndpoint = (lang: Lang, question: string) => {
  const wikiLang = lang === 'ta' ? 'ta' : 'en'
  return `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(question)}&utf8=1&format=json&origin=*`
}

export async function answerGeneralQuestion(question: string, lang: Lang): Promise<string | undefined> {
  const cleanQuestion = question.trim()
  if (!cleanQuestion) return undefined
  try {
    const aiResponse = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: cleanQuestion, lang }),
      signal: AbortSignal.timeout(9000),
    })
    if (aiResponse.ok) {
      const aiData = await aiResponse.json() as { answer?: string }
      if (aiData.answer) return aiData.answer
    }
  } catch {
    // Continue to the public knowledge fallback when the optional AI route is unavailable.
  }
  try {
    const searchResponse = await fetch(searchEndpoint(lang, cleanQuestion))
    if (!searchResponse.ok) return undefined
    const searchData = await searchResponse.json() as { query?: { search?: Array<{ title: string }> } }
    const title = searchData.query?.search?.[0]?.title
    if (!title) return undefined
    const wikiLang = lang === 'ta' ? 'ta' : 'en'
    const summaryResponse = await fetch(`https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    if (!summaryResponse.ok) return undefined
    const summary = await summaryResponse.json() as { title?: string; extract?: string }
    if (!summary.extract) return undefined
    const sentences = summary.extract.match(/[^.!?]+[.!?]+/g)?.slice(0, 3).join(' ').trim() ?? summary.extract.slice(0, 500)
    return lang === 'ta' ? `${summary.title ?? title}: ${sentences}` : `${summary.title ?? title}: ${sentences}`
  } catch {
    return undefined
  }
}
