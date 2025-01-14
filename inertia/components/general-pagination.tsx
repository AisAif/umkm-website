import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'

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
      <PaginationContent>
        <PaginationItem>
          {meta.previousPageUrl && <PaginationPrevious href={meta.previousPageUrl} />}
        </PaginationItem>
        <PaginationItem>
          {meta.nextPageUrl && <PaginationNext href={meta.nextPageUrl} />}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
export default GeneralPagination
