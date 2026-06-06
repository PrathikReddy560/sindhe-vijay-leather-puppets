import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif">Shopping Bag</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <p className="text-sm">Your bag is empty</p>
            <Button variant="outline" onClick={() => setIsOpen(false)} asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="mb-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={product.images.day}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h4 className="font-serif text-sm font-medium text-foreground">{product.name}</h4>
                      <div className="flex items-center gap-1.5">
                        {product.discountPrice ? (
                          <>
                            <span className="text-sm font-medium text-primary">{formatPrice(product.discountPrice)}</span>
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-primary">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-7 w-7 text-destructive"
                          onClick={() => removeItem(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="font-serif">Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Button className="mt-4 w-full" size="lg" asChild onClick={() => setIsOpen(false)}>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
