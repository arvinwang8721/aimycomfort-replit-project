import { FabricCard } from '../fabric-card'
import type { Fabric } from '@shared/schema'

export default function FabricCardExample() {
  const sampleFabric: Fabric = {
    id: "1",
    name: "Premium Cotton",
    color: "Navy Blue", 
    width: 150,
    gramWeight: 280,
    price: "12.50",
    imageUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=300&fit=crop",
    createdAt: new Date(),
  };

  const handleEdit = (fabric: Fabric) => {
    console.log('Edit fabric:', fabric.id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete fabric:', id);
  };

  return (
    <FabricCard 
      fabric={sampleFabric} 
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}