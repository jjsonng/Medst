import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import AuthChecker from "@/components/auth-checker";

export default function Page() {
  return (
    <AuthChecker>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"></header>
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold">AI Health Assistant</h1>
            <h2 className="text-lg mt-5 mb-10">
              Ask questions, get summaries, and receive insights about your
              health.
            </h2>
            <div className="flex-1 flex justify-center">
              <div className="w-[1300px] h-[750px] bg-white dark:bg-neutral-800 shadow-xl rounded-2xl flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto text-sm text-black dark:text-white justify-left items-left">
                </div>
                <div className="p-3 border-t border-neutral-300 dark:border-neutral-700 flex items-center gap-2 flex-shrink-0">
                  <Input placeholder="Ask about your health records..." className="flex-1"/>
                  <Button><Send/></Button>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthChecker>
  );
}
