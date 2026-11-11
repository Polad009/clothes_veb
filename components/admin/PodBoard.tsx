"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { adminFetch, formatDate, formatMoney, POD_STATUSES, type Tone } from "@/lib/adminClient";
import { Badge, Card, EmptyState, PageHeader, Select, useToast } from "@/components/admin/ui";

export interface PodJob {
  id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  garmentType: string;
  garmentColor: string;
  size: string;
  price: number;
  placement: string;
  customerNote: string;
  status: string;
  preview: string;
  artwork: string[];
}

const tone: Record<string, Tone> = { "Pending Print": "amber", "In Production": "blue", Printed: "violet", Shipped: "green" };

export function PodBoard({ jobs }: { jobs: PodJob[] }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState("open");
  const [busy, setBusy] = useState<string | null>(null);

  const visible = jobs.filter((j) => (filter === "open" ? j.status !== "Shipped" : filter === "all" ? true : j.status === filter));

  const setStatus = async (job: PodJob, status: string) => {
    setBusy(job.id);
    try {
      await adminFetch(`/api/admin/pod-orders/${encodeURIComponent(job.id)}`, { method: "PATCH", body: { status } });
      toast.success(`${job.id}: ${POD_STATUSES.find((s) => s.value === status)?.label || status}`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Öz dizayn sifarişləri"
        description="Müştərilərin studiyada hazırladığı dizaynlar. Hər kart bir işdir."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status üzrə süz" className="w-auto">
            <option value="open">Açıq işlər</option>
            {POD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
            <option value="all">Hamısı</option>
          </Select>
        }
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            title={jobs.length === 0 ? "Hələ öz dizayn sifarişi yoxdur" : "Bu süzgəcdə iş yoxdur"}
            description={jobs.length === 0 ? "Studiyadan gələn sifarişlər burada görünəcək." : undefined}
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((job) => (
            <li key={job.id}>
              <Card className="flex h-full flex-col overflow-hidden">
                <div className="flex aspect-[4/3] items-center justify-center border-b border-stone-200 bg-stone-100">
                  {job.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.preview} alt={`${job.id} dizayn önizləməsi`} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-stone-400">Önizləmə yoxdur</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900">{job.garmentType}</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {[job.garmentColor, job.size && `Ölçü ${job.size}`, job.placement].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Badge tone={tone[job.status] || "neutral"}>{POD_STATUSES.find((s) => s.value === job.status)?.label || job.status}</Badge>
                  </div>

                  {job.customerNote && <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-700">“{job.customerNote}”</p>}

                  <dl className="space-y-1 text-xs text-stone-600">
                    <div className="flex justify-between gap-3">
                      <dt>Müştəri</dt>
                      <dd className="truncate text-stone-900">{job.customerName} · {job.customerPhone}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Sifariş</dt>
                      <dd>
                        {/^(VTX-ORD|HW)-\d+$/.test(job.orderId) ? (
                          <Link href={`/admin/orders/${encodeURIComponent(job.orderId)}`} className="text-stone-900 underline underline-offset-2">{job.orderId}</Link>
                        ) : (
                          <span className="text-stone-900">{job.orderId || "—"}</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>{formatDate(job.createdAt)}</dt>
                      <dd className="font-medium tabular-nums text-stone-900">{formatMoney(job.price)}</dd>
                    </div>
                  </dl>

                  {job.artwork.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.artwork.map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          download={`${job.id}-fayl-${i + 1}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:border-stone-900 hover:text-stone-900"
                        >
                          <Download className="h-3.5 w-3.5" /> Dizayn faylı {job.artwork.length > 1 ? i + 1 : ""}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-1">
                    <Select value={job.status} disabled={busy === job.id} onChange={(e) => setStatus(job, e.target.value)} aria-label={`${job.id} statusu`}>
                      {!POD_STATUSES.some((s) => s.value === job.status) && <option value={job.status}>{job.status}</option>}
                      {POD_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
