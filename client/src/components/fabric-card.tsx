import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Fabric } from "@shared/schema";

interface FabricCardProps {
  fabric: Fabric;
  onEdit?: (fabric: Fabric) => void;
  onDelete?: (id: string) => void;
}

export function FabricCard({ fabric, onEdit, onDelete }: FabricCardProps) {
  const handleEdit = () => {
    onEdit?.(fabric);
    console.log('Edit fabric:', fabric.id);
  };

  const handleDelete = () => {
    onDelete?.(fabric.id);
    console.log('Delete fabric:', fabric.id);
  };

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-fabric-${fabric.id}`}>
      <CardHeader className="p-0">
        {fabric.imageUrl ? (
          <img
            src={fabric.imageUrl}
            alt={`${fabric.name} - ${fabric.color}`}
            className="w-full h-48 object-cover"
            data-testid={`img-fabric-${fabric.id}`}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">无图像</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2" data-testid={`text-fabric-name-${fabric.id}`}>
          {fabric.name}
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" data-testid={`badge-fabric-color-${fabric.id}`}>
              {fabric.color}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>宽度：{fabric.width}厘米</p>
            <p>克重：{fabric.gramWeight} 克/平方米</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-primary" data-testid={`text-fabric-price-${fabric.id}`}>
          ${fabric.price}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleEdit}
            data-testid={`button-edit-fabric-${fabric.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleDelete}
            data-testid={`button-delete-fabric-${fabric.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}