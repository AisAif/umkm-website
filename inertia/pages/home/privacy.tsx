import { Head } from '@inertiajs/react'

const termsOfService: {
  name: string
  description?: string
  pointList?: string[]
}[] = [
  {
    name: 'Persyaratan Penggunaan',
    pointList: [
      'Berusia minimal 18 tahun atau memiliki izin dari orang tua/wali.',
      'Tidak menggunakan situs ini untuk tujuan ilegal.',
      'Mematuhi semua hukum dan peraturan yang berlaku saat menggunakan situs.',
    ],
  },
  {
    name: 'Hak Kekayaan Intelektual',
    description:
      'Semua konten, desain, logo, dan elemen lain yang terdapat di situs ini adalah milik kami atau pemberi lisensi kami. Anda tidak diizinkan untuk mendistribusikan, memodifikasi, mereproduksi, atau menggunakan konten tersebut tanpa izin tertulis dari kami.',
  },
  {
    name: 'Pembatasan Tanggung Jawab',
    description:
      'Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan situs ini. Situs ini disediakan "sebagaimana adanya" tanpa jaminan apa pun.',
  },
  {
    name: 'Tautan ke Situs Pihak Ketiga',
    description:
      'Situs kami dapat berisi tautan ke situs pihak ketiga. Kami tidak bertanggung jawab atas konten, kebijakan privasi, atau praktik situs pihak ketiga tersebut. Kami menyarankan Anda membaca ketentuan layanan dan kebijakan privasi mereka sebelum menggunakan situs tersebut.',
  },
  {
    name: 'Perubahan Ketentuan',
    description:
      'Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Perubahan akan berlaku segera setelah kami mempublikasikannya di situs ini. Anda bertanggung jawab untuk meninjau Ketentuan Layanan secara berkala.',
  },
  {
    name: 'Hubungi Kami',
    pointList: [
      '<strong>Email</strong>: <a href="mailto:me@obexcustomlamp.biz.id">me@obexcustomlamp.biz.id</a>',
      '<strong>WhatsApp</strong>: <a href="https://wa.me/+62882003475593">+62882003475593</a>',
    ],
  },
]

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 md:px-20">
      <Head title="Terms of Service" />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Ketentuan Layanan</h1>
        <p className="text-gray-600 mb-4">
          Dengan mengakses atau menggunakan situs ini, Anda menyetujui untuk mematuhi dan terikat
          oleh Ketentuan Layanan berikut. Harap baca ketentuan ini dengan saksama sebelum
          menggunakan layanan kami.
        </p>

        {termsOfService.map((item, index) => (
          <section className="mb-6" key={index}>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{`${index + 1}. ${item.name}`}</h2>
            {item.description && (
              <p
                className="text-gray-600 mb-4"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}
            {item.pointList && (
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {item.pointList.map((point, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="text-sm text-gray-400 mt-8">
          Tanggal Diperbarui: {new Date("2023-06-13").toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

export default TermsOfService
