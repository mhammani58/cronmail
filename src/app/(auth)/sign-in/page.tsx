"use client";

import { Button } from "@/client/components/ui/button";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
});

type Payload = z.infer<typeof schema>;

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<Payload>({
    resolver: zodResolver(schema),
    values: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: Payload) => {
    setIsLoading(true);
    try {
      await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/",
      });
      toast.success("Check your email");
    } catch (err: any) {
      toast.error(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-[100dvh] flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>You can signup from here.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="example@example.com" />
                    </FormControl>
                    <FormDescription>
                      We&apos;ll never share your email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button isLoading={isLoading} className="w-full">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SignIn;
