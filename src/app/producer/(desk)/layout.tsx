import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PRODUCER_COOKIE,
  verifyProducerSessionToken,
} from "@/lib/producer-auth";

export default async function ProducerDeskLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(PRODUCER_COOKIE)?.value ?? "";
  if (!verifyProducerSessionToken(token)) {
    redirect("/producer/login");
  }
  return children;
}
