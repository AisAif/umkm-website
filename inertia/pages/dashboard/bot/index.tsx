import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import BotsController from '#controllers/bots_controller'

export default function Page({ models }: InferPageProps<BotsController, 'index'>) {
  console.log(models)
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div>Model</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
