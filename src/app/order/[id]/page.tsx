import SiteShell from "@/components/layout/SiteShell";
import OrderView from "@/components/sections/OrderView";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (<SiteShell><OrderView id={id} /></SiteShell>);
}
