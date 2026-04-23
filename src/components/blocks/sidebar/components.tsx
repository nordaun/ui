import Link from "next/link";
import registry from "../../../../registry.json";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";

export function SidebarComponents() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Components</SidebarGroupLabel>
      <SidebarMenu>
        {registry.items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <Link href={`/components/${item.name}`}>
              <SidebarMenuButton>{item.title}</SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
