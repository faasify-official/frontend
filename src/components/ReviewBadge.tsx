import { Star } from 'lucide-react'

type Props = {
  rating: number
  label?: string
  showStars?: boolean
}

const ReviewBadge = ({ rating, label, showStars = false }: Props) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  if (showStars) {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={16} className="fill-primary text-primary" />
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative inline-block">
                <Star size={16} className="text-slate-300" />
                <div className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star size={16} className="fill-primary text-primary" />
                </div>
              </div>
            )
          } else {
            return <Star key={i} size={16} className="text-slate-300" />
          }
        })}
        <span className="ml-1 text-sm font-semibold text-charcoal">{rating.toFixed(1)}</span>
        {label && <span className="text-xs text-slate-500">{label}</span>}
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <Star size={12} className="fill-primary text-primary" />
      {rating.toFixed(1)} {label}
    </span>
  )
}

export default ReviewBadge

