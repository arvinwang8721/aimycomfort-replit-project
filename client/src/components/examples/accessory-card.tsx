import { AccessoryCard } from '../accessory-card'
import type { Accessory } from '@shared/schema'

export default function AccessoryCardExample() {
  const sampleAccessory: Accessory = {
    id: "1",
    name: "Zipper - Heavy Duty",
    price: "2.50",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=300&fit=crop",
    createdAt: new Date(),
  };

  const handleEdit = (accessory: Accessory) => {
    console.log('Edit accessory:', accessory.id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete accessory:', id);
  };

  return (
    <AccessoryCard 
      accessory={sampleAccessory} 
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}