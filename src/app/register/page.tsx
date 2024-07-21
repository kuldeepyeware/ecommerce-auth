"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { useTransition } from "react";
import { registerFormSchema } from "~/schema/registerFormSchema";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useToast } from "~/app/_components/ui/use-toast";

const Register = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const registerMutation = api.user.register.useMutation({
    onSuccess: ({ userId }) => {
      toast({ title: "Account created! Please verify your email." });
      void router.push(`/verify?userId=${userId}`);
    },
    onError: (error) => {
      toast({ variant: "destructive", title: error.message });
    },
  });

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerFormSchema>) => {
    startTransition(() => {
      registerMutation.mutate({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    });
  };

  return (
    <main className="mt-[40px] flex items-center justify-center px-[20px] md:ml-[100px] md:px-0">
      <Card className="w-full rounded-[20px] py-[10px] md:w-[576px] md:px-[60px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center space-y-2"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-[32px] font-semibold">
                Create your account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-[32px]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name" className="text-base font-normal">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        id="name"
                        placeholder="Enter"
                        className="w-[320px] px-[15px] text-base md:w-[456px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="email"
                      className="text-base font-normal"
                    >
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        id="email"
                        placeholder="Enter"
                        type="email"
                        className="w-[320px] px-[15px] text-base md:w-[456px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="password"
                      className="text-base font-normal"
                    >
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        id="password"
                        placeholder="Enter"
                        type="password"
                        className="w-[320px] px-[15px] text-base md:w-[456px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="mt-[15px] flex flex-col items-center space-y-[48px]">
              <Button
                type="submit"
                disabled={isPending}
                className="h-[56px] w-full bg-black text-base font-medium text-white md:w-[456px]"
              >
                {isPending ? "Creating..." : "CREATE ACCOUNT"}
              </Button>
              <div className="space-x-[11px] text-base">
                <span className="text-light">Have an Account?</span>
                <Link href="/login" className="font-medium text-black">
                  LOGIN
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
};

export default Register;
