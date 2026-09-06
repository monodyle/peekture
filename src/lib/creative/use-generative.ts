import {
  type Content,
  type GenerateContentResponse,
  GoogleGenerativeAI,
  type Part,
} from '@google/generative-ai'
import { useMutation } from '@tanstack/react-query'
import { blobToBase64 } from '../image/encode'
import type { LoadedImage } from '../image/load'
import persisted from '../persisted'

export const GENERATIVE_MUTATION_KEY = 'generative' as const

const DEFAULT_MIME_TYPE = 'image/png'

function createModel(apiKey: string) {
  const client = new GoogleGenerativeAI(apiKey)
  return client.getGenerativeModel({
    model: 'gemini-2.0-flash-exp-image-generation',
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      // @ts-expect-error - Gemini API JS is missing this type
      responseModalities: ['Text', 'Image'],
    },
  })
}

async function buildMessageParts(
  prompt: string,
  image: LoadedImage,
): Promise<Array<Part>> {
  const mimeType =
    image.source.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const data = await blobToBase64(image.source)
  return [{ text: prompt }, { inlineData: { data, mimeType } }]
}

function extractImage(response: GenerateContentResponse) {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  let image: string | null = null
  let mimeType = DEFAULT_MIME_TYPE
  for (const part of parts) {
    if (part.inlineData) {
      image = part.inlineData.data
      mimeType = part.inlineData.mimeType || DEFAULT_MIME_TYPE
    }
  }
  return { image, mimeType }
}

export function useGenerative() {
  return useMutation({
    mutationKey: [GENERATIVE_MUTATION_KEY],
    mutationFn: async ({
      prompt,
      image,
      history,
    }: {
      prompt: string
      image: LoadedImage
      history?: Array<Content>
    }) => {
      const apiKey = persisted.read((state) => state.geminiApiKey)
      if (!apiKey) {
        throw new Error('No Gemini API key found')
      }

      const chat = createModel(apiKey).startChat({ history })
      const { response } = await chat.sendMessage(
        await buildMessageParts(prompt, image),
      )
      return extractImage(response)
    },
  })
}
