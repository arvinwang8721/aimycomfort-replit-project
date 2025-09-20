import { ClientRequirementCard } from '../client-requirement-card'
import type { ClientRequirement } from '@shared/schema'

export default function ClientRequirementCardExample() {
  const sampleRequirement: ClientRequirement = {
    id: "1",
    clientName: "Hotel Chain International",
    description: "Need 500 custom pillows for new luxury hotel opening",
    requirements: "Memory foam core, hypoallergenic cover, hotel branding embroidered, delivered in 6 weeks",
    status: "in_progress",
    priority: "high",
    createdAt: new Date('2024-01-18'),
  };

  const handleEdit = (requirement: ClientRequirement) => {
    console.log('Edit client requirement:', requirement.id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete client requirement:', id);
  };

  return (
    <ClientRequirementCard 
      requirement={sampleRequirement} 
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}