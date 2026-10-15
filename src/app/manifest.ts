import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LearnLink',
    short_name: 'LearnLink',
    description: 'Connecting Teachers, Students, and Parents',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#667eea',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
