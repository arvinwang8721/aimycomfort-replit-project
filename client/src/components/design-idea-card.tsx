import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import type { DesignIdea } from "@shared/schema";

interface DesignIdeaCardProps {
  designIdea: DesignIdea;
  onEdit?: (designIdea: DesignIdea) => void;
  onDelete?: (id: string) => void;
  onView?: (designIdea: DesignIdea) => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

export function DesignIdeaCard({ designIdea, onEdit, onDelete, onView }: DesignIdeaCardProps) {
  const handleEdit = () => {
    onEdit?.(designIdea);
    console.log('Edit design idea:', designIdea.id);
  };

  const handleDelete = () => {
    onDelete?.(designIdea.id);
    console.log('Delete design idea:', designIdea.id);
  };

  const handleView = () => {
    onView?.(designIdea);
    console.log('View design idea:', designIdea.id);
  };

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-design-idea-${designIdea.id}`}>
      <CardHeader className="p-0">
        {designIdea.imageUrls && designIdea.imageUrls.length > 0 ? (
          <img
            src={designIdea.imageUrls[0]}
            alt={designIdea.title}
            className="w-full h-48 object-cover"
            data-testid={`img-design-idea-${designIdea.id}`}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">无图像</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg" data-testid={`text-design-idea-title-${designIdea.id}`}>
            {designIdea.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={statusColors[designIdea.status as keyof typeof statusColors]}
            data-testid={`badge-design-idea-status-${designIdea.id}`}
          >
            {designIdea.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {designIdea.description}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            创建人：{designIdea.createdBy}
          </p>
          {(designIdea.priceRangeMin || designIdea.priceRangeMax) && (
            <p className="text-sm">
              价格：${designIdea.priceRangeMin || 0} - ${designIdea.priceRangeMax || 0}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {new Date(designIdea.createdAt || '').toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleView}
            data-testid={`button-view-design-idea-${designIdea.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleEdit}
            data-testid={`button-edit-design-idea-${designIdea.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleDelete}
            data-testid={`button-delete-design-idea-${designIdea.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}