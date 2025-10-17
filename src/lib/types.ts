
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
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  firstName: string | null;
  lastName: string | null;
  shippingAddress?: string;
  phoneNumber?: string;
  createdAt: any; // Can be Firestore's Timestamp
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
  items: (CartItem | OrderItem)[];
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
  userId?: string; // Made optional for cart items within an order
};

export type OrderItem = {
    productId: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
}


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

export type HomePageSettings = {
    id: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string;
    featuredProductIds: string[];
};
