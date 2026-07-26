import { brand } from './brand';

/** Legal / invoice NAP — keep in sync with `brand` for schema and public pages. */
export const COMPANY = {
  brandName: brand.name,
  legalName: brand.fullName,
  registrationNumber: "2025/545182/07",
  taxNumber: "",
  website: brand.website,
  email: brand.emailSales,
  supportEmail: brand.emailSupport,
  country: "South Africa",
  businessType: "Technology Ecommerce & Solutions Provider",
};
