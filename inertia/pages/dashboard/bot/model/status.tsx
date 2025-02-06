import { router } from '@inertiajs/react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'
const Status = () => {
  const [status, setStatus] = useState<{
    onProcess: boolean
    processValue?: number
    success: boolean
    name: 'train' | 'deploy'
  } | null>()

  useEffect(() => {
    axios.get('/dashboard/bot/model/status').then((res) => {
      setStatus(res.data)
    })
  }, [])

  useEffect(() => {
    if (!status?.name) return
    if (!status.onProcess) {
      router.visit(window.location.href, {
        replace: true,
      })
    }
    const interval = setInterval(() => {
      axios.get('/dashboard/bot/model/status').then((res) => setStatus(res.data))
    }, 500)

    return () => clearInterval(interval)
  }, [status])
  return (
    status &&
    status.name && (
      <div className="w-full flex flex-col gap-2 items-center justify-center">
        <Progress value={status.onProcess ? status.processValue : status.success ? 100 : 0} />
        <p
          className={cn(
            'text-sm',
            status.success && (status.success ? 'text-green-600' : 'text-red-600')
          )}
        >
          {status.name === 'train' ? 'Training' : 'Activating'}{' '}
          {status.success ? (status.success ? 'success' : 'failed') : 'in progress...'}
        </p>
      </div>
    )
  )
}

export default Status
