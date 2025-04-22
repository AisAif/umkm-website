import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import BotsController from '#controllers/bots_controller'
import { DataTable } from '~/components/data-table'
import { columns } from './column'
import Response from '#models/response'
import GeneralPagination from '~/components/general-pagination'
import { Head } from '@inertiajs/react'
import Header from '~/components/header'
import ResponseMutation from './mutation'
import DatasetFilter from './filter'
import { Button } from '~/components/ui/button'

export default function Page({ responses }: InferPageProps<BotsController, 'getResponse'>) {
  return (
    <SidebarProvider>
      <Head title="Response" />
      <AppSidebar />
      <SidebarInset>
        <Header title="Response">
          <Button asChild>
            <ResponseMutation
              key="add"
              method="post"
              title="Add Response"
              url="/dashboard/bot/response"
            >
              Add Response
            </ResponseMutation>
          </Button>
          <DatasetFilter />
        </Header>

        <DataTable columns={columns} data={responses.data as Response[]} />
        <GeneralPagination meta={responses.meta} />
      </SidebarInset>
    </SidebarProvider>
  )
}
