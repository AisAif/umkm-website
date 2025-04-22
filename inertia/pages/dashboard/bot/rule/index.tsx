import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import BotsController from '#controllers/bots_controller'
import { DataTable } from '~/components/data-table'
import { columns } from './column'
import Rule from '#models/rule'
import GeneralPagination from '~/components/general-pagination'
import { Head } from '@inertiajs/react'
import Header from '~/components/header'
import RuleMutation from './mutation'
import DatasetFilter from './filter'
import { Button } from '~/components/ui/button'

export default function Page({ rules }: InferPageProps<BotsController, 'getRule'>) {
  return (
    <SidebarProvider>
      <Head title="Rule" />
      <AppSidebar />
      <SidebarInset>
        <Header title="Rule">
          <Button asChild>
            <RuleMutation key="add" method="post" title="Add Rule" url="/dashboard/bot/rule">
              Add Rule
            </RuleMutation>
          </Button>
          <DatasetFilter />
        </Header>

        <DataTable columns={columns} data={rules.data as Rule[]} />
        <GeneralPagination meta={rules.meta} />
      </SidebarInset>
    </SidebarProvider>
  )
}
