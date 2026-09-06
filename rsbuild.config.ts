import { defineConfig, type RsbuildPlugin } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

// Rsbuild auto-detects public/favicon.ico and injects its own <link> without `sizes`.
// Drop it so only the explicit favicon tags below remain.
const pluginDropAutoFavicon: RsbuildPlugin = {
  name: 'drop-auto-favicon',
  setup(api) {
    api.modifyHTMLTags(({ headTags, bodyTags }) => ({
      headTags: headTags.filter(
        (tag) =>
          !(
            tag.tag === 'link' &&
            tag.attrs?.rel === 'icon' &&
            tag.attrs?.href === '/favicon.ico' &&
            tag.attrs?.sizes === undefined
          ),
      ),
      bodyTags,
    }))
  },
}

export default defineConfig({
  plugins: [pluginReact(), pluginDropAutoFavicon],
  html: {
    title: 'Peekture',
    tags: [
      {
        tag: 'link',
        attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
      },
      {
        tag: 'link',
        attrs: { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
      },
      {
        tag: 'link',
        attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      },
      {
        tag: 'link',
        attrs: { rel: 'manifest', href: '/manifest.webmanifest' },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
      },
      {
        tag: 'link',
        attrs: {
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap',
          rel: 'stylesheet',
        },
      },
    ],
  },
})
