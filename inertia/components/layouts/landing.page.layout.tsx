import { Link, usePage } from '@inertiajs/react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '~/lib/utils'

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="flex flex-col justify-between items-center px-4 md:px-12 mt-24">
        {children}
      </div>
      <Footer />
    </>
  )
}

const Nav = () => {
  const { url } = usePage()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="flex justify-between items-center gap-5 px-4 md:px-12 py-6 max-h-24 bg-gray-100 border-y-[1px] fixed top-0 left-0 w-full z-[100000]">
      <img className="w-32 rounded-lg" src="/advance-logo.jpg" alt="logo" />
      <nav className="hidden md:flex gap-5 justify-between items-center">
        <Link
          href="/"
          className={cn('hover:border-b-[2px] border-black', url === '/' ? 'border-b-[2px]' : '')}
        >
          Home
        </Link>
        <Link
          href="#about"
          className={cn(
            'hover:border-b-[2px] border-black',
            url.includes('#about') ? 'border-b-[2px]' : ''
          )}
        >
          Tentang Kami
        </Link>
        <Link
          href="#services"
          className={cn(
            'hover:border-b-[2px] border-black',
            url.includes('#services') ? 'border-b-[2px]' : ''
          )}
        >
          Layanan
        </Link>
        <Button onClick={() => window.open('https://wa.me/+62882003475593', '_blank')} size="lg">
          Hubungi Kami
        </Button>
      </nav>
      <span
        onClick={() => setIsOpen(!isOpen)}
        className="block md:hidden material-symbols-outlined text-4xl"
      >
        {isOpen ? 'close' : 'menu'}
      </span>
      <nav
        className={cn(
          'md:hidden flex-col justify-between items-center absolute w-full top-24 left-0 bg-gray-100',
          isOpen ? 'flex' : 'hidden'
        )}
      >
        <Link
          href="/"
          className={cn(
            'p-4 border-y-[1px] w-full border-slate-300',
            url === '/' ? 'bg-slate-200' : ''
          )}
        >
          Home
        </Link>
        <Link
          href="#about"
          className={cn(
            'p-4 border-y-[1px] w-full border-slate-300',
            url.includes('#about') ? 'bg-slate-200' : ''
          )}
        >
          Tentang Kami
        </Link>
        <Link
          href="#services"
          className={cn(
            'p-4 border-y-[1px] w-full border-slate-300',
            url.includes('#services') ? 'bg-slate-200' : ''
          )}
        >
          Layanan
        </Link>
        <div className="w-full flex justify-center p-4">
          <Button onClick={() => window.open('https://wa.me/+62882003475593', '_blank')} size="lg">
            Hubungi Kami
          </Button>
        </div>
      </nav>
    </div>
  )
}

const Footer = () => {
  return (
    <div className="flex justify-between items-center gap-5 px-4 md:px-12 py-6 max-h-24 bg-gray-100 border-y-[1px] w-full">
      <span className="text-sm">© 2024 Obex Customlamp, All rights reserved.</span>
    </div>
  )
}
