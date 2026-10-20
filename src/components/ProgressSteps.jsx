import { Check } from 'lucide-react'

export default function ProgressSteps({ current, total = 5 }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div className={[
              'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition',
              done && 'bg-brand text-white',
              active && 'border-2 border-brand text-brand',
              !done && !active && 'border border-line text-slate-500',
            ].filter(Boolean).join(' ')}>
              {done ? <Check size={14} /> : step}
            </div>
            {step < total && <div className={`h-[2px] flex-1 ${done ? 'bg-brand' : 'bg-line'}`} />}
          </div>
        )
      })}
    </div>
  )
}