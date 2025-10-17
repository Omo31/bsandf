import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';
import type { Product, WithId } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: WithId<Product>;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = placeholderImages.find(p => p.id === product.imagePlaceholderId);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to add items to your cart.',
      });
      return;
    }

    try {
      const cartRef = collection(firestore, `users/${user.uid}/cart_items`);
      // Check if the item already exists in the cart
      const q = query(cartRef, where('productId', '==', product.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Item exists, update quantity
        const existingItem = querySnapshot.docs[0];
        const newQuantity = existingItem.data().quantity + 1;
        const batch = writeBatch(firestore);
        batch.update(existingItem.ref, { quantity: newQuantity });
        await batch.commit();
        toast({
          title: 'Item Updated in Cart!',
          description: `Quantity of ${product.name} is now ${newQuantity}.`,
        });
      } else {
        // Item does not exist, add new document
        await addDoc(cartRef, {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
        toast({
          title: 'Added to Cart!',
          description: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Could not add item to cart. Please try again.',
      });
    }
  };


  return (
    <Card className="w-full overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-w-4 aspect-h-3">
          {image ? (
            <Image
              src={image.imageUrl}
              alt={product.name}
              width={400}
              height={300}
              className="object-cover w-full h-full"
              data-ai-hint={image.imageHint}
            />
          ) : (
            <div className="w-full h-full bg-muted animate-pulse" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">₦{product.price.toFixed(2)}</p>
        <Button size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
