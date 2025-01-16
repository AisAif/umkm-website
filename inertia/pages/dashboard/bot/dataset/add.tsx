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
import { useForm } from '@inertiajs/react'
import { useState } from 'react'

const AddDataset = () => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog {...{ open, onOpenChange: setOpen }}>
      <DialogTrigger>
        <Button>Add Dataset</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-slate-800">Choose Method</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList>
            <TabsTrigger value="file">Via File (Exported Meta Account Message)</TabsTrigger>
            <TabsTrigger value="form">Via Form</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <UploadViaFile onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="form">Form</TabsContent>
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
