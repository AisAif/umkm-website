import { Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem } from '~/components/ui/pagination'
import { Separator } from './ui/separator'
import { cn } from '~/lib/utils'

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
  return (
    <Pagination>
      <PaginationContent className="flex items-center justify-between gap-2">
        {meta.firstPageUrl && (
          <>
            <PaginationItem>
              <Link
                className="text-slate-700 text-sm flex gap-1 items-center"
                href={`${meta.firstPageUrl.slice(1)}`}
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
                className="text-slate-700 text-sm flex gap-1 items-center"
                href={`${meta.previousPageUrl.slice(1)}`}
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
                  className={cn(
                    'text-slate-700 text-sm flex gap-1 items-center',
                    meta.currentPage == currentPage && 'font-bold text-slate-900'
                  )}
                  href={`?page=${currentPage}`}
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
                className="text-slate-700 text-sm flex gap-1 items-center"
                href={`${meta.nextPageUrl.slice(1)}`}
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
              className="text-slate-700 text-sm flex gap-1 items-center"
              href={`${meta.lastPageUrl.slice(1)}`}
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
