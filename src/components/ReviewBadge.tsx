type Props = {
  rating: number
  label?: string
}

const ReviewBadge = ({ rating, label }: Props) => {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      {'\u2605'} {rating.toFixed(1)} {label}
    </span>
  )
}

export default ReviewBadge

