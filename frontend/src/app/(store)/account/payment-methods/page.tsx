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
    <div className="min-h-screen bg-gray-50 md:bg-white pb-28">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Payment Methods</h1>
        <button aria-label="Help" className="text-gray-700">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {/* Saved Cards */}
        <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Saved Cards</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {savedCards.map((card) => (
            <div key={card.id} className={`flex items-center gap-3 px-4 py-3.5 ${card.id !== savedCards[savedCards.length - 1].id ? 'border-b border-gray-100' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">
                {card.brand === 'Visa' ? 'V' : card.brand === 'Mastercard' ? 'M' : 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{card.brand} •••• {card.last4}</p>
                  {card.isDefault && <span className="text-[10px] font-semibold text-[#003d7a] bg-blue-50 px-1.5 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-xs text-gray-400">Expires {card.expiry}</p>
              </div>
              <div className="flex items-center gap-1">
                {!card.isDefault && (
                  <button
                    onClick={() => handleSetDefault(card.id)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Set as default"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  aria-label="Remove card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {showAddCard ? (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Add New Card</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-600 focus:outline-none"
                  maxLength={16}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-600 focus:outline-none"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-600 focus:outline-none"
                    maxLength={4}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-600 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCard}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#003d7a] border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Card
            </button>
          )}
        </div>

        {/* EFT Options */}
        <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Instant EFT</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#003d7a]" />
            <p className="text-xs text-gray-500">Select your bank for instant payment</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {eftBanks.map((bank) => (
              <button key={bank.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-[#003d7a] hover:bg-blue-50 transition-colors">
                <span className="text-lg">{bank.logo}</span>
                <span className="text-xs font-medium text-gray-700">{bank.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wallets */}
        <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Mobile Wallets</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {wallets.map((w) => (
            <button key={w.id} className={`w-full flex items-center gap-3 px-4 py-3.5 ${w.id !== wallets[wallets.length - 1].id ? 'border-b border-gray-100' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">{w.name}</p>
                <p className="text-xs text-gray-400">{w.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        {/* Billing Address */}
        <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Billing Address</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : defaultAddress ? (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{defaultAddress.street}</p>
                <p className="text-xs text-gray-500">{defaultAddress.city}, {defaultAddress.province || ''} {defaultAddress.postalCode}</p>
                <p className="text-xs text-gray-400 mt-1">{user?.phone || ''}</p>
              </div>
              <Link href="/account/addresses" className="text-[#003d7a] text-xs font-semibold">Edit</Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <p className="text-sm text-gray-600">No billing address saved.</p>
              <Link href="/account/addresses" className="text-[#003d7a] text-xs font-semibold">Add</Link>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 px-1">
          <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-900">Secure Payments</p>
            <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
              All transactions are encrypted and processed securely. We never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
