import { useForm, usePage } from '@inertiajs/react'
import QueryString from 'qs'
import { useEffect, useState } from 'react'
import { Input } from '~/components/ui/input'
import { useDebounce } from 'use-debounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

const DatasetFilter = () => {
  const initialQuery = QueryString.parse(window.location.search, { ignoreQueryPrefix: true }) as {
    type: string
    search: string
    intent_id: string
  }
  const intents = usePage().props.intents as { id: number; name: string }[]

  const filterForm = useForm({
    ...initialQuery,
    page: 1,
  })

  const [searchDebounce] = useDebounce(filterForm.data.search, 500)

  useEffect(() => {
    if (
      filterForm.data.type === initialQuery.type &&
      filterForm.data.search === initialQuery.search &&
      filterForm.data.intent_id === initialQuery.intent_id
    )
      return
    filterForm.get('/dashboard/bot/dataset')
  }, [filterForm.data.type, searchDebounce, filterForm.data.intent_id])

  return (
    <div className="flex gap-2">
      <OptimizeDialog />
      <ExportUnlabeledDialog />

      <Select
        onValueChange={(filter) => {
          filterForm.setData('intent_id', filter)
        }}
        value={filterForm.data.intent_id}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Intent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {intents.map((intent) => (
            <SelectItem key={intent.id} value={intent.id.toString()}>
              {intent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(filter) => {
          filterForm.setData('type', filter)
        }}
        value={filterForm.data.type}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="labeled">Labeled</SelectItem>
          <SelectItem value="unlabeled">Unlabeled</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={filterForm.data.search}
        onChange={(e) => filterForm.setData('search', e.target.value)}
        type="text"
        placeholder="Search"
      />
    </div>
  )
}

const ExportUnlabeledDialog = () => {
  const [open, setOpen] = useState(false)
  const form = useForm({
    total: '50',
  })
  return (
    <Dialog {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger asChild>
        <Button>Export Unlabeled</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Dataset</DialogTitle>
        </DialogHeader>
        <form>
          <div className="flex flex-col gap-2">
            <label htmlFor="total">Total</label>
            <Input
              name="total"
              type="number"
              value={form.data.total}
              onChange={(e) => form.setData('total', e.target.value)}
              placeholder="Total"
            />
          </div>
        </form>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button asChild>
            <a href={'/dashboard/bot/dataset/export?total=' + form.data.total}>Export</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const OptimizeDialog = () => {
  const [open, setOpen] = useState(false)
  const form = useForm()
  return (
    <Dialog {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger>
        <Button>Optimize</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Optimize Dataset</DialogTitle>
        </DialogHeader>
        <DialogDescription>Do you really want to optimize the dataset?</DialogDescription>
        <DialogFooter>
          <Button
            onClick={(e) => {
              console.log('optimize')
              e.preventDefault()

              form.put('/dashboard/bot/dataset/optimize', {
                onSuccess: () => {
                  setOpen(false)
                },
                preserveState: false,
              })
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DatasetFilter
