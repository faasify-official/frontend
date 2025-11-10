export type Review = {
  id: string
  reviewer: string
  rating: number
  comment: string
}

export type Product = {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  averageRating: number
  reviews: Review[]
}

