import PersonForm from "../../../components/PersonForm";
import { ROUTES } from "../../../routes/routes";

export default function AddNewContact(): React.JSX.Element {
  return (
    <PersonForm
      namespace="contact"
      titleKey="addNewContact"
      successKey="contactAdded"
      backRoute={ROUTES.CONTACT}
    />
  );
}
