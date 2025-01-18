import Story from '#models/story'
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
import StoryMutation from './mutation'

export const columns: ColumnDef<Story>[] = [
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
        <DropdownMenu key={`actions-${row.original.id}`} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <StoryMutation
              method="put"
              title="Edit"
              url={`/dashboard/bot/story/${row.original.id}`}
              formContent={{
                name: row.original.name,
                steps: row.original.steps,
              }}
              key={`edit-${row.original.id}`}
              className="w-full text-sm py-2"
            >
              Edit
            </StoryMutation>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/bot/story/${row.original.id}`}
                method="delete"
                as="button"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                Delete
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
