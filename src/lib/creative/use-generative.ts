import { useMutation } from '@tanstack/react-query'
import {
  type Content,
  GoogleGenerativeAI,
  type Part,
} from '@google/generative-ai'
import persisted from '../persisted'

export function useGenerative() {
  return useMutation({
    mutationKey: ['generative'],
    mutationFn: async ({
      prompt,
      image,
      mimeType,
      history,
    }: {
      prompt: string
      image: string
      mimeType: string
      history?: Array<Content>
    }) => {
      const apiKey = persisted.read((state) => state.geminiApiKey)
      if (!apiKey) {
        throw new Error('No Gemini API key found')
      }

      const client = new GoogleGenerativeAI(apiKey)

      const model = client.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
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
      messageParts.push({
        inlineData: {
          data: imageParts[1],
          mimeType,
        },
      })

      const { response } = await chat.sendMessage(messageParts)
      let imageData = null
      let responseMimeType = 'image/png'

      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts
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
