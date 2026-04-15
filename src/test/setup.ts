import '@testing-library/jest-dom/vitest'

// Mock URL.createObjectURL / revokeObjectURL for jsdom
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url')
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn()
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
