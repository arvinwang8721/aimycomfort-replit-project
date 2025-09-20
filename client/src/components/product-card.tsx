import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const handleEdit = () => {
    onEdit?.(product);
    console.log('Edit product:', product.id);
  };

  const handleDelete = () => {
    onDelete?.(product.id);
    console.log('Delete product:', product.id);
  };

  const totalCost = Number(product.coverCost) + Number(product.innerCoreCost) + 
                   Number(product.packageCost) + Number(product.generalCost);

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-product-${product.id}`}>
      <CardHeader className="p-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
            data-testid={`img-product-${product.id}`}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">无图像</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </CardTitle>
          <Badge
            variant={product.status === 'active' ? 'default' : 'secondary'}
            data-testid={`badge-product-status-${product.id}`}
          >
            {product.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          代码：{product.code}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>面料成本：</span>
            <span>${product.coverCost}</span>
          </div>
          <div className="flex justify-between">
            <span>内芯成本：</span>
            <span>${product.innerCoreCost}</span>
          </div>
          <div className="flex justify-between">
            <span>包装成本：</span>
            <span>${product.packageCost}</span>
          </div>
          <div className="flex justify-between">
            <span>一般成本：</span>
            <span>${product.generalCost}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>总成本：</span>
            <span data-testid={`text-product-total-${product.id}`}>${totalCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {new Date(product.createdAt || '').toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleEdit}
            data-testid={`button-edit-product-${product.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleDelete}
            data-testid={`button-delete-product-${product.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}