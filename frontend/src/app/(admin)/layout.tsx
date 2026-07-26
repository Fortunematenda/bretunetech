import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BretuneTech — Admin Console',
  description: 'BretuneTech Admin Console — product, order and inventory management.',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#13151c] text-white overflow-x-hidden">
      {children}
    </div>
  );
}
