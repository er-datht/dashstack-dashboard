import AddPersonForm from "../../../components/AddPersonForm";
import type { PersonFormData } from "../../../components/AddPersonForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { mockTeamMembers } from "../teamData";
import type { TeamMember } from "../../../types/team";
import { ROUTES } from "../../../routes/routes";

export default function AddNewMember(): React.JSX.Element {
  const [members, setMembers] = useLocalStorage<TeamMember[]>(
    "team-members",
    mockTeamMembers,
  );

  const handleAddMember = (data: PersonFormData) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: data.firstName + " " + data.lastName,
      email: data.email,
      avatar: data.photoPreview ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMembers([newMember, ...members]);
  };

  return (
    <AddPersonForm
      namespace="team"
      titleKey="addNewMemberTitle"
      successKey="memberAdded"
      backRoute={ROUTES.TEAM}
      onSubmit={handleAddMember}
    />
  );
}
