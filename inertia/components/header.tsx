const Header = ({ title, ...props }: { title?: string; [key: string]: any }) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-700">{title}</h1>
      {props.children && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 *:w-fit" {...props} />
      )}
    </div>
  )
}

export default Header
