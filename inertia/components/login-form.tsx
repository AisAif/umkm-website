import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useForm, usePage } from '@inertiajs/react'
import { useEffect } from 'react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const allProps = usePage();
  const form = useForm({
    email: '',
    password: '',
  })

  useEffect(() => {
    console.log(allProps)
  }, [form])
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.post('/auth/login', {
                onSuccess: () => {
                  console.log('success')
                },
                onError: () => {
                  form.setData('password', '')
                }
              })
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={form.data.email}
                  onChange={(e) => form.setData('email', e.target.value)}
                  error={form.errors.email}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  value={form.data.password}
                  onChange={(e) => form.setData('password', e.target.value)}
                  error={form.errors.password}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
