import { useForm } from '@inertiajs/react'
import QueryString from 'qs'
import { useEffect } from 'react'
import { Input } from '~/components/ui/input'
import { useDebounce } from 'use-debounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const DatasetFilter = () => {
  const initialQuery = QueryString.parse(window.location.search, { ignoreQueryPrefix: true }) as {
    type: string
    search: string
  }

  const filterForm = useForm({
    ...initialQuery,
    page: 1,
  })

  const [searchDebounce] = useDebounce(filterForm.data.search, 500)

  useEffect(() => {
    if (
      filterForm.data.type === initialQuery.type &&
      filterForm.data.search === initialQuery.search
    )
      return
    filterForm.get('/dashboard/bot/dataset', {
      preserveState: true,
    })
  }, [filterForm.data.type, searchDebounce])

  return (
    <div className="flex gap-2">
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

export default DatasetFilter
