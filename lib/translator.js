import translate from 'google-translate-api-x'

// Mapping full language names to ISO codes since google-translate-api-x uses ISO codes
const langToCode = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Dutch: 'nl',
  Russian: 'ru',
  Chinese: 'zh-CN',
  Japanese: 'ja',
  Korean: 'ko',
  Arabic: 'ar',
  Hindi: 'hi',
  Bengali: 'bn',
  Urdu: 'ur',
}

function getIsoCode(langName) {
  // Try to find matching language code, default to 'en'
  return langToCode[langName] || 'en'
}

/**
 * Detect language and translate email body using a free translation API.
 * Returns { detectedLang, confidence, translated }
 */
export async function translateEmail(text, targetLang = 'English') {
  if (!text?.trim()) throw new Error('No text provided')
  
  try {
    const toCode = getIsoCode(targetLang)
    const res = await translate(text, { to: toCode, autoCorrect: true })
    
    return {
      detectedLang: res.from.language.iso, // It returns the detected ISO code
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
    const toCode = getIsoCode(recipientLang)
    const res = await translate(replyText, { to: toCode, autoCorrect: true })
    
    return {
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
    const toCode = getIsoCode(lang)
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
