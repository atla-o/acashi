import { redirect } from "next/navigation";

export default function ProducerRootRedirect() {
  redirect("/admin");
}
