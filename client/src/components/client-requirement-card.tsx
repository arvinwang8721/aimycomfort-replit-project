import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { ClientRequirement } from "@shared/schema";

interface ClientRequirementCardProps {
  requirement: ClientRequirement;
  onEdit?: (requirement: ClientRequirement) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

export function ClientRequirementCard({ requirement, onEdit, onDelete }: ClientRequirementCardProps) {
  const handleEdit = () => {
    onEdit?.(requirement);
    console.log('Edit client requirement:', requirement.id);
  };

  const handleDelete = () => {
    onDelete?.(requirement.id);
    console.log('Delete client requirement:', requirement.id);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-client-requirement-${requirement.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg" data-testid={`text-client-requirement-client-${requirement.id}`}>
            {requirement.clientName}
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={statusColors[requirement.status as keyof typeof statusColors]}
              data-testid={`badge-client-requirement-status-${requirement.id}`}
            >
              {requirement.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className={priorityColors[requirement.priority as keyof typeof priorityColors]}
              data-testid={`badge-client-requirement-priority-${requirement.id}`}
            >
              {requirement.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">描述</h4>
          <p className="text-sm line-clamp-2">{requirement.description}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">需求</h4>
          <p className="text-sm line-clamp-3">{requirement.requirements}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {new Date(requirement.createdAt || '').toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleEdit}
            data-testid={`button-edit-client-requirement-${requirement.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleDelete}
            data-testid={`button-delete-client-requirement-${requirement.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}