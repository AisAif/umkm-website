import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import BotsController from '#controllers/bots_controller'
import { DataTable } from '~/components/data-table'
import { columns } from './column'
import Message from '#models/message'
import GeneralPagination from '~/components/general-pagination'
import { Head } from '@inertiajs/react'
import Header from '../../../../components/header'
import AddDataset from './add'
import DatasetFilter from './filter'

export default function Page({ datasets }: InferPageProps<BotsController, 'getDataset'>) {
  return (
    <SidebarProvider>
      <Head title="Dataset" />

      <AppSidebar />

      <SidebarInset>
        <Header title="Dataset">
          <AddDataset />
          <DatasetFilter  />
        </Header>

        <DataTable columns={columns} data={datasets.data as Message[]} />

        <GeneralPagination meta={datasets.meta} />
      </SidebarInset>
    </SidebarProvider>
  )
}
