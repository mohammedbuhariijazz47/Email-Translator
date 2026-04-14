import translate from 'google-translate-api-x'
import {
  getLanguageCode,
  getLanguageDisplayName,
  getLanguageLabel,
} from '@/lib/languages'
import { GoogleGenAI } from '@google/genai'

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

/**
 * Detect language and translate email body.
 * Uses Gemini if API key is provided for flawless results, else falls back to generic google translate API.
 */
export async function translateEmail(text, targetLang = 'English') {
  if (!text?.trim()) throw new Error('No text provided')
  
  const ai = getGeminiClient()
  if (ai) {
    try {
      const prompt = `You are an expert translator. Translate the following email text into ${targetLang}. Focus on perfect grammar, correct native spellings, and appropriate alphabets. Do not add any conversational text, just return the translated text.\n\nText:\n${text}`
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      })
      const toCode = getLanguageCode(targetLang)
      return {
        detectedLang: 'Auto-Detected',
        detectedLangCode: 'auto',
        targetLang: getLanguageLabel(toCode),
        targetLangCode: toCode,
        confidence: 'high',
        translated: response.text.trim(),
      }
    } catch (e) {
      console.warn("Gemini translation failed, falling back...", e)
    }
  }

  // Fallback to basic translation
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
 */
export async function translateReply(replyText, recipientLang) {
  if (!replyText?.trim()) throw new Error('No reply text provided')

  const ai = getGeminiClient()
  if (ai) {
    try {
      const prompt = `You are a professional email translator. Accurately translate this text to ${recipientLang}. Maintain the exact tone, ensure formal/polite addressing natively, use accurate alphabets, and zero spelling mistakes. Provide ONLY the translated output.\n\nText:\n${replyText}`
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      })
      const toCode = getLanguageCode(recipientLang)
      return {
        recipientLang: getLanguageLabel(toCode),
        recipientLangDisplay: getLanguageDisplayName(toCode),
        recipientLangCode: toCode,
        translated: response.text.trim(),
      }
    } catch (e) {
      console.warn("Gemini reply translation failed, falling back...", e)
    }
  }

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
 */
export async function summarizeEmail(text, lang = 'English') {
  if (!text?.trim()) throw new Error('No text provided')
  
  const ai = getGeminiClient()
  if (ai) {
    try {
      const prompt = `Summarize the following email in a single, clear sentence in ${lang}.\n\nText:\n${text}`
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      })
      return { summary: response.text.trim() }
    } catch (e) {
      console.warn('Gemini summarize failed, falling back...', e)
    }
  }

  const firstSentence = text.split(/[.!?\n]/).filter(s => s.trim().length > 0)[0] || text
  const summaryText = firstSentence.substring(0, 150) + (firstSentence.length > 150 ? '...' : '.')
  try {
    const toCode = getLanguageCode(lang)
    const res = await translate(summaryText, { to: toCode, autoCorrect: true })
    return { summary: res.text }
  } catch (err) {
    return { summary: summaryText }
  }
}

/**
 * Generate an AI Draft reply based on the received email
 */
export async function generateDraftReply(emailBody, lang = 'English') {
  if (!emailBody?.trim()) throw new Error('No email content provided')
  const ai = getGeminiClient()
  if (!ai) throw new Error('Gemini API key is required to generate AI drafts.')

  const prompt = `You are a helpful AI assistant. Write a polite, standard reply to the following email. Write the draft in ${lang}. Return ONLY the text of the reply, ready to be inserted into a text box, with no conversational filler.\n\nReceived Email:\n${emailBody}`
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt
  })
  
  return response.text.trim()
}

/**
 * Grammar check text
 */
export async function grammarCheckText(text) {
  if (!text?.trim()) throw new Error('No text provided')
  const ai = getGeminiClient()
  if (!ai) throw new Error('Gemini API key is required for Grammar Check.')

  const prompt = `Proofread the following text. Fix any spelling mistakes, punctuation, grammatical errors, and ensure it sounds professional. Ensure the exact language remains the same. Return ONLY the corrected text, no conversational filler.\n\nText:\n${text}`
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt
  })
  
  return response.text.trim()
}
