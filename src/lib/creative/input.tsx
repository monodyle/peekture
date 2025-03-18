import { Loader2, Sparkles } from 'lucide-react'
import { useCallback, useReducer, useState } from 'react'
import persisted from '../persisted'
import { useGenerative } from './use-generative'
import { useImage, useSetImage } from '../image/state'

export default function CreativeInput() {
  const [prompt, setPrompt] = useState('')
  const image = useImage()
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
  const [isShowApiKey, toggleShowApiKey] = useReducer((state) => !state, false)

  const { mutateAsync: generate, isPending: isGenerating } = useGenerative()

  const handleGenerate = useCallback(async () => {
    if (!image) {
      console.error('Please upload an image first')
      return
    }

    const result = await generate({ prompt, image })
    setImage(`data:${result.mimeType};base64,${result.image}`)

    setPrompt('')
  }, [generate, prompt, image, setImage])

  return (
    <div className="flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-tight uppercase text-neutral-500">
          Creative
        </div>
        <button
          type="button"
          className="flex items-center gap-1 border rounded px-1 py-0.5 text-xs font-semibold tracking-tight text-neutral-500 transition-colors duration-100 border-transparent bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt || !geminiApiKey}
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
          <div className="flex items-center gap-1">
            <input
              type={isShowApiKey ? 'text' : 'password'}
              className="w-full rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500 focus:outline-none focus:text-neutral-200"
              id="gemini-api-key"
              value={geminiApiKey}
              onChange={handleGeminiApiKeyChange}
              disabled={isGenerating}
            />
            <button
              type="button"
              onClick={toggleShowApiKey}
              className="text-xs bg-neutral-800 rounded font-medium px-1.5 py-1 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-200"
            >
              {isShowApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="creative-prompt"
            className="text-xs font-semibold tracking-tight text-neutral-500"
          >
            Creative Prompt
          </label>
          <textarea
            className="w-full rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500 focus:outline-none h-16 resize-none focus:text-neutral-200"
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
