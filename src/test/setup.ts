import '@testing-library/jest-dom/vitest'

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
