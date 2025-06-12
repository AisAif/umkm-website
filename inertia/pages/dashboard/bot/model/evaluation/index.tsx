import { Head } from '@inertiajs/react'
import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import IntentChart from './intent-chart'
import IntentTable from './intent-table'

export default function Page() {
  return (
    <SidebarProvider>
      <Head title="Model Evaluation" />
      <AppSidebar />
      <SidebarInset>
        <div className="max-w-7xl mx-auto space-y-8">
          <IntentChart />
          <IntentTable />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
