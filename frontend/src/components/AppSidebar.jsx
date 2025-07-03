import { Gamepad2, Trophy } from "lucide-react";
import { NavUser } from "@/components/NavUser.jsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroupContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const data = {
  menu: [
    {
      title: "Game",
      url: "/dashboard/game",
      icon: Gamepad2,
    },
    {
      title: "Leaderboard",
      url: "/dashboard/leaderboard",
      icon: Trophy,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { user } = useAuthStore();

  // Default user data in case auth user is not available
  const userData = user
    ? {
        name: user.name || "User",
        email: user.email || "",
        avatar: user.avatar || "",
      }
    : {
        name: "Guest",
        email: "Not logged in",
        avatar: "",
      };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={userData} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <SidebarGroupLabel>App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.menu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
