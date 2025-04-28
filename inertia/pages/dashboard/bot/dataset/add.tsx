import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import DatasetMutation from './mutation'

const AddDataset = () => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger>
        <Button>Add Dataset</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Choose Method</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList>
            <TabsTrigger value="file">Via Exported Meta</TabsTrigger>
            <TabsTrigger value="form">Via Form</TabsTrigger>
            <TabsTrigger value="json">Via JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <UploadViaFile onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="form">
            <div className="flex flex-col justify-center items-center py-20">
              <DatasetMutation
                method="post"
                title="Edit"
                url={`/dashboard/bot/dataset/`}
                key={`add-dataset`}
              >
                <Button className="text-sm py-2 w-fit" variant={'outline'}>
                  Add Dataset
                </Button>
              </DatasetMutation>
            </div>
          </TabsContent>
          <TabsContent value="json">
            <UploadVIaJson onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AddDataset

const UploadViaFile = ({ onSuccess }: { onSuccess?: () => void }) => {
  const form = useForm<{ files: FileList | null }>({
    files: null,
  })
  return (
    <Label className="flex flex-col gap-2 p-10 justify-center items-center">
      <Button variant={'outline'} asChild={true}>
        <span>Select File</span>
      </Button>
      <Input
        type="file"
        accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
        onChange={(e) => form.setData('files', e.target.files)}
        className="hidden"
      />
      {form.data.files && form.data.files?.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            {Array.from(form.data.files).map((file, index) => (
              <p key={index} className="text-sm text-slate-500">
                {file.name} | {file.size} bytes | type: {file.type}
              </p>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() =>
              form.post('/dashboard/bot/dataset/add/file', {
                onSuccess: () => {
                  form.reset()
                  onSuccess?.()
                  router.visit(window.location.href, {
                    replace: true,
                  })
                },
              })
            }
          >
            Upload
          </Button>
        </div>
      )}
    </Label>
  )
}

const UploadVIaJson = ({ onSuccess }: { onSuccess?: () => void }) => {
  const form = useForm<{ files: FileList | null }>({
    files: null,
  })

  return (
    <Label className="flex flex-col gap-2 p-10 justify-center items-center">
      <Button variant={'outline'} asChild={true}>
        <span>Select File</span>
      </Button>
      <Input
        type="file"
        accept="application/json"
        onChange={(e) => form.setData('files', e.target.files)}
        className="hidden"
      />
      {form.data.files && form.data.files?.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            {Array.from(form.data.files).map((file, index) => (
              <p key={index} className="text-sm text-slate-500">
                {file.name} | {file.size} bytes | type: {file.type}
              </p>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() =>
              form.post('/dashboard/bot/dataset/add/json', {
                onSuccess: () => {
                  form.reset()
                  onSuccess?.()
                  router.visit(window.location.href, {
                    replace: true,
                  })
                },
              })
            }
          >
            Upload
          </Button>
        </div>
      )}
    </Label>
  )
}
