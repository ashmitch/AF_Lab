import type { Metadata } from "next";
import PolicyArticle from "../PolicyArticle";
import { policies } from "../policyContent";

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug];
  return {
    title: policy ? `${policy.title} | AF_Lab` : "Policy | AF_Lab",
    description: policy?.summary ?? "AF_Lab policies and information.",
  };
}

export default async function PolicySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PolicyArticle slug={slug} />;
}
