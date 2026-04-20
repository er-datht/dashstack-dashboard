import AddPersonForm from "../../../components/AddPersonForm";
import { ROUTES } from "../../../routes/routes";

export default function AddNewMember(): React.JSX.Element {
  return (
    <AddPersonForm
      namespace="team"
      titleKey="addNewMemberTitle"
      successKey="memberAdded"
      backRoute={ROUTES.TEAM}
    />
  );
}
