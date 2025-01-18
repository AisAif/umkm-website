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
import { Input } from '~/components/ui/input'
import { useForm } from '@inertiajs/react'

export interface ResponseMutationInterface {
  url: string
  method: 'post' | 'put'
  title: string
  children: React.ReactNode
  className?: string
  formContent?: {
    name: string
    content: string
  }
}

const ResponseMutation = ({
  children,
  url,
  method,
  formContent = { name: '', content: '' },
  className,
}: ResponseMutationInterface) => {
  const [open, setOpen] = useState(false)
  const form = useForm(formContent)
  return (
    <Dialog key={`dialog-${url}`} {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger className={className} asChild>
        <button onClick={() => setOpen(true)}>{children}</button>
      </DialogTrigger>
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
                    setOpen(false)
                  },
                })
              } else if (method === 'put') {
                form.put(url, {
                  onSuccess: () => {
                    form.reset()
                    setOpen(false)
                  },
                })
              }
            }}
            className="flex flex-col gap-4"
          >
            <Label className="flex flex-col gap-2" htmlFor="name">
              Name
              <Input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                name="name"
                type="text"
              />
            </Label>
            <Label className="flex flex-col gap-2" htmlFor="content">
              Content
              <Input
                id="content"
                value={form.data.content}
                onChange={(e) => form.setData('content', e.target.value)}
                name="content"
                type="text"
              />
            </Label>
            <Button type="submit">Submit</Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default ResponseMutation
