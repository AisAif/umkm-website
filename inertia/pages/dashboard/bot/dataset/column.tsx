import Message from '#models/message'
import { Link, useForm, usePage } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { Check, ChevronsUpDown, Ellipsis, Trash } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import AddIntent from './add-intent'
import DatasetMutation from './mutation'

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
    accessorKey: 'intent.name',
    header: 'Intent',
    cell: ({ row }) => {
      const intents = usePage().props.intents as { id: number; name: string }[]
      const [open, setOpen] = useState(false)

      const attachMessageForm = useForm()
      const deleteForm = useForm()
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {row.original.intent ? row.original.intent.name : 'Select intent...'}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search intent..." />
              <CommandList>
                <CommandGroup>
                  <CommandItem>
                    <AddIntent />
                  </CommandItem>
                </CommandGroup>
                <CommandEmpty>No intent found.</CommandEmpty>
                <CommandGroup>
                  {intents.map((intent) => (
                    <CommandItem
                      key={intent.id}
                      value={intent.name}
                      onSelect={() => {
                        attachMessageForm.post(
                          `/dashboard/bot/intent/${intent.id}/message/${row.original.id}`
                        )
                        setOpen(false)
                      }}
                    >
                      <div className="flex justify-between items-center gap-2 w-full">
                        {intent.name}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteForm.delete(`/dashboard/bot/intent/${intent.id}`)
                            }}
                          >
                            <Trash className="text-red-700" />
                          </button>
                          <Check
                            className={cn(
                              row.original.intent?.name === intent.name
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )
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
            <DatasetMutation
              method="put"
              title="Edit"
              url={`/dashboard/bot/dataset/${row.original.id}`}
              formContent={{
                content: row.original.content,
                intentId: row.original.intent?.id,
              }}
              key={`edit-${row.original.id}`}
              className="w-full text-sm py-2"
            >
              Edit
            </DatasetMutation>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/bot/dataset/${row.original.id}/`}
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
