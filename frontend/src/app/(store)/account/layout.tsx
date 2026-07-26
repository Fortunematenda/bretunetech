import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import AccountShell from './AccountShell';

export const metadata: Metadata = generatePageMetadata({
  title: 'My Account',
  description: 'Manage your BretuneTech account, orders, and addresses.',
  path: '/account',
  noIndex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
