export const ENDPOINTS = {
  catalog: {
    products: '/api/v1/products',
    productById: (id) => `/api/v1/products/${id}`,
    categories: '/api/v1/categories',
    taxes: '/api/v1/taxes',
    units: '/api/v1/units',
  },
  locations: {
    markets: '/api/v1/markets',
    marketById: (id) => `/api/v1/markets/${id}`,
    marketCatalog: (id) => `/api/v1/markets/${id}/catalog`,
    addresses: '/api/v1/addresses',
  },
  vendors: {
    vendors: '/api/v1/vendors',
    vendorById: (id) => `/api/v1/vendors/${id}`,
    inventories: '/api/v1/inventories',
    inventoryById: (id) => `/api/v1/inventories/${id}`,
  },
  orders: {
    orders: '/api/v1/orders',
    orderById: (id) => `/api/v1/orders/${id}`,
    orderStatus: (id) => `/api/v1/orders/${id}/status`,
    pickingRoute: (id) => `/api/v1/orders/${id}/picking-route`,
  },
  billing: {
    invoices: '/api/v1/invoices',
    invoiceById: (id) => `/api/v1/invoices/${id}`,
    payOrder: (id) => `/api/v1/invoices/${id}/pay`,
  },
  security: {
    login: '/api/v1/auth/login',
    fcmToken: '/api/v1/auth/fcm-token',
    userFcmToken: (id) => `/api/v1/auth/users/${id}/fcm-token`,
    refresh: '/security/refresh-token',
  },
  fulfillment: {
    deliverers: '/api/v1/deliverers',
    delivererById: (id) => `/api/v1/deliverers/${id}`,
    assignOrder: (id) => `/api/v1/fulfillment/orders/${id}/assign`,
    updateLocation: (id) => `/api/v1/fulfillment/deliverers/${id}/location`,
    transitionStatus: (orderId, delivererId) =>
      `/api/v1/fulfillment/orders/${orderId}/deliverers/${delivererId}/transition`,
  },
};

export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DELIVERY_BOY: 'delivery',
  VENDOR: 'vendor',
  SUPERVISOR: 'supervisor',
};

export const ROUTE_BY_ROLE = {
  [USER_ROLES.DELIVERY_BOY]: 'DeliveryBoy',
  [USER_ROLES.ADMIN]: 'Supervisor',
  [USER_ROLES.SUPERVISOR]: 'CentroAcoque',
};

export const ORDER_STATUSES = {
  CREATED: 'CREATED',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  PICKING_UP: 'PICKING_UP',
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};
