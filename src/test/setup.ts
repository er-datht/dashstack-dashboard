import '@testing-library/jest-dom/vitest'

// Mock URL.createObjectURL / revokeObjectURL for jsdom
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url')
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn()
}

// jsdom does not implement AnimationEvent. React sniffs for it to decide
// whether the browser supports unprefixed animation events, and without it
// registers the VENDOR-PREFIXED `webkitAnimationEnd` instead of `animationend`.
// The consequence is that `fireEvent.animationEnd(node)` dispatches a native
// `animationend` that React's `onAnimationEnd` never hears, so any component
// driven by that event looks inert in tests while working fine in a browser.
//
// Defining the constructor before react-dom loads restores the unprefixed name.
// Must stay above any import that pulls in react-dom, since React registers its
// DOM event names once at module initialization.
if (typeof window.AnimationEvent === 'undefined') {
  class AnimationEventPolyfill extends Event {
    animationName: string
    elapsedTime: number
    pseudoElement: string

    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init)
      this.animationName = init.animationName ?? ''
      this.elapsedTime = init.elapsedTime ?? 0
      this.pseudoElement = init.pseudoElement ?? ''
    }
  }

  window.AnimationEvent =
    AnimationEventPolyfill as unknown as typeof window.AnimationEvent
}

vi.mock('react-i18next', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useTranslation: (_ns?: string) => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
    ready: true,
  }),
  Trans: ({ children }: { children: unknown }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))
