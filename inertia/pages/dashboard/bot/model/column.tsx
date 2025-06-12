import BotModel from '#models/bot_model'
import { Link, router } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

export const columns: ColumnDef<BotModel>[] = [
  {
    header: 'No.',
    cell: ({ row }) => {
      const page = window.location.search.split('page=')[1]
      return row.index + 1 + (page ? (parseInt(page) - 1) * 10 : 0)
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => {
      return getValue() ? 'Active' : 'Inactive'
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string)
      return date.toLocaleDateString()
    },
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
      const [open, setOpen] = useState(false)
      return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/bot/model/${row.original.id}/activate`}
                method="put"
                onSuccess={() => {
                  console.log('success')
                  router.visit(window.location.href, {
                    replace: true,
                  })
                }}
                as="button"
                onClick={() => setOpen(false)}
              >
                Activate
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/bot/model/${row.original.name.replace(/\.tar\.gz$/, '')}/evaluation`}
                as="button"
                onClick={() => setOpen(false)}
              >
                Open Evaluation
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
