import { redirect } from "next/navigation";

export default async function ProducerFileRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/${id}`);
}
