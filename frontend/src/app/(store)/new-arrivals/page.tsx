import { redirect } from 'next/navigation';

export const metadata = {
  title: 'New Arrivals | Bretunetech',
  description: 'Shop the latest products at Bretunetech. New arrivals in networking, computing, power solutions, and more.',
};

export default function NewArrivalsPage() {
  redirect('/products?newArrivals=true');
}
