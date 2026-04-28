import { useParams, Navigate } from "react-router-dom";
import PersonForm, { type PersonFormData } from "../../../components/PersonForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { mockContacts } from "../contactData";
import type { Contact } from "../../../types/contact";
import { ROUTES } from "../../../routes/routes";

export default function ContactDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [contacts, setContacts] = useLocalStorage<Contact[]>(
    "contacts",
    mockContacts,
  );

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return <Navigate to={ROUTES.CONTACT} replace />;
  }

  const firstName = contact.firstName ?? contact.name.split(" ")[0] ?? "";
  const lastName =
    contact.lastName ?? contact.name.split(" ").slice(1).join(" ") ?? "";

  const initialValues: Partial<PersonFormData> = {
    firstName,
    lastName,
    email: contact.email,
    phone: contact.phone ?? "",
    dateOfBirth: contact.dateOfBirth ?? "",
    gender: contact.gender ?? "",
    photoPreview: contact.avatar ?? null,
  };

  const handleSave = (data: PersonFormData) => {
    setContacts(
      contacts.map((c) =>
        c.id === id
          ? {
              ...c,
              firstName: data.firstName,
              lastName: data.lastName,
              name: data.firstName + " " + data.lastName,
              email: data.email,
              phone: data.phone,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender,
              avatar: data.photoPreview ?? undefined,
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  return (
    <PersonForm
      namespace="contact"
      titleKey={contact.name}
      successKey="contactUpdated"
      backRoute={ROUTES.CONTACT}
      onSubmit={handleSave}
      initialValues={initialValues}
      submitKey="save"
    />
  );
}
