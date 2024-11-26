import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import LandingPageLayout from '~/components/layouts/landing.page.layout'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export default function Home() {
  return (
    <LandingPageLayout>
      <Head title="Home" />
      <Hero />
      <About />
      <Service />
    </LandingPageLayout>
  )
}

const Hero = () => {
  const [onImage, setOnImage] = useState(0)
  const images = ['/car-1.jpg', '/car-2.jpg', '/car-3.jpg']

  useEffect(() => {
    const interval = setInterval(() => {
      setOnImage((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div id="home" className="flex flex-col justify-between items-center gap-16 py-20">
      <h1 className="text-3xl md:text-4xl font-bold text-center max-w-[500px]">
        Selamat datang di <span className="text-red-600">Obex Customlamp</span>
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center gap-10">
        {images.map((image, index) => (
          <img
            className={cn(
              'size-[300px] object-cover rounded-lg transition-all',
              index === onImage ? 'transform scale-110' : 'transform scale-100'
            )}
            src={image}
            alt="car"
          />
        ))}
      </div>
      <div className="flex flex-col gap-5 lg:w-[50%] text-center">
        <p>
          Spesialis custom lamp motor dan mobil yang menghadirkan inovasi pencahayaan berkualitas
          tinggi. Sebagai partner resmi AES, kami menawarkan produk dengan teknologi terkini yang
          menjamin ketahanan, performa, dan estetika maksimal.
        </p>
        <Button
          className="h-12"
          onClick={() => window.open('https://wa.me/+62882003475593', '_blank')}
          size="lg"
        >
          Hubungi Kami
        </Button>
      </div>
    </div>
  )
}

const About = () => {
  return (
    <div id="about" className="flex flex-col lg:flex-row justify-between items-center gap-20 py-20">
      <div className="flex flex-col gap-5 lg:w-[45%] text-justify">
        <h1 className="text-2xl md:text-4xl font-bold">Tentang Kami</h1>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Keunggulan Kami dalam Dunia Custom Lamp</h2>
          <p>
            Kami adalah mitra Anda dalam meningkatkan penampilan dan performa pencahayaan kendaraan.
            Dengan menjadi partner resmi AES, kami menghadirkan produk lampu berstandar global.
            Setiap custom lamp yang kami buat dirancang untuk memenuhi keinginan Anda, mulai dari
            penampilan mewah hingga pencahayaan optimal di segala kondisi.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Mengapa Memilih Kami?</h2>
          <p>
            <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>{' '}
            Teknologi Canggih: Menggunakan bahan dan teknologi AES yang telah teruji.
          </p>
          <p>
            <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>{' '}
            Desain Eksklusif: Sesuai dengan karakter dan kebutuhan kendaraan Anda.
          </p>
          <p>
            <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>{' '}
            Tim Profesional: Berpengalaman dalam merancang pencahayaan untuk berbagai jenis
            kendaraan.
          </p>
        </div>
      </div>
      <div className="lg:w-[30%] bg-black/20 px-20 rounded-md">
        <video autoPlay loop preload="auto">
          <source src="/services.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}

const Service = () => {
  return (
    <div
      id="services"
      className="flex flex-col md:flex-row justify-between items-center gap-20 py-20"
    >
      <iframe
        className="rounded-lg md:w-[45%] w-full"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.591376014457!2d111.37841416916818!3d-6.819450475588809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e773df335215871%3A0xc925639b6cfdde9!2sObex%20Customlamp%20Rembang!5e0!3m2!1sid!2sid!4v1732639622340!5m2!1sid!2sid"
        width="600"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      <div className="flex flex-col gap-5 md:w-[45%] text-justify">
        <h1 className="text-2xl md:text-4xl font-bold">Produk dan Layanan</h1>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-blue-600">1. Custom Lamp Mobil</h2>
          <p>
            Lengkapi gaya mobil Anda dengan pencahayaan premium. Dari lampu utama hingga lampu
            aksesoris, kami menawarkan desain inovatif yang meningkatkan estetika dan visibilitas.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-blue-600">2. Custom Lamp Motor</h2>
          <p>
            Buat motor Anda tampil beda dengan lampu custom unik dan fungsional. Pilih dari berbagai
            desain modern hingga klasik yang dirancang untuk menarik perhatian tanpa mengurangi
            keamanan berkendara.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-blue-600">3. Instalasi dan Servis Profesional</h2>
          <p>Tim kami memastikan pemasangan yang presisi untuk hasil terbaik.</p>
        </div>
      </div>
    </div>
  )
}
