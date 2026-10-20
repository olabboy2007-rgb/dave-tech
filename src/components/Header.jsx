import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'
import Logo from './Logo'

export default function Header({ back = false, right = null }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg-base/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {back ? (
          <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        ) : null}
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
      </div>
      {right ?? (
        <button className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5" aria-label="Menu">
          <Menu size={22} />
        </button>
      )}
    </header>
  )
}