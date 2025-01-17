import { Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem } from '~/components/ui/pagination'
import { Separator } from './ui/separator'
import { cn } from '~/lib/utils'
import QueryString from 'qs'

const GeneralPagination = ({
  meta,
}: {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: null | string
    previousPageUrl: null | string
  }
}) => {
  const query = QueryString.parse(window.location.search, {
    ignoreQueryPrefix: true,
  })
  return (
    <Pagination>
      <PaginationContent className="flex items-center justify-between gap-2">
        {meta.firstPageUrl && (
          <>
            <PaginationItem>
              <Link
                data={{
                  ...query,
                  page: meta.firstPage,
                }}
                className="text-slate-700 text-sm flex gap-1 items-center"
                href=""
              >
                <ChevronsLeft className="h-4 w-4" />
              </Link>
            </PaginationItem>
            <Separator orientation="vertical" />
          </>
        )}
        {meta.previousPageUrl && (
          <>
            <PaginationItem>
              <Link
                data={{
                  ...query,
                  page: meta.currentPage - 1,
                }}
                className="text-slate-700 text-sm flex gap-1 items-center"
                href=""
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </PaginationItem>
            <Separator orientation="vertical" />
          </>
        )}
        {meta.currentPage > 3 && (
          <>
            ...
            <Separator orientation="vertical" />
          </>
        )}
        {Array.from({ length: 5 }, (_, index) => index + 1).map((page) => {
          const currentPage = meta.currentPage + page - 3
          if (currentPage < 1 || currentPage > meta.lastPage) return null
          return (
            <>
              <PaginationItem key={page}>
                <Link
                  data={{
                    ...query,
                    page: currentPage,
                  }}
                  className={cn(
                    'text-slate-700 text-sm flex gap-1 items-center',
                    meta.currentPage == currentPage && 'font-bold text-slate-900'
                  )}
                  href=""
                >
                  {currentPage}
                </Link>
              </PaginationItem>
              <Separator orientation="vertical" />
            </>
          )
        })}
        {meta.currentPage < meta.lastPage - 2 && (
          <>
            ...
            <Separator orientation="vertical" />
          </>
        )}
        {meta.nextPageUrl && (
          <>
            <PaginationItem>
              <Link
                data={{
                  ...query,
                  page: meta.currentPage + 1,
                }}
                className="text-slate-700 text-sm flex gap-1 items-center"
                href=""
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </PaginationItem>
            <Separator orientation="vertical" />
          </>
        )}
        {meta.lastPageUrl && (
          <PaginationItem>
            <Link
              data={{
                ...query,
                page: meta.lastPage,
              }}
              className="text-slate-700 text-sm flex gap-1 items-center"
              href=""
            >
              <ChevronsRight className="h-4 w-4" />
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
export default GeneralPagination
