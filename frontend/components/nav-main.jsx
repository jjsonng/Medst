"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function NavMain({ items }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <div className="flex justify-start">
        <Image src="/logo.png" alt="App Logo" width={80} height={80} />
        <div className="flex flex-col ml-3">
          <span className="font-bold text-lg mb-1">MEDST </span>
          <span className="text-sm text-gray-400 block">
            Your health. <br></br> Your control.
          </span>
        </div>
      </div>

      <hr className="my-3 border-gray-200"></hr>

      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;

          return (
            <Collapsible key={item.title} defaultOpen={isActive}>
              <SidebarMenuItem className="py-1.5">
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`flex items-center gap-2 h-12 ${
                      isActive ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
