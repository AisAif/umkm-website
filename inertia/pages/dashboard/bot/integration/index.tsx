import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import { Head, useForm } from '@inertiajs/react'
import Header from '~/components/header'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import BotsController from '#controllers/bots_controller'
import { Button } from '~/components/ui/button'

export default function Page({ providers }: InferPageProps<BotsController, 'getIntegration'>) {
  const toggleActivateForm = useForm({
    providers,
  })
  return (
    <SidebarProvider>
      <Head title="Integration" />
      <AppSidebar />
      <SidebarInset>
        <Header title="Integration" />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            toggleActivateForm.post('/dashboard/bot/integration/toggle-activate')
          }}
          className="flex flex-col gap-2 border p-4 rounded-md"
        >
          {toggleActivateForm.data.providers.map((prov) => {
            return (
              <Label className="flex gap-2 items-center justify-between">
                <span>{prov.name}</span>
                <Switch
                  checked={prov.isActive}
                  onCheckedChange={(e) => {
                    toggleActivateForm.setData(
                      'providers',
                      toggleActivateForm.data.providers.map((p) => ({
                        ...p,
                        isActive: p.name === prov.name ? e : p.isActive,
                      }))
                    )
                  }}
                />
              </Label>
            )
          })}
          <Button className="w-fit self-end mt-4" type="submit">
            Save
          </Button>
        </form>
      </SidebarInset>
    </SidebarProvider>
  )
}
