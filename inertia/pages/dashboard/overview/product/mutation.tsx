import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useState } from 'react'
import { Label } from '~/components/ui/label'
import {
  useForm,
  // usePage,
} from '@inertiajs/react'
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from '~/components/ui/select'
import Product from '#models/product'
import { Input } from '~/components/ui/input'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import ErrorText from '~/components/ui/error-text'

export interface ProductMutationInterface {
  url: string
  method: 'post' | 'put'
  title: string
  children: React.ReactNode
  product?: Product
}

const ProductMutation = ({ children, url, method, product }: ProductMutationInterface) => {
  const [open, setOpen] = useState(false)
  const form = useForm<{
    name: string
    description: string
    image: File | null
    starting_price: number
  }>({
    name: product ? product.name : '',
    description: product ? product.description : '',
    image: null,
    starting_price: product ? product.startingPrice : 0,
  })
  return (
    <Dialog key={`dialog-${url}`} {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-slate-800">Fill The Form</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (method === 'post') {
                form.post(url, {
                  onSuccess: () => {
                    form.reset()
                    setOpen(false)
                  },
                })
              } else if (method === 'put') {
                form.put(url, {
                  onSuccess: () => {
                    setOpen(false)
                  },
                })
              }
            }}
            className="flex flex-col gap-4"
          >
            <Label className="flex flex-col gap-2" htmlFor="name">
              Product Name
              <Input
                id="name"
                onChange={(e) => form.setData('name', e.target.value)}
                name="name"
                className="p-2"
                value={form.data.name}
              />
              {form.errors.name && <ErrorText>{form.errors.name}</ErrorText>}
            </Label>
            <Label className="flex flex-col gap-2" htmlFor="image">
              Image
              <Input
                id="image"
                type="file"
                onChange={(e) => form.setData('image', e.target.files && e.target.files[0])}
                name="image"
                className="p-2"
              />
              {form.errors.image && <ErrorText>{form.errors.image}</ErrorText>}
            </Label>
            <Label className="flex flex-col gap-2" htmlFor="starting_price">
              Start Price
              <Input
                id="starting_price"
                type="number"
                onChange={(e) => form.setData('starting_price', Number(e.target.value))}
                name="starting_price"
                className="p-2"
                value={form.data.starting_price}
              />
              {form.errors.starting_price && <ErrorText>{form.errors.starting_price}</ErrorText>}
            </Label>
            <Label className="flex flex-col gap-2 max-h-fit" htmlFor="content">
              Description
              <ReactQuill
                theme="snow"
                value={form.data.description}
                onChange={(e) => form.setData('description', e)}
              />
              {form.errors.description && <ErrorText>{form.errors.description}</ErrorText>}
            </Label>
            <Button type="submit">Submit</Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default ProductMutation
