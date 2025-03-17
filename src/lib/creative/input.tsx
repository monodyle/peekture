import { Loader2, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import persisted from '../persisted'
import { useGenerative } from './use-generative'
import { useImage, useSetImage } from '../image/state'

export default function CreativeInput() {
  const [prompt, setPrompt] = useState('')
  const { image, mimeType } = useImage()
  const setImage = useSetImage()

  const [geminiApiKey, setGeminiApiKey] = useState(() =>
    persisted.read((state) => state.geminiApiKey),
  )
  const handleGeminiApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGeminiApiKey(e.target.value)
      persisted.write((draft) => {
        draft.geminiApiKey = e.target.value
      })
    },
    [],
  )

  const { mutateAsync: generate, isPending: isGenerating } = useGenerative()

  const handleGenerate = useCallback(async () => {
    if (!image || !mimeType) {
      console.error('Please upload an image first')
      return
    }

    const result = await generate({ prompt, image, mimeType })
    setImage(`data:${result.mimeType};base64,${result.image}`, result.mimeType)

    setPrompt('')
  }, [generate, prompt, image, mimeType, setImage])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-tight uppercase text-neutral-500">
          Creative
        </div>
        <button
          type="button"
          className="flex items-center gap-1 border rounded cursor-pointer px-1 py-0.5 text-xs font-semibold tracking-tight text-neutral-500 transition-colors duration-100 border-transparent bg-neutral-800"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-3 text-neutral-500 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-3 text-neutral-500" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-neutral-900/80">
            <div className="flex items-center justify-center h-full gap-2 text-xs text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              <span>Generating...</span>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <label
            htmlFor="gemini-api-key"
            className="text-xs font-semibold tracking-tight text-neutral-500"
          >
            Gemini API Key
          </label>
          <input
            type="text"
            className="w-full rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500 focus:outline-none"
            id="gemini-api-key"
            value={geminiApiKey}
            onChange={handleGeminiApiKeyChange}
            disabled={isGenerating}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="creative-prompt"
            className="text-xs font-semibold tracking-tight text-neutral-500"
          >
            Creative Prompt
          </label>
          <textarea
            className="w-full rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500 focus:outline-none h-16 resize-none"
            id="creative-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}
