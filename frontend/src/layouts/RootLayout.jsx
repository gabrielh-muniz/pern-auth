import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
}

export default RootLayout;
