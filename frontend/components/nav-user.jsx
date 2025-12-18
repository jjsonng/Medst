"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Unknown User",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch the logged-in user's info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await fetch("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        setUser({
          name: data.full_name || "Unknown User",
          email: data.email || "",
          avatar: data.avatar_url || "", // optional avatar
        });
      } catch (err) {
        console.error("Error fetching current user:", err);
        setUser({ name: "Unknown User", email: "", avatar: "" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogOut = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  if (loading) return null; // or a spinner

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name ? user.name[0] : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={handleLogOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}