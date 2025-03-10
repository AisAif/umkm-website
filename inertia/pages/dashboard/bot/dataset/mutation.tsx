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
import { useForm, usePage } from '@inertiajs/react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import Intent from '#models/intent'

export interface DatasetMutationInterface {
  url: string
  method: 'post' | 'put'
  title: string
  children: React.ReactNode
  className?: string
  formContent?: {
    content: string
    intentId?: number
  }
}

const DatasetMutation = ({
  children,
  url,
  method,
  formContent = { content: '' },
  className,
}: DatasetMutationInterface) => {
  const [open, setOpen] = useState(false)
  const form = useForm(formContent)
  const intents = usePage().props.intents as Intent[]
  return (
    <Dialog key={`dialog-${url}`} {...{ open, onOpenChange: setOpen }}>
      <Button asChild className="my-8">
        <DialogTrigger className={className}>
          {children}
        </DialogTrigger>
      </Button>
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
            <Label className="flex flex-col gap-2" htmlFor="content">
              Content
              <textarea
                id="content"
                onChange={(e) => form.setData('content', e.target.value)}
                name="content"
                rows={16}
                className="p-2"
              >
                {form.data.content}
              </textarea>
            </Label>
            <Select
              onValueChange={(e) => form.setData('intentId', parseInt(e))}
              defaultValue={form.data.intentId ? form.data.intentId.toString() : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Intent...</SelectLabel>
                  {intents.map((intent) => (
                    <SelectItem key={intent.id} value={intent.id.toString()}>
                      {intent.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button type="submit">Submit</Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default DatasetMutation
