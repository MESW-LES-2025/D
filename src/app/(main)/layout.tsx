import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

export default function Layout({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {header}
        <main className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
