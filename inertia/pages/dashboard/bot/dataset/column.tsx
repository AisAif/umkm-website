import Message from '#models/message'
import { Link } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

export const columns: ColumnDef<Message>[] = [
  {
    header: 'No.',
    cell: ({ row }) => {
      const page = window.location.search.split('page=')[1]
      return row.index + 1 + (page ? (parseInt(page) - 1) * 10 : 0)
    },
  },
  {
    accessorKey: 'content',
    header: 'Content',
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
                as="button"
                onClick={() => setOpen(false)}
              >
                Activate
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
