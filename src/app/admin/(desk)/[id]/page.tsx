import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProducerDetail } from "@/components/producer-detail";
import { producerApplication } from "@/lib/application";
import { readApplicationById } from "@/lib/application-store";
import { producerDefaults } from "@/lib/producer";

export const metadata: Metadata = {
  title: "Admin file",
};

export const dynamic = "force-dynamic";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await readApplicationById(id);
  if (!application) notFound();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <ProducerDetail
        application={producerApplication(application)}
        agentDefaults={producerDefaults()}
      />
    </div>
  );
}
