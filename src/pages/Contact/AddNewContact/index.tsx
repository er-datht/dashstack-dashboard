import PersonForm, { type PersonFormData } from "../../../components/PersonForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { mockContacts } from "../contactData";
import type { Contact } from "../../../types/contact";
import { ROUTES } from "../../../routes/routes";

export default function AddNewContact(): React.JSX.Element {
  const [contacts, setContacts] = useLocalStorage<Contact[]>(
    "contacts",
    mockContacts,
  );

  const handleAddContact = (data: PersonFormData) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: data.firstName + " " + data.lastName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      avatar: data.photoPreview ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts([newContact, ...contacts]);
  };

  return (
    <PersonForm
      namespace="contact"
      titleKey="addNewContact"
      successKey="contactAdded"
      backRoute={ROUTES.CONTACT}
      onSubmit={handleAddContact}
    />
  );
}
