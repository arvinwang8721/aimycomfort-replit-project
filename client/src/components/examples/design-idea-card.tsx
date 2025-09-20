import { DesignIdeaCard } from '../design-idea-card'
import type { DesignIdea } from '@shared/schema'

export default function DesignIdeaCardExample() {
  const sampleDesignIdea: DesignIdea = {
    id: "1",
    title: "Ergonomic Lumbar Support Pillow",
    description: "A new pillow design specifically for lower back support with memory foam core and breathable fabric cover. Designed for office workers and people with back pain.",
    imageUrls: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"],
    demandAnalysis: "High demand from office workers and elderly customers",
    negativeReviews: "Current pillows too firm, not breathable enough",
    redesignReason: "Customer complaints about comfort and temperature regulation",
    priceRangeMin: "45.00",
    priceRangeMax: "65.00",
    createdBy: "Sarah Johnson",
    status: "in_progress",
    createdAt: new Date('2024-01-15'),
  };

  const handleEdit = (designIdea: DesignIdea) => {
    console.log('Edit design idea:', designIdea.id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete design idea:', id);
  };

  const handleView = (designIdea: DesignIdea) => {
    console.log('View design idea:', designIdea.id);
  };

  return (
    <DesignIdeaCard 
      designIdea={sampleDesignIdea} 
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
    />
  )
}