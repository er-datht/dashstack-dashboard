import { useParams, Navigate } from "react-router-dom";
import PersonForm, { type PersonFormData } from "../../../components/PersonForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { mockTeamMembers } from "../teamData";
import type { TeamMember } from "../../../types/team";
import { ROUTES } from "../../../routes/routes";

export default function MemberDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useLocalStorage<TeamMember[]>(
    "team-members",
    mockTeamMembers,
  );

  const member = members.find((m) => m.id === id);

  if (!member) {
    return <Navigate to={ROUTES.TEAM} replace />;
  }

  // Resolve firstName/lastName from stored fields or by splitting name
  const firstName = member.firstName ?? member.name.split(" ")[0] ?? "";
  const lastName =
    member.lastName ?? member.name.split(" ").slice(1).join(" ") ?? "";

  const initialValues: Partial<PersonFormData> = {
    firstName,
    lastName,
    email: member.email,
    phone: member.phone ?? "",
    dateOfBirth: member.dateOfBirth ?? "",
    gender: member.gender ?? "",
    photoPreview: member.avatar ?? null,
  };

  const handleSave = (data: PersonFormData) => {
    setMembers(
      members.map((m) =>
        m.id === id
          ? {
              ...m,
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
          : m,
      ),
    );
  };

  return (
    <PersonForm
      namespace="team"
      titleKey={member.name}
      successKey="memberUpdated"
      backRoute={ROUTES.TEAM}
      onSubmit={handleSave}
      initialValues={initialValues}
      submitKey="save"
    />
  );
}
