/*
  Warnings:

  - You are about to drop the column `canonicalUrl` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `canonicalUrl` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discontinued` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `fullDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `imageAltText` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `noIndex` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `replacementProductId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryKeywords` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `seoContentVersion` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `seoGeneratedAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `seoLocked` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierSku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierSpecifications` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierTitle` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `admin_notification_states` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_redirects` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `role` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS', 'PROMOTION', 'ACCOUNT', 'GENERAL');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'AWAITING_CUSTOMER_RETURN', 'RECEIVED', 'INSPECTING', 'REFUND_APPROVED', 'REPLACEMENT_SENT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnResolution" AS ENUM ('REFUND', 'REPLACEMENT', 'EXCHANGE', 'STORE_CREDIT');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "admin_notification_states" DROP CONSTRAINT "admin_notification_states_userId_fkey";

-- DropForeignKey
ALTER TABLE "product_redirects" DROP CONSTRAINT "product_redirects_productId_fkey";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "addressVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "placeId" TEXT,
ADD COLUMN     "suburb" TEXT;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "warehouseLocation" TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "canonicalUrl",
DROP COLUMN "metaDescription",
DROP COLUMN "seoTitle";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "warehouseLocation" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedByAdminId" TEXT,
ADD COLUMN     "deletedByAdminName" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "canonicalUrl",
DROP COLUMN "discontinued",
DROP COLUMN "displayName",
DROP COLUMN "fullDescription",
DROP COLUMN "imageAltText",
DROP COLUMN "noIndex",
DROP COLUMN "replacementProductId",
DROP COLUMN "secondaryKeywords",
DROP COLUMN "seoContentVersion",
DROP COLUMN "seoGeneratedAt",
DROP COLUMN "seoLocked",
DROP COLUMN "seoTitle",
DROP COLUMN "shortDescription",
DROP COLUMN "supplierDescription",
DROP COLUMN "supplierSku",
DROP COLUMN "supplierSpecifications",
DROP COLUMN "supplierTitle",
ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "discountExpiresAt" TIMESTAMP(3),
ADD COLUMN     "focusKeyword" TEXT,
ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manualUrl" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "schemaJsonLd" TEXT,
ADD COLUMN     "seoScore" INTEGER,
ADD COLUMN     "seoStatus" TEXT,
ADD COLUMN     "shippingDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "stockCpt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockDbn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockJhb" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "role_permissions" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "service_bookings" ADD COLUMN     "emailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emailSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "customRoleId" TEXT,
ADD COLUMN     "emailOtp" TEXT,
ADD COLUMN     "emailOtpExpiry" TIMESTAMP(3),
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "termsAcceptedAt" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "admin_notification_states";

-- DropTable
DROP TABLE "product_redirects";

-- CreateTable
CREATE TABLE "product_documents" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'pdf',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "related_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "relatedProductId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "related_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT,
    "comment" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "badge" TEXT,
    "backgroundColor" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cta" TEXT,
    "href" TEXT,
    "price" TEXT,
    "period" TEXT,
    "phone" TEXT,
    "features" JSONB,
    "services" JSONB,
    "extras" JSONB,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroSlides" JSONB,
    "heroCtaText" TEXT,
    "heroCtaLink" TEXT,
    "heroQuoteText" TEXT,
    "heroQuoteLink" TEXT,
    "descriptionColor" TEXT,
    "subtitleColor" TEXT,
    "textColor" TEXT,
    "ctaBgColor" TEXT,
    "ctaTextColor" TEXT,
    "secondaryBgColor" TEXT,
    "secondaryTextColor" TEXT,
    "cardAccentColor" TEXT,
    "cardBgColor" TEXT,
    "cardBtnBgColor" TEXT,
    "cardBtnTextColor" TEXT,
    "cardNameColor" TEXT,
    "cardPriceColor" TEXT,
    "cardBorderColor" TEXT,
    "eyebrowBgColor" TEXT,
    "eyebrowBorderColor" TEXT,
    "eyebrowTextColor" TEXT,
    "slideBadgeBgColor" TEXT,
    "slideBadgeBorderColor" TEXT,
    "slideBadgeTextColor" TEXT,
    "heroTemplate" TEXT,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "price" TEXT,
    "salePrice" TEXT,
    "brand" TEXT,
    "description" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "benefits" JSONB,
    "pricing" JSONB,
    "branding" JSONB,
    "exportFormat" TEXT NOT NULL DEFAULT 'facebook_post',
    "generatedImageUrl" TEXT,
    "generatedThumbnailUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Bretune Technologies',
    "legalName" TEXT NOT NULL DEFAULT 'Bretune Technologies (Pty) Ltd',
    "registrationNumber" TEXT NOT NULL DEFAULT '2025/545182/07',
    "taxNumber" TEXT NOT NULL DEFAULT '9276141273',
    "website" TEXT NOT NULL DEFAULT 'https://bretunetech.com',
    "email" TEXT NOT NULL DEFAULT 'sales@bretune.co.za',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@bretunetech.com',
    "phone" TEXT NOT NULL DEFAULT '+27 61 268 5933',
    "address" TEXT NOT NULL DEFAULT '123 Main Road, Cape Town, 8001, South Africa',
    "country" TEXT NOT NULL DEFAULT 'South Africa',
    "businessType" TEXT NOT NULL DEFAULT 'Technology Ecommerce & Solutions Provider',
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountHolder" TEXT,
    "branchCode" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'Current',
    "vatIncluded" BOOLEAN NOT NULL DEFAULT true,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "showLegalInfo" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "googleSiteVerification" TEXT,
    "bingSiteVerification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "service" TEXT,
    "budget" TEXT,
    "urgency" TEXT,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_requests" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedResolution" "ReturnResolution" NOT NULL,
    "customerReason" TEXT NOT NULL,
    "customerComment" TEXT,
    "adminNote" TEXT,
    "customerVisibleNote" TEXT,
    "totalReturnValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "conditionReceived" TEXT,
    "inspectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_attachments" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_status_history" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "oldStatus" "ReturnStatus" NOT NULL,
    "newStatus" "ReturnStatus" NOT NULL,
    "note" TEXT,
    "changedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_visits" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "pageUrl" TEXT NOT NULL,
    "pageTitle" TEXT,
    "referrer" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "city" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "website_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_role_permissions" (
    "id" TEXT NOT NULL,
    "customRoleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_url_inspections" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'page',
    "status" TEXT,
    "coverageState" TEXT,
    "lastCrawlTime" TIMESTAMP(3),
    "googleCanonical" TEXT,
    "userCanonical" TEXT,
    "robotsState" TEXT,
    "pageFetchState" TEXT,
    "mobileUsability" TEXT,
    "richResults" TEXT,
    "seoScore" INTEGER,
    "issue" TEXT,
    "recommendedFix" TEXT,
    "notes" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_url_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_documents_productId_idx" ON "product_documents"("productId");

-- CreateIndex
CREATE INDEX "related_products_productId_idx" ON "related_products"("productId");

-- CreateIndex
CREATE INDEX "related_products_relatedProductId_idx" ON "related_products"("relatedProductId");

-- CreateIndex
CREATE UNIQUE INDEX "related_products_productId_relatedProductId_key" ON "related_products"("productId", "relatedProductId");

-- CreateIndex
CREATE INDEX "product_specifications_productId_idx" ON "product_specifications"("productId");

-- CreateIndex
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");

-- CreateIndex
CREATE INDEX "reviews_isApproved_idx" ON "reviews"("isApproved");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_productId_key" ON "reviews"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_isActive_idx" ON "brands"("isActive");

-- CreateIndex
CREATE INDEX "ads_isActive_idx" ON "ads"("isActive");

-- CreateIndex
CREATE INDEX "ads_sortOrder_idx" ON "ads"("sortOrder");

-- CreateIndex
CREATE INDEX "marketing_ads_template_idx" ON "marketing_ads"("template");

-- CreateIndex
CREATE INDEX "marketing_ads_isActive_idx" ON "marketing_ads"("isActive");

-- CreateIndex
CREATE INDEX "marketing_ads_createdAt_idx" ON "marketing_ads"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "return_requests_returnNumber_key" ON "return_requests"("returnNumber");

-- CreateIndex
CREATE INDEX "return_requests_orderId_idx" ON "return_requests"("orderId");

-- CreateIndex
CREATE INDEX "return_requests_customerId_idx" ON "return_requests"("customerId");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

-- CreateIndex
CREATE INDEX "return_requests_createdAt_idx" ON "return_requests"("createdAt");

-- CreateIndex
CREATE INDEX "return_items_returnRequestId_idx" ON "return_items"("returnRequestId");

-- CreateIndex
CREATE INDEX "return_items_orderItemId_idx" ON "return_items"("orderItemId");

-- CreateIndex
CREATE INDEX "return_attachments_returnRequestId_idx" ON "return_attachments"("returnRequestId");

-- CreateIndex
CREATE INDEX "return_status_history_returnRequestId_idx" ON "return_status_history"("returnRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_key" ON "suppliers"("name");

-- CreateIndex
CREATE INDEX "website_visits_createdAt_idx" ON "website_visits"("createdAt");

-- CreateIndex
CREATE INDEX "website_visits_pageUrl_idx" ON "website_visits"("pageUrl");

-- CreateIndex
CREATE INDEX "website_visits_productId_idx" ON "website_visits"("productId");

-- CreateIndex
CREATE INDEX "website_visits_sessionId_idx" ON "website_visits"("sessionId");

-- CreateIndex
CREATE INDEX "website_visits_visitorId_idx" ON "website_visits"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_name_key" ON "custom_roles"("name");

-- CreateIndex
CREATE INDEX "custom_role_permissions_customRoleId_idx" ON "custom_role_permissions"("customRoleId");

-- CreateIndex
CREATE INDEX "custom_role_permissions_permissionId_idx" ON "custom_role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_role_permissions_customRoleId_permissionId_key" ON "custom_role_permissions"("customRoleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_url_inspections_url_key" ON "seo_url_inspections"("url");

-- CreateIndex
CREATE INDEX "seo_url_inspections_coverageState_idx" ON "seo_url_inspections"("coverageState");

-- CreateIndex
CREATE INDEX "seo_url_inspections_checkedAt_idx" ON "seo_url_inspections"("checkedAt");

-- CreateIndex
CREATE INDEX "seo_url_inspections_followUpAt_idx" ON "seo_url_inspections"("followUpAt");

-- CreateIndex
CREATE INDEX "seo_url_inspections_pageType_idx" ON "seo_url_inspections"("pageType");

-- CreateIndex
CREATE INDEX "products_brandId_idx" ON "products"("brandId");

-- CreateIndex
CREATE INDEX "role_permissions_role_idx" ON "role_permissions"("role");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_permissionId_key" ON "role_permissions"("role", "permissionId");

-- CreateIndex
CREATE INDEX "users_customRoleId_idx" ON "users"("customRoleId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "custom_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_attachments" ADD CONSTRAINT "return_attachments_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_status_history" ADD CONSTRAINT "return_status_history_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
