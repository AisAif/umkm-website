import { useForm } from '@inertiajs/react'
import QueryString from 'qs'
import { useEffect } from 'react'
import { Input } from '~/components/ui/input'
import { useDebounce } from 'use-debounce'

const DatasetFilter = () => {
  const initialQuery = QueryString.parse(window.location.search, { ignoreQueryPrefix: true }) as {
    search: string
  }

  const filterForm = useForm({
    ...initialQuery,
    page: 1,
  })

  const [searchDebounce] = useDebounce(filterForm.data.search, 500)

  useEffect(() => {
    if (filterForm.data.search === initialQuery.search) return
    filterForm.get('/dashboard/bot/response', {
      preserveState: true,
    })
  }, [searchDebounce])

  return (
    <div className="flex gap-2">
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
