import AddPersonForm from "../../../components/AddPersonForm";
import { ROUTES } from "../../../routes/routes";

export default function AddNewContact(): React.JSX.Element {
  return (
    <AddPersonForm
      namespace="contact"
      titleKey="addNewContact"
      successKey="contactAdded"
      backRoute={ROUTES.CONTACT}
    />
  );
}
