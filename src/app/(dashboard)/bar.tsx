"use client";

import { Button } from "@/client/components/ui/button";
import { useRouter } from "next/navigation";

export const Bar = () => {
  const router = useRouter();

  const navigate = (href: string) => {
    router.push(href);
    router.refresh()
  }

  return (
    <div className="flex items-center h-16 border-b">
      <Button variant="link" onClick={() => navigate("/")}  >
        Emails
      </Button>
      <Button variant="link" onClick={() => navigate("/emails/create")}>
        Create Email
      </Button>
    </div>
  )
}
