import { Installation } from "@/components/blocks/intallation";
import registry from "../../../../registry.json";

type PageProps = {
  params: { name: string };
};

export default async function ComponentPage({ params }: PageProps) {
  const { name } = await params;
  const component = registry.items.find((i) => i.name === name);

  if (!component) return <div>Couldn't find this component</div>;

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{component.title}</h1>
        <h2 className="text-muted-foreground">{component.description}</h2>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Installation</h2>
        <Installation name={component.name} />
      </div>
    </div>
  );
}
