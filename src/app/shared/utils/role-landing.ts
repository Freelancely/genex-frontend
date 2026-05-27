export const ROLE_LANDING: Record<string, string> = {
  SuperAdmin: '/pages/admin/dashboard',
  Admin: '/pages/admin/dashboard',
  StoreKeeper: '/pages/admin/products',
  Accountant: '/pages/admin/order-list',
  Receptionist: '/pages/admin/inquiries',
};

export const CUSTOMER_LANDING = '/home/electronic';

export function landingForRole(role: string | null | undefined): string {
  if (!role) return CUSTOMER_LANDING;
  return ROLE_LANDING[role] ?? CUSTOMER_LANDING;
}
