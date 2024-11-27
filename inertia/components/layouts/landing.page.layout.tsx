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
    <div className="flex justify-between items-center gap-5 px-4 md:px-12 md:py-6 py-3 bg-gray-100 border-y-[1px] fixed top-0 left-0 w-full z-[100000]">
      <img className="w-20 md:w-28 rounded-lg" src="/images/advance-logo.jpg" alt="logo" />
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
        className="block md:hidden material-symbols-outlined text-2xl"
      >
        {isOpen ? 'close' : 'menu'}
      </span>
      <nav
        className={cn(
          'md:hidden flex-col justify-between items-center absolute w-full top-14 left-0 bg-gray-100',
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
    <div className="flex flex-col justify-between md:items-center gap-5 px-4 md:px-12 py-6 bg-gray-100 border-y-[1px] w-full">
      <div className="w-full flex flex-col-reverse md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold text-center">Ada Pertanyaan?</p>
          <Button size="lg" onClick={() => window.open('https://wa.me/+62882003475593', '_blank')}>
            Hubungi Kami
          </Button>
        </div>
        <div className="flex gap-5">
          <a href="https://www.facebook.com/dcato.caters/?_rdr" target="_blank">
            <img className="size-5 md:size-8" src="/icons/fb.png" alt="fb" />
          </a>
          <a href="https://www.instagram.com/obex_customlamp/" target="_blank">
            <img className="size-5 md:size-8" src="/icons/ig.png" alt="ig" />
          </a>
          <a href="https://www.tiktok.com/@obex_customlamp/" target="_blank">
            <img className="size-5 md:size-8" src="/icons/tt.png" alt="tt" />
          </a>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center gap-1 text-center border-t-2 py-4">
        <p className="text-sm">© 2024 Obex Customlamp, All rights reserved.</p>
        <p className="text-xs text-slate-800">
          Created by{' '}
          <a href="https://ais-aif.my.id" target="_blank" className="font-bold">
            Ais Aif
          </a>
        </p>
      </div>
    </div>
  )
}
