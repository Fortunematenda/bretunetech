'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, CreditCard, Wallet, Smartphone, Trash2, CheckCircle, ChevronRight,
  MapPin, Shield, Lock, AlertCircle, HelpCircle, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { addressesApi } from '@/lib/api';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    if (!token) return;
    addressesApi.list(token).then((a) => setAddresses(Array.isArray(a) ? a : [])).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const defaultAddress = addresses[0];

  const [savedCards, setSavedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/27', isDefault: true },
    { id: '2', last4: '5555', brand: 'Mastercard', expiry: '08/26', isDefault: false },
  ]);

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiry || !newCard.cvv || !newCard.name) {
      alert('Please fill in all card details');
      return;
    }

    const brand = newCard.cardNumber.startsWith('4') ? 'Visa' : newCard.cardNumber.startsWith('5') ? 'Mastercard' : 'Card';
    const last4 = newCard.cardNumber.slice(-4);
    
    setSavedCards([
      ...savedCards,
      {
        id: Date.now().toString(),
        last4,
        brand,
        expiry: newCard.expiry,
        isDefault: false,
      },
    ]);
    
    setNewCard({ cardNumber: '', expiry: '', cvv: '', name: '' });
    setShowAddCard(false);
  };

  const handleRemoveCard = (id: string) => {
    if (confirm('Are you sure you want to remove this card?')) {
      setSavedCards(savedCards.filter(card => card.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setSavedCards(savedCards.map(card => ({
      ...card,
      isDefault: card.id === id,
    })));
  };

  const eftBanks = [
    { id: 'absa', name: 'ABSA', logo: '🏦' },
    { id: 'fnb', name: 'FNB', logo: '🏦' },
    { id: 'nedbank', name: 'Nedbank', logo: '🏦' },
    { id: 'standard', name: 'Standard Bank', logo: '🏦' },
    { id: 'capitec', name: 'Capitec', logo: '🏦' },
  ];

  const wallets = [
    { id: 'ozow', name: 'Ozow', desc: 'Instant EFT' },
    { id: 'snapscan', name: 'SnapScan', desc: 'Scan to pay' },
    { id: 'peach', name: 'Peach Payments', desc: 'Card & EFT' },
  ];

  return (
    <>
    {/* Mobile Layout */}
    <div className="md:hidden min-h-screen bg-gray-50 pb-28">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <Link href="/account" aria-label="Go back" className="text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Payment Methods</h1>
        <button aria-label="Help" className="text-gray-700">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#e6f0ff] flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#003d7a]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Methods Coming Soon</h2>
          <p className="text-sm text-gray-500 mb-4">
            We're working on adding card payments and other payment options. For now, please use Instant EFT at checkout.
          </p>
          <div className="bg-[#e6f0ff] rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">How to pay with EFT:</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Select your bank at checkout</li>
              <li>Complete the payment on your bank's app</li>
              <li>Your order will be confirmed automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    {/* Desktop Layout */}
    <main className="hidden md:block min-h-screen bg-slate-50">
      <section className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
            <p className="text-slate-500 mt-2">
              Manage your payment options for faster checkout
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#e6f0ff] flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-[#003d7a]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Payment Methods Coming Soon</h2>
            <p className="text-base text-slate-500 mb-6">
              We're working on adding card payments and other payment options. For now, please use Instant EFT at checkout.
            </p>
            <div className="bg-[#e6f0ff] rounded-2xl p-6 text-left">
              <p className="text-base font-semibold text-blue-900 mb-3">How to pay with EFT:</p>
              <ol className="text-base text-blue-700 space-y-2 list-decimal list-inside">
                <li>Select your bank at checkout</li>
                <li>Complete the payment on your bank's app</li>
                <li>Your order will be confirmed automatically</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
