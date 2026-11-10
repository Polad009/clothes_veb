"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/admin/ui";

export function PrintButton({ label = "Çap et" }: { label?: string }) {
  return (
    <Button variant="primary" onClick={() => window.print()}>
      <Printer className="h-4 w-4" /> {label}
    </Button>
  );
}
