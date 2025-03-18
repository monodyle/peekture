import { useMutation } from '@tanstack/react-query'
import {
  type Content,
  GoogleGenerativeAI,
  type Part,
} from '@google/generative-ai'
import persisted from '../persisted'

export const GENERATIVE_MUTATION_KEY = 'generative' as const

export function useGenerative() {
  return useMutation({
    mutationKey: [GENERATIVE_MUTATION_KEY],
    mutationFn: async ({
      prompt,
      image,
      history,
    }: {
      prompt: string
      image: string
      history?: Array<Content>
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 100000))
      const apiKey = persisted.read((state) => state.geminiApiKey)
      if (!apiKey) {
        throw new Error('No Gemini API key found')
      }

      const client = new GoogleGenerativeAI(apiKey)

      const model = client.getGenerativeModel({
        model: 'gemini-2.0-flash-exp-image-generation',
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          // @ts-expect-error - Gemini API JS is missing this type
          responseModalities: ['Text', 'Image'],
        },
      })

      const chat = model.startChat({
        history: history,
      })

      const messageParts: Array<Part> = []
      messageParts.push({ text: prompt })

      const imageParts = image.split(',')
      const mimeType = image.includes('image/png') ? 'image/png' : 'image/jpeg'
      const data = imageParts[1]

      messageParts.push({
        inlineData: {
          data,
          mimeType,
        },
      })

      const { response } = await chat.sendMessage(messageParts)
      let imageData = null
      let responseMimeType = 'image/png'

      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content?.parts ?? []
        for (const part of parts) {
          if ('inlineData' in part && part.inlineData) {
            imageData = part.inlineData.data
            responseMimeType = part.inlineData.mimeType || 'image/png'
          }
        }
      }

      return {
        image: imageData,
        mimeType: responseMimeType,
      }
    },
  })
}
