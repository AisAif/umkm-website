import Product from '#models/product'
import { Link } from '@inertiajs/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="w-full flex flex-col bg-gray-100 p-4 gap-4">
      <img src={product.image} alt="Product" className="" />
      <div className="flex flex-col gap-2">
        <h2 className="md:text-2xl text-lg font-bold">{product.name}</h2>
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
      </div>
      <Button asChild>
        <Link href={`/product/${product.id}`}>Detail</Link>
      </Button>
    </div>
  )
}

export default ProductCard
