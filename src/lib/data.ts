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

export const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin', lastSeen: '2 hours ago' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user', lastSeen: '5 minutes ago' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'user', lastSeen: '1 day ago' },
    { id: '4', name: 'David', email: 'david@example.com', role: 'user', lastSeen: '30 minutes ago' },
];

export const orders: Order[] = [
    { 
        id: 'ORD001', 
        userId: '2', 
        date: '2023-10-26', 
        total: 23.49, 
        status: 'Accepted', 
        items: [
            { productId: '1', name: 'Organic Tomatoes', price: 4.99, quantity: 1 },
            { productId: '2', name: 'Sourdough Bread', price: 6.50, quantity: 1 },
            { productId: '4', name: 'Extra Virgin Olive Oil', price: 12.00, quantity: 1 }
        ]
    },
    { 
        id: 'ORD002', 
        userId: '3', 
        date: '2023-10-25', 
        total: 8.49, 
        status: 'Canceled',
        items: [
            { productId: '5', name: 'Fresh Basil', price: 2.99, quantity: 1 },
            { productId: '6', name: 'Free-Range Eggs', price: 5.50, quantity: 1 }
        ]
    },
    { 
        id: 'ORD003', 
        userId: '2', 
        date: '2023-10-27', 
        total: 3.00, 
        status: 'Draft',
        items: [
            { productId: '8', name: 'Organic Carrots', price: 3.00, quantity: 1 }
        ]
    },
    {
        id: 'ORD004',
        userId: '4',
        date: '2023-10-28',
        total: 58.46,
        status: 'Shipped',
        items: [
            { productId: '3', name: 'Artisanal Cheddar', price: 12.00, quantity: 2 },
            { productId: '9', name: 'Balsamic Vinegar', price: 10.99, quantity: 1 },
            { productId: '12', name: 'Gourmet Mushrooms', price: 9.99, quantity: 1 },
            { productId: '7', name: 'Bell Peppers', price: 3.50, quantity: 2 },
        ]
    },
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