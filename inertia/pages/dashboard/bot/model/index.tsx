import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import BotsController from '#controllers/bots_controller'
import { DataTable } from '~/components/data-table'
import { columns } from './column'
import BotModel from '#models/bot_model'
import GeneralPagination from '~/components/general-pagination'
import { Head } from '@inertiajs/react'
import Header from '~/components/header'
import Train from './train'
import Status from './status'

export default function Page({ models }: InferPageProps<BotsController, 'index'>) {
  return (
    <SidebarProvider>
      <Head title="Model" />
      <AppSidebar />
      <SidebarInset>
        <Header title="Model">
          <Train />
        </Header>
        <Status />
        <DataTable columns={columns} data={models.data as BotModel[]} />
        <GeneralPagination meta={models.meta} />
      </SidebarInset>
    </SidebarProvider>
  )
}
