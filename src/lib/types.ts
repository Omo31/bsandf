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
  firstName?: string;
  lastName?: string;
  shippingAddress?: string;
  phoneNumber?: string;
  uid?: string;
};

export type Order = {
  id: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status:
    | 'Pending Admin Review'
    | 'Pending User Approval'
    | 'Accepted'
    | 'Rejected'
    | 'Canceled'
    | 'Processing'
    | 'Shipped';
  items: CartItem[];
  shippingAddress: string;
  subTotal: number;
  serviceCharge?: number;
  shippingFee?: number;
};

export type CartItem = {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  userId: string;
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
