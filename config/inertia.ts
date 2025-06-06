import User from '#models/user'
import env from '#start/env'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    appName: () => env.get('VITE_APP_NAME'),
    message: (ctx) => ctx.session?.flashMessages.get('message'),
    messages: (ctx) => ctx.session?.flashMessages.get('messages'),
    errors: (ctx) => ctx.session?.flashMessages.get('errors'),
    user: (ctx) => ctx.auth?.user,
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {
    user?: User
    message: {
      type: 'success' | 'error'
      text: string
    }
    messages: {
      type: 'success' | 'error' | 'info'
      text: string
    }[]
  }
}
