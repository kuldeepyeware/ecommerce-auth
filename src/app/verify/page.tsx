"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "~/app/_components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/app/_components/ui/input-otp";
import { Label } from "~/app/_components/ui/label";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useToast } from "~/app/_components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, Suspense } from "react";
import Cookies from "js-cookie";

const Verify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const verifyMutation = api.user.verifyEmail.useMutation({
    onSuccess: ({ token }) => {
      Cookies.set("auth-token", token, { expires: 1 });
      toast({ title: "Email verified successfully!" });
      void router.push("/");
    },
    onError: (error) => {
      toast({ variant: "destructive", title: error.message });
    },
  });

  const handleVerify = () => {
    startTransition(() => {
      if (!userId) {
        toast({ variant: "destructive", title: "User ID is missing" });
        return;
      }
      verifyMutation.mutate({ userId, otp });
    });
  };

  const { data, error } = api.user.getUserEmail.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId },
  );

  useEffect(() => {
    if (data?.email) {
      setEmail(data.email);
    }

    if (error) {
      toast({ variant: "destructive", title: error.message });
    }
  }, [data, error, toast]);

  return (
    <main className="mt-[40px] flex items-center justify-center px-[20px] md:ml-[100px] md:px-0">
      <Card className="w-[450px] rounded-[20px] px-[30px] py-[10px] md:w-[576px]">
        <CardHeader className="text-center">
          <CardTitle className="text-[32px] font-semibold">
            Verify your email
          </CardTitle>
          <CardDescription className="flex flex-col items-center justify-center pt-[36px] text-[16px] text-black">
            <span>Enter the 8 digit code you have received on </span>
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-[32px]">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-normal">
              Code
            </Label>
            <InputOTP
              maxLength={8}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup className="space-x-[12px]">
                {[...(Array(8) as number[])].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-[38px] w-[36px] rounded-md border md:h-[48px] md:w-[46px]"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter className="mt-[34px] flex flex-col items-center">
          <Button
            className="h-[56px] w-full bg-black text-base font-medium text-white"
            onClick={handleVerify}
            disabled={otp.length !== 8 || isPending}
          >
            {isPending ? "Verifying..." : "VERIFY"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

const VerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  );
};

export default VerifyPage;
