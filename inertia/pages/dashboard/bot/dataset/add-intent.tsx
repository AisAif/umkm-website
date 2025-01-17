import { useForm } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
const AddIntent = () => {
  const form = useForm({
    name: '',
  })
  return (
    <div className="flex gap-2 items-center justify-between">
      <Input
        value={form.data.name}
        onChange={(e) => form.setData('name', e.target.value)}
        placeholder="New intent"
      />
      <Button
        size={'sm'}
        className="rounded-lg"
        onClick={() => form.post('/dashboard/bot/intent/add', { onSuccess: () => form.reset() })}
      >
        <Plus />
      </Button>
    </div>
  )
}

export default AddIntent
