export type Storefront = {
  storeId: string
  name: string
  description: string
  category: string
  image: string
  owner: string
  ownerName?: string // Owner's display name/email
  items: string[] // Array of product IDs
  createdAt?: string
  updatedAt?: string
}

