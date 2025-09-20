import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Accessory } from "@shared/schema";

interface AccessoryCardProps {
  accessory: Accessory;
  onEdit?: (accessory: Accessory) => void;
  onDelete?: (id: string) => void;
}

export function AccessoryCard({ accessory, onEdit, onDelete }: AccessoryCardProps) {
  const handleEdit = () => {
    onEdit?.(accessory);
    console.log('Edit accessory:', accessory.id);
  };

  const handleDelete = () => {
    onDelete?.(accessory.id);
    console.log('Delete accessory:', accessory.id);
  };

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-accessory-${accessory.id}`}>
      <CardHeader className="p-0">
        {accessory.imageUrl ? (
          <img
            src={accessory.imageUrl}
            alt={accessory.name}
            className="w-full h-48 object-cover"
            data-testid={`img-accessory-${accessory.id}`}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">无图像</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2" data-testid={`text-accessory-name-${accessory.id}`}>
          {accessory.name}
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-primary" data-testid={`text-accessory-price-${accessory.id}`}>
          ${accessory.price}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleEdit}
            data-testid={`button-edit-accessory-${accessory.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleDelete}
            data-testid={`button-delete-accessory-${accessory.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}