import Product from '#models/product'
import type { PageProps } from '@adonisjs/inertia/types'
import { Head, Link, usePage } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'
import LandingPageLayout from '~/components/layouts/landing.page.layout'
import ProductCard from '~/components/product'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

interface ProductPageProps extends PageProps {
  products: Product[]
  product: Product
}

const ProductList = () => {
  const { product, products } = usePage<ProductPageProps>().props
  //   console.log(page.props.products)
  return (
    <LandingPageLayout>
      <Head title="Detail Produk" />
      <div className="flex flex-col md:flex-row gap-8 justify-between py-10 w-full max-w-screen-2xl">
        <img src={product.image} alt="product-thumbnail" className="md:w-[35%]" />
        <div className="flex flex-col gap-4 md:w-[65%]">
          <h1 className="text-2xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-gray-600">
            Start Price:{' '}
            <span className="font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                product.startingPrice
              )}
            </span>
          </p>
          <div className="flex gap-2">
            {product.tags?.slice(0, 3).map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
            {product.tags?.length > 3 && <Badge>{product.tags?.length}+</Badge>}
          </div>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </div>
      <div id="products" className="w-full flex flex-col gap-8 py-20 max-w-screen-2xl">
        <div className="flex gap-4 justify-between">
          <h1 className="text-2xl md:text-4xl font-bold">Produk Kami Lainnya</h1>
          <Button asChild>
            <Link href="/product">
              Lihat Semua <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="w-full grid lg:grid-cols-3 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </LandingPageLayout>
  )
}

export default ProductList
