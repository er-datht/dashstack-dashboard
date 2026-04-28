import { render, screen } from '@testing-library/react'
import AddNewContact from '../index'
import type { PersonFormData } from '../../../../components/PersonForm'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Capture the onSubmit callback passed to PersonForm
let capturedOnSubmit: ((data: PersonFormData) => void) | undefined

vi.mock('../../../../components/PersonForm', () => ({
  __esModule: true,
  default: (props: {
    namespace: string
    titleKey: string
    successKey: string
    backRoute: string
    onSubmit?: (data: PersonFormData) => void
  }) => {
    capturedOnSubmit = props.onSubmit
    return (
      <div data-testid="person-form">
        <span data-testid="namespace">{props.namespace}</span>
        <span data-testid="titleKey">{props.titleKey}</span>
        <span data-testid="successKey">{props.successKey}</span>
        <span data-testid="backRoute">{props.backRoute}</span>
        <span data-testid="has-onSubmit">{props.onSubmit ? 'yes' : 'no'}</span>
      </div>
    )
  },
}))

// Mock useLocalStorage to capture persistence calls
const mockSetContacts = vi.fn()
let mockContactsState: unknown[] = []

vi.mock('../../../../hooks/useLocalStorage', () => ({
  useLocalStorage: () => [mockContactsState, mockSetContacts],
}))

describe('AddNewContact', () => {
  beforeEach(() => {
    capturedOnSubmit = undefined
    mockSetContacts.mockClear()
    mockContactsState = []
  })

  describe('rendering', () => {
    it('renders PersonForm with correct contact namespace and props', () => {
      render(<AddNewContact />)

      expect(screen.getByTestId('person-form')).toBeInTheDocument()
      expect(screen.getByTestId('namespace')).toHaveTextContent('contact')
      expect(screen.getByTestId('titleKey')).toHaveTextContent('addNewContact')
      expect(screen.getByTestId('successKey')).toHaveTextContent('contactAdded')
      expect(screen.getByTestId('backRoute')).toHaveTextContent('/contact')
    })

    it('passes an onSubmit handler to PersonForm', () => {
      render(<AddNewContact />)

      expect(screen.getByTestId('has-onSubmit')).toHaveTextContent('yes')
      expect(capturedOnSubmit).toBeDefined()
      expect(typeof capturedOnSubmit).toBe('function')
    })
  })

  describe('persistence via onSubmit', () => {
    it('constructs a Contact and prepends it to the contacts array', () => {
      render(<AddNewContact />)

      const formData: PersonFormData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '555-1234',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        photoPreview: 'blob:http://localhost/fake-photo',
      }

      capturedOnSubmit!(formData)

      expect(mockSetContacts).toHaveBeenCalledTimes(1)

      const savedArray = mockSetContacts.mock.calls[0][0]
      expect(Array.isArray(savedArray)).toBe(true)
      expect(savedArray.length).toBe(1) // prepended to empty array

      const newContact = savedArray[0]
      expect(newContact.name).toBe('Jane Doe')
      expect(newContact.firstName).toBe('Jane')
      expect(newContact.lastName).toBe('Doe')
      expect(newContact.email).toBe('jane.doe@example.com')
      expect(newContact.phone).toBe('555-1234')
      expect(newContact.dateOfBirth).toBe('1990-05-15')
      expect(newContact.gender).toBe('female')
      expect(newContact.avatar).toBe('blob:http://localhost/fake-photo')
      expect(newContact.id).toBeDefined()
      expect(newContact.createdAt).toBeDefined()
      expect(newContact.updatedAt).toBeDefined()
    })

    it('prepends new contact before existing contacts', () => {
      const existingContact = {
        id: '1',
        name: 'Existing User',
        email: 'existing@example.com',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      mockContactsState = [existingContact]

      render(<AddNewContact />)

      const formData: PersonFormData = {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        phone: '',
        dateOfBirth: '',
        gender: '',
        photoPreview: null,
      }

      capturedOnSubmit!(formData)

      const savedArray = mockSetContacts.mock.calls[0][0]
      expect(savedArray.length).toBe(2)
      expect(savedArray[0].name).toBe('New User')
      expect(savedArray[1]).toBe(existingContact)
    })

    it('sets avatar to undefined when no photo is uploaded', () => {
      render(<AddNewContact />)

      const formData: PersonFormData = {
        firstName: 'No',
        lastName: 'Photo',
        email: 'nophoto@example.com',
        phone: '',
        dateOfBirth: '',
        gender: '',
        photoPreview: null,
      }

      capturedOnSubmit!(formData)

      const newContact = mockSetContacts.mock.calls[0][0][0]
      expect(newContact.avatar).toBeUndefined()
    })
  })
})
