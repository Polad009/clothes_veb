"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, ORDER_STATUSES, paymentLabel } from "@/lib/adminClient";
import { Button, Card, ConfirmButton, Field, Select, useToast } from "@/components/admin/ui";
import { statusMessage, waDigits } from "@/lib/customerMessage";

const PAYMENT_STATUSES = ["pending_payment", "paid", "test_paid", "failed", "refunded"];

export function OrderActions({
  id,
  orderStatus,
  paymentStatus,
  customerName,
  customerPhone,
  trackingCode,
}: {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  trackingCode?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [saving, setSaving] = useState(false);

  const dirty = status !== orderStatus || payment !== paymentStatus;
  const statusOptions = ORDER_STATUSES.includes(orderStatus as any) ? [...ORDER_STATUSES] : [orderStatus, ...ORDER_STATUSES];
  const paymentOptions = PAYMENT_STATUSES.includes(paymentStatus) ? PAYMENT_STATUSES : [paymentStatus, ...PAYMENT_STATUSES];

  const save = async () => {
    setSaving(true);
    try {
      await adminFetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: {
          orderStatus: status !== orderStatus ? status : undefined,
          paymentStatus: payment !== paymentStatus ? payment : undefined,
        },
      });
      toast.success("Status yeniləndi.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await adminFetch(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
      toast.success("Sifariş silindi.");
      router.push("/admin/orders");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Card title="Status">
      <div className="space-y-4 px-5 py-4">
        <Field label="Sifarişin statusu" hint="Dəyişəndə müştəriyə e-poçt bildirişi gedir.">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ödəniş statusu">
          <Select value={payment} onChange={(e) => setPayment(e.target.value)}>
            {paymentOptions.map((s) => (
              <option key={s} value={s}>{paymentLabel(s).label}</option>
            ))}
          </Select>
        </Field>
        <Button variant="primary" className="w-full" disabled={!dirty} loading={saving} onClick={save}>
          Yadda saxla
        </Button>
        {waDigits(customerPhone).length >= 10 && (
          <a
            href={`https://wa.me/${waDigits(customerPhone)}?text=${encodeURIComponent(statusMessage({ name: customerName, orderId: id, status, trackingCode }))}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            Müştəriyə WhatsApp ilə yaz
          </a>
        )}
        <p className="-mt-2 text-xs text-stone-500">Seçilmiş statusa uyğun hazır mesaj və izləmə linki ilə açılır; göndərməzdən əvvəl dəyişə bilərsiniz.</p>
        <div className="border-t border-stone-200 pt-4">
          <ConfirmButton onConfirm={remove}>Sifarişi sil</ConfirmButton>
        </div>
      </div>
    </Card>
  );
}
