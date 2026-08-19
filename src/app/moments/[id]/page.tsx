"use client";

import { useParams } from "next/navigation";
import MomentDetailClient from "@/components/moments/MomentDetail";

export default function MomentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <MomentDetailClient id={id} />;
}
