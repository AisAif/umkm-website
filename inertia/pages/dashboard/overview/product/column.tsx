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
import AddTad from './add-tag'
import ProductMutation from './mutation'
import Product from '#models/product'

export const columns: ColumnDef<Product>[] = [
  {
    header: 'No.',
    cell: ({ row }) => {
      const page = window.location.search.split('page=')[1]
      return row.index + 1 + (page ? (parseInt(page) - 1) * 10 : 0)
    },
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
  },
  {
    accessorKey: 'startingPrice',
    header: 'Starting Price',
    cell: ({ row }) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
        row.original.startingPrice
      )
    },
  },
  {
    accessorKey: 'tag',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = usePage().props.tags as { id: number; name: string }[]
      const [open, setOpen] = useState(false)

      const toggleAttachTagForm = useForm()
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
              {row.original.tags.length
                ? row.original.tags
                    .filter((_, i) => i < 2)
                    .map((tag) => tag.name)
                    .join(', ')
                : 'Select tag...'}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search tag..." />
              <CommandList>
                <CommandGroup>
                  <CommandItem>
                    <AddTad />
                  </CommandItem>
                </CommandGroup>
                <CommandEmpty>No tag found.</CommandEmpty>
                <CommandGroup>
                  {tags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => {
                        toggleAttachTagForm.put(
                          `/dashboard/overview/tag/${tag.id}/product/${row.original.id}`
                        )
                        setOpen(false)
                      }}
                    >
                      <div className="flex justify-between items-center gap-2 w-full">
                        <span className="max-w-[100px] break-words">{tag.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteForm.delete(`/dashboard/overview/tag/${tag.id}`)
                            }}
                          >
                            <Trash className="text-red-700" />
                          </button>
                          <Check
                            className={cn(
                              row.original.tags.some((t) => t.id === tag.id)
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
            <ProductMutation
              method="put"
              title="Edit"
              url={`/dashboard/overview/product/${row.original.id}`}
              product={row.original}
              key={`edit-${row.original.id}`}
            >
              <button className="w-full text-sm py-2">Edit</button>
            </ProductMutation>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/overview/product/${row.original.id}/`}
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
