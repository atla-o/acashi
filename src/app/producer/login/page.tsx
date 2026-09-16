import { redirect } from "next/navigation";

export default async function ProducerLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.token) query.set("token", params.token);
  if (params.error) query.set("error", params.error);
  redirect(query.size ? `/admin/login?${query.toString()}` : "/admin/login");
}
