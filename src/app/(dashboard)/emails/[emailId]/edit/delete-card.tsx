"use client";

import { Button } from "@/client/components/ui/button";
import { deleteEmailAction } from "@/server/controllers/email";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteCardProps {
  emailId: string;
}

export const DeleteCard: React.FC<DeleteCardProps> = ({ emailId }) => {
  const router = useRouter();
  const { mutate: deleteEmail, isPending } = useMutation({
    mutationFn: deleteEmailAction,
  });

  const handleClick = () => {
    deleteEmail(
      { emailId },
      {
        onSuccess: (data) => {
          if ("message" in data) {
            toast.error(data.message);
            return;
          }

          toast.success("Email deleted successfully");
          router.push("/");
          router.refresh();
        },
      }
    );
  };

  return (
    <Button isLoading={isPending} onClick={handleClick} variant="destructive">
      Delete
    </Button>
  );
};
