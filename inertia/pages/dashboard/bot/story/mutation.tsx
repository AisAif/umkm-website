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
import { useForm, usePage } from '@inertiajs/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import Intent from '#models/intent'
import Response from '#models/response'
import { Separator } from '~/components/ui/separator'
import { Plus } from 'lucide-react'

export interface StoryMutationInterface {
  url: string
  method: 'post' | 'put'
  title: string
  children: React.ReactNode
  className?: string
  formContent?: {
    name: string
    steps: {
      position: number
      intentId: null | number
      responseId: null | number
    }[]
  }
}

const StoryMutation = ({
  children,
  url,
  method,
  formContent = {
    name: '',
    steps: [
      {
        position: 1,
        intentId: null,
        responseId: null,
      },
    ],
  },
  className,
}: StoryMutationInterface) => {
  const intents = usePage().props.intents as Intent[]
  const responses = usePage().props.responses as Response[]
  const [open, setOpen] = useState(false)
  const form = useForm(formContent)
  return (
    <Dialog key={`dialog-${url}`} {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger className={className} asChild>
        <button onClick={() => setOpen(true)}>{children}</button>
      </DialogTrigger>
      <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
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
              Steps
              {form.data.steps
                ?.sort((a, b) => a.position - b.position)
                .map((step, index) => {
                  return (
                    <div key={index} className="flex h-32 items-center space-x-4 text-sm">
                      <Separator orientation="vertical" className="ml-4" />
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex gap-2 items-center justify-between">
                          <Label>Intent</Label>
                          <Select
                            onValueChange={(value) => {
                              form.setData(
                                'steps',
                                form.data.steps?.map((step, i) => {
                                  if (i === index) {
                                    return {
                                      ...step,
                                      intentId: parseInt(value),
                                    }
                                  }
                                  return step
                                })
                              )
                            }}
                            value={step.intentId?.toString()}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select Intent" />
                            </SelectTrigger>
                            <SelectContent>
                              {intents.map((intent) => {
                                return (
                                  <SelectItem key={intent.id} value={intent.id.toString()}>
                                    {intent.name}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 items-center justify-between">
                          <Label>Response</Label>
                          <Select
                            onValueChange={(value) => {
                              form.setData(
                                'steps',
                                form.data.steps?.map((step, i) => {
                                  if (i === index) {
                                    return {
                                      ...step,
                                      responseId: parseInt(value),
                                    }
                                  }
                                  return step
                                })
                              )
                            }}
                            value={step.responseId?.toString()}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select Response" />
                            </SelectTrigger>
                            <SelectContent>
                              {responses.map((response) => {
                                return (
                                  <SelectItem key={response.id} value={response.id.toString()}>
                                    {response.name}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            form.setData(
                              'steps',
                              form.data.steps?.filter((_, i) => i !== index)
                            )
                          }}
                          className="text-red-500 underline w-fit self-end text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
            </Label>
            <button
              onClick={(e) => {
                e.preventDefault()
                form.setData('steps', [
                  ...form.data.steps,
                  {
                    position: form.data.steps.length + 1,
                    intentId: null,
                    responseId: null,
                  },
                ])
              }}
              className="ml-1 size-6 flex justify-center items-center text-blue-500 underline rounded-[100px] border border-blue-500"
            >
              <Plus size={12} />
            </button>
            <Button type="submit">Submit</Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default StoryMutation
