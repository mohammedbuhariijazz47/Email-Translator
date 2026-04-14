import translate from 'google-translate-api-x'
import {
  getLanguageCode,
  getLanguageDisplayName,
  getLanguageLabel,
} from '@/lib/languages'

/**
 * Detect language and translate email body using a free translation API.
 * Returns { detectedLang, confidence, translated }
 */
export async function translateEmail(text, targetLang = 'English') {
  if (!text?.trim()) throw new Error('No text provided')
  
  try {
    const toCode = getLanguageCode(targetLang)
    const res = await translate(text, { to: toCode, autoCorrect: true })
    const detectedCode = res.from?.language?.iso || 'auto'
    
    return {
      detectedLang: getLanguageLabel(detectedCode),
      detectedLangCode: detectedCode,
      targetLang: getLanguageLabel(toCode),
      targetLangCode: toCode,
      confidence: 'high',
      translated: res.text,
    }
  } catch (err) {
    console.error('Translation error:', err)
    throw new Error('Translation failed.')
  }
}

/**
 * Translate a reply from the user's language into the recipient's language.
 * Returns { translated }
 */
export async function translateReply(replyText, recipientLang) {
  if (!replyText?.trim()) throw new Error('No reply text provided')

  try {
    const toCode = getLanguageCode(recipientLang)
    const res = await translate(replyText, { to: toCode, autoCorrect: true })
    
    return {
      recipientLang: getLanguageLabel(toCode),
      recipientLangDisplay: getLanguageDisplayName(toCode),
      recipientLangCode: toCode,
      translated: res.text,
    }
  } catch (err) {
    console.error('Reply translation error:', err)
    throw new Error('Translation failed.')
  }
}

/**
 * Summarize an email in one or two sentences.
 * Returns { summary }
 */
export async function summarizeEmail(text, lang = 'English') {
  if (!text?.trim()) throw new Error('No text provided')
  
  // Since we don't have an AI for summarization, we will extract the first sentence
  // and translate it as a basic summary.
  const firstSentence = text.split(/[.!?\n]/).filter(s => s.trim().length > 0)[0] || text
  const summaryText = firstSentence.substring(0, 150) + (firstSentence.length > 150 ? '...' : '.')
  
  try {
    const toCode = getLanguageCode(lang)
    const res = await translate(summaryText, { to: toCode, autoCorrect: true })
    return {
      summary: res.text,
    }
  } catch (err) {
    console.error('Summarize error:', err)
    return {
      summary: summaryText, 
    }
  }
}
