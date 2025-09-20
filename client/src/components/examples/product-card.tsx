import { ProductCard } from '../product-card'
import type { Product } from '@shared/schema'

export default function ProductCardExample() {
  const sampleProduct: Product = {
    id: "1",
    code: "PIL-001",
    name: "Classic Memory Foam Pillow",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
    coverCost: "8.50",
    innerCoreCost: "12.00",
    packageCost: "2.50",
    generalCost: "5.00",
    status: "active",
    createdAt: new Date('2024-01-01'),
  };

  const handleEdit = (product: Product) => {
    console.log('Edit product:', product.id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete product:', id);
  };

  return (
    <ProductCard 
      product={sampleProduct} 
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}