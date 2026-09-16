import { redirect } from "next/navigation";

export default async function StatusRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; email?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.id) query.set("id", params.id);
  if (params.email) query.set("email", params.email);
  redirect(query.size ? `/account?${query.toString()}` : "/account");
}
