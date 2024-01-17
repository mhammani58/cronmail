import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { DeleteCard } from "./delete-card";
import { EditCard } from "./edit-card";
import { showEmailAction } from "@/server/controllers/email";
import { redirect } from "next/navigation";

interface EditProps {
  params: Record<string, string>;
}

const Edit: React.FC<EditProps> = async ({ params }) => {
  const email = await showEmailAction(params);

  if (!email || "message" in email) {
    return redirect("/");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Delete Email</CardTitle>
          <CardDescription>
            You can delete your email from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteCard emailId={email.id} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Edit Email</CardTitle>
          <CardDescription>You can edit your email from here.</CardDescription>
        </CardHeader>
        <EditCard email={email} />
      </Card>
    </>
  );
};

export default Edit;
