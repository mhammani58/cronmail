"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { Textarea } from "@/client/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { UpdateEmailPayload, updateEmailSchema } from "@/common/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Cron, Email } from "@/server/database/schema";
import { updateEmailAction } from "@/server/controllers/email";

interface EditCardProps {
  email: Email & {
    crons: Cron[];
  };
}

export const EditCard: React.FC<EditCardProps> = ({ email }) => {
  const { mutate: updateEmail, isPending } = useMutation({
    mutationFn: updateEmailAction,
  });

  const timestampInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<UpdateEmailPayload>({
    resolver: zodResolver(updateEmailSchema),
    values: {
      emailId: email.id,
      email: email.email,
      password: email.password,
      subject: email.subject,
      content: email.content,
      timestamps: email.crons.map((cron) => ({
        hour: cron.hour,
        minute: cron.minute,
      })),
    },
  });

  const addTimestamp = () => {
    if (!timestampInputRef.current || !timestampInputRef.current.value) return;
    const rawTimestamp = timestampInputRef.current.value;
    const [hour, minute] = rawTimestamp.split(":").map((v) => parseInt(v));

    for (let timestamp of form.getValues("timestamps")) {
      if (hour === timestamp.hour && minute === timestamp.minute) {
        toast.error("Timestamp already exists, please change it and try again");
        return;
      }
    }

    form.setValue("timestamps", [
      ...form.getValues("timestamps"),
      {
        hour,
        minute,
      },
    ]);
    timestampInputRef.current.value = "";
  };

  const deleteTimestamp = (hour: number, minute: number) => {
    form.setValue(
      "timestamps",
      form.getValues("timestamps").filter((timestamp) => {
        return !(timestamp.hour === hour && timestamp.minute === minute);
      })
    );
  };

  const onSubmit = (data: UpdateEmailPayload) => {
    updateEmail(data, {
      onSuccess: () => {
        toast.success("Email updated successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="example@example.com" />
                </FormControl>
                <FormDescription>
                  The email address for this job.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="********" />
                </FormControl>
                <FormDescription>The password of this email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="subject"
            render={({ field }) => (
              <FormItem className="col-start-1 col-end-3">
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="A question abo..." />
                </FormControl>
                <FormDescription>The subject of this email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="content"
            render={({ field }) => (
              <FormItem className="col-start-1 col-end-3">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    rows={8}
                    {...field}
                    placeholder="A question abo..."
                  />
                </FormControl>
                <FormDescription>The content of this email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="timestamps"
            render={() => (
              <FormItem className="col-start-1 col-end-3">
                <FormLabel>Timestamps</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Input ref={timestampInputRef} type="time" step="60" />
                    <Button
                      className="shrink-0"
                      type="button"
                      onClick={addTimestamp}
                    >
                      Add
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  The timestamps for this email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="border rounded-md col-start-1 col-end-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.watch("timestamps").map((timestamp, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {timestamp.hour}:{timestamp.minute}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        type="button"
                        onClick={() =>
                          deleteTimestamp(timestamp.hour, timestamp.minute)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button isLoading={isPending}>Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
