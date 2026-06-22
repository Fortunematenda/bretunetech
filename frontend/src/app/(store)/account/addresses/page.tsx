'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { addressesApi } from '@/lib/api';
import { MapPin, Plus, Edit3, Trash2, ChevronLeft, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
    placeId: '',
  });
  const [addressSuggestions, setAddressSuggestions] = useState<{ description: string; place_id: string }[]>([]);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const data = await addressesApi.list(token);
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.street || !formData.city || !formData.province || !formData.postalCode) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await addressesApi.update(token, editingId, formData);
      } else {
        await addressesApi.create(token, {
          ...formData,
          country: 'South Africa',
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        street: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: false,
        placeId: '',
      });
      await fetchAddresses();
    } catch (error: any) {
      alert(error?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: any) => {
    setEditingId(address.id);
    setFormData({
      street: address.street,
      suburb: address.suburb || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      isDefault: address.isDefault || false,
      placeId: address.placeId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    if (!token) return;

    try {
      await addressesApi.delete(token, id);
      await fetchAddresses();
    } catch (error: any) {
      alert(error?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!token) return;

    try {
      await addressesApi.update(token, id, { isDefault: true });
      await fetchAddresses();
    } catch (error: any) {
      alert(error?.message || 'Failed to set default address');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      street: '',
      suburb: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false,
      placeId: '',
    });
    setAddressSuggestions([]);
  };

  const handleStreetInput = async (value: string) => {
    setFormData({ ...formData, street: value });
    
    if (value.length >= 3) {
      try {
        const response = await fetch(
          `/api/addresses/autocomplete?input=${encodeURIComponent(value)}`
        );
        const data = await response.json();
        if (data.predictions) {
          setAddressSuggestions(data.predictions.map((p: any) => ({ description: p.description, place_id: p.place_id })));
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion: { description: string; place_id: string }) => {
    try {
      const response = await fetch(
        `/api/addresses/place-details?place_id=${suggestion.place_id}`
      );
      const data = await response.json();
      if (data.result && data.result.address_components) {
        const components = data.result.address_components;
        const getAddressComponent = (types: string[]) => components.find((c: any) => types.some(t => c.types.includes(t)))?.long_name || '';

        const streetNumber = getAddressComponent(['street_number']);
        const route = getAddressComponent(['route']);
        const street = streetNumber && route ? `${streetNumber} ${route}` : (route || streetNumber || suggestion.description);

        setFormData({
          street: street,
          suburb: getAddressComponent(['sublocality', 'locality']),
          city: getAddressComponent(['locality', 'administrative_area_level_2']),
          province: getAddressComponent(['administrative_area_level_1']),
          postalCode: getAddressComponent(['postal_code']),
          isDefault: formData.isDefault,
          placeId: suggestion.place_id,
        });
      } else {
        // Fallback: just use the description as street address
        setFormData({
          ...formData,
          street: suggestion.description,
        });
      }
      setAddressSuggestions([]);
    } catch (error) {
      console.error('Failed to fetch place details:', error);
      // Fallback: just use the description as street address
      setFormData({
        ...formData,
        street: suggestion.description,
      });
      setAddressSuggestions([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/account')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        </div>

        {!showForm ? (
          <>
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#003d7a] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#002d5a] transition-colors mb-6"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </button>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No addresses saved yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{address.street}</p>
                        {address.suburb && <p className="text-sm text-gray-600">{address.suburb}</p>}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.province}, {address.postalCode}
                        </p>
                        {address.isDefault && (
                          <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Set as default"
                          >
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="text-sm text-gray-600 mb-1 block">Street Address *</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleStreetInput(e.target.value)}
                  placeholder="123 Main Street, Apartment 4B"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors"
                  required
                />
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto" onMouseDown={(e) => e.preventDefault()}>
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-start gap-2"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="break-words">{suggestion.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Suburb</label>
                <input
                  type="text"
                  value={formData.suburb}
                  onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                  placeholder="Fish Hoek"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cape Town"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Province *</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors"
                  required
                >
                  <option value="">Select Province</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="North West">North West</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Postal Code *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="8001"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] transition-colors"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#003d7a] border-gray-300 rounded focus:ring-[#003d7a]"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#003d7a] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#002d5a] transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
