"use client";

import { useParams } from "next/navigation";
import ArticleDetailClient from "@/components/articles/ArticleDetail";

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <ArticleDetailClient id={id} />;
}
