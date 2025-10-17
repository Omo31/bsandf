import type { Product, User, Order, CustomMeasure, CustomService } from '@/lib/types';

export const products: Product[] = [
  { id: '1', name: 'Organic Tomatoes', price: 4.99, description: 'Fresh, juicy, and full of flavor.', stock: 100, imagePlaceholderId: 'product-1' },
  { id: '2', name: 'Sourdough Bread', price: 6.50, description: 'Crusty artisan sourdough, baked fresh daily.', stock: 50, imagePlaceholderId: 'product-2' },
  { id: '3', name: 'Artisanal Cheddar', price: 12.00, description: 'Aged for 12 months for a sharp, nutty taste.', stock: 30, imagePlaceholderId: 'product-3' },
  { id: '4', name: 'Extra Virgin Olive Oil', price: 15.99, description: 'Cold-pressed from the finest olives.', stock: 75, imagePlaceholderId: 'product-4' },
  { id: '5', name: 'Fresh Basil', price: 2.99, description: 'Aromatic basil perfect for pasta and salads.', stock: 80, imagePlaceholderId: 'product-5' },
  { id: '6', name: 'Free-Range Eggs', price: 5.50, description: 'A dozen eggs from happy, pasture-raised chickens.', stock: 60, imagePlaceholderId: 'product-6' },
  { id: '7', name: 'Bell Peppers', price: 3.50, description: 'A mix of red, yellow, and green peppers.', stock: 90, imagePlaceholderId: 'product-7' },
  { id: '8', name: 'Organic Carrots', price: 3.00, description: 'A bunch of sweet and crunchy carrots.', stock: 120, imagePlaceholderId: 'product-8' },
];

export const recommendedProducts: Product[] = [
  { id: '9', name: 'Balsamic Vinegar', price: 10.99, description: 'Aged balsamic from Modena.', stock: 40, imagePlaceholderId: 'rec-1' },
  { id: '10', name: 'Organic Honey', price: 8.99, description: 'Raw and unfiltered wildflower honey.', stock: 55, imagePlaceholderId: 'rec-2' },
  { id: '11', name: 'Quinoa', price: 7.50, description: 'Versatile and nutritious organic quinoa.', stock: 70, imagePlaceholderId: 'rec-3' },
  { id: '12', name: 'Gourmet Mushrooms', price: 9.99, description: 'A mix of shiitake, cremini, and oyster mushrooms.', stock: 25, imagePlaceholderId: 'rec-4' },
];

export const cartItems = [
    { productId: '2', name: 'Sourdough Bread', price: 6.50, quantity: 1 },
    { productId: '5', name: 'Fresh Basil', price: 2.99, quantity: 2 },
];

export const customMeasures: CustomMeasure[] = [
    { id: '1', name: 'kg' },
    { id: '2', name: 'grams' },
    { id: '3', name: 'liters' },
    { id: '4', name: 'bunch' },
    { id: '5', name: 'box' },
];

export const customServices: CustomService[] = [
  { id: 'gift-wrapping', label: 'Gift Wrapping', description: 'We can wrap your items as a gift.' },
  { id: 'special-sourcing', label: 'Special Sourcing', description: 'Need something not in our store? We can try to source it for you.' },
  { id: 'bulk-order', label: 'Bulk Order Inquiry', description: 'For large quantities and special pricing.' },
  { id: 'dietary-prep', label: 'Dietary Preparation', description: 'Let us know about your dietary needs (e.g., gluten-free, nut-free).'},
];
