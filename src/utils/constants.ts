export const BRAND = {
  name: 'SIGNIFY BY AHON',
  tagline: 'Elegance Redefined',
};

export const COLORS = {
  primary: '#1C1C1C',
  secondary: '#FFFFFF',
  accent: '#1C1C1C',
  border: '#DDDDDD',
  sale: '#E40100',
  bgSecondary: '#F9F9F9',
};

export const SHIPPING_RATES = [
  { id: 'inside-dhaka', label: 'Inside Dhaka', price: 70 },
  { id: 'dhaka-sub-area', label: 'Dhaka Sub-area', price: 100 },
  { id: 'outside-dhaka', label: 'Outside Dhaka', price: 120 },
] as const;

export const SHIPPING = {
  insideDhaka: 70,
  dhakaSubArea: 100,
  outsideDhaka: 120,
  freeDeliveryThreshold: 2000,
};

export const ORDER_STATUS = [
  { value: 'received', label: 'Order Received' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out For Delivery' },
  { value: 'delivered', label: 'Delivered' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash On Delivery' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'bank', label: 'Bank Transfer' },
] as const;

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to High' },
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/#collections', label: 'Collections' },
  { href: '/#sale', label: 'Sale' },
];
