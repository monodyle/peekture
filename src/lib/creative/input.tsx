import { Toggle } from '@base-ui/react/toggle'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '../cn'
import { base64ToBlob } from '../image/encode'
import { useImage } from '../image/state'
import { useLoadImage } from '../image/use-load-image'
import persisted from '../persisted'
import { ActionButton } from '../ui/panel'
import { useToast } from '../ui/toast'
import { Tooltip } from '../ui/tooltip'
import { useGenerative } from './use-generative'

type ApiKeyControlProps = {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

function ApiKeyControl({ value, onChange, disabled }: ApiKeyControlProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="dialkit-text-control">
      <label htmlFor="gemini-api-key" className="dialkit-text-label">
        API key
      </label>
      <input
        id="gemini-api-key"
        type={visible ? 'text' : 'password'}
        className="dialkit-text-input"
        placeholder="Gemini"
        autoComplete="off"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <Tooltip label={visible ? 'Hide API key' : 'Show API key'}>
        <Toggle
          aria-label={visible ? 'Hide API key' : 'Show API key'}
          pressed={visible}
          onPressedChange={setVisible}
          className="-mr-1.5 grid size-6 shrink-0 place-items-center rounded-[6px] text-muted hover:bg-surface-hover hover:text-white"
        >
          {visible ? (
            <EyeOff className="size-3.5" />
          ) : (
            <Eye className="size-3.5" />
          )}
        </Toggle>
      </Tooltip>
    </div>
  )
}

export default function CreativeInput() {
  const [prompt, setPrompt] = useState('')
  const image = useImage()
  const loadImage = useLoadImage()
  const toast = useToast()

  const [geminiApiKey, setGeminiApiKey] = useState(() =>
    persisted.read((state) => state.geminiApiKey),
  )
  const handleGeminiApiKeyChange = useCallback((value: string) => {
    setGeminiApiKey(value)
    persisted.write((draft) => {
      draft.geminiApiKey = value
    })
  }, [])

  const { mutate: generate, isPending: isGenerating } = useGenerative()

  const handleGenerate = useCallback(() => {
    if (!image) return

    generate(
      { prompt, image },
      {
        onSuccess: (result) => {
          if (!result.image) {
            toast.add({
              title: 'No image returned',
              description: 'Try a different prompt.',
            })
            return
          }
          loadImage(base64ToBlob(result.image, result.mimeType))
          setPrompt('')
        },
        onError: (error) => {
          toast.add({ title: 'Generation failed', description: error.message })
        },
      },
    )
  }, [generate, prompt, image, loadImage, toast])

  const canGenerate =
    !isGenerating && prompt.trim() !== '' && geminiApiKey !== ''

  return (
    <>
      <ApiKeyControl
        value={geminiApiKey}
        onChange={handleGeminiApiKeyChange}
        disabled={isGenerating}
      />
      <div className="rounded-row bg-surface px-3 py-2.5">
        <textarea
          aria-label="Prompt"
          className={cn(
            'block h-20 w-full resize-none bg-transparent text-[13px] font-medium text-white outline-none',
            'placeholder:text-muted disabled:text-muted',
          )}
          placeholder="Describe the change you want..."
          value={prompt}
          disabled={isGenerating}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <ActionButton
        className="flex items-center justify-center gap-2"
        onClick={handleGenerate}
        disabled={!canGenerate}
      >
        <Sparkles className="size-3.5" />
        <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
      </ActionButton>
    </>
  )
}
