import Product from '#models/product'
import type { PageProps } from '@adonisjs/inertia/types'
import { Head, usePage } from '@inertiajs/react'
import LandingPageLayout from '~/components/layouts/landing.page.layout'
import ProductCard from '~/components/product'

interface ProductPageProps extends PageProps {
  products: Product[]
}

const ProductList = () => {
  const page = usePage<ProductPageProps>()
  //   console.log(page.props.products)
  return (
    <LandingPageLayout>
      <Head title="Products" />
      <div className="flex flex-col gap-4 items-center py-10 border-b-2 border-gray-300 w-full  max-w-screen-2xl">
        <h1 className="text-2xl md:text-4xl font-bold">Produk Kami</h1>
        <p className="text-gray-600">
          Sebagai partner resmi AES, kami menawarkan produk dengan teknologi terkini yang menjamin
          ketahanan, performa, dan estetika maksimal.
        </p>
      </div>
      <div id="products" className="w-full flex flex-col gap-8 py-10 max-w-screen-2xl">
        <div className="w-full grid lg:grid-cols-3 md:grid-cols-2">
          {page.props.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </LandingPageLayout>
  )
}

export default ProductList
