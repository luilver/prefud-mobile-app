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
  DELIVERER: 'Deliverer',
  SUPERVISOR: 'Supervisor',
  LOGISTIC: 'Logistic',
  PROVIDER: 'Provider',
};

export const ROUTE_BY_ROLE = {
  [USER_ROLES.DELIVERER]: 'Deliverer',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.LOGISTIC]: 'Logistic',
  [USER_ROLES.PROVIDER]: 'Provider',
};
