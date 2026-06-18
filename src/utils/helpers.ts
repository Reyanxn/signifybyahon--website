export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('bn-BD')}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SIG';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SIG-TRK-';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    received: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    packed: 'bg-purple-100 text-purple-800',
    shipped: 'bg-orange-100 text-orange-800',
    out_for_delivery: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getSizeStock(product: any): { name: string; stock: number; visible: boolean }[] {
  if (product.sizeStock && Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
    const hasStock = product.sizeStock.some((s: any) => (s.stock || 0) > 0);
    if (hasStock) return product.sizeStock;
  }
  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.map((s: string) => ({ name: s, stock: product.stock ?? 0, visible: true }));
  }
  return [{ name: 'One Size', stock: product.stock ?? 0, visible: true }];
}

export function getSizeStockByName(product: any, sizeName: string): number {
  if (product.sizeStock && Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
    const found = product.sizeStock.find((s: any) => s.name === sizeName);
    if (found) return found.stock ?? 0;
  }
  return product.stock ?? 0;
}

export function getTotalStock(product: any): number {
  if (product.sizeStock && Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
    const fromSizes = product.sizeStock.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
    if (fromSizes > 0) return fromSizes;
  }
  return product.stock ?? 0;
}

export function getVisibleSizes(product: any): { name: string; stock: number }[] {
  if (product.sizeStock && Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
    const hasStock = product.sizeStock.some((s: any) => (s.stock || 0) > 0);
    if (hasStock) {
      return product.sizeStock.filter((s: any) => s.visible).map(({ name, stock }: any) => ({ name, stock }));
    }
  }
  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.map((s: string) => ({ name: s, stock: product.stock ?? 0 }));
  }
  return [{ name: 'One Size', stock: product.stock ?? 0 }];
}

function g<T>(obj: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

export function generateInvoiceHTML(order: any): string {
  const customer = g<any>(order, 'customer_info', 'customerInfo') || {};
  const address = g<any>(order, 'shipping_address', 'shippingAddress') || {};
  const createdAt = g<string>(order, 'created_at', 'createdAt') || '';
  const paymentMethod = g<string>(order, 'payment_method', 'paymentMethod') || '';
  const paymentStatus = g<string>(order, 'payment_status', 'paymentStatus') || '';
  const shippingCharge = g<number>(order, 'shipping_charge', 'shippingCharge') || 0;
  const discount = g<number>(order, 'discount') || 0;
  const totalAmount = g<number>(order, 'total_amount', 'totalAmount') || 0;

  const itemsHtml = (order.items || []).map((item: any, i: number) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px;text-transform:uppercase">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px">${item.size} / ${item.color}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px;text-align:right">৳${item.price.toLocaleString()}</td>
    </tr>`).join('');

  return `
    <html>
    <head><style>
      body { font-family:'Poppins',Arial,sans-serif; margin:40px; color:#1C1C1C; }
      .header { text-align:center; border-bottom:2px solid #1C1C1C; padding-bottom:20px; margin-bottom:30px; }
      .header h1 { font-size:24px; letter-spacing:0.3em; text-transform:uppercase; font-weight:400; margin:0; }
      .header p { font-size:11px; opacity:0.6; margin:4px 0 0; text-transform:uppercase; letter-spacing:0.1em; }
      .info { display:flex; justify-content:space-between; margin-bottom:30px; font-size:12px; }
      .info div p { margin:3px 0; }
      .info .label { opacity:0.6; }
      table { width:100%; border-collapse:collapse; margin-bottom:20px; }
      th { background:#1C1C1C; color:white; padding:10px 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; text-align:left; font-weight:400; }
      .totals { text-align:right; font-size:13px; margin-top:20px; padding-top:20px; border-top:1px solid #ddd; }
      .totals p { margin:4px 0; }
      .totals .grand { font-size:16px; font-weight:600; margin-top:8px; padding-top:8px; border-top:2px solid #1C1C1C; }
      .footer { text-align:center; font-size:10px; opacity:0.4; margin-top:40px; padding-top:20px; border-top:1px solid #ddd; text-transform:uppercase; letter-spacing:0.1em; }
    </style></head>
    <body>
      <div class="header">
        <h1>SIGNIFY BY AHON</h1>
        <p>Invoice — ${order.id}</p>
      </div>
      <div class="info">
        <div>
          <p class="label">Bill To</p>
          <p>${customer.name || 'N/A'}</p>
          <p>${customer.phone || ''}</p>
          <p>${address.address || ''}${address.city ? ', ' + address.city : ''}</p>
        </div>
        <div style="text-align:right">
          <p class="label">Order Date</p>
          <p>${createdAt ? new Date(createdAt).toLocaleDateString() : ''}</p>
          <p class="label">Payment</p>
          <p style="text-transform:uppercase">${paymentMethod} — ${paymentStatus}</p>
        </div>
      </div>
      <table>
        <tr><th>#</th><th>Item</th><th>Variant</th><th>Qty</th><th style="text-align:right">Price</th></tr>
        ${itemsHtml}
      </table>
      <div class="totals">
        <p>Subtotal: ৳${(totalAmount - shippingCharge).toLocaleString()}</p>
        <p>Shipping: ${shippingCharge === 0 ? 'Free' : '৳' + shippingCharge.toLocaleString()}</p>
        ${discount > 0 ? `<p>Discount: -৳${discount.toLocaleString()}</p>` : ''}
        <p class="grand">Total: ৳${totalAmount.toLocaleString()}</p>
      </div>
      <div class="footer">
        SIGNIFY BY AHON — Thank you for your purchase
      </div>
      <script>window.print();</script>
    </body></html>`;
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
