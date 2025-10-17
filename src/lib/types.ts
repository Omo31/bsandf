export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  imagePlaceholderId: string;
};

export type WithId<T> = T & { id: string };

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  lastSeen: string;
};

export type Order = {
  id: string;
  userId: string;
  date: string;
  total: number;
  status: 'Accepted' | 'Canceled' | 'Draft' | 'Processing' | 'Shipped';
  items: CartItem[];
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type CustomMeasure = {
    id: string;
    name: string;
}

export type CustomService = {
    id: string;
    label: string;
    description: string;
}

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  timestamp: string;
};
