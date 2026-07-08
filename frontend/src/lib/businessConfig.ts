/**
 * Central business configuration for BretuneTech.
 * 
 * Controls VAT display and other business-level settings.
 * When the business becomes VAT registered, update these values:
 *   isVatRegistered: true
 *   vatNumber: "your-vat-number"
 *   vatRate: 0.15
 *   showVatOnCustomerPages: true
 */
export const businessConfig = {
  isVatRegistered: false,
  vatNumber: null as string | null,
  vatRate: 0,
  showVatOnCustomerPages: false,
};
