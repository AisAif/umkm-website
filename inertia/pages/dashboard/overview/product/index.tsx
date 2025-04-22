import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import type { InferPageProps } from '@adonisjs/inertia/types'
import ProductsController from '#controllers/products_controller'
import { DataTable } from '~/components/data-table'
import { columns } from './column'
import Product from '#models/product'
import GeneralPagination from '~/components/general-pagination'
import { Head } from '@inertiajs/react'
import Header from '~/components/header'
import ProductFilter from './filter'
import Status from '~/components/status'
import { Button } from '~/components/ui/button'
import ProductMutation from './mutation'

export default function Page({ products }: InferPageProps<ProductsController, 'index'>) {
  return (
    <SidebarProvider>
      <Head title="Product" />

      <AppSidebar />

      <SidebarInset>
        <Header title="Product">
          <ProductMutation
            method="post"
            title="Add"
            url={`/dashboard/overview/product/`}
            key={`add-product`}
          >
            <Button className="w-full text-sm py-2">Add</Button>
          </ProductMutation>
          <ProductFilter />
        </Header>
        <Status />

        <DataTable columns={columns} data={products.data as Product[]} />

        <GeneralPagination meta={products.meta} />
      </SidebarInset>
    </SidebarProvider>
  )
}
