const Header = ({ title, ...props }: { title: string; [key: string]: any }) => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <h1 className="text-2xl font-bold text-slate-700">{title}</h1>
      <div className="flex flex-col md:flex-row items-center justify-between gap-2" {...props} />
    </div>
  )
}

export default Header
