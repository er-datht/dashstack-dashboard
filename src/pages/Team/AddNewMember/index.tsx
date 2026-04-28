import PersonForm, { type PersonFormData } from "../../../components/PersonForm";
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
    setMembers([newMember, ...members]);
  };

  return (
    <PersonForm
      namespace="team"
      titleKey="addNewMemberTitle"
      successKey="memberAdded"
      backRoute={ROUTES.TEAM}
      onSubmit={handleAddMember}
    />
  );
}
