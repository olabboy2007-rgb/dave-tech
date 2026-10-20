export default function Logo({ withText = true }) {
  return (
    <div className="flex items-center">
      {withText && (
        <span className="text-xl font-extrabold tracking-wide text-white">
          DAVE <span className="text-brand-light">TECH</span>
        </span>
      )}
    </div>
  )
}