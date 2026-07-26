import { redirect } from 'next/navigation';

export const metadata = {
  title: 'New Arrivals | BretuneTech',
  description: 'Shop the latest products at BretuneTech. New arrivals in networking, computing, power solutions, and more.',
};

export default function NewArrivalsPage() {
  redirect('/products?newArrivals=true');
}
