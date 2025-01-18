import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import BotsController from '#controllers/bots_controller'
import { DataTable } from '~/components/data-table'
import { columns } from './column'
import Story from '#models/story'
import GeneralPagination from '~/components/general-pagination'
import { Head } from '@inertiajs/react'
import Header from '~/components/header'
import StoryMutation from './mutation'
import DatasetFilter from './filter'
import { Button } from '~/components/ui/button'

export default function Page({ stories }: InferPageProps<BotsController, 'getStory'>) {
  return (
    <SidebarProvider>
      <Head title="Story" />
      <AppSidebar />
      <SidebarInset>
        <Header title="Story">
          <Button asChild>
            <StoryMutation key="add" method="post" title="Add Story" url="/dashboard/bot/story">
              Add Story
            </StoryMutation>
          </Button>
          <DatasetFilter />
        </Header>

        <DataTable columns={columns} data={stories.data as Story[]} />
        <GeneralPagination meta={stories.meta} />
      </SidebarInset>
    </SidebarProvider>
  )
}
