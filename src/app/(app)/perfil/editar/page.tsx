import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { EditProfileForm } from "./edit-profile-form";

export default async function EditarPerfilPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  return (
    <ScreenContent>
      <TopBar title="Editar Perfil" />
      <EditProfileForm player={me} />
    </ScreenContent>
  );
}
