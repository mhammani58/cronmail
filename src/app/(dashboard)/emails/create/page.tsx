import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { CreateForm } from "./form";

const Create = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Email</CardTitle>
        <CardDescription>You can create a new email from here.</CardDescription>
      </CardHeader>
      <CreateForm />
    </Card>
  );
};

export default Create;
