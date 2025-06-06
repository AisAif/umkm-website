import * as React from 'react'
import { Bot, Home } from 'lucide-react'

import { NavMain } from '~/components/nav-main'
import { NavUser } from '~/components/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from '~/components/ui/sidebar'
import { Head, usePage } from '@inertiajs/react'
import { SharedProps } from '@adonisjs/inertia/types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = usePage().props.user as SharedProps['user']
  return (
    <Sidebar collapsible="icon" {...props}>
      <Head title="Dashboard" />
      <SidebarContent>
        <NavMain
          items={[
            {
              title: 'Overview',
              url: '/dashboard',
              icon: Home,
              items: [
                {
                  title: 'Summary',
                  url: '/dashboard',
                },
                {
                  title: 'Produk',
                  url: '/dashboard/overview/product',
                },
              ],
            },
            {
              title: 'Bot',
              url: '/dashboard/bot',
              icon: Bot,
              items: [
                {
                  title: 'Model',
                  url: '/dashboard/bot/model',
                },
                {
                  title: 'Dataset',
                  url: '/dashboard/bot/dataset',
                },
                {
                  title: 'Response',
                  url: '/dashboard/bot/response',
                },
                {
                  title: 'Story',
                  url: '/dashboard/bot/story',
                },
                {
                  title: 'Rule',
                  url: '/dashboard/bot/rule',
                },
                {
                  title: 'Integration',
                  url: '/dashboard/bot/integration',
                },
              ],
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.fullName ?? '',
            email: user?.email ?? '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
