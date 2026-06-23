--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-06-22 11:11:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 362534)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 935 (class 1247 OID 362602)
-- Name: BookingServiceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingServiceType" AS ENUM (
    'WIFI_INSTALLATION',
    'FIBRE_INSTALLATION',
    'CCTV_SETUP',
    'MIKROTIK_CONFIGURATION',
    'REMOTE_SUPPORT',
    'NETWORK_TROUBLESHOOTING'
);


ALTER TYPE public."BookingServiceType" OWNER TO postgres;

--
-- TOC entry 932 (class 1247 OID 362590)
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."BookingStatus" OWNER TO postgres;

--
-- TOC entry 941 (class 1247 OID 362628)
-- Name: EnquiryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EnquiryStatus" AS ENUM (
    'NEW',
    'READ',
    'REPLIED',
    'CLOSED'
);


ALTER TYPE public."EnquiryStatus" OWNER TO postgres;

--
-- TOC entry 938 (class 1247 OID 362616)
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- TOC entry 881 (class 1247 OID 367614)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_STATUS',
    'PROMOTION',
    'ACCOUNT',
    'GENERAL'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- TOC entry 923 (class 1247 OID 362552)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- TOC entry 926 (class 1247 OID 362566)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'EFT',
    'PAYFAST',
    'OZOW',
    'WHATSAPP',
    'YOCO'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 920 (class 1247 OID 362546)
-- Name: ProductCondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductCondition" AS ENUM (
    'NEW',
    'REFURBISHED'
);


ALTER TYPE public."ProductCondition" OWNER TO postgres;

--
-- TOC entry 902 (class 1247 OID 412000)
-- Name: ReturnResolution; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnResolution" AS ENUM (
    'REFUND',
    'REPLACEMENT',
    'EXCHANGE',
    'STORE_CREDIT'
);


ALTER TYPE public."ReturnResolution" OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 411976)
-- Name: ReturnStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnStatus" AS ENUM (
    'REQUESTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'AWAITING_CUSTOMER_RETURN',
    'RECEIVED',
    'INSPECTING',
    'REFUND_APPROVED',
    'REPLACEMENT_SENT',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ReturnStatus" OWNER TO postgres;

--
-- TOC entry 917 (class 1247 OID 362536)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'VENDOR',
    'STAFF',
    'SUPER_ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 929 (class 1247 OID 362578)
-- Name: StockChangeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockChangeType" AS ENUM (
    'SALE',
    'RETURN',
    'RESTOCK',
    'ADJUSTMENT',
    'BUNDLE_SALE'
);


ALTER TYPE public."StockChangeType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 241 (class 1259 OID 363074)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 362647)
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    label text,
    street text NOT NULL,
    city text NOT NULL,
    province text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'South Africa'::text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 362754)
-- Name: ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ads (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    badge text,
    "backgroundColor" text NOT NULL,
    type text NOT NULL,
    cta text,
    href text,
    price text,
    period text,
    phone text,
    features jsonb,
    services jsonb,
    extras jsonb,
    "imageUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "heroTitle" text,
    "heroSubtitle" text,
    "heroSlides" jsonb,
    "heroCtaText" text,
    "heroCtaLink" text,
    "heroQuoteText" text,
    "heroQuoteLink" text,
    "descriptionColor" text,
    "subtitleColor" text,
    "textColor" text,
    "ctaBgColor" text,
    "ctaTextColor" text,
    "secondaryBgColor" text,
    "secondaryTextColor" text,
    "cardAccentColor" text,
    "cardBgColor" text,
    "cardBtnBgColor" text,
    "cardBtnTextColor" text,
    "cardNameColor" text,
    "cardPriceColor" text,
    "cardBorderColor" text,
    "eyebrowBgColor" text,
    "eyebrowBorderColor" text,
    "eyebrowTextColor" text,
    "slideBadgeBgColor" text,
    "slideBadgeBorderColor" text,
    "slideBadgeTextColor" text,
    "heroTemplate" text
);


ALTER TABLE public.ads OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 362744)
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "logoUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 362774)
-- Name: bundle_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bundle_items (
    id text NOT NULL,
    "bundleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.bundle_items OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 362764)
-- Name: bundles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bundles (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "bundlePrice" double precision NOT NULL,
    "imageUrl" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bundles OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 368477)
-- Name: business_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_settings (
    id text NOT NULL,
    name text DEFAULT 'Bretune Technologies'::text NOT NULL,
    email text DEFAULT 'sales@bretune.co.za'::text NOT NULL,
    phone text DEFAULT '+27 61 268 5933'::text NOT NULL,
    address text DEFAULT '123 Main Road, Cape Town, 8001, South Africa'::text NOT NULL,
    "bankName" text,
    "accountNumber" text,
    "accountHolder" text,
    "branchCode" text,
    "accountType" text DEFAULT 'Current'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "legalName" text DEFAULT 'Bretune Technologies (Pty) Ltd'::text NOT NULL,
    "registrationNumber" text DEFAULT '2025/545182/07'::text NOT NULL,
    "taxNumber" text DEFAULT '9276141273'::text NOT NULL,
    website text DEFAULT 'https://bretunetech.com'::text NOT NULL,
    "supportEmail" text DEFAULT 'support@bretunetech.com'::text NOT NULL,
    country text DEFAULT 'South Africa'::text NOT NULL,
    "businessType" text DEFAULT 'Technology Ecommerce & Solutions Provider'::text NOT NULL,
    "showLegalInfo" boolean DEFAULT true NOT NULL,
    "maintenanceMode" boolean DEFAULT false NOT NULL,
    "maintenanceMessage" text,
    "vatIncluded" boolean DEFAULT true NOT NULL,
    "vatRate" double precision DEFAULT 15 NOT NULL
);


ALTER TABLE public.business_settings OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 362790)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text,
    "bundleId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "warehouseLocation" text
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 362782)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 362666)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "parentId" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 363065)
-- Name: enquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enquiries (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service text,
    budget text,
    urgency text,
    message text NOT NULL,
    status public."EnquiryStatus" DEFAULT 'NEW'::public."EnquiryStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.enquiries OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 362833)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text,
    "customerAddress" text,
    "businessName" text DEFAULT 'Bretune Technologies'::text NOT NULL,
    "businessReg" text,
    "vatNumber" text,
    subtotal double precision NOT NULL,
    "vatAmount" double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    "amountPaid" double precision DEFAULT 0 NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "paymentMethod" public."PaymentMethod",
    "paymentRef" text,
    "orderId" text,
    "userId" text,
    items jsonb NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 411123)
-- Name: marketing_ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_ads (
    id text NOT NULL,
    title text NOT NULL,
    template text NOT NULL,
    "productId" text,
    "productName" text NOT NULL,
    "productImage" text,
    price text,
    "salePrice" text,
    brand text,
    description text,
    headline text NOT NULL,
    subheading text,
    benefits jsonb,
    pricing jsonb,
    branding jsonb,
    "exportFormat" text DEFAULT 'facebook_post'::text NOT NULL,
    "generatedImageUrl" text,
    "generatedThumbnailUrl" text,
    "downloadCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.marketing_ads OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 367623)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 362809)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    "bundleId" text,
    name text NOT NULL,
    price double precision NOT NULL,
    quantity integer NOT NULL,
    "warehouseLocation" text
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 362798)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "addressId" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'EFT'::public."PaymentMethod" NOT NULL,
    "paymentRef" text,
    "idempotencyKey" text,
    subtotal double precision NOT NULL,
    "shippingCost" double precision DEFAULT 0 NOT NULL,
    "totalPrice" double precision NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedByAdminId" text,
    "deletedByAdminName" text
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 362701)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 362692)
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_specifications (
    id text NOT NULL,
    "productId" text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 362710)
-- Name: product_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tags (
    id text NOT NULL,
    "productId" text NOT NULL,
    tag text NOT NULL
);


ALTER TABLE public.product_tags OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 362735)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    "priceAdjust" double precision DEFAULT 0 NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 362675)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "categoryId" text NOT NULL,
    condition public."ProductCondition" DEFAULT 'NEW'::public."ProductCondition" NOT NULL,
    "costPrice" double precision NOT NULL,
    "sellingPrice" double precision NOT NULL,
    "originalPrice" double precision,
    "discountExpiresAt" timestamp(3) without time zone,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 5 NOT NULL,
    "supplierName" text,
    sku text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "vendorId" text,
    "manualUrl" text,
    "additionalInfo" text,
    "averageRating" double precision DEFAULT 0 NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "shippingDays" integer DEFAULT 3 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "stockCpt" integer DEFAULT 0 NOT NULL,
    "stockDbn" integer DEFAULT 0 NOT NULL,
    "stockJhb" integer DEFAULT 0 NOT NULL,
    "brandId" text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 412027)
-- Name: return_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_attachments (
    id text NOT NULL,
    "returnRequestId" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text,
    "uploadedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.return_attachments OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 412019)
-- Name: return_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_items (
    id text NOT NULL,
    "returnRequestId" text NOT NULL,
    "orderItemId" text NOT NULL,
    "productId" text,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    total double precision NOT NULL,
    reason text,
    "conditionReceived" text,
    "inspectionNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.return_items OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 412009)
-- Name: return_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_requests (
    id text NOT NULL,
    "returnNumber" text NOT NULL,
    "orderId" text NOT NULL,
    "customerId" text NOT NULL,
    status public."ReturnStatus" DEFAULT 'REQUESTED'::public."ReturnStatus" NOT NULL,
    "requestedResolution" public."ReturnResolution" NOT NULL,
    "customerReason" text NOT NULL,
    "customerComment" text,
    "adminNote" text,
    "customerVisibleNote" text,
    "totalReturnValue" double precision DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.return_requests OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 412035)
-- Name: return_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_status_history (
    id text NOT NULL,
    "returnRequestId" text NOT NULL,
    "oldStatus" public."ReturnStatus" NOT NULL,
    "newStatus" public."ReturnStatus" NOT NULL,
    note text,
    "changedByAdminId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.return_status_history OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 362725)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    title text,
    comment text,
    "isApproved" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 362824)
-- Name: service_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_bookings (
    id text NOT NULL,
    "bookingNumber" text NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text NOT NULL,
    company text,
    "serviceType" public."BookingServiceType" NOT NULL,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    province text NOT NULL,
    "postalCode" text NOT NULL,
    "preferredDate" timestamp(3) without time zone,
    "scheduledDate" timestamp(3) without time zone,
    "scheduledTime" text,
    "technicianId" text,
    "technicianName" text,
    description text,
    "internalNotes" text,
    "estimatedCost" double precision,
    "finalCost" double precision,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailCount" integer DEFAULT 0 NOT NULL,
    "emailSentAt" timestamp(3) without time zone
);


ALTER TABLE public.service_bookings OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 362845)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "group" text DEFAULT 'general'::text NOT NULL,
    description text,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 362816)
-- Name: stock_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_history (
    id text NOT NULL,
    "productId" text NOT NULL,
    "changeType" public."StockChangeType" NOT NULL,
    "quantityChange" integer NOT NULL,
    "previousQty" integer NOT NULL,
    "newQty" integer NOT NULL,
    "orderId" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stock_history OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 388254)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    name text NOT NULL,
    "contactPerson" text,
    email text,
    phone text,
    website text,
    address text,
    city text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 362637)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "avatarUrl" text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailOtp" text,
    "emailOtpExpiry" timestamp(3) without time zone,
    "isVerified" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 362656)
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessName" text NOT NULL,
    slug text NOT NULL,
    description text,
    "logoUrl" text,
    "commissionRate" double precision DEFAULT 0.10 NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 362717)
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- TOC entry 5351 (class 0 OID 363074)
-- Dependencies: 241
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
48b2665b-d02c-4055-b8b4-7699ec017125	2a8eb0ee89c8e2397d15f2cad170f6567c1877cfe5149617446a7067dab72eec	2026-06-02 08:58:37.717022+02	20260408001936_init	\N	\N	2026-06-02 08:58:37.542534+02	1
\.


--
-- TOC entry 5328 (class 0 OID 362647)
-- Dependencies: 218
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "userId", label, street, city, province, "postalCode", country, "isDefault") FROM stdin;
62be76c3-52f0-4929-9d37-162d45cfe0ef	ed03c631-4984-4ed7-8fad-248032f69b04	\N	134 Kommitjie Road, Fish Hoek	Cape Town	Western Cape	7975	South Africa	f
2641a5fa-5603-4666-97e9-22245f12d09e	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
5f901f9d-331e-4916-8ab2-ad65b441d30d	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
4fb52410-7f49-40cb-83eb-56cca0d1289f	b7ca3ae4-8daa-498b-bb4f-250735a5c130	Shipping Address	2982 Masonwabe	Capetown	Western Cape	7975	South Africa	f
63dfdbf5-d034-4e8e-ab6f-a49d295bb72b	b7ca3ae4-8daa-498b-bb4f-250735a5c130	Shipping Address	2982 Masonwabe	Capetown	Western Cape	7975	South Africa	f
722e3e71-e33f-4908-9944-5d1e27793143	b7ca3ae4-8daa-498b-bb4f-250735a5c130	Shipping Address	2982 Masonwabe	Capetown	Western Cape	7975	South Africa	t
3e8195c2-d502-46c2-b689-d05a22ec46a5	11809a30-01ac-4847-bbe3-33401aed4476	\N	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	f
d2555311-2553-48e2-8226-5bd33b87e91b	11809a30-01ac-4847-bbe3-33401aed4476	Shipping Address	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	f
d60ac0e3-5e72-45b4-8442-a8c0a26cdc9d	11809a30-01ac-4847-bbe3-33401aed4476	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	t
8ddef204-ca5d-4aed-b24f-df0892ee7a3f	a071a725-1d90-400f-b14a-fee06d77c6f6	Shipping Address	134 kommitjie Road	Fish Hoek	KwaZulu-Natal	7975	South Africa	f
f3e675a5-b774-4c4f-8433-81192f255e22	a071a725-1d90-400f-b14a-fee06d77c6f6	Shipping Address	Faerie Knowe	Capetown	Western Cape	7975	South Africa	f
96721f57-e82d-4316-ba4b-9d63c0bad032	a071a725-1d90-400f-b14a-fee06d77c6f6	Shipping Address	2659 Myeza,Masiphumelele	Capetown	KwaZulu-Natal	7975	South Africa	f
d1d6412e-1875-4d51-b740-e4e4220d2324	a071a725-1d90-400f-b14a-fee06d77c6f6	Shipping Address	2659 Myeza,Masiphumelele	Capetown	KwaZulu-Natal	7975	South Africa	t
49e62858-10b2-4316-8a70-5c0e1bd1044f	7fb306d0-f047-4146-bb07-49e5385a3cdc	Shipping Address	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	t
634e5422-c06c-47ff-ab85-978d83ccc3d3	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
91c4b40b-f1bc-4d98-ac56-9ba5336484b5	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
7e64dfa1-cc78-4cd6-afa9-839742d3abeb	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
b4a764fe-a591-487f-9275-c1f70d65782e	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
64906d0d-7448-4b7f-ba6a-01ed963849ef	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
cc8dc60c-64d2-4faf-b751-421eadb14e89	b4b9237d-4e20-4771-96b9-07ef09c80631	Shipping Address	134 Kommitjie road Fish Hoek	Capetown	Western Cape	7975	South Africa	f
452768f4-e75b-4884-9533-267783871691	b4b9237d-4e20-4771-96b9-07ef09c80631	Shipping Address	134 Kommitjie road Fish Hoek	Capetown	Western Cape	7975	South Africa	f
241a2d28-b9fa-4bee-8e81-c9b66baa0666	b4b9237d-4e20-4771-96b9-07ef09c80631	Shipping Address	134 Kommitjie road Fish Hoek	Capetown	Western Cape	7975	South Africa	f
0514bb8d-bd82-4f75-87b4-5f9f856780ea	b4b9237d-4e20-4771-96b9-07ef09c80631	Shipping Address	134 Kommitjie road Fish Hoek	Capetown	Western Cape	7975	South Africa	f
54c0c5d8-5e14-440e-b9ea-a33dedc0d1e8	b4b9237d-4e20-4771-96b9-07ef09c80631	Shipping Address	134 Kommitjie road Fish Hoek	Capetown	Western Cape	7975	South Africa	t
9256c803-3871-4a88-beb8-9a393db7553e	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
a53c2d8f-0ee5-4115-bdcf-35be96057d11	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	f
a16e6c03-f9d6-4e4b-a0ec-27534ec6d657	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	f
9a33546b-8180-4fc5-bcb6-4e37878c0b09	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	t
f2747fa7-da7c-4263-9e8d-1abe64d870ec	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
bcd53483-a83c-46bc-adb9-de06edbe4c3a	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
fe353fa0-bf57-463f-8c56-07324df6ce23	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road	Cape Town	Western Cape	7975	South Africa	f
1e841292-3a8d-432a-9809-e23b145421d7	533b4a46-5854-46e9-b084-65a7138731c4	Shipping Address	134 kommitjie road Fishhoek	Fish Hoek Capetown	Western Cape	7975	South Africa	t
\.


--
-- TOC entry 5339 (class 0 OID 362754)
-- Dependencies: 229
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ads (id, title, subtitle, badge, "backgroundColor", type, cta, href, price, period, phone, features, services, extras, "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt", "heroTitle", "heroSubtitle", "heroSlides", "heroCtaText", "heroCtaLink", "heroQuoteText", "heroQuoteLink", "descriptionColor", "subtitleColor", "textColor", "ctaBgColor", "ctaTextColor", "secondaryBgColor", "secondaryTextColor", "cardAccentColor", "cardBgColor", "cardBtnBgColor", "cardBtnTextColor", "cardNameColor", "cardPriceColor", "cardBorderColor", "eyebrowBgColor", "eyebrowBorderColor", "eyebrowTextColor", "slideBadgeBgColor", "slideBadgeBorderColor", "slideBadgeTextColor", "heroTemplate") FROM stdin;
550669f5-31be-4e99-8811-576752041461	New Arrival	Upgrade Your Network Today	Premium Quality	linear-gradient(135deg, #f97316 0%, #9333ea 100%)	side-left	Get Quote	/services	\N	\N	\N	\N	\N	\N	https://res.cloudinary.com/dojzkljaa/image/upload/v1781940764/bretunetech/ads/chatgpt-image-jun-20--2026--09_32_35-am.jpg	0	t	2026-06-20 06:57:13.042	2026-06-20 07:33:05.918	\N	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	split
\.


--
-- TOC entry 5338 (class 0 OID 362744)
-- Dependencies: 228
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name, slug, description, "logoUrl", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c	Linkbasic	linkbasic	\N	https://capitalit.co.za/wp-content/uploads/2018/04/Capital-ITC-linkbasic.png	t	0	2026-06-08 21:34:23.43	2026-06-08 21:34:23.43
23622a40-8984-48d8-956f-4961f9de3310	Mikrotik	mikrotik	\N	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT5p61qX8Sy5L6iY4T4pEBWS28_BDpZupLYg&s	t	0	2026-06-08 00:34:28.646	2026-06-08 21:37:25.812
6d8db5ba-c261-41f5-baec-2ea276029ba8	Scoop	scoop	\N	https://media.licdn.com/dms/image/v2/C4D0BAQHxauNPdMYqww/company-logo_200_200/company-logo_200_200/0/1631347841933?e=2147483647&v=beta&t=_K1-0c9rhSlmKPFn6kzN3FfRotlUtCu2XfReBCeUwgI	t	0	2026-06-08 21:32:42.872	2026-06-09 22:46:12.899
9cd67eab-3117-4ee3-bc46-103e8271773d	Ubiquiti	ubiquiti	\N	https://upload.wikimedia.org/wikipedia/commons/3/3d/Ubiquiti_Logo_Horizontal.png	t	0	2026-06-08 00:34:43.843	2026-06-09 22:47:48.816
242ce27a-6f1e-484f-8f28-27cdbaa81696	Cudy	cudy	\N	\N	t	0	2026-06-18 23:09:43.733	2026-06-18 23:09:43.733
fc9e8c70-8ab3-4074-90ba-0b85851b426c	Fanvil	fanvil	\N	\N	t	0	2026-06-18 23:09:43.744	2026-06-18 23:09:43.744
3ee4b8f5-0eb6-48dc-8e3d-0c6ca00fbdbd	Rackstuds	rackstuds	\N	\N	t	0	2026-06-18 23:09:43.761	2026-06-18 23:09:43.761
26a5a808-02b0-4f61-9837-6c473236a4ec	Reyee	reyee	\N	https://eo-sgp-cos.ruijie.com/site_style/new_navs/fer/upimg/logo.svg	t	0	2026-06-18 23:09:43.752	2026-06-18 23:17:28.381
\.


--
-- TOC entry 5341 (class 0 OID 362774)
-- Dependencies: 231
-- Data for Name: bundle_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundle_items (id, "bundleId", "productId", quantity) FROM stdin;
\.


--
-- TOC entry 5340 (class 0 OID 362764)
-- Dependencies: 230
-- Data for Name: bundles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundles (id, name, slug, description, "bundlePrice", "imageUrl", "isFeatured", "isActive", "createdAt", "updatedAt") FROM stdin;
8e1cc90c-c71b-4677-95e6-49f488225395	Load Shedding Backup Kit	load-shedding-backup-kit	Beat load shedding with a powerful inverter and lithium battery combo. Keep your home or office running.	23999	https://res.cloudinary.com/dojzkljaa/image/upload/v1781832443/bretunetech/ads/chatgpt-image-jun-18--2026--03_18_02-am.jpg	t	t	2026-06-14 23:29:59.453	2026-06-19 01:27:29.467
07136fc3-ee1c-4534-a95f-7096fbb9d622	Work From Home Kit	work-from-home-kit	Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals.	9499	\N	t	t	2026-06-14 23:29:59.452	2026-06-14 23:29:59.452
5b22de96-7bfa-4a07-b541-503a7d300603	Small Business Network Kit	small-business-network-kit	Professional networking setup for small businesses — router, access point, and bulk cabling.	4999	\N	t	t	2026-06-14 23:29:59.453	2026-06-14 23:29:59.453
\.


--
-- TOC entry 5353 (class 0 OID 368477)
-- Dependencies: 243
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_settings (id, name, email, phone, address, "bankName", "accountNumber", "accountHolder", "branchCode", "accountType", "createdAt", "updatedAt", "legalName", "registrationNumber", "taxNumber", website, "supportEmail", country, "businessType", "showLegalInfo", "maintenanceMode", "maintenanceMessage", "vatIncluded", "vatRate") FROM stdin;
9eb1de1a-f6ce-4d1f-9b1a-affa2c9a031d	Bretune Technologies	sales@bretune.co.za	+27 61 268 5933	134 KOMMITJIE ROAD FISH HOEK CAPE TOWN WESTERN CAPE 7975	 FNB/RMB	63164874175	Bretune Technologies (pty) Ltd	250655	Gold Business	2026-06-10 01:54:58.622	2026-06-19 00:58:14.206	Bretune Technologies (Pty) Ltd	2025/545182/07	9276141273	https://bretunetech.com	support@bretunetech.com	South Africa	Technology Ecommerce & Solutions Provider	t	f	We are currently performing maintenance. Please check back soon.	t	15
\.


--
-- TOC entry 5343 (class 0 OID 362790)
-- Dependencies: 233
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, "cartId", "productId", "bundleId", quantity, "warehouseLocation") FROM stdin;
a76266cd-c740-4a21-8c68-83389a5f6b61	2bdf2de2-6f86-49c0-bdd8-215796f2b4ce	\N	\N	1	CPT
\.


--
-- TOC entry 5342 (class 0 OID 362782)
-- Dependencies: 232
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, "userId", "createdAt", "updatedAt") FROM stdin;
5c4bc31e-8f76-43c2-b6e8-7168a8509002	533b4a46-5854-46e9-b084-65a7138731c4	2026-06-15 08:51:45.569	2026-06-15 08:51:45.569
2bdf2de2-6f86-49c0-bdd8-215796f2b4ce	ed03c631-4984-4ed7-8fad-248032f69b04	2026-06-19 00:17:27.451	2026-06-19 00:17:27.451
\.


--
-- TOC entry 5330 (class 0 OID 362666)
-- Dependencies: 220
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, "imageUrl", "parentId", "sortOrder", "createdAt", "updatedAt") FROM stdin;
c47e0b89-5435-40d5-8998-bec57df85f07	Accessories	accessories	Cables, adapters, peripherals, and more	\N	\N	4	2026-06-14 23:29:59.214	2026-06-14 23:29:59.214
47b467e9-cd20-4709-bbaa-2774a0003d2c	Technology	technology	Laptops, tablets, and computing devices	/assets/brands/mikrotik.svg	\N	1	2026-06-14 23:29:59.206	2026-06-14 23:29:59.206
daa57c23-4c7a-4fca-8d45-9732b4a31036	Power Solutions	power-solutions	Inverters, batteries, UPS, and solar products	/assets/brands/must.svg	\N	2	2026-06-14 23:29:59.207	2026-06-14 23:29:59.207
91c4222c-dcb8-4770-9937-f3a5eecf2503	Internet & Networking	internet-networking	Routers, switches, and networking equipment	/assets/brands/ubiquiti.png	\N	3	2026-06-14 23:29:59.207	2026-06-14 23:29:59.207
6e1fce5b-710f-468e-914a-96512d73585a	General	general	Auto-created from import: "general"	\N	\N	0	2026-06-14 23:34:26.86	2026-06-14 23:34:26.86
\.


--
-- TOC entry 5350 (class 0 OID 363065)
-- Dependencies: 240
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiries (id, name, email, phone, company, service, budget, urgency, message, status, notes, "createdAt", "updatedAt") FROM stdin;
1bd6601c-c1e3-4d67-b4ce-0aea0c088f45	fortune	fortunematenda@gmail.com	0612685933	matenda	\N	\N	\N	tsjsdjhsduyfjghfcudfhfmdfdhjdfj;k	REPLIED	\N	2026-06-07 12:56:05.653	2026-06-07 13:01:59.067
d5b55f32-0074-4143-a20c-c45286e6702a	fortune	fortunematenda@gmail.com	0612685933	Bretune	\N	\N	\N	dfgfgfggfdgdfgsdadsfd	CLOSED		2026-06-07 22:21:20.273	2026-06-07 22:21:55.753
a659a927-eb29-4c6c-b474-d3e826a16383	Fortune Matenda	fortunematenda5@gmail.com	0612685933	Bretune Technologies	Fibre Installations	\N	\N	Service: Fibre Installations\nBudget: Under R5,000\nUrgency: ASAP (within a week)\n\ndcvcdaveavbfbvfdvfbfb v  	REPLIED	\N	2026-06-09 22:52:20.27	2026-06-10 00:23:25.683
\.


--
-- TOC entry 5348 (class 0 OID 362833)
-- Dependencies: 238
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "invoiceNumber", "customerName", "customerEmail", "customerPhone", "customerAddress", "businessName", "businessReg", "vatNumber", subtotal, "vatAmount", total, "amountPaid", status, "dueDate", "paidAt", "paymentMethod", "paymentRef", "orderId", "userId", items, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5355 (class 0 OID 411123)
-- Dependencies: 245
-- Data for Name: marketing_ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_ads (id, title, template, "productId", "productName", "productImage", price, "salePrice", brand, description, headline, subheading, benefits, pricing, branding, "exportFormat", "generatedImageUrl", "generatedThumbnailUrl", "downloadCount", "isActive", "createdAt", "updatedAt") FROM stdin;
023f3f35-fa95-4265-a4ea-522b4f3144f0	Winter Sale 2026	powder_splash	\N	Reyee Dual Band WiFi 5 1200Mbps 5dBi Fast Ethernet Mesh Router	https://res.cloudinary.com/dojzkljaa/image/upload/v1781998341/marketing-ads/chatgpt_image_jun_21__2026__01_23_05_am-removebg-preview.png	R1425.00	R1125.00	Reyee	\N	No More Dead Zones	Fast, Reliable Whole-Home Mesh WiFi Coverage	[]	\N	{"showLogo": true, "showPhone": true, "showWebsite": true, "showFacebook": true, "showLinkedIn": true}	facebook_post	\N	\N	0	t	2026-06-20 23:16:13.285	2026-06-20 23:32:25.502
\.


--
-- TOC entry 5352 (class 0 OID 367623)
-- Dependencies: 242
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", type, title, message, link, "isRead", metadata, "createdAt") FROM stdin;
\.


--
-- TOC entry 5345 (class 0 OID 362809)
-- Dependencies: 235
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", "bundleId", name, price, quantity, "warehouseLocation") FROM stdin;
8269b5d5-8278-4fab-bb5c-97cd9c386261	b19a7020-1d73-4dd0-a37e-270f9d65ce2d	\N	\N	Ubiquiti UISP WaveFiber SC/APC 2.5Gbps Ethernet ONU 20pk	15695	1	CPT
18dee5d4-3e2a-4392-919e-80bffb75e99c	5af022b7-07e2-4120-9903-f628c847cf00	\N	\N	Linkbasic Grey Boots RJ45	0.95	1	CPT
37032162-f16d-40c6-8640-830eb92f0657	0075196c-a824-427f-9b5c-27e6f82294be	\N	\N	Linkbasic RJ45 Cat5e UTP Modular Plug	1.5	1	CPT
da05a882-9adf-4cad-802a-9bbcbcb100e3	b4b98baa-89cb-41de-a13d-6a4f69a21094	\N	\N	Reyee 2.4GHz 300Mbps 8dBi 70° Pre-Paired Kit	825	1	CPT
09e853ff-bf3f-4489-a763-9a07a0472851	6e7963b2-5000-4808-9ac1-0a6a7b6b5a69	\N	\N	Cudy Dual Band WiFi 5 1200Mbps Fast Ethernet Mesh 3 Pack	1125	2	CPT
96dcb22a-bf92-4c86-abf9-946fce6a6ab6	0bc51d9e-186c-4fda-b8e6-8d2e1a68d7ee	\N	\N	Cudy Dual Band WiFi 5 1200Mbps Fast Ethernet Mesh 3 Pack	1125	2	CPT
f28ccd8d-3be1-4b7b-8a9f-218af86c4173	199b1c76-f358-4a6c-989a-aa6cbf3199db	\N	\N	Cudy Dual Band WiFi 5 1200Mbps Fast Ethernet Mesh 3 Pack	1125	2	CPT
c6755566-6c27-4981-a92f-d73a767ff6a8	f87357e0-bb5a-406f-935c-f8f7628417f7	\N	\N	Cudy Dual Band WiFi 5 1200Mbps Fast Ethernet Mesh 3 Pack	1125	1	CPT
d4da0c27-bee6-404a-bddd-8d4ff0f4eb4d	5106015b-e423-46a6-a5ee-024a6caaa615	686fef89-e035-4439-9b37-211f842454e8	\N	Ubiquiti UISP 60GHz/5GHz Wave Long Range Radio	9425	1	\N
\.


--
-- TOC entry 5344 (class 0 OID 362798)
-- Dependencies: 234
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "userId", "addressId", status, "paymentMethod", "paymentRef", "idempotencyKey", subtotal, "shippingCost", "totalPrice", notes, "createdAt", "updatedAt", "deletedAt", "deletedByAdminId", "deletedByAdminName") FROM stdin;
b19a7020-1d73-4dd0-a37e-270f9d65ce2d	VN-MQEZXWZX-1DCR	533b4a46-5854-46e9-b084-65a7138731c4	fe353fa0-bf57-463f-8c56-07324df6ce23	PENDING	EFT	\N	\N	15695	0	15695		2026-06-15 09:14:06.299	2026-06-15 09:14:06.299	\N	\N	\N
6e7963b2-5000-4808-9ac1-0a6a7b6b5a69	VN-MQEZ5GT1-814I	533b4a46-5854-46e9-b084-65a7138731c4	2641a5fa-5603-4666-97e9-22245f12d09e	PENDING	EFT	\N	\N	2250	0	2250		2026-06-15 08:51:58.946	2026-06-18 23:25:33.828	2026-06-18 23:25:33.82	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
0bc51d9e-186c-4fda-b8e6-8d2e1a68d7ee	VN-MQEZB2D1-7ROE	533b4a46-5854-46e9-b084-65a7138731c4	5f901f9d-331e-4916-8ab2-ad65b441d30d	PENDING	EFT	\N	\N	2250	0	2250		2026-06-15 08:56:20.162	2026-06-18 23:25:37.075	2026-06-18 23:25:37.074	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
199b1c76-f358-4a6c-989a-aa6cbf3199db	VN-MQEZBTQB-P1M5	533b4a46-5854-46e9-b084-65a7138731c4	634e5422-c06c-47ff-ab85-978d83ccc3d3	PENDING	EFT	\N	\N	2250	0	2250		2026-06-15 08:56:55.62	2026-06-18 23:25:40.083	2026-06-18 23:25:40.082	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
f87357e0-bb5a-406f-935c-f8f7628417f7	VN-MQEZH8LW-7V40	533b4a46-5854-46e9-b084-65a7138731c4	91c4b40b-f1bc-4d98-ac56-9ba5336484b5	PENDING	EFT	\N	\N	1125	99	1224		2026-06-15 09:01:08.194	2026-06-18 23:25:43.676	2026-06-18 23:25:43.676	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
b4b98baa-89cb-41de-a13d-6a4f69a21094	VN-MQEZOCEM-CMUH	533b4a46-5854-46e9-b084-65a7138731c4	7e64dfa1-cc78-4cd6-afa9-839742d3abeb	PENDING	EFT	\N	\N	825	99	924		2026-06-15 09:06:39.694	2026-06-18 23:25:46.282	2026-06-18 23:25:46.282	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
5af022b7-07e2-4120-9903-f628c847cf00	VN-MQEZPI03-E5J2	533b4a46-5854-46e9-b084-65a7138731c4	f2747fa7-da7c-4263-9e8d-1abe64d870ec	PENDING	EFT	\N	\N	0.95	99	99.95		2026-06-15 09:07:33.616	2026-06-18 23:25:55.194	2026-06-18 23:25:55.193	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
0075196c-a824-427f-9b5c-27e6f82294be	VN-MQEZS90D-WSFK	533b4a46-5854-46e9-b084-65a7138731c4	bcd53483-a83c-46bc-adb9-de06edbe4c3a	PENDING	EFT	\N	\N	1.5	99	100.5		2026-06-15 09:09:41.918	2026-06-18 23:26:07.87	2026-06-18 23:26:07.869	533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com
5106015b-e423-46a6-a5ee-024a6caaa615	VN-MQODH9B3-JHNI	533b4a46-5854-46e9-b084-65a7138731c4	1e841292-3a8d-432a-9809-e23b145421d7	COMPLETED	EFT	\N	\N	9425	0	9425		2026-06-21 22:42:59.309	2026-06-21 23:20:48.272	\N	\N	\N
\.


--
-- TOC entry 5333 (class 0 OID 362701)
-- Dependencies: 223
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, "productId", url, "altText", "sortOrder", "isPrimary") FROM stdin;
61eda078-d7c5-4a9e-9698-f0ba26e18ce5	1fccc1b8-46c9-4f06-8c9b-6d9770839e47	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090882/bretunetech/products/s9xbeznn2ier7vd70bib.jpg	Ubiquiti UniFi Switch Lite 16 Port Gigabit 8PoE 45W	0	t
11562227-ed09-4909-ae6b-e67cdb08af1d	1fdd49fe-9c54-4b7a-a5b0-7d9b21a4869d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090883/bretunetech/products/hes3eykzhlya2zo0ngbc.jpg	Ubiquiti UniFi Flex Switch Utility Outdoor Enclosure	0	t
da382522-544f-4dba-853c-b4f25222052e	87f164f8-149d-4e26-af77-3bf3d7afb226	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090884/bretunetech/products/ksuk14mf3cvdwaviasrt.png	Ubiquiti UniFi Aggregation Switch 8SFP+	0	t
f87917c9-3dc0-4429-a583-53a48f61529e	111375ae-8016-4890-9e22-9292d99f7dad	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090885/bretunetech/products/dcypsylesr6al4jsom7k.jpg	Ubiquiti UniFi Flex 2.5G PoE 8 Port PoE with 10G Combo Uplink	0	t
189e9de9-0512-4edc-b311-dfbdd71bc088	558e8106-a086-40cb-8dd9-fa07b06d6b47	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090886/bretunetech/products/wsfjs7k2mm0i0mkrgbjt.jpg	Ubiquiti UniFi Flex 2.5G 8 Port 2.5G with 10G Combo Uplink	0	t
c253afd7-3216-4fe4-9e03-3cd985206f0f	ed7dcf9f-0f88-4d94-be36-c3d3ca330426	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090887/bretunetech/products/eesvymeltidlygwx0cgg.jpg	Ubiquiti UniFi Flex Mini 5 Port Gigabit 1PoE Input	0	t
1f377558-3661-4cf8-8e8c-2b1f2399ceec	d5c59a34-cfe1-4177-8c13-d52b8c27a67c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090911/bretunetech/products/rzshhu5gjpu3cwwbi7cd.jpg	Ubiquiti UniFi AI Horn Speaker 120dB	0	t
d448531c-d472-49c5-b9b3-1ddec3776f9e	bce5c576-ebd4-4901-bf69-67303634c937	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090912/bretunetech/products/j0hzcxzyfvyoao9byufh.jpg	Ubiquiti UniFi Protect AI Port	0	t
3146b808-6e4a-493b-b85e-2a135c2c9f69	1c42516d-904e-4cb4-92f4-7d36aaeb123c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090913/bretunetech/products/darzamhalv9ekyilqygy.jpg	Ubiquiti UniFi Protect 7 Bay 1SFP+ Gigabit Ethernet NVR Pro	0	t
329ca663-c6a3-49ba-abd8-0f86682fc36d	ecf76421-e3f5-4123-bf5f-079bb7bbd3c7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090914/bretunetech/products/l1wfl5xjigagm2wa6r4q.jpg	Ubiquiti UniFi Protect Network Video Recorder Instant	0	t
5c2ea613-f4ae-458c-923b-49c3bc3c8a1a	845dfcea-78c5-4768-8e86-0ff38de5de07	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090915/bretunetech/products/epg0bxkqh8vzacks1fsl.jpg	Ubiquiti UniFi Protect 4 Bay 1SFP+ Gigabit Ethernet NVR	0	t
d56ec51b-c438-42a7-8f88-0b51948a3d68	b72ce05d-c0fb-4507-a706-5cf54c08bf18	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090916/bretunetech/products/jkggzv2toy0pfv0n28n3.jpg	Ubiquiti UniFi NAS Pro 2U 7 Drive Bays	0	t
050aca16-250d-42d7-902e-e823af50347f	7255b5bf-0caa-4cf2-be78-0affddac9065	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090917/bretunetech/products/ke4q2wjesrmug0xpxarf.jpg	Ubiquiti UniFi White UNAS 2.5Gbps Ethernet 2x 3.5" HDD bays	0	t
75e1ff55-eb81-4eba-859d-a3a167cd63a2	63422a18-d703-4268-a192-ac56c5f6f94b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090918/bretunetech/products/v56z81otnosswsnyggkd.jpg	Ubiquiti UniFi Black UNAS 2.5Gbps Ethernet 2x 3.5" HDD bays	0	t
8b6f6000-d2e8-4a2c-8bb9-732bb34cb1a7	979f3d6e-3e99-43df-9f79-3a40fe4ab64c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090919/bretunetech/products/oqmakiyf1ovxi2imapmg.jpg	Ubiquiti UniFi LTE4 Managed WiFi 4 Mobile Router Ultra	0	t
297831a7-002d-4946-9bb9-be620cb14dec	9eac4668-c31d-4d7e-a02e-7b05bd916c8b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090920/bretunetech/products/twg1vjudumj72dogzhal.jpg	Ubiquiti UniFi Mobile Industrial Router	0	t
9b54fd10-95f1-4351-b783-a8d70ba8ba76	aa1da2b1-c1fd-45ce-9896-103f91904ae6	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090922/bretunetech/products/bwloryiothcnkvkqpj7c.jpg	Ubiquiti UniFi Swiss Army Knife Ultra WiFi 5 AP	0	t
a03a36ad-61a8-4121-b441-165b671bd07e	ccd65b18-2b32-4777-bbbf-ba310c50f03d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090924/bretunetech/products/gqvz457hte2wtn5yagcl.jpg	Ubiquiti UISP Switch 8 Port Gigabit PoE 110W 1SFP	0	t
84077bb8-7580-4cc4-870d-8189251f72ec	539195e4-c72d-4a3a-b31b-a4339512cb45	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090925/bretunetech/products/c5kgpkksg6k2e7pmnvyj.png	Ubiquiti UISP Router Pro 9 Port Gigabit 4SFP+	0	t
02cabcd6-0089-4bf5-b4db-ac28ab4254e1	366cc49c-623e-4e26-99b5-53bce4e4d1aa	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090926/bretunetech/products/mozksum9qgnnhan48mre.jpg	Ubiquiti UISP Console 9 Port Gigabit 2SFP+	0	t
427a52e3-6613-410d-9aba-b24e7da4ab62	3ce85696-4739-4cbe-90ed-e25155cb0dcc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090946/bretunetech/products/bbmxrfirbxil7c42pa0n.jpg	Ubiquiti 10G Multi-WAN UniFi Cloud Gateway Fiber without M.2 SSD Tray	0	t
76e75e2f-b505-4c71-b8dc-70ef6d2b3d87	32c33dbd-2000-43ae-87b1-a8ace9aa0c3f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090947/bretunetech/products/lioyqecqvze1gs1axum8.jpg	Ubiquiti UniFi Dual Band WiFi 6 HDMI Display Cast Lite	0	t
bf32f59a-3a75-4686-a52b-3ad44494e1ce	acae9831-050a-4ba6-b5b0-6c9cfc7d23f2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090948/bretunetech/products/dfhdmg0s60uvmuxczqnk.jpg	U-Bolt 50mm Mild Steel	0	t
0aaab20a-ec76-4171-b1c7-ff7c18b690ff	428ba69e-f8b9-4f37-8690-224a49e3f8a0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090957/bretunetech/products/g02xf0e4vlavdj2guyu2.jpg	Ubiquiti UISP Power TransPort Cable 20M	0	t
c7afc2bd-dd06-455b-9290-d1d4d6b1a395	377a32e6-e626-4a8b-b24f-d96c2e79bd43	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090958/bretunetech/products/diquajv2s6eajoaw8dyu.jpg	Ubiquiti UISP Power TransPort Cable 1.5M	0	t
f5fa91da-d0b0-429d-9b55-5ab34744a67b	e8ea8885-1273-420c-a6e9-2781de479bb0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090959/bretunetech/products/q7xrlzo02ueskkkslhwb.jpg	Ubiquiti UniFi M.2 SSD Tray for UCG Fiber	0	t
ecce2189-dd27-4873-b3c3-6c37d485cda0	04eac9ac-20cf-4ef7-b9dc-d0cd91543303	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090960/bretunetech/products/omcu6k6zjcsqtfbf56gm.jpg	Ubiquiti Single Mode 1.25G LC Bi-Directional SFP 3km	0	t
27c23c55-495f-48e1-8971-76186c54ae6b	58912b3d-6ac3-4c2c-b5b3-a9321647303b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090961/bretunetech/products/mavqajg7fufoi4kzm1e1.jpg	Ubiquiti Single Mode 10G LC SFP+  1310nm 10km	0	t
61af3ae9-a379-4d8c-9a7f-9c8f64ac0868	138f14a7-9d34-490d-8e48-6f6ba610e4c5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090962/bretunetech/products/xpm6s6grhlp81r7u99sd.jpg	Ubiquiti 1.25G SFP to RJ45 Gigabit Ethernet Module	0	t
20977c4f-3829-49f2-b7f9-9b7aea17862d	27d97f60-bb9f-42bd-a574-4f45f823e301	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090963/bretunetech/products/aype36q8mnd3uw0q8hvb.jpg	Ubiquiti RJ45 Dust Cover 24-Pack	0	t
bcd8c549-af65-499d-9397-7f95d98207b9	8ff208d6-3c34-4b9f-b271-963fd6e1c97e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090888/bretunetech/products/knppdevbeb6uqqg0xm8p.jpg	Ubiquiti UniFi Flex Mini 2.5Gbps 5 Port Switch with PoE Input	0	t
73bacd2b-207e-417b-838d-acede87c2067	f27ad17c-ab47-497b-b26c-bc86c6bf395d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090926/bretunetech/products/cvqe0gupexuik9arpzjs.jpg	Ubiquiti UISP IPX6 Enclosure for UISP-R and UISP-S	0	t
4424c765-7684-48be-bcb7-64478ee47ded	0416e6f2-5ccb-4589-a2ac-8d7ca4ffc194	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090928/bretunetech/products/vgdvyirjcrl8ysfg9ptq.jpg	Ubiquiti UniFi CyberSecure 1 Year Subscription	0	t
2c6656e8-a7db-484c-984b-1d6efd0ed058	08c1effb-5fb4-4027-942d-fefd5a33b39a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090929/bretunetech/products/pn2wsq5zn1szlcjdfdpl.jpg	U.FL to SMA Female Bulkhead	0	t
8b24da82-e767-472c-80cb-d1920bf7963a	0bd22bb1-fe86-4411-b356-3f6f6fc0d480	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090930/bretunetech/products/zhftyjkivs7fgfplstut.jpg	Ubiquiti UISP Fiber WiFi 6 GPON CPE with 4 Gigabit Ports	0	t
36ad428d-f272-4948-a3a0-19fe0bc093a5	98c573c3-6c31-481f-b820-798372b8d357	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090931/bretunetech/products/dfuw7i6ujlit9kjydtsx.jpg	Ubiquiti UISP Fiber WiFi GPON CPE with 4 Gigabit Ports	0	t
cf8ea33a-73cd-49a1-8513-beea40391ea5	6f511958-e8cf-4440-a90e-2fe367513541	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090932/bretunetech/products/lrjjc19ya0xosgx7wur8.jpg	Ubiquiti UISP Fiber GPON OLT 8 PON Ports 2SFP+	0	t
fae98a74-2f8a-4a0a-9061-b66a1a9c8f7f	23669c9c-fa15-4ee6-898d-184c688a6935	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090933/bretunetech/products/bhkntersol26r1njkqx7.jpg	Ubiquiti GPON C+ SC/UPC 20km SFP Module	0	t
51e6f235-7192-4869-bb6c-4b25620a7fe0	b68f7ecc-d6aa-4634-aed9-405390ed678d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090949/bretunetech/products/pk2al192ezl2fqbxldkd.jpg	Ubiquiti Grounded Ethernet Surge Protector	0	t
cd3e22e5-3447-4010-b771-957736780f95	42bc9667-7530-4092-8f32-bd44f00b9564	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090950/bretunetech/products/mg3ei87pj0yxal8bc9u2.jpg	Ubiquiti Universal Antenna Mount	0	t
d1608f17-0c41-4040-9ac3-f2053e7c961a	4d17f9f9-b184-43d3-85e5-2cb9c324e1ca	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090951/bretunetech/products/xkulxwyzljvodzcxgida.jpg	Ubiquiti UniFi AC Mesh Outdoor Dual Band AP	0	t
1125590f-729e-4d8a-b8ee-0749742242a9	e003bc2d-cb44-4050-af51-9ee87f783909	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090952/bretunetech/products/f1otwhhie4svdyuqexmy.jpg	Ubiquiti USB-C Cable with Charge Display Black	0	t
5962737f-9c55-4ed9-bd76-0cb637b44902	d3999541-674a-4edd-85e2-2c2d6e92563b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090953/bretunetech/products/zjl5ws0oycdte34jl4sn.jpg	Ubiquiti UniFi Panel Antenna for Swiss Army Knife Ultra	0	t
9a379cef-d8da-4592-b3c9-58c0809bf1df	eb20c6b0-e559-4c9d-854d-1beba19f6d6f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090954/bretunetech/products/d6fbcgwfamjtwav1sqgt.jpg	Ubiquiti UISP Power TransPort Cable 50M	0	t
4c2c151e-f183-4719-873e-d519fcb69c42	3ae24105-2c48-4d1a-9bb0-978d692ef9e3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090964/bretunetech/products/lro4l93mb5qice6e2tvi.jpg	Ubiquiti 54V 210W AC Power Supply	0	t
dcd99555-fd74-4786-ab2c-bd5c762616eb	c6c1067b-2b0a-4476-872c-8b741a260b6b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090965/bretunetech/products/swhtbz6qnqwrdz2xusfo.jpg	Ubiquiti Access Point Pro Arm Mount for UniFi Pro AP's	0	t
ab046b30-4b48-44c8-b23a-0032de3ada21	44ee0af1-8ed2-431f-a280-29c119a75f8d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090966/bretunetech/products/si6phzaclgqakbo6q4el.jpg	Ubiquiti Multi Mode 1.25G LC SFP 850nm 550m	0	t
25f2107a-bbc3-421d-8e9e-c32d840821d0	3f08b152-03f0-466b-bc8d-5d125b9dbb16	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090967/bretunetech/products/weyxq4foxg6qwbdrgl3z.jpg	Ubiquiti Multi Mode 10G LC SFP+ 850nm 300m	0	t
431c2ebf-7013-4ab6-bfe6-7549165d3e37	a4756238-0f56-45cd-b1ed-d8d4b60e27db	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090968/bretunetech/products/i1yubafkomxmv6dsl69c.jpg	Ubiquiti Long Range PoE Repeater and Surge Protector	0	t
0cbfbcad-45ec-4a92-9545-0a9f7f16878a	04d1b696-63a1-4c80-91b1-d7cf5545806f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090969/bretunetech/products/ozp29odc8qdrawz5qgqi.jpg	Ubiquiti UniFi Protect G4/G6 Instant PoE to USB-C Cable 4.5M	0	t
878d7fd9-20c6-48e1-9250-9c2fff0dabfc	7e509b2c-b686-4f50-a33b-1e1e59e668b2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090970/bretunetech/products/iaki6hzftpp2ih1h25um.jpg	Ubiquiti Standard 3.5" SATA 4TB Hard Drive	0	t
5547cd18-546d-442a-adf5-b859c6ceef52	61d126b4-4f8e-41b3-9e69-8f441fe25ea9	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090971/bretunetech/products/rruzflrhugzhdysv9uao.jpg	Ubiquiti UniFi Protect G6 PTZ White In-Ceiling Mount	0	t
d10a68c5-e18f-4693-a64d-c7237cefa3ff	4a4b14d0-050d-48a8-99d5-5c3eaf67669a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090972/bretunetech/products/xek77zeyinpsbdf1eues.jpg	Ubiquiti UniFi Protect G5/G6 White PTZ Corner Mount	0	t
7261b389-1b04-4367-a116-e24d3f05a4a0	044f199b-1201-4cfa-84a5-0561b8b8b269	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090973/bretunetech/products/u4rd4afyobf9qsvljjxb.jpg	Ubiquiti UniFi 10Gbps Direct Attach 0.5M Cable	0	t
a8199ebe-f4e8-4a0b-9095-deb558c81b1a	a535d8c6-6524-4168-8ee3-c38bf331be1f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090974/bretunetech/products/mta2m4rrh3stbgsvpcgp.jpg	Ubiquiti AI Port Rack-Mount Kit	0	t
6f2024cb-8db3-4dcc-939e-ac4ee18dfda9	4d06efef-7a1a-426d-9118-d39a367c79f9	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090975/bretunetech/products/gi9qj8tvoc6acyhtsqjy.jpg	Ubiquiti UniFi Access Ultra Reader and Hub	0	t
001fbce2-79aa-467e-8549-7c5f2b5cedfc	6dd364d8-3249-4e12-a82c-83cc51975a7b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090977/bretunetech/products/ilrtvermohdywxrjxesy.jpg	Ubiquiti UniFi Access Rescue Manual Key Switch	0	t
f065b26f-69f1-4672-b45d-2772bc2390f6	d19e4d3b-30af-4c63-a748-f9752a008c7f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090978/bretunetech/products/rrjkycvhuvbur8ekv2jb.jpg	Ubiquiti UniFi Access Gate Hub 5x Input, 4x Relay	0	t
99f56dbb-f4d3-4ae4-8297-d6b642be3fca	35ce684f-a511-4e9f-819c-0602722e929b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090979/bretunetech/products/fpz8getcco9enmflnoeo.jpg	Ubiquiti UniFi Access Door Hub 4x Input, 4x Relay	0	t
f8226e95-8f7f-4fa6-a805-11034655a001	fd6594df-c27a-4445-8236-871c44d09669	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090980/bretunetech/products/odu2esciv5e0ovm7pk5v.jpg	Ubiquiti UniFi Access Door Hub Mini 2x Input, 1x Relay	0	t
85abfe9a-df6e-40da-b3bb-ab2a1dde1c61	6ff67c45-e5e8-4e39-92d4-31f28c12efa8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090890/bretunetech/products/djy0cpsyuqlsgmutzhh6.jpg	Ubiquiti UniFi Flex Switch 5 Port Gigabit 1PoE In 4PoE Out	0	t
816100e8-c118-4bf0-b40a-eaeca202ca01	a85b19bf-7713-4c37-bd8c-ce7fb2d8159d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090891/bretunetech/products/ki9uyfuzhhg9joxfahjl.jpg	Ubiquiti UniFi Switch 48 Port Gigabit 32PoE 195W 4SFP	0	t
9dc7d3de-eb2d-495e-a0de-8c4ed0b5fb46	1996d855-c657-4f2a-98b3-3bf9bc8379ae	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090892/bretunetech/products/vzlv3teaegqfk9ak8ya1.jpg	Ubiquiti UniFi Switch 48 Port Gigabit 4SFP	0	t
6f2fc739-94bf-4f8c-bda5-5ac0cbad0ac3	d84f8cb9-2c72-4507-a0fd-12fa17dd4b3d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090893/bretunetech/products/wrmwqvlkqqfki9ca4ica.jpg	Ubiquiti UniFi Switch 24 Port Gigabit 16PoE 95W 2SFP	0	t
9b62d40b-5d32-4a35-afd5-ad57771afe00	a9ab6c8b-0471-4100-bb9a-47e1e2cd9641	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090894/bretunetech/products/vbycxdp4jwqnubtmfxoj.jpg	Ubiquiti UniFi Switch 24 Port Gigabit 2SFP	0	t
225b22d9-9e45-4e82-a46d-8a5f6eab0913	f9b74c4d-4419-47cb-96e7-fcb0a9adc1db	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090895/bretunetech/products/gfsthqevnkpegkpcui4g.jpg	Ubiquiti UniFi Switch 16 Port Gigabit 8PoE 42W 2SFP	0	t
0d6bffbe-26c7-43c4-a7ce-96e066ff3f05	a9519996-6295-406f-be95-68939f10f34f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090896/bretunetech/products/clxmzaywvvznfjbb8ouv.jpg	Ubiquiti UniFi SuperLink Environmental Sensor	0	t
c7fa4993-c3ed-480f-8123-a68d7bebac05	59e0d23b-2a21-4337-a812-28f11d4905a4	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090897/bretunetech/products/co4wv8y4r84wltd9mu98.jpg	Ubiquiti UniFi SuperLink Entry Sensor	0	t
77c8b693-b1e5-487e-a9f9-633b659ce016	f524a5b2-2dd8-4d89-9283-368f9e56af9c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090898/bretunetech/products/zfgach7ll1k6v7uplhgq.jpg	Ubiquiti UniFi UPS Tower 10 Outlet 600W	0	t
0a9749da-e415-4e8e-86a1-b4210b812531	871876ad-ff01-471c-bd97-bce384388267	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090899/bretunetech/products/obzjniqwt8bdxrwnvfrl.jpg	Ubiquiti UniFi UPS 2U 8 Outlet 1000W	0	t
bdb2a25f-77b8-4717-af9c-0c7da0ea0dd5	82a6b87f-cf05-4e3f-9576-b2c2eb7d6c87	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090900/bretunetech/products/dsfr56iwsczruzoartuq.jpg	Ubiquiti 10Gbps 54V 60W PoE Adapter with No Cable	0	t
f4ce69ec-653c-4997-8f14-e5de266b3fdd	cd5c7ced-f6ed-41e2-8429-36045f1f8c3a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090901/bretunetech/products/ilrk8jxdf6mknh2om3t5.jpg	Ubiquiti Gigabit PoE Adapter 48V 60W with No Cable	0	t
7055f3c9-9b64-4dc6-a657-105605e0cf55	7c52e49a-4910-4776-b515-10cbe3426cd0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090902/bretunetech/products/g9q1to5dxzbjnxfh1chk.jpg	Ubiquiti 2.5Gbps 48V 30W PoE Adapter with No Cable	0	t
68b62f71-1603-44e0-a68c-f422426af3fe	85a69eed-c1a9-4734-a3de-ad0eae384169	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090903/bretunetech/products/x7smtii6fcma7bgblk5i.jpg	Ubiquiti Gigabit PoE Adapter 48V 30W with No Cable	0	t
6aaf9c1e-a4f5-4ede-ae12-b0591548df01	98e20bac-80ec-428f-abbd-651b6f854aea	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090904/bretunetech/products/p9hads9uatan3jxcup4q.jpg	Ubiquiti Gigabit PoE Adapter 48V 15W with No Cable	0	t
1ebab83f-05dd-4aa3-8ba8-a7c29f80b06a	703be67e-8ad6-489f-85ea-e94011903c90	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090905/bretunetech/products/s7cvxew3kwwaftlen1u5.jpg	Ubiquiti Gigabit PoE Adapter 24V 7W with No Cable	0	t
c8ff381c-1062-49a5-9242-5a0526f30129	68ec4ed1-f939-4886-aa25-bf7499f2f5c5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090906/bretunetech/products/mfzhddkeii0efwhkkrvg.jpg	Ubiquiti Gigabit PoE Adapter 24V 24W with No Cable	0	t
38fe023b-2bfa-404a-973f-576ee39fa18e	c25ab3fe-d03f-42e7-9c2e-7513704b748e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090907/bretunetech/products/rul2gucdlonm4xuuviq5.jpg	Ubiquiti Gigabit PoE Adapter 24V 12W with No Cable	0	t
a9a6f63e-74d0-4f8b-8527-999092f89b4d	49864b40-11c5-4bba-a0b4-4776f81aa8b8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090908/bretunetech/products/eisu4lqwuo1u23zvsc3z.jpg	Ubiquiti UniFi PoE Audio Port Audio Streamer	0	t
7549a92f-1aff-4e66-ab47-57af126689ff	2fee61aa-a3e5-49b8-96ca-b8d0e7145a4a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090934/bretunetech/products/jmcuoanf3qqw4fs7msag.jpg	Ubiquiti UniFi Dream Machine Special Edition 8 PoE 1SFP+	0	t
932f8511-94f1-44c0-bce7-9148e61a105f	877ee7f3-9bb5-41b6-92f3-d51c8c20b4a0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090935/bretunetech/products/jarhpkpguigqr6iktkxr.jpg	Ubiquiti UniFi Dream Machine Pro Max 8 Port Gigabit 1x2.5G 2SFP+	0	t
8659b444-b233-4f19-ae1a-3259fabc1133	e5a717be-3c98-4f29-b291-c28001fb41c8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090936/bretunetech/products/canttjvuhymcntjjakqh.jpg	Ubiquiti UniFi Dream Machine Pro 9 Port Gigabit with 2SFP+	0	t
01fd7354-90f9-44d2-b872-d2d2c58a286a	3a2c9a58-45a8-4b54-b95f-7a7a7a6c9ca7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090936/bretunetech/products/zgqug4qyeiawl2gisjkr.jpg	Ubiquiti UniFi Device Bridge WiFi 7 Switch 35W 7x 2.5G PoE 1x 10G PoE	0	t
0afe6304-5845-45ad-b826-bbdb0e530dea	4a778adf-534e-4768-b561-f1ce9588557b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090937/bretunetech/products/kmmgidj9zv3ci0ebi1ap.jpg	Ubiquiti UniFi Device Bridge Pro 5GHz 17dBi 90° Sector	0	t
83295625-d279-4849-b8b5-fc96eac1e8f5	63cbe2fd-0220-4a05-a9bc-a8cb73dfd6c6	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090939/bretunetech/products/anvdns2qmll6a3r6dnqb.jpg	Ubiquiti UniFi Device Bridge Pro with PoE Input and PoE Output	0	t
dd601e72-bcd4-43bc-a2e3-2ce9a62e6787	079acd38-89da-4983-948e-d93fef5f9bf0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090939/bretunetech/products/ohvenvvviushtx6vsprv.jpg	Ubiquiti UniFi WiFi Device Bridge for IoT	0	t
e0b0634a-ec4c-4fce-b736-9f201b8cf09f	9ca26b4b-cdf8-4db4-8441-91b3e1bd60c7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090940/bretunetech/products/leoi1paztttlwcdyhnbx.jpg	Ubiquiti UniFi Device Bridge WiFi Bridging PoE Adapter	0	t
7f8f4564-6279-4d60-8470-ca23ee89a202	673e708d-3023-48f5-b9c9-8ac50a9d54a1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090941/bretunetech/products/gnukpufccy3rlfbqibh4.jpg	Ubiquiti UniFi CloudKey+ Console with 1TB SSD	0	t
34354c93-739b-484c-a821-ce074e0a8483	2bc879e6-9b12-4ad9-9dad-52234a5407cb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090957/bretunetech/products/ritrigfhtufao3dzoutq.jpg	Ubiquiti UISP Power TransPort Cable 30M	0	t
5363ef27-3aa6-4470-ae77-4953eec94cce	6bd11f49-215c-4320-8cd1-e0346d761475	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091002/bretunetech/products/ckufp1hvxicv6vdckrni.jpg	Ubiquiti UniFi6 Dual Band WiFi 6 Range Extender	0	t
32b89d8b-a37b-4118-b521-63d0ee58adf2	bf11b8e1-935d-4c42-9bee-9ea4c4d21ea7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091003/bretunetech/products/newowceox5bt48pttrik.jpg	Galvanised 50mm Pole / Mast 6M	0	t
f7feabd1-78f5-46a8-a139-305eddeba8df	fd607937-8ac5-415f-a217-fb47a10a4001	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091004/bretunetech/products/q7757zpsbp2uc8uzg6wa.jpg	Galvanised 50mm Pole / Mast 3M	0	t
784f1490-aac6-44b9-b9cd-7f1ba23c48b0	bfde01f1-af1e-4eb6-a2c9-83c65b3825fa	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091005/bretunetech/products/gxxgyy4giesfbo9ghqyl.jpg	Galvanised 50mm Pole / Mast 2M	0	t
1a00ac14-4059-43fd-bc28-49991346841a	3deea999-a3c1-4233-bccd-e4413319a678	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091006/bretunetech/products/mxym2bsr5hoxenxygnry.jpg	Galvanised 50mm Pole / Mast 1M	0	t
e0344165-85d8-4800-85b9-dd1332478858	7369989d-6324-49dd-aa8a-674d8d28b37c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091007/bretunetech/products/qvj074t1hapsoenpqwq6.jpg	50mm Aluminium Pole / Mast 6M	0	t
ed766404-a0c9-45c6-beaf-0fd1642a3ddd	946998c3-9186-4a38-a117-3d379008ad2a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091008/bretunetech/products/ku4qm9h3xz7uz67dz1is.jpg	50mm Aluminium Pole / Mast 3M	0	t
a995ca90-f1fb-4bf2-af2e-aca1f60aefc6	0e098af3-771d-4d34-abf5-6af71c78a693	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091009/bretunetech/products/xrsdv0hfcdkapfabkk89.jpg	38mm Aluminium Pole / Mast 2M	0	t
d88a3893-0685-4360-9f4f-83aae583e51c	00a14fe2-2c5b-4963-bd70-051e31121144	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091009/bretunetech/products/c4eokcrj8koa3adsnm9w.jpg	Linkbasic UTP Cable Tester	0	t
f8412b38-bfc7-4d00-a3b2-43cf9320c3d8	83abb981-3c37-4911-a1ed-1eeb0328cd74	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091010/bretunetech/products/w2w3yrv78uwtw6c80x2j.jpg	Linkbasic UTP Cable Stripper Tool	0	t
89a393cb-1c30-4e7c-947f-c2a5b326416c	b503a967-f162-4850-b5b8-62a4f4909a54	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091011/bretunetech/products/e63y9jq7ru3kjqowyka0.jpg	Passive and 802.3af/at PoE Detector	0	t
c14c7dce-8018-4269-bfad-5c0360f28396	9a25f628-7e09-43f7-a2b9-1104d63b2b1a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091013/bretunetech/products/oenrm4wj3jaxe7j0csty.jpg	Linkbasic UTP Krone Tool	0	t
493d09e0-4e33-44be-9f1c-8b1d553f3be8	ff9e2ebb-8e4b-49c5-8897-002ffb7f9856	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091014/bretunetech/products/ntir38rtzzfn2nbmgypo.jpg	Linkbasic EZ Combo RJ45 Crimp Tool	0	t
755c0106-c174-4624-a886-6b49bde70f8b	abc6b064-faa2-4c1a-b4d9-f5be7c03dda4	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091016/bretunetech/products/sddxnl2sctkzi0hsoikq.jpg	Linkbasic UTP Combo Crimp Tool RJ11/RJ12/RJ45	0	t
76d0b446-5811-4273-a0b5-4f5d13607bc4	4a0d9986-12ba-4019-b7f8-9cb89e9a989f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091079/bretunetech/products/nur0pyx2m9fe7e9gaaol.jpg	Reyee 5GHz AC 10dBi 60° Pre-Paired Kit	0	t
63af9ec3-b116-407a-9779-ca6df15608ea	0e5d8faf-3fdc-4d6e-b5af-fe4b8e1a9fa0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091080/bretunetech/products/hqn5yrq7z2mng30my0a6.jpg	Reyee 2.4GHz 300Mbps 8dBi 70° Pre-Paired Kit	0	t
d1a076c5-c29a-491e-a90a-e46ba6532ca8	1b012ff8-a334-4d3a-aeef-24fc698fbde4	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091082/bretunetech/products/w1d6llummt28cuvg5cwy.jpg	MikroTik PowerBox Pro 5 Port Gigabit 1SFP Outdoor Router	0	t
e76a8989-ea77-4b23-ad65-46ab94dc63e2	4cd06318-ed10-42e4-9d18-a992b1e2f1e8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091083/bretunetech/products/j0djjuacb7qziuf5fklb.jpg	Cudy 4G LTE4 Dual Band 1200Mbps WiFi 5 Router	0	t
4ace3d94-261f-448e-8642-8e8c7520dc11	810efb3d-6fc3-41ab-9ecd-3f805dce8493	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091084/bretunetech/products/c6v1gcpes1ucc2bywief.jpg	Cudy Multi Mode 25G LC SFP28 850nm 100m	0	t
8d6e7d84-a08f-41a4-a568-0a3f6cd5811e	11c40ecd-0fc4-4eec-a59d-931ac008d196	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091085/bretunetech/products/za321yq5ndhj4gfxpwup.jpg	Cudy Single Mode 1.25G LC SFP 1310nm 20km	0	t
fa516cef-8787-456f-b57e-c6e317f7793d	f3951734-a182-47c7-9652-b02e9d9cc235	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091086/bretunetech/products/ajhxlnvnumdjk7can59r.jpg	Cudy Multi Mode 10G LC SFP+ 850nm 300m	0	t
727c7073-1885-4adf-a2a8-53229b5b9a99	171a8370-7e82-4927-908b-37757ca40a65	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091087/bretunetech/products/t1yetshqdehuzxy2qbzq.jpg	Cudy 8 Port Metal Gigabit Desktop Switch	0	t
cb5df549-4f77-4b17-a33f-df2da74336b0	96af299e-2302-41aa-b143-89bcd5c7b337	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091088/bretunetech/products/f6csj1xulimnvfqmrrho.jpg	Cudy 5 Port Metal Gigabit Desktop Switch	0	t
ef4ed7b4-71c5-46f9-8571-ccc1353d34d0	28edb63e-1954-4d99-97c5-c7dcb3b7020b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091089/bretunetech/products/orbkgbqy4t94zkme5tzx.jpg	Cudy USB-A to Gigabit Ethernet Adapter	0	t
ca11f9b5-e22c-4303-a2e4-59d7ce7f57cb	3afb39be-85c8-43db-9c31-9da11bfbd2fa	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091090/bretunetech/products/dpkaclpjzex9cloogb5y.jpg	Cudy Gigabit Ethernet Media Converter	0	t
8c80c174-7f93-43d9-b523-cab61617d19b	6224c310-07c5-4500-8d72-0c1098cd9418	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091091/bretunetech/products/vkzkciwo7jsawpe5ldpi.jpg	Cudy Dual Band WiFi 5 xPON Router	0	t
d4e3826c-f442-4293-a6d8-63d1a56d4510	16e91a00-0689-4f6e-8d33-9060b6aa0a1e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091092/bretunetech/products/i3xkcezrsoa6cnequzxp.jpg	Cudy Dual Band WiFi 7 6500Mbps 5dBi Gigabit Router	0	t
24f5f1c0-111c-43b0-929c-5bd1476dc2ef	3c6e4ced-5ab0-44e1-a928-3fa18a494135	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091093/bretunetech/products/lldbxcfvyjjsnfujjslj.jpg	Cudy 10 Port Gigabit 8 PoE 100W PoE Switch	0	t
43257891-05d8-4bfd-aa95-121b60750f60	df8218af-bc92-4c23-bef1-51aebd1e3d3c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091016/bretunetech/products/d0t4urdcig7zd1xhgjos.jpg	DC Terminal to 2.1mm Jack Adapter	0	t
1a45a359-66e7-4d3c-a694-b572dad17b09	6084a247-ad22-4d53-9f7d-3a094603f335	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091017/bretunetech/products/iyntdyubkgqfqlqqhjju.jpg	Linkbasic 50m Shielded UV Protected Cat5e Flylead	0	t
0ae808ea-e6a1-444f-9e44-c1df2f283d4a	99813073-65e9-4935-814d-c19c537151cb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091019/bretunetech/products/ogbw7gflxayni43vffqy.jpg	Linkbasic 30m Shielded UV Protected Cat5e Flylead	0	t
773c1335-7d9e-4c4c-ac0e-8f6a66e35755	7795d7b4-33ec-4544-9fa0-e916080ad1f5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091019/bretunetech/products/bygpdyb4i1yskzzrjotb.jpg	Linkbasic 20m Shielded UV Protected Cat5e Flylead	0	t
3d09e0e1-1c77-4a3f-840e-bc205626a57d	d094d202-b400-44c6-8093-0c190826b2b0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091020/bretunetech/products/mf38ww0wsqybxekx3qfu.jpg	Linkbasic 15m Shielded UV Protected Cat5e Flylead	0	t
5e7009a1-3022-4cf6-bff0-094f87ff683d	3fbc9bec-f8c8-4602-932c-4c77110ccfe8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091022/bretunetech/products/ip3uwzhccdhiown49hdr.jpg	Linkbasic 10m Shielded UV Protected Cat5e Flylead	0	t
56683bea-93f3-49c3-9b7c-21c298447e35	97014011-8f9c-4d7d-8d2e-0a8fa03f7cdb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091023/bretunetech/products/qutqnwfkmzpllt5drpde.jpg	Linkbasic 5m Shielded UV Protected Cat5e Flylead	0	t
9c40a5f3-0ba6-4447-9fe5-753bd55fae15	13caa7d9-693a-47a4-b60c-1402913383e8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091024/bretunetech/products/ub9fyi7bzk0vhss1jfmr.jpg	Linkbasic 2m Shielded UV Protected Cat5e Flylead	0	t
199a441e-9743-4e57-8940-0f1294b8c421	8b5f3f12-b7e4-4d40-ab86-0778ae788ffc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091025/bretunetech/products/pokn4dorqagodsicw1wk.jpg	Linkbasic 500m Shielded UV Protected Cat6 Cable	0	t
01332df6-5151-4965-af9a-a0fa34f05e02	5b569768-00c6-4ca4-b8ec-4b5935ae2c6b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091026/bretunetech/products/xmyc52zeftjkucvwtpun.jpg	Scoop 305m Box CAT6 Outdoor FTP CCA Cable	0	t
2b3d5957-140e-4013-bd35-a1577605b117	c5a5a110-d8e7-4a59-9ff7-58c49b4f2d58	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091027/bretunetech/products/qhjvubkddvknkkmj4mcj.jpg	Linkbasic 305m Shielded UV Protected Cat6 Cable	0	t
2929c213-a9e8-4e13-a304-3820be7ba09d	71b00bd5-e15b-4f8f-8098-f6f376805d2b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091028/bretunetech/products/bgnkbtv8hdwqpwpl1e4q.jpg	Linkbasic 100m Shielded UV Protected Cat6 Cable	0	t
bfa13e49-7963-45ff-a711-90f7c4920bad	fc684adc-50ed-4cb5-a1ec-ee08a7f1d2cc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091029/bretunetech/products/tzei2amnzw44umqdzk57.jpg	Linkbasic 500m Shielded UV Protected Cat5e Cable	0	t
e0eadc5a-3fd3-4dc8-903f-76a887892b15	cbe2268d-8889-4c11-9faa-7004af148523	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091030/bretunetech/products/qcjvtp7thbkvau7ryzgi.jpg	Linkbasic 305m Shielded UV Protected Cat5e Cable	0	t
2d5bbff8-4573-4789-9e56-7c06b21b7bea	34b7bbe6-4a9c-4806-982d-07d260f441ac	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091031/bretunetech/products/lzsraqhn7nbfvqtt32sf.jpg	Linkbasic 100m Shielded UV Protected Cat5e Cable	0	t
d044b8d8-f85b-4565-a979-ae2a44f699fd	1a3bd56e-c5e2-48de-8ba1-0d6fdd9d34d4	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091032/bretunetech/products/gokfzo7tohtwdy0y7ob5.jpg	Cable Ties T50R 200 x 4.8mm	0	t
35edff8b-727a-4ea4-bb1e-35b10cbe5457	3b6ce164-e78b-4007-91d3-e02bc69eb445	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091033/bretunetech/products/tekprrmfir26j079d71d.jpg	Cable Ties T50L 370 x 4.8mm	0	t
b5b6717b-d3cf-4cbc-951a-514a3a917804	bd65dddd-78aa-4fa2-8f62-e66894689391	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091094/bretunetech/products/iwdduu4zdzojrkvfcngl.jpg	Cudy 8 Port Gigabit PoE 110W 2SFP 2 Gigabit Ethernet Switch	0	t
55510ff7-bd35-449c-8028-089f26ea2300	8409ba3c-eb33-4677-89ea-f80604833341	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091095/bretunetech/products/pz204kk1spa6w5weurv3.jpg	Cudy Dual Band WiFi 7 3600Mbps Gigabit Mesh Router	0	t
0077c190-ac6d-4406-a462-3f776b5fa9bb	e0cb4f8a-32d9-48a8-b7d5-4c7732a59ff9	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091096/bretunetech/products/ziekuumangajyl869p5i.jpg	Ubiquiti UISP Router 8 Port Gigabit PoE 110W 1SFP	0	t
c9adf57a-99ea-4182-a701-1f6384fd5c81	2daec726-bf76-4f22-9ac9-1c49a8d51485	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091098/bretunetech/products/yzqf8ef7q6o8stiwwriz.jpg	Linkbasic EZ RJ45 CAT5e FTP Modular Plug	0	t
2995c5c7-de69-4068-bb3e-1c9a2445b89d	54f50be7-2369-4604-b773-57adf7f33561	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091098/bretunetech/products/qpdu0qiiexvochowhvbx.jpg	Ubiquiti Multi-WAN UniFi Cloud Gateway Ultra	0	t
adfda21a-9977-4862-91d9-b7d2cfe75258	36769af4-8b37-4371-9f87-1552b6bf7049	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091099/bretunetech/products/lzdonhxvdm7svsuurwrx.jpg	Ubiquiti UniFi Security Gateway Lite	0	t
4c7932a2-9e74-4dde-82c0-218a2ee9103e	f6c0b44d-e13d-4cae-b4c8-8d04a25f496e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091100/bretunetech/products/kv3dopzfjozfhcfdbrgl.jpg	MikroTik hEX PoE 5 Port Gigabit 1SFP PoE Out Desktop Router	0	t
a362d576-b8d8-42d7-ae6e-cada8a004654	7c183db2-071f-4419-a2ce-bd384c4b509a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091102/bretunetech/products/h1aqadlj1tqyesojxrql.jpg	Reyee 5 Port Gigabit 2 WAN 4 PoE 54W 100 User Cloud Router	0	t
5c383bad-2496-41cf-982a-62c4d79eb3c3	64a17dfb-ab8d-4221-ae42-6d920da4d441	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091103/bretunetech/products/dowteufgmzjto2dresqe.jpg	Reyee 5 Port Gigabit WiFi 5 Wave 2 150 User Cloud Router	0	t
f7877197-3af4-4242-a598-61d4d94d9154	e26f0476-9ca9-44cb-8cbd-172c796a0028	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091104/bretunetech/products/gpd3vk8o8ongs8m99lxq.jpg	Scoop 500m Drum Cat5e Outdoor FTP CCA Cable	0	t
1ddbba42-63d8-44cb-8eba-ea83d71db2d1	355e18e6-3026-4096-9324-793c3f67ae90	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091104/bretunetech/products/hlcdfcdc1glllrqkzzdn.jpg	Scoop 100m Box Cat5e Outdoor FTP CCA Cable	0	t
b4727277-c169-4d4c-b999-b4c55b823515	9471d50a-f678-494d-8401-3ea6eb181c63	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091105/bretunetech/products/olgogsf6brufy8dxini2.jpg	Scoop 305m Box Cat5e Outdoor FTP CCA Cable	0	t
782a9a8b-4e53-4d2d-aeac-d6875afaac88	48bcfa3e-bced-4bbf-9d0e-b5ec2278523d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091107/bretunetech/products/yifgmxvdngevzk0nmsez.jpg	Cudy 5 Port Gigabit Multi-WAN VPN Router	0	t
2305ac43-b741-49f4-b9f0-2c25e31efe81	68a77d74-4a3a-40cb-8f97-19f9b68c67d7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091034/bretunetech/products/zg0qpv4tuoikuhtqhcsb.jpg	Cable Ties T50I 300 x 4.8mm	0	t
4444abdb-16d5-44d1-9f4d-c1c3b2eadb29	0bce5a81-fee7-4dc6-a002-a678d70e307c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091035/bretunetech/products/bxq60avvaqwrhfqatuzk.jpg	Cable Ties T30R 150 x 3.6mm	0	t
36a75e53-a3ff-485d-93d7-da38fa1da996	bdd9a983-08c0-42e9-b0e6-b284ededb7ea	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091036/bretunetech/products/ub1dls3xpmleqflsrnq3.jpg	Cable Ties T18R 100 x 2.5mm	0	t
35e35889-2c75-4300-9492-5de329782f4b	57cb164e-143d-4419-9905-2814d8e6705c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091037/bretunetech/products/m60sgvijd8ss7yoysabg.jpg	Cabinet Cage Nuts	0	t
249c3759-f1fc-47b1-ab55-4e3b34ac8bf8	6fea70b1-0201-43c5-897d-a19f37a21ef6	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091038/bretunetech/products/bjpurd9etoktoeysjc08.jpg	Scoop 8 Port Gigabit PoE 96W 2SFP Switch	0	t
af6155cd-ba37-4296-94d1-7944ee0d2da9	f6b18f48-d127-4a8b-a01d-cd787344ffc5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091039/bretunetech/products/tkl4w60ha5qchvcvxnqj.jpg	Scoop 10 Port Gigabit 8 PoE 96W Switch	0	t
7257d31d-2b24-4883-9dd3-822187fe5552	b61eb77f-f642-45d8-b5c8-380103fc50a5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091040/bretunetech/products/zilufyertyr6rcc8fmou.jpg	Scoop 8 Port Fast Ethernet PoE 96W 2 Gigabit Switch	0	t
1539500f-c88a-4430-bf6e-476b5d47e79a	7c63ccb8-5a72-4be3-a5be-5371770947b3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091041/bretunetech/products/rx16bluaethoeledd7vm.jpg	Scoop 10 Port Fast Ethernet 8 PoE 96W Switch	0	t
86f23695-395c-44f2-b86d-e3d2880f049d	7b030388-d5c6-4652-93c3-736da62ce16d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091042/bretunetech/products/odx5ewx4gclkd2aacpjr.jpg	Scoop 6 Port Gigabit 4 PoE 60W Switch	0	t
9d8b0892-5be8-44f7-a3f3-c58a650ef2f9	ef5a311d-3935-494a-a7e8-67f912197f6a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091043/bretunetech/products/xswm6abn7psv0xnmv5sd.jpg	Scoop 6 Port Fast Ethernet 4 PoE 60W Switch	0	t
2b3b0467-3542-4464-97ae-83e5999c0b04	59c6c3b1-9b6e-4ac1-8f70-5590d62aa824	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091044/bretunetech/products/e0bptoxzyviv5srbqauc.jpg	Scoop 24 Port Gigabit PoE 250W 2SFP Switch	0	t
314cd6d3-b6c5-4e9d-831f-50df99fde9f2	8100ce57-7b29-4ca4-8030-2dd8599c1638	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091045/bretunetech/products/ivh0skvo5gzqmnlpscyq.jpg	Scoop 24 Port Fast Ethernet PoE 250W 2 Gigabit 1SFP Switch	0	t
1b3743c5-3e34-4bce-95a6-0b5f80828043	d39aad8f-6dd6-4fb8-b3c0-9579dbf6cb44	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091108/bretunetech/products/nb7ttyrltsrkikg3xilu.jpg	Ubiquiti UniFi WiFi 7 Lite Dual Band AP	0	t
6ff755fe-0520-4d71-95aa-4337222e1fe1	e7598b60-e84c-43b5-b314-c301f03a2a92	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091109/bretunetech/products/z4wzmnpehqkqsq8idczh.jpg	MikroTik hEX Lite 5 Port Ethernet Desktop Router	0	t
59da7a2f-c35a-41a6-8cae-a0dac6a6cdee	a399afb3-b165-4ac5-80fe-73edc79f6cfc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091110/bretunetech/products/t3ha2fh5ilszsy1exh59.jpg	MikroTik hEX 5 Port Gigabit Desktop Router	0	t
d6686caa-5dd7-4b49-b6fe-0abcd52729b0	d17b627e-c5ba-4eec-ae6c-2cfd9e984576	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091110/bretunetech/products/mpw4e9d6w2e5m6vqus8u.jpg	MikroTik hEX PoE Lite 5 Port Ethernet 4 PoE Router	0	t
818ed556-09c0-424a-accc-ec8aa610fad1	3c3d8f03-7ec3-4fda-9e54-25b5e21820a7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091112/bretunetech/products/dtmz5m6cadoaay0cg3qt.jpg	MikroTik hEX S 5 Port Gigabit 1x 2.5G SFP Desktop Router	0	t
4e19dbc5-ca7c-497f-944f-479669449a04	9fa90335-467e-4906-811f-e5b55ee1769d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091113/bretunetech/products/hxhnkfnzdbkoyox3zo7w.jpg	Reyee 5 Port Gigabit 2 WAN 100 User Cloud Router	0	t
6068e1b7-74ab-4e3c-8c8a-8a317bdbc841	fcba0d3f-d2d4-4481-b9be-91f5ba9632a1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091046/bretunetech/products/jc4boy1nwlo6jxasfytp.jpg	Scoop 16 Port Gigabit PoE 150W 2SFP Switch	0	t
eb7829a1-cfbe-4a0f-b94c-9f1363af1b95	bc35833d-8720-4a29-aa4a-56422d6f87eb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091048/bretunetech/products/zzor0bqsmbikjyrhcgle.jpg	Scoop 16 Port Fast Ethernet PoE 150W 2 Gigabit 1SFP Switch	0	t
9649fcc2-57b2-4b56-895a-bf6a9b375b01	54f7228c-ff37-4033-a1af-bdf3e1b4e454	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091049/bretunetech/products/oskpma05fj4ja6ziqfb5.jpg	Linkbasic Breakout Cable 3m 1 QSFP to 4 SFP+ Uplink Cable	0	t
bd1c1d48-cf27-4801-8a19-25329bae019d	0db20290-7d09-47b1-9fe4-2d30f7787658	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091050/bretunetech/products/a6m3eiamey8zu8kwgljy.jpg	Linkbasic Breakout Cable 1m 1 QSFP28 to 4 SFP28 Uplink Cable	0	t
92b27ed6-820c-48a6-9d92-44582eb0cd13	8053b227-34ac-45ba-9c0f-041bf9fe1686	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091051/bretunetech/products/yabdoac3kkhnsxkldpyh.jpg	Linkbasic Direct Attached 1m 40G QSFP+ Uplink Cable	0	t
37fdf964-86f3-4d50-8c86-839c1af0d34a	83fe8c70-afd0-43ef-9652-017fc608e950	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091052/bretunetech/products/n89uf3zngijkzcz0fnff.jpg	Linkbasic Direct Attached Copper 5m 10G SFP+ Uplink Cable	0	t
59b00ef9-ce82-4540-abd8-ef9195c6f3fc	53cd042b-904b-41c7-a963-cd39acabdfee	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091053/bretunetech/products/shzxqxzyzrxwuorjpduq.jpg	Linkbasic Direct Attached Copper 3m 10G SFP+ Uplink Cable	0	t
a2d03614-3605-4282-86d0-ea70333ea89f	1d75da1f-0ac9-4c80-a0a8-e3ac8e66173d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091054/bretunetech/products/j5ji2rmhffrzisk9lluf.jpg	Linkbasic Direct Attached Copper 1m 10G SFP+ Uplink Cable	0	t
8fd57351-57fd-4548-a807-bbf4a8488359	bc9d5835-c50f-4b2a-886c-4602118f96fb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091055/bretunetech/products/frxlweudxkec4scaoacx.jpg	Linkbasic Direct Attached Copper 0.5M 10G SFP+ Uplink Cable	0	t
1705c57a-e96c-4baf-99c8-7dd2fbadda30	df594ca2-0fe7-4a37-98e9-20f0e71a2eae	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091056/bretunetech/products/url7d7frj1xgipoqlf92.jpg	Linkbasic Direct Attached SFP28 1m 25G Uplink Cable	0	t
c53ec6a6-3bc9-432b-9f5f-c0057c6e9ffd	b0869b74-34e0-4ecc-9b91-0055ed486323	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091057/bretunetech/products/uudrkm9t1z5pubea68zm.jpg	Linkbasic Direct Attached Copper 0.5M 25G SFP28 Uplink Cable	0	t
4d505cc7-651c-4333-b01b-ae540ab6d5bd	1421dabe-2031-44fe-bdb9-99f27ca96320	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091058/bretunetech/products/fa8qmijyykehrbpimrsl.jpg	Linkbasic Direct Attached QSFP28 1m 100G Uplink Cable	0	t
3acf198b-0ce9-456d-ab14-6ae7966eff8e	bbabfdf7-34f5-4212-9c2f-a0e010f3fc68	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091059/bretunetech/products/kf0jqyhvarit4i1jnvxl.jpg	Linkbasic Active Optical Cable 5m 10G SFP+ Uplink Cable	0	t
1b70f59b-0d51-4688-9810-4d56599d73ce	2e20abfd-8579-4b5f-8bb6-0d812b4359b7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091060/bretunetech/products/o6no3vhkruuxdsltqq3m.jpg	Rackstuds Duo 2.2mm/3.2mm 20 Pack Black	0	t
ba8f79c8-c0f6-4dc9-874c-5d9e20cab331	b9cc7791-cc15-4c50-84d3-1ea60eaa79eb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091061/bretunetech/products/grazkiok8baoykrhedm8.jpg	Rackstuds 2.2mm 20 Pack Red	0	t
99474b56-e9ef-4616-938e-e7d304f50fd4	3ea8c5c8-1cc7-4390-b062-8e6606cdb57e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091062/bretunetech/products/qxzc5i53yac15slcrc47.jpg	Rackstuds 2.2mm 100 Pack Red	0	t
9e7df84e-3113-43e6-b7e1-9011dc53ebd4	b2524d44-821d-421b-82c7-fd265185c7a1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091063/bretunetech/products/dmpqtjyclubtytp4fiik.jpg	Ubiquiti UISP airMAX Rocket Lite AC 5GHz Radio	0	t
4e0ca001-9bc5-4d14-b5a4-0076b0357c33	3a4e95e3-047b-483c-a09c-7a4c80027b06	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091064/bretunetech/products/di3aqyvbl6dsoatkdvzi.jpg	Ubiquiti UISP airCube ISP WiFi Access Point	0	t
bd4cad09-7e1c-47b6-b299-e6ddb5a77181	1e3f9717-1072-474b-ab3c-7c36aace5bc8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091065/bretunetech/products/teqjqwmq2jcx9uqthr6h.jpg	TP-Link AC1200 Whole Home Mesh Wi-Fi Router (1-pack)	0	t
fd3e9ff5-00e8-4303-a8ff-19233b89d897	9f250a2d-0fda-4265-9ef0-2daf44d57c3f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091066/bretunetech/products/t1hxo9kgmfh2qonf897m.jpg	Dedicated 3 pin to Clover Cable	0	t
806bb2cd-5648-4ce7-b4b1-2694ce1cc4e3	84ed1112-59ac-45a7-b940-2df896d43982	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091067/bretunetech/products/gaht0pujjw6e8xpmcjp0.jpg	Reyee Dual Band WiFi 6 3000Mbps Gigabit Ceiling Mount AP	0	t
c7ec7bb4-e0d3-4751-a37e-fe72c97d66a4	adc8fae0-70e2-4cf6-995e-2f590db41f7a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091068/bretunetech/products/qdhywyry9d1svqagkfng.jpg	Procet Gigabit 48V 15W PoE Adapter with No Cable	0	t
51dbeb62-dadf-4ce2-bae0-f2957d9e89f1	7b1236de-2c47-49d3-855e-aabf8d3f2312	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090909/bretunetech/products/xjlmme5rduibrlms5fut.jpg	Ubiquiti UniFi PowerAmp Black	0	t
680d4476-bfa7-44a6-9e12-e21dc1b48066	bb042a39-55b5-4878-aeaf-edfc4feea0b2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090797/bretunetech/products/knt6em6vmifutobhlqqz.jpg	Half Moon Trunking 70mm x 10mm	0	t
5bfeb595-1b52-4d0c-8b44-602432c95ade	b3330714-b6fe-4e93-adfb-14e76a23817d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090798/bretunetech/products/i3v4fw786y70nme3k72i.jpg	EGA Trunking 40mm x 40mm	0	t
fe5ffcb5-4d4d-448c-ad22-eee8f5a2318f	ed5145c3-4106-477d-b7ff-c33343a8872d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090799/bretunetech/products/ufpwkro6tslpo8mtqd1n.jpg	EGA Trunking 40mm x 25mm	0	t
dc0257c7-4a15-4fbb-831d-08330f647d18	3619c0f6-a80f-44ed-a4ac-60c58fa583ab	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090800/bretunetech/products/vljo1hfj0qtq1gukrhzz.jpg	EGA Trunking 25mm x 16mm	0	t
e9294125-225b-4ab8-be68-4dafdb4321ec	40201437-724e-4c3e-b831-59f5359fcd29	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090801/bretunetech/products/ohgtlu6whdaz6q2ckee3.jpg	EGA Trunking 16mm x 16mm	0	t
0140a85b-5b22-49f4-8851-11710bdbd8dc	f7f8d360-529a-4ffb-a03e-831fcd44ad98	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090802/bretunetech/products/sbzhw0pfjsoaxyhkrrfg.jpg	7M SMA Male to SMA Male Cable	0	t
2d13b498-f503-4077-b5e6-449dbbe0e168	3fa13c7e-4b28-4533-b5d2-d8d7058f4bd4	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090803/bretunetech/products/nxboeykliaqdekezijnb.jpg	5M SMA Male to SMA Male Cable	0	t
6546ed35-2ff0-4756-a748-9819bfc0b71f	f41b4b16-a8df-483b-a706-56b0e5ba3e90	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090804/bretunetech/products/v1but1ladqtkqavkrhd7.jpg	1M SMA Male to SMA Male Cable	0	t
11c840cd-b805-4877-8c0b-efc6eac7ad76	f036e929-9944-460b-9d1e-bf43cd3555bc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090805/bretunetech/products/zwdlpjv8sip8hzvs4k9y.jpg	1M SMA R/P to N-Type Male LMR Cable	0	t
b91f058b-5295-4246-88d1-3865e0846fc7	b3808e7d-975f-4f01-b16d-c255d637ebb3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090806/bretunetech/products/cvehnyku93pynue3nwpu.jpg	0.5M SMA R/P to N-Type Male LMR Cable	0	t
54845918-a0e1-4aff-b66a-bbb2a2ce40f8	9c71c626-5341-4bdc-be0d-2aa9a1480d90	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090807/bretunetech/products/pmu60lf4ucqgop3w5u7l.jpg	Ubiquiti UISP 60GHz/5GHz Wave Professional Radio	0	t
fc939e1f-7d22-4266-9441-8d11ef0d76eb	9f05776c-0660-49c4-b23e-8259a871e243	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090733/bretunetech/products/vbubvnxpv5snujjvihqt.jpg	Ubiquiti UISP 60GHz/5GHz Wave Pico Radio	0	t
ff6d5286-099f-4ff8-bcee-dd487ab25df1	36715641-4659-4e1f-aa4c-94a2a92ad99a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090808/bretunetech/products/brjmljrwq33gmkhoiuk3.jpg	Ubiquiti UISP WaveFiber SC/APC 2.5Gbps Ethernet ONU 20pk	0	t
a89f63b1-9795-4c30-9fbc-d79d7a8a1dc9	793ca0a4-f642-4553-b330-05e32882d1fa	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090809/bretunetech/products/y2l9feczl1w1qyroyafw.jpg	Ubiquiti UISP WaveFiber SC/APC 2.5Gbps Ethernet ONU	0	t
cd8d6fe0-541e-48d5-a75f-7b245508ff6e	dbfccadf-afac-444b-b42b-48ffa3d260a0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090810/bretunetech/products/qfpjgtjdbwswqw2jcpb1.jpg	Ubiquiti UISP 60GHz/5GHz Wave Nano Radio	0	t
d6bcc160-2a67-40c7-b547-b987386325d9	f319b1bf-aa36-4cac-b96d-540811bf98c3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090810/bretunetech/products/blhecpbx5fogcr6yojgr.jpg	Ubiquiti UISP Wave AP Micro Mount	0	t
fac7d954-aba4-4a1c-91ab-9cc768169010	bf4b174f-5cd5-4d33-ad44-7519cc0057c2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090812/bretunetech/products/lfp3eyxosc0optxg5tig.jpg	Ubiquiti UISP Wave MLO5 5GHz WiFi 7 PtP Radio	0	t
f9258e90-4591-47dd-8507-43066e31523f	686fef89-e035-4439-9b37-211f842454e8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090813/bretunetech/products/gsof1qxoejeehcvytw6o.jpg	Ubiquiti UISP 60GHz/5GHz Wave Long Range Radio	0	t
aeb313f7-59a5-475d-8463-4e9790619f60	e1c3ed76-c0b4-485b-b955-36fccc77ce4a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090814/bretunetech/products/wejgm0clecuwkpfaqeqn.jpg	Ubiquiti UISP 60GHz/5GHz PtMP Wave Access Point Micro	0	t
6f3862f5-594a-45b2-8b71-2e332557ac36	d02f56b1-0756-4ded-9308-bb3c7eb09088	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090815/bretunetech/products/qzrp2punjqfl3wojffs3.jpg	Ubiquiti UISP 60GHz/5GHz 90° PtMP Wave Access Point Gen2	0	t
387d982a-133b-4a78-95c7-a53564eaf5fe	341c5ccf-dc30-4a47-ba5d-fe47c31f66d5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090816/bretunetech/products/qs2hv72t7yzrizu5zw06.jpg	Ubiquiti UISP 60GHz/5GHz PtMP Wave Access Point	0	t
eb4162a6-593a-4222-8d40-9c7242a7ac57	942c7c43-0c55-4cd8-84d5-e761a834d612	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090817/bretunetech/products/hcmrvfkilhrlirswxdp0.jpg	Ubiquiti UniFi Express WiFi 7 Tri-Band 10Gbps Cloud Gateway	0	t
f1b61600-bbcb-4649-8172-1489a83941b4	ce5cc491-6943-46eb-81a9-9883de34389a	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090818/bretunetech/products/lhaljbze4u3flpppkhcz.jpg	Ubiquiti UniFi Protect G6 Turret White 8MP IP Camera	0	t
8c8eea53-842f-49eb-a348-b6009c69cc5f	b002389c-df8b-4c8d-a22c-6283fc04bef2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090818/bretunetech/products/y2bm7pexv6hbstvk5hnf.jpg	Ubiquiti UniFi Protect G6 Black 8MP IP Camera	0	t
be739515-1dd5-4b1e-935e-76920bc3b711	dd7974c3-23c5-433d-90f6-e99b4182e70f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090819/bretunetech/products/x19fp5os9iqimu6b5jtv.jpg	Ubiquiti UniFi Protect G6 PTZ 8MP White IP Camera	0	t
8091d97b-5f9f-44bf-9c85-dae0eed02c10	c21f63ea-e7d7-4ad0-a1a3-7fe492caf55c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090820/bretunetech/products/z1ohjecof0jvt7yvkqaj.jpg	Ubiquiti UniFi Protect G6 PTZ 8MP Black IP Camera	0	t
fa746ed1-683d-4032-9ae9-a7501e9f3419	6656a49d-05cb-4875-bd44-177c3be28e05	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090821/bretunetech/products/kogqadwujhweyckxd2mh.jpg	Ubiquiti UniFi Protect G6 Instant 8MP White WiFi 5 IP Camera	0	t
556a6ab7-2f37-4fc0-a37f-fe28819f3d60	67e72262-4099-4c4c-bd02-15bc103f39e1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090823/bretunetech/products/t0l728dgmps84xpspmzs.jpg	Ubiquiti UniFi Protect G6 Dome 8MP Black IP Camera	0	t
2d4fdfed-012c-4770-8128-d31a5aa0ac28	40d4899f-50c2-48e1-9828-cbe8b46f4b92	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090823/bretunetech/products/euyj3hyyxrbi4ydfqryo.jpg	Ubiquiti UniFi Protect G6 Pro Bullet 8MP White IP Camera	0	t
a4679dea-00f5-4f8a-9816-ec5a80a9795c	7c9b1214-1daa-45c7-9411-73e34f897c19	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090824/bretunetech/products/tig3c6w8ihgcsb9ozcqm.jpg	Ubiquiti UniFi Protect G6 Pro Bullet 8MP Black IP Camera	0	t
43ce5941-4050-46a9-9c75-5fdc8cadd62a	ab0470a4-523f-4ca0-90b9-e549c7ab67bb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090825/bretunetech/products/jlhdnh4sch6jsa8fawmp.jpg	Ubiquiti UniFi Protect G6 Bullet 8MP White IP Camera	0	t
b7bf5f1d-e6b5-4d9d-8e35-753e4a961386	c22b1a66-dcea-44ef-b8d1-75c3c97798e6	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090827/bretunetech/products/lku1k15b0obmvtzgvoop.jpg	Ubiquiti UniFi Protect G6 Bullet 8MP Black IP Camera	0	t
f4a71381-400b-49a3-a931-8e9ef2eebbfd	7a7f331a-118c-4bb2-94bb-20f9f4888d7b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090827/bretunetech/products/yqpg5q95kofmm0nexf6w.jpg	Ubiquiti UniFi Protect G6 180 16MP Black IP Camera	0	t
9fd7f770-3078-4a72-8b96-f4bef3f18bd3	2f033d2a-8719-40ef-a9a6-34841557ef68	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090829/bretunetech/products/tik5k9utqo7wjwcutmy3.jpg	Ubiquiti UniFi Protect Dual Camera G6 Entry Black	0	t
54c8794a-07c2-4fd9-80e8-36e2dda28ad7	e31238a3-7c2b-468e-b11f-5c42cd0c35fc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090830/bretunetech/products/lmrjhkjz0n16bhehgmwl.jpg	Ubiquiti UniFi Protect G5 Turret Ultra White 4MP IP Camera	0	t
20c2c219-29ff-464c-bdea-92a446eeb013	ccaae4e1-7d67-4862-9319-b703d44b83b3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090831/bretunetech/products/m2ztplusofcjsnfytm8t.jpg	Ubiquiti UniFi Protect G5 Turret Ultra Black 4MP IP Camera	0	t
68da0467-02f2-4496-9bc6-5f9c182f9eda	43254a07-1a21-4484-bce8-429ac4f339ca	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090832/bretunetech/products/dijisctq3zpzqns7dtxp.jpg	Ubiquiti UniFi Protect G5 PTZ 4MP White IP Camera	0	t
4d726487-8cf0-481f-8685-5e4b2a4c1548	8429141b-7af4-485c-9aa6-402275e61e87	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090833/bretunetech/products/vudwi93nd2z8iztzbodr.jpg	Ubiquiti UniFi Protect G5 PTZ 4MP Black IP Camera	0	t
fef3e51f-d55c-48a9-8058-9713f90598eb	5a07d156-74ca-4d10-952d-005fadd42cb5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090834/bretunetech/products/b9khamglljbzfqsyizks.jpg	Ubiquiti UniFi Protect G5 Pro 8MP IP Camera	0	t
03a141fd-fb61-4f58-87b9-1f02e5edda67	b6675315-0c88-4386-84a5-c33acf287ff6	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090834/bretunetech/products/zxkxuwspfgbfsfejzok6.jpg	Ubiquiti UniFi Protect G5 Bullet 4MP IP Camera 3pk	0	t
324d8a5d-56e4-4d76-918a-811c94e363e0	6eb8b299-e7e6-412b-8e7a-89e8530496c2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090835/bretunetech/products/tdp3gb6uxntqgwkuvwjh.jpg	Ubiquiti UniFi Protect G5 Bullet 4MP IP Camera	0	t
31148f49-3394-47f4-afce-f58a055f3ede	894d53b8-f3f7-4534-9772-2fd044baa90b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090836/bretunetech/products/b07pithzzfz7oufgaqd3.jpg	Ubiquiti UniFi Protect G4 Instant 4MP WiFi IP Camera	0	t
2bdf0117-1f65-4f78-8a45-6ba42467917d	9ca6dea1-2738-4f73-ac34-9dd414894c26	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090837/bretunetech/products/sfnri9nqpowlvigfc9hr.jpg	Ubiquiti UniFi Protect Doorbell Lite 5MP White	0	t
07a977d8-ebf5-4fce-81fc-f8f9392165d6	f6109600-3cb9-4ecc-8166-4732d1c4fa75	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090838/bretunetech/products/utnaqtpcjvrvfnkjswkt.jpg	Ubiquiti UniFi Protect Doorbell Lite 5MP Black	0	t
0fd182f9-3bb0-446c-9218-f6d09d89c4ec	acf801c0-9c01-455a-8c8a-b376a0994f77	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090839/bretunetech/products/i7hoonh3vydisdlzfon9.jpg	Linkbasic 305m Box Cat5e Stranded Grey UTP Cable	0	t
4d9ee9b7-a581-40b1-bcd4-79269c90eca0	625f35eb-3219-423a-903f-22bd84c664a1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090840/bretunetech/products/xqmgnw4p5p7lsrepknhu.jpg	Scoop 500m Drum Cat6 CCA Grey UTP Cable	0	t
201b6872-526a-47e4-9f68-522093f63069	fcf4e53b-800e-4fb4-aea1-4b6cc98f40cb	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090841/bretunetech/products/ptkbaqsi7ikjldcjexbi.jpg	Linkbasic 500m Drum Cat6 Solid Grey UTP Cable	0	t
05fbae56-89bb-403f-89a8-5da5a52bdf41	e86268b0-7401-4a57-a469-963ae34061f0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090842/bretunetech/products/gytfjgb5cy1gqavlxhdg.jpg	Scoop 305m Box Cat6 CCA White UTP Cable	0	t
00fccd87-3edb-4bbd-aa57-ca53baa8e345	7f587e8d-a676-4bd8-9814-f32fe13648c7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090843/bretunetech/products/nelpaesaqygvozvz9q9t.jpg	Scoop Unbranded 305m Box Cat6 CCA Grey UTP Cable	0	t
44f3c3fd-6849-4bc3-b53e-00d5fae42831	fbd7e9f2-1b04-494e-a400-6e722498521d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090844/bretunetech/products/nlum8l8vmn4qanzbdnlv.jpg	Scoop 305m Box Cat6 CCA Grey UTP Cable	0	t
7267dafd-62f2-4642-be53-6cd064a9f0ba	f6c74d32-9bd3-4ccb-a669-402302d7430d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090845/bretunetech/products/xnecjetpe89bhfgdftil.jpg	Linkbasic 305m Drum Cat6a Solid Grey UTP Cable	0	t
0548dd71-36ec-4ee1-9221-61c446529172	a485300c-6079-40ed-bd08-8814c6e7809e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090846/bretunetech/products/t06zdetmivcn6p2byxe1.jpg	Linkbasic 305m Box Cat6 Solid Grey UTP Cable	0	t
b28843ce-9b74-4c2a-bfc8-5398c7428ca2	71e95670-5e1d-4abd-9490-93643aff0842	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090847/bretunetech/products/dcgkzut3niopmrogox79.jpg	Scoop 100m Box Cat6 CCA White UTP Cable	0	t
e3b5b253-04e3-475b-8680-93d98fe023c4	756e299c-9065-4b2b-94e4-179bd2b25887	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090848/bretunetech/products/zm5mhfqnnk4dlr8lhjjb.jpg	Scoop 100m Box Cat6 CCA Grey UTP Cable	0	t
fd638818-243e-4e5f-b759-a64f4150b10a	05bc7559-e504-4cd6-890b-94076eb5b956	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090849/bretunetech/products/gkwyaumboxicsfifs2nx.jpg	Linkbasic 100m Box Cat6 Solid Grey UTP Cable	0	t
bd9fb6e5-fe26-4a4a-af74-2294807b293a	fa2c5f9e-9fdc-44c3-8dfd-042cd320e385	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090849/bretunetech/products/v2ycv5dj5ze2znuxjsnb.jpg	Scoop 500m Drum Cat5e CCA Grey UTP Cable	0	t
36d68360-641e-42f9-8b52-3ee445e860d6	a277e9a8-beae-46ea-aa39-6f281ad193c4	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090851/bretunetech/products/je1ghibmw8rfsyfu50lt.jpg	Linkbasic 500m Drum Cat5e Solid Grey UTP Cable	0	t
2a736ebe-db37-412b-803f-4cd1ce4b976f	83b52130-9c92-47c0-9675-966deff96477	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090851/bretunetech/products/ovk55ry9vdx2jf8vvnna.jpg	Linkbasic 305m Drum Cat5e Solid Shielded Grey FTP Cable	0	t
595e7118-b3e2-4492-83e4-fd23cdcc2086	bb84cc92-3791-4822-a2cc-b14029c0c581	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090852/bretunetech/products/yvvmzkqjrlyh6fwh0xfj.jpg	Linkbasic 305m Box Cat5e Solid Red UTP Cable	0	t
0ea6fd9b-9a24-4cb3-a068-1b0f472162f8	cb521c27-7ec1-485d-9fb3-9e724fdec654	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090853/bretunetech/products/w5zxbb0ebxx6zeg1elkq.jpg	Scoop 305m Box Cat5e CCA White UTP Cable	0	t
6dbf14df-f545-4230-b7b7-8b42aeea7c5d	d6828599-9352-4d51-bc94-f2620f3160c9	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090855/bretunetech/products/klragh5b8gfmqelntbu7.jpg	Scoop Unbranded 305m Box Cat5e CCA Grey UTP Cable	0	t
d458722c-62fc-436f-90ad-c4dbd1778bf6	c9321f7a-5078-42c3-b80a-d57ff088d58e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090856/bretunetech/products/htr6fe9kceoxevehmxvf.jpg	Scoop 305m Box Cat5e CCA Grey UTP Cable	0	t
c291f34b-1ed6-4f9f-8c5a-9f182ca8310d	1b3c33b5-62c0-4d95-b394-36a99275558c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090857/bretunetech/products/bmpn9q0japovr5cojhqi.jpg	Linkbasic 305m Box Cat5e Solid Blue UTP Cable	0	t
cd670cb4-ba60-4cbe-885c-0d4941037cf8	ff5e9a26-54b2-4003-893d-6351c2564b69	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090858/bretunetech/products/z1k3fcua4xnedpklutq8.jpg	Linkbasic 305m Box Cat5e Solid Grey UTP Cable	0	t
c683f1b8-9fab-4fd1-8d58-6634534d2f70	fd3b8110-4557-4779-8e3b-7d4d6ace4913	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090859/bretunetech/products/jcdrdtgprjjfhebcat8e.jpg	Scoop 100m Box Cat5e CCA White UTP Cable	0	t
4f3aed71-c91c-49cd-9c2e-1a09babb7d20	39a17af5-4c02-43c3-a2df-46b3a928d314	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090861/bretunetech/products/lydznrbdqiwgxdj887da.jpg	Scoop 100m Box Cat5e CCA Grey UTP Cable	0	t
6abb1ea6-a72f-4b65-94c5-394d05dc3686	f1c702a7-c49a-4d64-8980-c2d1fcbacbe7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090862/bretunetech/products/zykyswg7pz00oiwtuozg.jpg	Linkbasic 100m Box Cat5e Solid Grey UTP Cable	0	t
0ab4c0d3-9272-4874-b30c-77ecb062a994	4d393b97-870d-4a32-9674-d2fed4a79b4c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090863/bretunetech/products/yk7jd5rsrpv0ljzracr5.jpg	Ubiquiti UniFi WAN Switch RJ45 3x10Gbps Ethernet Ports	0	t
f5541e9f-e179-40f4-930d-5ab1e9047dc1	0e43b654-2fe4-4784-808a-54ec77325a49	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090864/bretunetech/products/wlg85axuukhrftbjiuxq.jpg	Ubiquiti UniFi WAN Switch with 3SFP+	0	t
ca867d81-3831-4fb1-b57c-8a286fe7702b	0d537d44-e56f-4c8f-bad4-b1d9143be4d9	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090865/bretunetech/products/dimcsrlcdxn7kxfzeo4q.jpg	Ubiquiti UniFi Switch Ultra 8 Port Gigabit 1PoE Input 7 PoE Out	0	t
40f62b11-fd86-4167-9ed6-2b38e9478fc2	b057b2df-a5fd-4920-96bf-c9a67e68ad61	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090866/bretunetech/products/mpcguwskiik7xx6t2dfs.jpg	Ubiquiti UniFi Switch Ultra 8 Port Gigabit 1PoE Input 7 PoE Out 52W	0	t
b3c0d496-ebb5-4c3a-82de-2fb96873f81c	e579282b-ea4d-4189-84f3-961b26cff0c3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090867/bretunetech/products/odv22isvnx7ixvyso64y.jpg	Ubiquiti UniFi Switch Pro 8 Port 6PoE+ 2PoE++ 120W	0	t
0f545d61-d9b9-4f51-ba4b-acfbda524d8e	21c51057-3424-4e06-b337-5b8fee49a037	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090868/bretunetech/products/ahopa16enl7bz2fazwsu.jpg	Ubiquiti UniFi Switch Pro 48 Port 40PoE+ 8PoE++ 600W 4SFP+	0	t
68db4810-d161-44ca-ae82-c3c7cb31d7c3	c64bf349-781c-452b-89ea-8bb74d64989f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090869/bretunetech/products/eejpr5wuei5ez3u70dgd.jpg	Ubiquiti UniFi Switch Pro 24 Port 16PoE+ 8PoE++ 400W	0	t
94a6a3bb-c010-4038-83b6-213b74233be1	b2d3b9a1-b742-48e2-861d-d007581faa18	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090870/bretunetech/products/qi0q5odgyyvwohagxf6q.jpg	Ubiquiti UniFi Switch Pro 24 Port Gigabit 2SFP+	0	t
dac828d5-79b8-4d78-9b92-c7a2e322e65b	5d8b07da-fb1f-4402-8da4-7a4b2e779ab2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090871/bretunetech/products/qkcluitsi8qmyroh0dng.jpg	Ubiquiti UniFi Pro XG Switch 8 x 10Gbps PoE++ 2SFP+ 155W	0	t
71c9dd8a-b4f8-428b-ab50-409da2a023c2	d996bf30-87a3-4ec0-9e46-ef707158b18e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090872/bretunetech/products/mmnz4cro6tdgvfcna1ie.jpg	Ubiquiti UniFi Pro XG Switch 32 x 10Gbps 16 x 2.5Gbps PoE+++ 2SFP28 1080W	0	t
a5f1188d-50d4-4ca0-a276-38810afc6c6b	a5313401-20d6-428c-a1b9-ef394fee15b2	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090873/bretunetech/products/kevro7tf5bwxltlazbvw.jpg	Ubiquiti UniFi Pro XG Switch 32 Port 10Gbps 16 x 2.5Gbps 2SFP28	0	t
a4786e88-673d-4d0e-b314-7f4d9dab71aa	848f7d63-6934-4a7a-ac59-75aabebd0b38	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090874/bretunetech/products/qy67udwdr2shje1p9arn.jpg	Ubiquiti UniFi Pro XG Switch 10 x 10Gbps PoE+++ 2SFP+ 400W	0	t
43ea24ac-1cb3-4d51-9147-65413a50e72c	74d18311-0e1f-4ff6-ad68-daa892289fb1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090875/bretunetech/products/kaeyx4tpuwcdfpakaqji.jpg	Ubiquiti UniFi Pro Max Switch 48 with 32PoE 16x 2.5Gbps PoE++ 720W	0	t
8410dbf2-d050-43ce-97fc-62535475a925	842ab21a-5a7b-4c36-b563-10cdc9c1221c	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090876/bretunetech/products/xohpg8o6gsouphohbsru.jpg	Ubiquiti UniFi Pro Max Switch 48 with 32 Gigabit 16x 2.5Gbps 4SFP+	0	t
35aed146-4610-4b39-87eb-e7c0df4dd8fa	81160b7f-8dac-41ac-8a33-790c256afa19	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090877/bretunetech/products/xqml0sicz2jnxwctwg8p.jpg	Ubiquiti UniFi Pro Max Switch 24 with 16PoE 8x 2.5Gbps PoE++ 400W	0	t
587db022-8034-4aea-abac-cdb245bbe97b	5b443e26-373a-480f-a534-52457bbffb38	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090878/bretunetech/products/lu8dcfegxhwvksxfjvpx.jpg	Ubiquiti UniFi Pro Max Switch 16 with 12 Gigabit 4x 2.5Gbps 2SFP+	0	t
02e126f2-a5f3-4ebd-ab2c-2bfbcc67930e	ddf468a3-1a64-4a90-ae7b-437983258c0b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090878/bretunetech/products/ehp7l5tvrjyutnxu1rlo.jpg	Ubiquiti UniFi Pro HD Switch 2x 10Gbps 22x 2.5Gbps PoE++ 2SFP+ 600W	0	t
f8433731-acbb-4504-9811-7cfb8ebdb0c3	948cd420-4fab-4645-a608-0de452c715a9	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090879/bretunetech/products/zenbw5k5sh8sa0eeply3.jpg	Ubiquiti UniFi 24 Port 2x 10Gbps 22x 2.5Gbps 4SFP+ Pro HD Switch	0	t
db1d6ede-7f21-4e35-a6c4-c2ac49c361ac	ec7b35b6-d3fe-408f-a083-e36cf6b406fa	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090880/bretunetech/products/yvj8lepfoiixcyv9fhnh.jpg	Ubiquiti UniFi Pro XG Aggregation Switch 32 SFP28	0	t
27705479-ab7e-4f30-a8a9-b1af8005edd9	d72b001d-28f8-4234-bf96-fffab7afe66d	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090881/bretunetech/products/wjwiglyyrkhxfksj9vza.jpg	Ubiquiti UniFi Switch Lite 8 Port Gigabit 4PoE 52W	0	t
5cbd916a-7e8b-4c3f-b140-5cdc224e1ddc	4d32b2a9-bbfe-4635-8af3-20cb201ae1b0	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090910/bretunetech/products/nb9munprgqpirhh20vnx.jpg	Ubiquiti UniFi Protect 110dB PoE Siren	0	t
170fbc56-8c1c-4132-b3ed-aaae58d699ff	e0250c58-c5e4-4743-bff4-d1af736f7fff	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090942/bretunetech/products/ggiue2tjgiymvf4githm.jpg	Ubiquiti 2.5Gbps Multi-WAN UniFi Cloud Gateway Max	0	t
dd26b59c-c185-4046-b247-7db43c54b0fa	11e5d88f-865f-4092-822b-59fd5e333247	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090943/bretunetech/products/mt5mid8r4dmm5rimhgny.jpg	Ubiquiti 10G Multi-WAN UniFi Cloud Gateway Fiber with M.2 SSD Tray	0	t
1191188e-eb0d-4182-8183-53f0b5b747d2	ed7f163c-1d07-4762-9e2c-365cf8ae8488	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090981/bretunetech/products/znhskk9b2btavxrdq1mu.jpg	Ubiquiti UniFi Access G3 Starter Kit Pro with Hub & 2x Readers	0	t
af834d1b-73e3-4f12-8299-947a6c44d7cd	d456c186-52ca-417f-8288-796ac3012c25	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090982/bretunetech/products/mtny3svzohvt5lq2kzmw.jpg	Ubiquiti UniFi Access Reader Pro Black	0	t
c7646b1a-47bf-459d-ac98-3b1186b264a2	1cfe0aff-2388-429f-8ae9-c21a540b8c67	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090984/bretunetech/products/pomv6bhu9tii6c6w31wr.jpg	Ubiquiti UniFi Access Reader Flex White	0	t
c9e35f40-5354-4c4e-b4f3-b03a56e6a202	8f369e56-32a4-4b09-98d8-38f46576de2f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090985/bretunetech/products/menc5l72emnsmt3w6zc2.jpg	Ubiquiti UniFi Access Reader Flex Black	0	t
5bb87370-7947-46a9-be01-bd744b641931	0c0496f0-7871-4ec8-bf4f-b12ad8e6b91b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090986/bretunetech/products/opfeckkepbkj6cvmgvqk.jpg	Ubiquiti UniFi Access Reader	0	t
fce90a43-2983-43d8-a8c6-89f37383d118	99674d6b-d843-4230-bc71-6cd092d116e1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090987/bretunetech/products/hqhk33iq3ai3mejp09mm.jpg	Ubiquiti UniFi WiFi 7 Pro XGS Tri-Band White AP	0	t
4ca0bfc7-1ba8-4742-be62-1222a73fd5ad	24f71c0e-de3e-4fe5-baad-e652941cb8e8	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090988/bretunetech/products/bxwyii71e1fh4oybycmp.jpg	Ubiquiti UniFi WiFi 7 Pro XGS Tri-Band Black AP	0	t
fa001499-236e-4370-9ab4-d38a287f2070	e2cfae11-66f2-4fa6-b68f-154e776956a1	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090989/bretunetech/products/vsrdp371zdk9w0uspjet.jpg	Ubiquiti UniFi WiFi 7 Pro XG Tri-Band White AP	0	t
a26bb9fe-64f7-4f64-8121-fcbc63e08d72	75a695e6-c4a2-4f43-a47d-424ce37a8041	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090990/bretunetech/products/h1bfwyb6cp2bi25or6j2.jpg	Ubiquiti UniFi WiFi 7 Tri Band Pro XG 10G In-Wall AP	0	t
cf7a178d-08e4-4cfd-95b8-22e3444a7b68	ff65fbe1-cb6f-47d9-be89-bb825ab095df	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090991/bretunetech/products/wawzcpbwzezrf9yldrga.jpg	Ubiquiti UniFi WiFi 7 Pro XG Tri-Band Black AP	0	t
487db6fa-fc00-49cc-9c1a-f63eb2f93239	a9ff5273-ce2d-41e8-95c5-799dcc89d1cc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090992/bretunetech/products/rm9jhm4ats3vu29raln9.jpg	Ubiquiti UniFi WiFi 7 Outdoor Pro Dual Band AP	0	t
7450cbc2-5053-4091-9ceb-f0994c2c2936	823ea16c-8905-4bbe-afb0-5a14973ba810	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090993/bretunetech/products/vfgvnp5ccc0vqfgt3s3t.jpg	Ubiquiti UniFi WiFi 7 Tri-Band Pro In-Wall AP	0	t
26a3cacb-2980-4ba0-915f-fcea8bc49878	4f876ca5-6f70-433b-9f5d-a5687631fa2f	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090994/bretunetech/products/n9qbb9wtqhdwnv2himpt.jpg	Ubiquiti UniFi WiFi 7 Pro Tri-Band AP 5pk	0	t
def27e00-5d01-4398-a3f7-4616443f71b7	d1395924-c83a-45b0-82a2-c3491940159b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090995/bretunetech/products/jgz8ykmkn8tcthstp4md.jpg	Ubiquiti UniFi WiFi 7 Pro Tri-Band AP	0	t
05481bdd-91f2-47ec-b378-13261a114a16	ed9aa755-e8b8-47fb-8ccc-6d5ff252f91e	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090996/bretunetech/products/mkmngarbh7wgjalqrnzw.jpg	Ubiquiti UniFi WiFi 7 Outdoor Dual Band AP	0	t
52a9ab7a-b273-4edf-8865-0d3604b6b11a	bfbdb201-437c-4415-9f9b-1929bc8ea267	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090997/bretunetech/products/lgpaq5czwzt1hncd579t.jpg	Ubiquiti UniFi WiFi 7 Long Range Dual Band AP	0	t
23c65102-e7b5-41e6-a47d-606f11dabd5e	c9126443-03dd-4c08-87e5-770a2a8ef8c6	https://res.cloudinary.com/dojzkljaa/image/upload/v1782090999/bretunetech/products/jg1a2bkuzbatrlnmeogd.jpg	Ubiquiti UniFi Dual Band WiFi 7 2.5G PoE Out In-Wall AP	0	t
c76e7bf9-aea0-423c-90b3-77a2981babf3	c635aef3-bcf3-4dc8-8760-3ead963da7f5	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091000/bretunetech/products/c7hk9qxxlan2xmiy6ksa.jpg	Ubiquiti UniFi6 Pro Dual Band WiFi 6 AP	0	t
709ba5ce-2f44-42af-9e11-fbd564fcebd2	c13e08fb-31cf-4775-a57c-c3e71049c554	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091000/bretunetech/products/d7jyxjw5dvnwtm8x5j8b.jpg	Ubiquiti UniFi6 Mesh Pro Indoor / Outdoor WiFi 6 AP	0	t
ee2bda3c-4a4c-47c6-8873-779d0d831cee	e49fb2d3-18ae-4491-8e51-42ff6dd083e3	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091001/bretunetech/products/db87wbtvdxt1royu4tci.jpg	Ubiquiti UniFi6 Mesh Indoor / Outdoor  WiFi 6 AP	0	t
5b972bf6-f467-4922-8c66-d663f9ed4d82	5a32e2b3-843b-417c-8b4a-246acba39d4b	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091069/bretunetech/products/jxw1u0qzeukx9mw4zcps.jpg	Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh 2-Pack	0	t
b26cb272-4cd4-4d2d-b6d6-cdf083d6f0a1	dbc5f223-a996-4be4-b2b7-47c609a8df97	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091070/bretunetech/products/prgt0mqeodradik16wod.jpg	Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh 3-Pack	0	t
b01a57fb-2d78-4896-96e4-decb64c3c4e8	55b7fe5e-73b1-407c-a7dd-af3ae593e7ae	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091071/bretunetech/products/yturuyptvsiv4zagdn5h.jpg	Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh Router	0	t
2f94d15c-4356-4e39-9792-eb51c0f16ae8	dd51a596-7d92-4737-b8c9-97b5ff543a83	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091073/bretunetech/products/tu7vp4udkaja9h3zovui.jpg	Reyee Dual Band WiFi 6 3000Mbps 5dBi Gigabit Mesh Router	0	t
c61f5afd-d947-4177-a216-35178f4ab2f4	bf33cbbc-deb1-46ad-8008-a502bf2161f7	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091073/bretunetech/products/qj3kzeq4nfmirdyozni7.jpg	Reyee Dual Band WiFi 5 1300Mbps Gigabit Mesh Router	0	t
c0602ef3-ff27-49d7-8065-a8491105fcba	f487927b-973b-4568-888c-4ef3f9994b37	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091075/bretunetech/products/gm2qvnpyjqdiud2ucuwy.jpg	Reyee Dual Band WiFi 5 1200Mbps 4dBi Mesh Range Extender	0	t
1b10a663-90ae-400b-a0d9-f7666a5244a2	7cc92472-dab0-4f6b-822b-3f0c0837eafc	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091076/bretunetech/products/kmavsx9neaotxzzcnejt.jpg	Reyee Dual Band WiFi 5 1200Mbps 5dBi Fast Ethernet Mesh Router	0	t
ab76044c-0289-40bb-aab9-ea45172abd2e	557a037e-8666-49d7-9fd9-68c6eb4e1188	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091077/bretunetech/products/e3qjj8ugemmz3btobzpf.jpg	Reyee 5GHz WiFi 5 Gigabit 15dBi 120° Integrated Sector	0	t
aec3c2af-17be-4bd5-a274-d4c8da046d2c	dfc8b29f-f27e-4643-9442-59d060214c75	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091077/bretunetech/products/nedlkj6u3oylhxk1lux6.jpg	Reyee 5GHz WiFi 5 Gigabit 16dBi 30° Pre-Paired Kit	0	t
6b6e6c95-f712-4b07-b69d-46fd35c1bc86	acddb4a2-5281-4605-bc9e-689e3a2e8c13	https://res.cloudinary.com/dojzkljaa/image/upload/v1782091079/bretunetech/products/kdmkq85cbhx1xum8lqup.jpg	Reyee 5GHz WiFi 5 Fast Ethernet 13dBi 30° CPE with 2xPoE Output	0	t
\.


--
-- TOC entry 5332 (class 0 OID 362692)
-- Dependencies: 222
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_specifications (id, "productId", key, value, "sortOrder", "createdAt") FROM stdin;
\.


--
-- TOC entry 5334 (class 0 OID 362710)
-- Dependencies: 224
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tags (id, "productId", tag) FROM stdin;
a627854f-59b1-4f16-b87f-e6061215e010	341c5ccf-dc30-4a47-ba5d-fe47c31f66d5	ubiquiti
f01343c4-d02b-46fe-8d80-d634265d50f1	942c7c43-0c55-4cd8-84d5-e761a834d612	ubiquiti
78942c6d-5d1a-446d-af39-0af289c36bd3	ce5cc491-6943-46eb-81a9-9883de34389a	ubiquiti
7bfb9007-a535-4433-8141-45a14461963d	b002389c-df8b-4c8d-a22c-6283fc04bef2	ubiquiti
a100b50e-0444-4e6f-a54c-c6118ea7fa61	dd7974c3-23c5-433d-90f6-e99b4182e70f	ubiquiti
642a287c-dbf0-4ed3-81a0-54f27b3c3487	c21f63ea-e7d7-4ad0-a1a3-7fe492caf55c	ubiquiti
cd22c366-5b59-4cd8-a1f4-4cf604f309cc	6656a49d-05cb-4875-bd44-177c3be28e05	ubiquiti
310ded74-5e76-4ca8-8c84-5afd5f296381	67e72262-4099-4c4c-bd02-15bc103f39e1	ubiquiti
3724a703-2672-4552-ac1d-1e60eb6986ef	40d4899f-50c2-48e1-9828-cbe8b46f4b92	ubiquiti
6094140f-0bb3-460c-839b-bd81a8fd4bc4	7c9b1214-1daa-45c7-9411-73e34f897c19	ubiquiti
1e4d2daf-52fc-4fd4-96a4-06455bd21fb8	ab0470a4-523f-4ca0-90b9-e549c7ab67bb	ubiquiti
00572ed9-c20a-4402-be26-cf0bceced353	c22b1a66-dcea-44ef-b8d1-75c3c97798e6	ubiquiti
ba0237e9-1305-4015-a0ac-2e3bbf79d870	7a7f331a-118c-4bb2-94bb-20f9f4888d7b	ubiquiti
cb092157-142b-4412-adf2-11f370073c7c	2f033d2a-8719-40ef-a9a6-34841557ef68	ubiquiti
c9861013-8353-4c3b-b6b1-519dba82482f	e31238a3-7c2b-468e-b11f-5c42cd0c35fc	ubiquiti
69f0e43e-1574-4514-b83a-599d495dd604	ccaae4e1-7d67-4862-9319-b703d44b83b3	ubiquiti
62b96ad2-eb47-4966-94d5-6329d3c910af	43254a07-1a21-4484-bce8-429ac4f339ca	ubiquiti
a40e6472-ea70-4e06-ad3b-69b9e1edcd9e	8429141b-7af4-485c-9aa6-402275e61e87	ubiquiti
08dc6223-2551-4a73-9a1e-1ef407e7ec95	5a07d156-74ca-4d10-952d-005fadd42cb5	ubiquiti
0d3ec1be-3b26-4ee3-99ff-3ed57dcb382c	b6675315-0c88-4386-84a5-c33acf287ff6	ubiquiti
11ecaac7-fec9-49ab-af99-e9206637bee3	6eb8b299-e7e6-412b-8e7a-89e8530496c2	ubiquiti
b1fab42e-f2bb-4d2e-8f91-35de7aa039ec	894d53b8-f3f7-4534-9772-2fd044baa90b	ubiquiti
d36f9c9b-5b90-4bec-b111-e3a3532070f6	9ca6dea1-2738-4f73-ac34-9dd414894c26	ubiquiti
c87a45d5-c46a-4148-bc2a-1e4a2fc904f7	f6109600-3cb9-4ecc-8166-4732d1c4fa75	ubiquiti
ebbcc0e5-3bb0-4e2a-9b86-fbda9b9e5e35	acf801c0-9c01-455a-8c8a-b376a0994f77	linkbasic
13e46b8a-304b-4544-b6a9-bc19c0e5db11	625f35eb-3219-423a-903f-22bd84c664a1	scoop
55fc8597-625d-4884-86e8-e3cdaeab85ad	fcf4e53b-800e-4fb4-aea1-4b6cc98f40cb	linkbasic
ae1b5649-a3b6-41f0-b914-cb831d6409bc	e86268b0-7401-4a57-a469-963ae34061f0	scoop
5027dd2f-8fc5-4c76-b089-7df9cf6dfb95	7f587e8d-a676-4bd8-9814-f32fe13648c7	scoop
6c7206d9-23b5-4b50-bf9d-3891f34756fd	fbd7e9f2-1b04-494e-a400-6e722498521d	scoop
87ca4199-69d8-48d6-9106-38960ddb3637	f6c74d32-9bd3-4ccb-a669-402302d7430d	linkbasic
c0dc726e-86d4-4619-94d6-106c8a55d02d	a485300c-6079-40ed-bd08-8814c6e7809e	linkbasic
d4bda8f1-d7c6-4b03-a84b-734360857e01	71e95670-5e1d-4abd-9490-93643aff0842	scoop
037b9099-83f5-4d64-ba7a-722d72442c43	756e299c-9065-4b2b-94e4-179bd2b25887	scoop
edc51603-939d-48d2-b614-59b714414f03	05bc7559-e504-4cd6-890b-94076eb5b956	linkbasic
8f4275fe-5d7c-4e7c-b760-9172174866c8	fa2c5f9e-9fdc-44c3-8dfd-042cd320e385	scoop
cfe77084-a7fc-46e4-bbf6-97c801c40f4d	a277e9a8-beae-46ea-aa39-6f281ad193c4	linkbasic
7769ac6e-f254-4c8e-87b1-a4ef7094bebb	83b52130-9c92-47c0-9675-966deff96477	linkbasic
10c2f3df-d962-47c2-8611-1202fc2259d4	bb84cc92-3791-4822-a2cc-b14029c0c581	linkbasic
52ee74d5-9c7d-47c2-9d62-478690c97110	cb521c27-7ec1-485d-9fb3-9e724fdec654	scoop
0a37db2a-570f-4d3d-8fe4-8501fc3ea68f	d6828599-9352-4d51-bc94-f2620f3160c9	scoop
735adce7-0a66-49d3-b9a0-6458b0f46b26	c9321f7a-5078-42c3-b80a-d57ff088d58e	scoop
92c3ac25-22dc-4a73-b2b5-1500315d6341	1b3c33b5-62c0-4d95-b394-36a99275558c	linkbasic
5a420f20-1700-480f-ac9d-bcd64221b73b	ff5e9a26-54b2-4003-893d-6351c2564b69	linkbasic
97a4393b-b60a-4f66-99b5-0dc84bede987	fd3b8110-4557-4779-8e3b-7d4d6ace4913	scoop
b530c08e-f372-4717-a7c2-3ec3db0caf27	39a17af5-4c02-43c3-a2df-46b3a928d314	scoop
f6f90abe-31cc-4d85-8a55-502639ee36a6	f1c702a7-c49a-4d64-8980-c2d1fcbacbe7	linkbasic
38d8b824-4ec9-42fd-8dd1-8a498078769f	4d393b97-870d-4a32-9674-d2fed4a79b4c	ubiquiti
285a6315-2cca-40d8-ba36-fe4751d0d1a4	0e43b654-2fe4-4784-808a-54ec77325a49	ubiquiti
eb346bdd-0c42-4120-8973-a32443b4abe5	0d537d44-e56f-4c8f-bad4-b1d9143be4d9	ubiquiti
e9b85fe5-623a-4ae0-8ee2-de3556ec3754	b057b2df-a5fd-4920-96bf-c9a67e68ad61	ubiquiti
7e16879a-c5c7-44bc-9b90-c567429b9ef4	e579282b-ea4d-4189-84f3-961b26cff0c3	ubiquiti
614839c2-e900-4b2d-ac85-e7fd5d29e221	21c51057-3424-4e06-b337-5b8fee49a037	ubiquiti
edbc64a9-af35-4dd1-925f-eb49292efa52	c64bf349-781c-452b-89ea-8bb74d64989f	ubiquiti
6ae49e21-f279-4308-8067-32f762e85640	b2d3b9a1-b742-48e2-861d-d007581faa18	ubiquiti
0d000d5b-c361-49c9-b728-a125309ef5e7	5d8b07da-fb1f-4402-8da4-7a4b2e779ab2	ubiquiti
e2a9cbb4-fa99-441b-8be6-7c04bf009173	d996bf30-87a3-4ec0-9e46-ef707158b18e	ubiquiti
1d87be39-c438-4dce-98d5-1e7db5975ec1	a5313401-20d6-428c-a1b9-ef394fee15b2	ubiquiti
a03fbb41-a262-4f61-8add-a3685ff69dd2	848f7d63-6934-4a7a-ac59-75aabebd0b38	ubiquiti
f928a018-30fa-4de3-9e8e-e688f4e4443d	74d18311-0e1f-4ff6-ad68-daa892289fb1	ubiquiti
22e79dae-fbab-4c96-9e26-85e218dc5c68	842ab21a-5a7b-4c36-b563-10cdc9c1221c	ubiquiti
ba4842df-772d-456a-b851-c3790806f1fc	81160b7f-8dac-41ac-8a33-790c256afa19	ubiquiti
5e55880d-37d4-48ee-98e2-d1f30b518967	5b443e26-373a-480f-a534-52457bbffb38	ubiquiti
d7b19e0b-3783-4e70-a06a-cb1d69ec2a78	ddf468a3-1a64-4a90-ae7b-437983258c0b	ubiquiti
6171970f-6fd0-41aa-92a2-cf0aba9dbdf4	948cd420-4fab-4645-a608-0de452c715a9	ubiquiti
654da3b6-360f-4896-a204-1e0c8618ab62	ec7b35b6-d3fe-408f-a083-e36cf6b406fa	ubiquiti
9d9c0878-b447-4f5b-a1d2-39a375c25f53	d72b001d-28f8-4234-bf96-fffab7afe66d	ubiquiti
21ca5928-c05c-45d1-9230-bdf48741e657	1fccc1b8-46c9-4f06-8c9b-6d9770839e47	ubiquiti
ce492502-bb8b-4f75-8787-86137d712a84	1fdd49fe-9c54-4b7a-a5b0-7d9b21a4869d	ubiquiti
326542fc-3416-41ca-bbb9-182f32740147	87f164f8-149d-4e26-af77-3bf3d7afb226	ubiquiti
27e0471d-6697-4855-912e-f4ae5d5f3c7a	111375ae-8016-4890-9e22-9292d99f7dad	ubiquiti
9dcfdc3a-3712-4e9f-a721-a9356e3385f2	558e8106-a086-40cb-8dd9-fa07b06d6b47	ubiquiti
667d8e7e-2da7-4b63-b7a4-5108789c8f96	ed7dcf9f-0f88-4d94-be36-c3d3ca330426	ubiquiti
57cb485b-2966-486a-b060-d608896db6ef	8ff208d6-3c34-4b9f-b271-963fd6e1c97e	ubiquiti
5ca4aed7-8be1-42fe-8b96-790ab5692f0f	6ff67c45-e5e8-4e39-92d4-31f28c12efa8	ubiquiti
cdb9bc86-2009-4a35-9962-dbdd2da079ca	a85b19bf-7713-4c37-bd8c-ce7fb2d8159d	ubiquiti
037a04ca-4038-4e5f-b1e7-b0252fed81a2	1996d855-c657-4f2a-98b3-3bf9bc8379ae	ubiquiti
bd59b0c3-4a48-470b-8a31-a5e3dc0f4211	d84f8cb9-2c72-4507-a0fd-12fa17dd4b3d	ubiquiti
03e99b55-96fb-449e-9cd6-3b1f34283fef	a9ab6c8b-0471-4100-bb9a-47e1e2cd9641	ubiquiti
991639ab-e09b-4d9b-8e7e-d83859e2232d	f9b74c4d-4419-47cb-96e7-fcb0a9adc1db	ubiquiti
d35f8613-1ec1-4928-90e5-99b38d2cce32	a9519996-6295-406f-be95-68939f10f34f	ubiquiti
7c9eb850-aff8-4a4a-b47a-296b11bf72a7	59e0d23b-2a21-4337-a812-28f11d4905a4	ubiquiti
d78c2189-130b-438d-ba75-e947f9a08e09	f524a5b2-2dd8-4d89-9283-368f9e56af9c	ubiquiti
6554b2d8-eafc-4a7d-a8f0-048e4a672e01	871876ad-ff01-471c-bd97-bce384388267	ubiquiti
42920664-2f61-411c-a3c1-41afdd263648	82a6b87f-cf05-4e3f-9576-b2c2eb7d6c87	ubiquiti
9193beb6-1630-47cc-bfdf-b979b1e5f264	cd5c7ced-f6ed-41e2-8429-36045f1f8c3a	ubiquiti
898a555c-f5ee-4eb8-b8e3-e07bd6d41ae8	7c52e49a-4910-4776-b515-10cbe3426cd0	ubiquiti
a07e1103-186b-4b25-b274-ce9e7a9a7d32	85a69eed-c1a9-4734-a3de-ad0eae384169	ubiquiti
e81e3a2d-d1b9-4566-8c37-b48515d17e4a	98e20bac-80ec-428f-abbd-651b6f854aea	ubiquiti
203cca88-c1ae-4c1a-b050-18867edb3386	703be67e-8ad6-489f-85ea-e94011903c90	ubiquiti
dba9806d-483b-4265-84f4-5a13000919e8	68ec4ed1-f939-4886-aa25-bf7499f2f5c5	ubiquiti
33f5b634-30c8-464b-a516-054d14675a35	c25ab3fe-d03f-42e7-9c2e-7513704b748e	ubiquiti
bfb17140-d5ef-41a5-a97b-9e2fdc4e1c1c	49864b40-11c5-4bba-a0b4-4776f81aa8b8	ubiquiti
b46b1320-be40-460c-acfb-fa7a236ce5f4	7b1236de-2c47-49d3-855e-aabf8d3f2312	ubiquiti
faf357ab-76e8-4553-86d3-d9eb7c865d39	4d32b2a9-bbfe-4635-8af3-20cb201ae1b0	ubiquiti
902525e4-f6b5-40c3-a7e5-ec75885d78cf	d5c59a34-cfe1-4177-8c13-d52b8c27a67c	ubiquiti
2b7d52e0-0b73-43b4-a8c5-956b8364def5	bce5c576-ebd4-4901-bf69-67303634c937	ubiquiti
8668c1a5-1667-496f-9d21-d2f3f8868a3c	1c42516d-904e-4cb4-92f4-7d36aaeb123c	ubiquiti
b5a0240d-fb3b-44cb-a658-1dfedaf0d922	ecf76421-e3f5-4123-bf5f-079bb7bbd3c7	ubiquiti
c6be31b6-9f22-4b98-85fe-2a932e55a991	845dfcea-78c5-4768-8e86-0ff38de5de07	ubiquiti
a967373e-3ee8-4eb8-941a-2f5506e668b7	b72ce05d-c0fb-4507-a706-5cf54c08bf18	ubiquiti
a8841d84-8e6a-437f-8d29-051dc417840b	7255b5bf-0caa-4cf2-be78-0affddac9065	ubiquiti
e27f531a-c96d-473f-ba0b-aa7fd05d4329	63422a18-d703-4268-a192-ac56c5f6f94b	ubiquiti
32bcc749-1f8f-4df0-9278-b6761165db3a	979f3d6e-3e99-43df-9f79-3a40fe4ab64c	ubiquiti
283dc002-4d15-4118-a708-9db700d4c179	9eac4668-c31d-4d7e-a02e-7b05bd916c8b	ubiquiti
41fe66ed-80eb-4cf0-960a-9d9a2809b080	aa1da2b1-c1fd-45ce-9896-103f91904ae6	ubiquiti
3c708e8e-5e83-471e-a8b3-19127a30e4e2	ccd65b18-2b32-4777-bbbf-ba310c50f03d	ubiquiti
38609b1e-f840-4344-907e-d089169778b3	539195e4-c72d-4a3a-b31b-a4339512cb45	ubiquiti
9f611156-cea7-4bb0-90cc-ab4be8f08742	366cc49c-623e-4e26-99b5-53bce4e4d1aa	ubiquiti
01cda251-8169-42e5-b70b-61d8576ec6ab	f27ad17c-ab47-497b-b26c-bc86c6bf395d	ubiquiti
c67109a6-0a9d-41d6-801d-09b4bb6b5db4	0416e6f2-5ccb-4589-a2ac-8d7ca4ffc194	ubiquiti
741c0508-03eb-48bc-8b5c-870774e348ef	08c1effb-5fb4-4027-942d-fefd5a33b39a	scoop
646d9aeb-5d2c-4b3e-9f5c-ff87a991e42c	0bd22bb1-fe86-4411-b356-3f6f6fc0d480	ubiquiti
7595d646-5f43-4379-8f73-9d05e483b955	98c573c3-6c31-481f-b820-798372b8d357	ubiquiti
6b545ac5-5924-4e51-b0c4-92ba46078170	6f511958-e8cf-4440-a90e-2fe367513541	ubiquiti
5feff470-1aa6-4899-b575-f4bb3e38a6fe	23669c9c-fa15-4ee6-898d-184c688a6935	ubiquiti
9a96a6fb-a31a-4c20-8a0c-dfbe7bd5e1c4	2fee61aa-a3e5-49b8-96ca-b8d0e7145a4a	ubiquiti
22cd444c-c04b-4525-a397-faa70528d6bf	877ee7f3-9bb5-41b6-92f3-d51c8c20b4a0	ubiquiti
c30c6da8-b166-4a2d-ae41-d8fc19089698	e5a717be-3c98-4f29-b291-c28001fb41c8	ubiquiti
bb00dd5b-9b60-490f-9e34-8aa5656e922e	3a2c9a58-45a8-4b54-b95f-7a7a7a6c9ca7	ubiquiti
c65f9b52-8962-41cb-aec7-3bffd690fe8c	4a778adf-534e-4768-b561-f1ce9588557b	ubiquiti
e09c2726-5885-422e-936c-c05be2755ccd	63cbe2fd-0220-4a05-a9bc-a8cb73dfd6c6	ubiquiti
2d98dc75-51c6-4041-a974-896cf61f95e6	079acd38-89da-4983-948e-d93fef5f9bf0	ubiquiti
14c05d5d-59e5-46dd-9aaa-75496248d8ea	9ca26b4b-cdf8-4db4-8441-91b3e1bd60c7	ubiquiti
9a18294c-230b-484b-ad0f-ec1da691014b	673e708d-3023-48f5-b9c9-8ac50a9d54a1	ubiquiti
ceb70a6c-1603-4373-92b0-855aefd2592d	e0250c58-c5e4-4743-bff4-d1af736f7fff	ubiquiti
5f6ebd66-ae4f-4b53-a916-5e322114173c	11e5d88f-865f-4092-822b-59fd5e333247	ubiquiti
6ffcc047-005f-4afb-a65e-16c0838a30e1	3ce85696-4739-4cbe-90ed-e25155cb0dcc	ubiquiti
2d0c60c7-4cf5-4db1-9f8b-0b11ec9064b0	32c33dbd-2000-43ae-87b1-a8ace9aa0c3f	ubiquiti
e505ad3e-9815-45fa-af79-ae7b3c1e2789	acae9831-050a-4ba6-b5b0-6c9cfc7d23f2	ubiquiti
56a473bd-cd76-4969-b9eb-257e89d7ad80	b68f7ecc-d6aa-4634-aed9-405390ed678d	ubiquiti
052c7225-253f-439b-a678-25ac53555cc4	42bc9667-7530-4092-8f32-bd44f00b9564	ubiquiti
322a51de-4cbd-4adf-b86d-1b55b90e4a52	4d17f9f9-b184-43d3-85e5-2cb9c324e1ca	ubiquiti
1b29ce0b-7bbc-4d5b-82c2-a88291939070	e003bc2d-cb44-4050-af51-9ee87f783909	ubiquiti
5ac4c094-5f4e-4135-8a51-b93acd215adb	d3999541-674a-4edd-85e2-2c2d6e92563b	ubiquiti
bbaa483e-499d-48c0-83c8-b9e566718404	eb20c6b0-e559-4c9d-854d-1beba19f6d6f	ubiquiti
06fbd8d1-fdcd-4a4d-bf5c-af02fd4da936	2bc879e6-9b12-4ad9-9dad-52234a5407cb	ubiquiti
13e59a88-07dd-4c51-a8d3-25c35292ee05	428ba69e-f8b9-4f37-8690-224a49e3f8a0	ubiquiti
dabfd23f-dbca-4116-b8c0-bf6dfc01a578	377a32e6-e626-4a8b-b24f-d96c2e79bd43	ubiquiti
9bfe69d7-b017-4e56-90f6-181ab8663156	e8ea8885-1273-420c-a6e9-2781de479bb0	ubiquiti
2df7c97c-578c-401f-9274-2e38dce49f8e	04eac9ac-20cf-4ef7-b9dc-d0cd91543303	ubiquiti
0d28f9c6-c321-4f24-8e0d-b2c6dd2aa0b9	58912b3d-6ac3-4c2c-b5b3-a9321647303b	ubiquiti
ff4f1f1a-1c8e-42ec-8707-b35c3a665ee3	138f14a7-9d34-490d-8e48-6f6ba610e4c5	ubiquiti
251ca898-4c5a-4a0d-867e-623234ce30a2	27d97f60-bb9f-42bd-a574-4f45f823e301	ubiquiti
b02a9709-71f4-4cb7-9a11-e27baad3d150	3ae24105-2c48-4d1a-9bb0-978d692ef9e3	ubiquiti
d80332dd-5bf9-44f7-98e0-9e55db117373	c6c1067b-2b0a-4476-872c-8b741a260b6b	ubiquiti
af68fa46-4caa-466e-a7a7-b96786c38b3f	44ee0af1-8ed2-431f-a280-29c119a75f8d	ubiquiti
31b3cd5b-c1c8-4a5e-84d8-717f06c07fc0	3f08b152-03f0-466b-bc8d-5d125b9dbb16	ubiquiti
c6bd0276-6d4d-48b2-b08d-765e84679f0a	a4756238-0f56-45cd-b1ed-d8d4b60e27db	ubiquiti
a26c67f0-b266-46f5-8e30-3147f50e0c64	04d1b696-63a1-4c80-91b1-d7cf5545806f	ubiquiti
376ce684-f56a-416e-9b9f-bc6cd7c76408	7e509b2c-b686-4f50-a33b-1e1e59e668b2	ubiquiti
d086be9e-3015-4ee9-8603-93ce8791bf7b	61d126b4-4f8e-41b3-9e69-8f441fe25ea9	ubiquiti
527b5f69-949d-437f-a802-d47e552ab48d	4a4b14d0-050d-48a8-99d5-5c3eaf67669a	ubiquiti
90f83249-1a61-46ae-876e-fb3233ed0f35	044f199b-1201-4cfa-84a5-0561b8b8b269	ubiquiti
e882746d-350e-405b-8d9d-f41558898499	a535d8c6-6524-4168-8ee3-c38bf331be1f	ubiquiti
0d56d4e2-5763-4607-99bc-fe8f668d6e6e	4d06efef-7a1a-426d-9118-d39a367c79f9	ubiquiti
8677a152-7087-4e95-b396-617f3fa63955	6dd364d8-3249-4e12-a82c-83cc51975a7b	ubiquiti
ca83eeda-194e-460c-bccb-b5bf48a165f4	d19e4d3b-30af-4c63-a748-f9752a008c7f	ubiquiti
090b5e56-4166-4416-9b5c-53b0e9787df2	35ce684f-a511-4e9f-819c-0602722e929b	ubiquiti
7ca0d5c5-5594-4da3-bda6-ee386305c505	fd6594df-c27a-4445-8236-871c44d09669	ubiquiti
806f1fb6-f45f-4446-bbb4-d6626c97c665	ed7f163c-1d07-4762-9e2c-365cf8ae8488	ubiquiti
680277ec-7501-4593-8dd3-e8d9ced86d3c	d456c186-52ca-417f-8288-796ac3012c25	ubiquiti
660826e0-3fac-45ed-8b94-74f0367f60eb	1cfe0aff-2388-429f-8ae9-c21a540b8c67	ubiquiti
2682edc2-7193-48ea-9e59-8b70edb3afce	8f369e56-32a4-4b09-98d8-38f46576de2f	ubiquiti
ee3e645c-29cb-4d58-8211-7295666c65ad	0c0496f0-7871-4ec8-bf4f-b12ad8e6b91b	ubiquiti
a9e39c19-c148-4192-b0db-372e81cee94a	99674d6b-d843-4230-bc71-6cd092d116e1	ubiquiti
18a94e9c-4e9b-427f-b7b3-c23c7404cefa	24f71c0e-de3e-4fe5-baad-e652941cb8e8	ubiquiti
7d0eb640-3351-43eb-a586-51ad6fca0943	e2cfae11-66f2-4fa6-b68f-154e776956a1	ubiquiti
2ffa4a9c-6e01-49a3-a194-8ea19c5ec743	75a695e6-c4a2-4f43-a47d-424ce37a8041	ubiquiti
94a1e275-1c60-4fb6-9568-00e72fcbed2b	ff65fbe1-cb6f-47d9-be89-bb825ab095df	ubiquiti
f80c1047-a29f-4b2a-b429-61c3f065a96c	a9ff5273-ce2d-41e8-95c5-799dcc89d1cc	ubiquiti
a1f95f03-781b-4883-a8bc-992c71477532	823ea16c-8905-4bbe-afb0-5a14973ba810	ubiquiti
f6a2e73e-5f22-484c-8dc4-9ce94334e745	4f876ca5-6f70-433b-9f5d-a5687631fa2f	ubiquiti
020b27f1-c94e-4ace-bbf2-6ffefffa2abe	d1395924-c83a-45b0-82a2-c3491940159b	ubiquiti
c54350e2-265e-460b-8d4d-1276b503cffa	ed9aa755-e8b8-47fb-8ccc-6d5ff252f91e	ubiquiti
aefd2a45-ca36-43d9-ba49-b96ad22cf445	bfbdb201-437c-4415-9f9b-1929bc8ea267	ubiquiti
c617d186-0027-4bdc-80d2-396df0e6034f	c9126443-03dd-4c08-87e5-770a2a8ef8c6	ubiquiti
32c8dad2-6273-428b-8d9a-33a544adf5f5	c635aef3-bcf3-4dc8-8760-3ead963da7f5	ubiquiti
5edc6eee-9440-4674-b740-902a624d4cd1	c13e08fb-31cf-4775-a57c-c3e71049c554	ubiquiti
0e09b8a6-2dfd-4474-966a-8148ba381ff6	e49fb2d3-18ae-4491-8e51-42ff6dd083e3	ubiquiti
04e1e80f-6d07-4e07-82e0-9ffda2ff2ab5	6bd11f49-215c-4320-8cd1-e0346d761475	ubiquiti
a52f2801-73df-436c-be92-7e6ea33a61a2	bf11b8e1-935d-4c42-9bee-9ea4c4d21ea7	scoop
2c215f75-6a6b-47c5-877b-ab065fa2c353	fd607937-8ac5-415f-a217-fb47a10a4001	scoop
3928c19c-543b-4155-900e-b0b9517a5448	bfde01f1-af1e-4eb6-a2c9-83c65b3825fa	scoop
f42ae15d-9ee1-4762-b8d2-cf04bf389473	3deea999-a3c1-4233-bccd-e4413319a678	scoop
09f620d5-1c9c-4624-a58c-1ff38e8c88cf	7369989d-6324-49dd-aa8a-674d8d28b37c	scoop
1cb539c2-9214-4708-b1e8-ade5acaed6ee	9f05776c-0660-49c4-b23e-8259a871e243	ubiquiti
5ebd8493-8342-432c-a98a-92a8a046a99b	946998c3-9186-4a38-a117-3d379008ad2a	scoop
e4ea31c3-9037-4c65-a2e3-c302f689a046	0e098af3-771d-4d34-abf5-6af71c78a693	scoop
f2a9f91c-6427-440c-85fd-6645d1d85fa2	00a14fe2-2c5b-4963-bd70-051e31121144	linkbasic
ebfaf136-494a-4166-aecf-68601c452a3b	83abb981-3c37-4911-a1ed-1eeb0328cd74	linkbasic
4845150c-5745-4b2e-ab15-9fea699c6c8e	b503a967-f162-4850-b5b8-62a4f4909a54	scoop
3318ea69-73b6-4e57-a4a6-5a6d0171c989	3a4e95e3-047b-483c-a09c-7a4c80027b06	ubiquiti
d87faac6-bce9-45d4-8917-c65fe55f8cd4	1e3f9717-1072-474b-ab3c-7c36aace5bc8	tplink
341ad6ca-ba2b-4767-974a-d2b010c9d999	355e18e6-3026-4096-9324-793c3f67ae90	Best Value
d014e264-4956-42fd-8684-5ff3e09b3d89	9471d50a-f678-494d-8401-3ea6eb181c63	Best Value
9ffce15b-5a40-4e54-ad7d-64fa2efda073	d39aad8f-6dd6-4fb8-b3c0-9579dbf6cb44	Best Value
d277b384-ce4c-431d-afd0-002d518d8e57	e7598b60-e84c-43b5-b314-c301f03a2a92	Load Shedding Ready
707055e5-f08b-47e5-aa9d-a4ca27c76bfa	e7598b60-e84c-43b5-b314-c301f03a2a92	Premium
05669e3e-7cad-4ed5-9904-fd588ba06a83	a399afb3-b165-4ac5-80fe-73edc79f6cfc	Best Seller
10fd2195-2613-47f9-9c77-5f751ad7c7ac	d17b627e-c5ba-4eec-ae6c-2cfd9e984576	Premium
0685a644-c50c-4230-a9e7-143af0c8882a	3c3d8f03-7ec3-4fda-9e54-25b5e21820a7	Solar
68802a13-a910-4dea-bd12-433eeba031f8	9fa90335-467e-4906-811f-e5b55ee1769d	Best Value
3e807efc-1620-4150-8f64-495b99435c79	9fa90335-467e-4906-811f-e5b55ee1769d	Work From Home
\.


--
-- TOC entry 5337 (class 0 OID 362735)
-- Dependencies: 227
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, "productId", name, value, "priceAdjust", "stockQuantity") FROM stdin;
\.


--
-- TOC entry 5331 (class 0 OID 362675)
-- Dependencies: 221
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, "categoryId", condition, "costPrice", "sellingPrice", "originalPrice", "discountExpiresAt", "stockQuantity", "lowStockThreshold", "supplierName", sku, "isFeatured", "isActive", "isDeleted", "vendorId", "manualUrl", "additionalInfo", "averageRating", "reviewCount", "shippingDays", "createdAt", "updatedAt", "stockCpt", "stockDbn", "stockJhb", "brandId") FROM stdin;
b68f7ecc-d6aa-4634-aed9-405390ed678d	Ubiquiti Grounded Ethernet Surge Protector	ubiquiti-grounded-ethernet-surge-protector	Ubiquiti's UB-ETHSP is a Gigabit Ethernet surge protector designed to protect outdoor, PoE or non-PoE Ethernet devices from electrostatic discharge and surges.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	215	295	\N	\N	5	5	\N	UB-ETHSP	f	t	f	\N	\N	Data Line Protection: RJ45 10/100/1000\nDC Spark-Over Voltage: 90V 100V/s\nDischarge Current: 10kA+\nEthernet Ports: 2x 10/100/1000\nMaximum Impulse Spark-Over Voltage: 700V 1kV/µs\nOperating Temperature: -30°C to 65°C\nPoE Support: 802.3af & Passive PoE\n\nDimensions: 91 x 61 x 32.5mm	0	0	3	2026-06-22 00:48:17.777	2026-06-22 01:15:50.087	0	0	0	\N
4d17f9f9-b184-43d3-85e5-2cb9c324e1ca	Ubiquiti UniFi AC Mesh Outdoor Dual Band AP	ubiquiti-unifi-ac-mesh-outdoor-dual-band-ap	Ubiquiti's UAP-ACM is an outdoor, WiFi 5, dual band, 2x2 MIMO access point. It features two detachable antennas that can be exchanged for a different antenna to improve signal propagation. It is capable of reaching up to 1167Mbps aggregate over both 2.4GHz and 5GHz radios.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1595	2175	\N	\N	5	5	\N	UAP-ACM	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 2x 3dBi ; 5.8GHz 2x 4dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 300Mbps ; 5.8GHz: 867Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8.5W\nMounting: Pole-Mount or Wall-Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 70°C\nPoE Input: 802.3af/at ; 24V/48V Passive PoE\nPoE Output: None\nPower Input: 24V, 0.5A PoE Injector (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44V to 57V or 24V\nUSB Ports: None\n\nDimensions: 353 x 46 x 34.4mm\nWeight: 152g	0	0	3	2026-06-22 00:48:20.062	2026-06-22 01:15:52.208	0	0	0	\N
ff65fbe1-cb6f-47d9-be89-bb825ab095df	Ubiquiti UniFi WiFi 7 Pro XG Tri-Band Black AP	ubiquiti-unifi-wifi-7-pro-xg-tri-band-black-ap	The Ubiquiti U7-PRO-XG-B is a black, Tri-Band WiFi 7 access point engineered for high-density, large-scale deployments. Featuring 6 spatial streams and a 10Gbps Ethernet port, it utilizes the 6GHz band to provide clean, interference-free wireless performance. The AP delivers an aggregate throughput of up to 10.78Gbps across its 6GHz, 5GHz, and 2.4GHz bands (all running 2x2 MU-MIMO). This PoE+-powered device is easily configured and managed via the centralized UniFi Network Application.\n\n*Note: PoE+ injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3695	4995	\N	\N	5	5	\N	U7-PRO-XG-B	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5GHz: 5dBi; 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 4.3Gbps ; 6GHz: 5.8Gbps\nEthernet Ports: 1x 10/100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 22W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3at (PoE+)\nPoE Output: None\nPower Input: 802.3at (PoE+) (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: Ø206 x 32.5 mm\nWeight: 750g	0	0	3	2026-06-22 00:49:03.942	2026-06-22 01:16:32.429	0	0	0	\N
4f876ca5-6f70-433b-9f5d-a5687631fa2f	Ubiquiti UniFi WiFi 7 Pro Tri-Band AP 5pk	ubiquiti-unifi-wifi-7-pro-tri-band-ap-5pk	The Ubiquiti U7-PRO-5 bundle provides five high-performance U7-PRO access points in a single, convenient multi-pack. These Tri-Band WiFi 7 units feature a 2.5Gbps Ethernet port and leverage the 6GHz spectrum to deliver clean, interference-free wireless connectivity in demanding spaces. Each AP offers an aggregate throughput of up to 9.3Gbps across the 6GHz, 5GHz, and 2.4GHz bands (all running 2x2 MU-MIMO). The deployment can be centrally managed and configured using the UniFi Network Application.\n\n*Note: PoE injectors are not included in this multi-pack.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	14995	20295	\N	\N	5	5	\N	U7-PRO-5	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5.8GHz: 6dBi : 6GHz: 5.8dBi\nBeam-width: 360\nData Rate: 2.4GHz: 688Mbps; 5.8GHz: 2.8Gbps ; 6GHz: 5.7Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 21W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3at or Passive PoE\nPoE Output: None\nPower Input: 802.3at or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44 to 57V\nUSB Ports: None\n\nDimensions: Ø206 x 46 mm\nWeight: 680g	0	0	3	2026-06-22 00:49:07.614	2026-06-22 01:16:35.254	0	0	0	\N
ed9aa755-e8b8-47fb-8ccc-6d5ff252f91e	Ubiquiti UniFi WiFi 7 Outdoor Dual Band AP	ubiquiti-unifi-wifi-7-outdoor-dual-band-ap	The Ubiquiti U7-OUT is a versatile outdoor WiFi 7 access point equipped with a 2.5Gbps Ethernet port and flexible options for wall or pole mounting. A standout feature is its ability to switch via software between an internal directional antenna and the included external omni-directional antennas. The AP provides a combined data rate of up to 5Gbps across its 5GHz and 2.4GHz bands (both featuring 2x2 MU-MIMO) and integrates fully with the UniFi Network Application for easy management.\n\n*Note: A separate PoE injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3425	4650	\N	\N	5	5	\N	U7-OUT	f	t	f	\N	\N	Antenna Gain: 2.4GHz : Directional: 8 dBi, Omni: 3 dBi; 5.8GHz : Directional: 12.5 dBi, Omni: 4 dBi\nBeam-width: 2.4GHz : 90° ; 5.8GHz : 45°\nData Rate: 2.4GHz : 688Mbps; 5.8GHz : 4.3Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 19W\nMounting: Wall or Pole Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3at or Passive PoE\nPoE Output: None\nPower Input: 802.3at or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: 170 x 208 x 54.5 mm\nWeight: 1.2kg	0	0	3	2026-06-22 00:49:10.038	2026-06-22 01:16:37.123	0	0	0	\N
c9126443-03dd-4c08-87e5-770a2a8ef8c6	Ubiquiti UniFi Dual Band WiFi 7 2.5G PoE Out In-Wall AP	ubiquiti-unifi-dual-band-wifi-7-2-5g-poe-out-in-wall-ap	The Ubiquiti U7-IW is a wall-mounted, Dual-Band WiFi 7 access point featuring 4 spatial streams and a built-in 3-port 2.5Gbps Ethernet switch. To simplify your deployment, one port serves as a PoE input to power the AP, while another offers PoE pass-through output to power a downstream device. The unit delivers an aggregate throughput of up to 5Gbps across its 5GHz and 2.4GHz bands (both utilizing 2x2 MU-MIMO) and is managed via the UniFi Network Application.\n\n*Note: A separate PoE injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2595	3525	\N	\N	5	5	\N	U7-IW	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi: ; 5GHz: 8dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 4.3Gbps\nEthernet Ports: 3x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 13W\nMounting: Wall-Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3af/at (PoE+ required for PoE output)\nPoE Output: 802.3af\nPower Input: 802.3at/at\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: 137 x 98.7 x 30.2 mm\nWeight: 400g	0	0	3	2026-06-22 00:49:12.767	2026-06-22 01:16:39.882	0	0	0	\N
e8ea8885-1273-420c-a6e9-2781de479bb0	Ubiquiti UniFi M.2 SSD Tray for UCG Fiber	ubiquiti-unifi-m-2-ssd-tray-for-ucg-fiber	Ubiquiti's UACC-SDD-TRAY provides an optional storage insert for the UCG-FIBER. It houses one 2230, 2242, 2260, 2280, or 22110 M.2 NVMe SSD. The Cloud Gateway Fiber supports the M.2 NVMe with PCIe Gen 3x2 lanes. All M.2 NVMe SSDs are compatible, but will be limited to Gen 3x2 performance.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	325	450	\N	\N	5	5	\N	UACC-SSD-TRAY	f	t	f	\N	\N	Material: Aluminium alloy, polycarbonate, stainless steel\n\nDimensions: 123.4 x 31.1 x 11.2 mm\nWeight: 53g	0	0	3	2026-06-22 00:48:27.142	2026-06-22 01:16:00.413	0	0	0	\N
04eac9ac-20cf-4ef7-b9dc-d0cd91543303	Ubiquiti Single Mode 1.25G LC Bi-Directional SFP 3km	ubiquiti-single-mode-1-25g-lc-bi-directional-sfp-3km	Ubiquiti's UACC-SM1GS is ideal for long-distance, bi-directional, single-mode connections. It can deliver up to 1.25Gbps speeds at distances of up to 3km.\n\nThese SFP modules make use of Wavelength-Division Multiplexing (WDM). This means it uses two different light wavelengths to transmit data in both directions at once, resulting in fewer fibre cables required to run. It also aids in maximising the use of existing infrastructure and simplifying installations.\n\n*Note: The price reflected is for a pair (one box of 2 units). This product is only sold as a pair and no single units are available.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	425	575	\N	\N	5	5	\N	UACC-SM1GS	f	t	f	\N	\N	Connector: 1x LC\nData Rate: 1.25Gbps\nForm Factor: SFP (BiDi)\nMode: Single Mode\nSupported Distance: 3km\nWavelength: 1310nm / 1550nm	0	0	3	2026-06-22 00:48:28.178	2026-06-22 01:16:01.452	0	0	0	\N
c13e08fb-31cf-4775-a57c-c3e71049c554	Ubiquiti UniFi6 Mesh Pro Indoor / Outdoor WiFi 6 AP	ubiquiti-unifi6-mesh-pro-indoor-outdoor-wifi-6-ap	Designed for versatile indoor and outdoor deployments, the Ubiquiti U6-MESH-PRO is a dual-band WiFi 6 (802.11ax) mesh access point featuring 4 spatial streams and dual Gigabit Ethernet ports. It comes equipped with integrated, high-power 8dBi antennas to maximize range, delivering a combined data rate of up to 3Gbps across its 5GHz ($2\\times2$ MU-MIMO) and 2.4GHz ($2\\times2$ MU-MIMO) bands. The device is fully configured and managed using the centralized UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3495	4775	\N	\N	5	5	\N	U6-MESH-PRO	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 8dBi ; 5.8GHz: 8dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps ; 5.8GHz: 2400Mbps\nEthernet Ports: 2x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 9W\nMounting: Desktop ; Wall-Mount ; Pole Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3af/at PoE\nPoE Output: None\nPower Input: 48V; 0.5A PoE Injector (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5V-57V\nUSB Ports: None\n\nDimensions: 343.2 x 181.2 x 60.2 mm\nWeight: 819g	0	0	3	2026-06-22 00:49:15.002	2026-06-22 01:16:41.739	0	0	0	\N
ff9e2ebb-8e4b-49c5-8897-002ffb7f9856	Linkbasic EZ Combo RJ45 Crimp Tool	linkbasic-ez-combo-rj45-crimp-tool	Built for durability, the Linkbasic TOOL-EZCRIMP is a robust, all-in-one solution that combines a crimper, stripper, and side cutter. It seamlessly supports both standard RJ45/RJ11 connectors and the specialized EZ Crimp pass-through modular plugs. With the EZ range, you can easily push all eight UTP wire strands through the plug, allowing the tool to crimp the connector and cleanly shear away excess copper in a single, efficient motion.\n\nPlease note: EZ RJ45 connectors are sold separately.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	175	245	\N	\N	5	5	\N	TOOL-EZCRIMP	f	t	f	\N	\N	Compatibility: RJ45-EZ & RJ45-CAT6EZ\nFunctions: Crimper & Stripper\nMaterial: Carbon Steel	0	0	3	2026-06-22 01:16:55.787	2026-06-22 01:16:55.787	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
abc6b064-faa2-4c1a-b4d9-f5be7c03dda4	Linkbasic UTP Combo Crimp Tool RJ11/RJ12/RJ45	linkbasic-utp-combo-crimp-tool-rj11-rj12-rj45	Built for precision and durability, the Linkbasic UTP Ratchet Crimp tool is an all-in-one solution for cutting, stripping, and crimping UTP modular cables and RJ45 connectors. Its heavy-duty, parallel-action design ensures the die and plug remain perfectly aligned, delivering a flawless crimp every time	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	125	175	\N	\N	5	5	\N	TOOL-CRIMP	f	t	f	\N	\N	Compatibility: RJ45 & RJ11\nFunctions: Crimper & Stripper\nMaterial: Carbon Steel	0	0	3	2026-06-22 01:16:56.702	2026-06-22 01:16:56.702	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
6084a247-ad22-4d53-9f7d-3a094603f335	Linkbasic 50m Shielded UV Protected Cat5e Flylead	linkbasic-50m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY50 is a 50-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for long distance runs, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	650	875	\N	\N	5	5	\N	TC-FLY50	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 50m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:16:58.728	2026-06-22 01:16:58.728	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
99813073-65e9-4935-814d-c19c537151cb	Linkbasic 30m Shielded UV Protected Cat5e Flylead	linkbasic-30m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY30 is a 30-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for long-distance runs, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	425	575	\N	\N	5	5	\N	TC-FLY30	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 30m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:16:59.705	2026-06-22 01:16:59.705	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
7795d7b4-33ec-4544-9fa0-e916080ad1f5	Linkbasic 20m Shielded UV Protected Cat5e Flylead	linkbasic-20m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY20 is a 20-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for outdoor runs, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	295	395	\N	\N	5	5	\N	TC-FLY20	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 20m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:00.675	2026-06-22 01:17:00.675	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
a4756238-0f56-45cd-b1ed-d8d4b60e27db	Ubiquiti Long Range PoE Repeater and Surge Protector	ubiquiti-long-range-poe-repeater-and-surge-protector	Ubiquiti's UACC-LRE is an outdoor Gigabit Ethernet adapter which establishes long-range connections between PoE switches and devices. The unit features 2x Gigabit Ethernet ports. Port one receives 802.3af/at PoE input while port two provides PoE passthrough for distances up to 1km when making use of multiple adapters. The unit also offers 10kA+ surge protection and works reliably in extreme temperatures to protect your deployment from weather and electrical damage.\n\n*Note: This device does not support MTU's larger than 1500. If making use of jumbo frames across the device, it will not work.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	525	715	\N	\N	5	5	\N	UACC-LRE	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nHardware Button: None\nMax. Power Consumption: 1.5W\nMounting: Pole-Mount\nOperating System: None\nOperating Temperature: -40°C to 80°C\nPoE Input: 802.3af/at\nPoE Output: 802.3af PoE Passthrough\nPower Input: 802.3af/at\nSFP Ports: None\nSupported Voltage Range: 37-57V\n\nDimensions: 196.5 x 93.5 x 39 mm\nWeight: 350g	0	0	3	2026-06-22 00:48:37.8	2026-06-22 01:16:09.565	0	0	0	\N
4d06efef-7a1a-426d-9118-d39a367c79f9	Ubiquiti UniFi Access Ultra Reader and Hub	ubiquiti-unifi-access-ultra-reader-and-hub	Ubiquiti's UA-Ultra is an IP55 tamper resistant access reader with an integrated hub for complete single door access control. The unit is powered by PoE+ and features 1x Lock terminal (12V/1A), 1x Exit request input and can be unlocked using an NFC card or UniFi Identity Mobile App.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1695	2295	\N	\N	5	5	\N	UA-ULTRA	f	t	f	\N	\N	Button: Reset\nBluetooth: BLE 4.2\nDigital Input: 1x Exit Request\nEthernet Ports: 1x 10/100\nLock Terminals: 1x 12V 1A\nMounting: Wall-Mount or Gang Box Mount\nOperating Tempreture: -30 to 40° C\nMax Power Consumption: 18W\nPower Input: 802.3af/at PoE (Not Included)\n\nDimensions: 126 x 45 x 37.45mm\nWeight: 140g	0	0	3	2026-06-22 00:48:46.618	2026-06-22 01:16:16.562	0	0	0	\N
3619c0f6-a80f-44ed-a4ac-60c58fa583ab	EGA Trunking 25mm x 16mm	ega-trunking-25mm-x-16mm	Scoop's YT2 EGA Trunking is 25mm x 16mm and available in 3 metre lengths.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	35	50	\N	\N	5	5	\N	YT2	f	t	f	\N	\N	SKU\tYT2\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tColour: White\nLength: 3m\nMaterial: PVC\n\nDimensions: 3000 x 25 x 16mm (L x W x H)	0	0	3	2026-06-21 22:33:05.935	2026-06-22 01:13:21.175	0	0	0	\N
3fa13c7e-4b28-4533-b5d2-d8d7058f4bd4	5M SMA Male to SMA Male Cable	5m-sma-male-to-sma-male-cable	Scoop's 5m SMA male to SMA male cable can be used to connect your LTE card or ltAP mini to our LTE Antenna from MikroTik (ANT-MLTE). The 5m cable can also be used for a number of other RF applications.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	195	275	\N	\N	5	5	\N	WL-SMAM-5	f	t	f	\N	\N	More Information\nSKU\tWL-SMAM-5\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tN/A	0	0	3	2026-06-21 22:33:05.963	2026-06-22 01:13:24.083	0	0	0	\N
f41b4b16-a8df-483b-a706-56b0e5ba3e90	1M SMA Male to SMA Male Cable	1m-sma-male-to-sma-male-cable	Scoops 1m SMA male to SMA male cable can be used to connect your LTE card or ltAP mini to our LTE Antenna from MikroTik (ANT-MLTE). The 1m cable can also be used for a number of other RF applications.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	100	145	\N	\N	5	5	\N	WL-SMAM-1	f	t	f	\N	\N	More Information\nSKU\tWL-SMAM-1\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tN/A	0	0	3	2026-06-21 22:33:05.97	2026-06-22 01:13:25.046	0	0	0	\N
f036e929-9944-460b-9d1e-bf43cd3555bc	1M SMA R/P to N-Type Male LMR Cable	1m-sma-r-p-to-n-type-male-lmr-cable	Scoop's WL-SMA-1, 1 metre SMA Reverse Polarity, N-Type Cable is high quality and fully tested.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	115	175	\N	\N	5	5	\N	WL-SMA-1	f	t	f	\N	\N	More Information\nSKU\tWL-SMA-1\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tRP-SMA Male\nHigh performance CLF200 low loss cable\nHexagon N-Type Male\nLength: 1 Metre	0	0	3	2026-06-21 22:33:05.979	2026-06-22 01:13:26.09	0	0	0	\N
b3808e7d-975f-4f01-b16d-c255d637ebb3	0.5M SMA R/P to N-Type Male LMR Cable	0-5m-sma-r-p-to-n-type-male-lmr-cable	Scoop's 0,5 metre SMA Reverse Polarity, N-Type Cable is high quality and fully tested.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	115	160	\N	\N	5	5	\N	WL-SMA-0.5	f	t	f	\N	\N	SKU\tWL-SMA-0.5\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tN/A	0	0	3	2026-06-21 22:33:05.987	2026-06-22 01:13:27.079	0	0	0	\N
793ca0a4-f642-4553-b330-05e32882d1fa	Ubiquiti UISP WaveFiber SC/APC 2.5Gbps Ethernet ONU	ubiquiti-uisp-wavefiber-sc-apc-2-5gbps-ethernet-onu	Ubiquiti's WAVE-ONU is a GPON optical network unit with 1x SC/APC port and a 2.5Gbps Ethernet port which takes 24V PoE Input. The unit delivers 1.2Gbps uplink and 2.5Gbps downlink at distances up to 20 km.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	850	1150	\N	\N	5	5	\N	WAVE-ONU	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 5W\nMounting: Desktop or Wall Mount\nOperating System: UFiber\nOperating Temperature: -15°C to 45°C\nPoE Input: 24V Passive PoE\nPoE Output: None\nPower Input: 24V 0.5A PoE Adapter (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 20-28V\nUSB Ports: None\nOther: 1x SC/APC GPON WAN port\n\nDimensions: 76.5 x 76.5 x 26.4 mm\nWeight: 78g	0	0	3	2026-06-21 22:33:06.028	2026-06-22 01:13:29.853	0	0	0	\N
b3330714-b6fe-4e93-adfb-14e76a23817d	EGA Trunking 40mm x 40mm	ega-trunking-40mm-x-40mm	Scoop's YT5 EGA Trunking is 40mm x 40mm and available in 3 metre lengths.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	75	115	\N	\N	5	5	\N	YT5	f	t	f	\N	\N	More Information\nSKU\tYT5\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tColour: White\nLength: 3m\nMaterial: PVC\n\nDimensions: 3000 x 40 x 40mm (L x W x H)	0	0	3	2026-06-21 22:33:05.918	2026-06-22 01:13:19.188	0	0	0	\N
40201437-724e-4c3e-b831-59f5359fcd29	EGA Trunking 16mm x 16mm	ega-trunking-16mm-x-16mm	Scoop's YT1 EGA Trunking is 16mm x 16mm and available in 2 metre lengths.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	17	25	\N	\N	5	5	\N	YT1	f	t	f	\N	\N	More Information\nSKU\tYT1\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tColour: White\nLength: 2m\nMaterial: PVC\n\nDimensions: 2000 x 16 x x16mm (L x W x H)	0	0	3	2026-06-21 22:33:05.944	2026-06-22 01:13:22.053	0	0	0	\N
ed5145c3-4106-477d-b7ff-c33343a8872d	EGA Trunking 40mm x 25mm	ega-trunking-40mm-x-25mm	Scoop's YT4 EGA Trunking is 40mm x 25mm and available in 3 metre lengths.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	50	70	\N	\N	5	5	\N	YT4	f	t	f	\N	\N	More Information\nSKU\tYT4\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tColour: White\nLength: 3m\nMaterial: PVC\n\nDimensions: 3000 x 40 x 25mm (L x W x H)	0	0	3	2026-06-21 22:33:05.928	2026-06-22 01:13:20.328	0	0	0	\N
f7f8d360-529a-4ffb-a03e-831fcd44ad98	7M SMA Male to SMA Male Cable	7m-sma-male-to-sma-male-cable	Scoop's 7m SMA male to SMA male cable can be used to connect your LTE card or ltAP mini to our LTE Antenna from MikroTik (ANT-MLTE). The 7m cable can also be used for a number of other RF applications.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	225	315	\N	\N	5	5	\N	WL-SMAM-7	f	t	f	\N	\N	More Information\nSKU\tWL-SMAM-7\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tN/A	0	0	3	2026-06-21 22:33:05.952	2026-06-22 01:13:23.126	0	0	0	\N
946998c3-9186-4a38-a117-3d379008ad2a	50mm Aluminium Pole / Mast 3M	50mm-aluminium-pole-mast-3m	Scoop's TUB-AU3 is a lightweight, high-durability aluminum utility pole measuring 3 meters in length. It features a 50mm diameter combined with a robust 5mm wall thickness, making it an excellent choice for a strong, naturally corrosion-resistant outdoor equipment mount.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	750	1025	\N	\N	5	5	\N	TUB-AU3	f	t	f	\N	\N	Diameter: 50mm\nLength: 3m\nAluminium Thickness: 5mm	0	0	3	2026-06-22 01:16:48.831	2026-06-22 01:16:48.831	0	0	0	\N
d02f56b1-0756-4ded-9308-bb3c7eb09088	Ubiquiti UISP 60GHz/5GHz 90° PtMP Wave Access Point Gen2	ubiquiti-uisp-60ghz-5ghz-90-ptmp-wave-access-point-gen2	Ubiquiti's WAVE-APG2 is a UISP 60GHz Point-to-MultiPoint 90° Access Point featuring 5GHz failover, 1x 10Gbps SFP+ Port, 1x 2.5Gbps Ethernet Port and an integrated GPS antenna. Utilising 60GHz point-to-multipoint technology, it can connect up to 31 stations with a total throughput of 5.4Gbps at distances of up to 6 km with a WAVE-PRO or WAVE-LR, up to 4 km with a WAVE-NANO, and 0.9km with a WAVE-PICO. The dedicated Bluetooth radio allows for easy setup via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	10595	14350	\N	\N	5	5	\N	WAVE-APG2	f	t	f	\N	\N	Antenna Gain: 60GHz: 20dBi ; 5GHz: 13dBi\nBeamwidth: 60GHz/5GHz: 90°\nData Rate: 60GHz: Up to 5.4Gbps ; 5GHz: 1200Mbps\nEthernet Ports: 1x 2.5Gbps\nHardware Button: Reset\nMax. Power Consumption: 24W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 24V or 48V Passive PoE\nPoE Output: None\nPower Input: 48V 0.65A 2.5GbE PoE Injector (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44–54V or 22–27V\nUSB Ports: None\nOther: 1x SFP+\n\nDimensions: 158.3 x 286.8 x 100.2 mm\nWeight: 1.5kg	0	0	3	2026-06-21 22:33:06.079	2026-06-22 01:13:35.899	0	0	0	\N
7c9b1214-1daa-45c7-9411-73e34f897c19	Ubiquiti UniFi Protect G6 Pro Bullet 8MP Black IP Camera	ubiquiti-unifi-protect-g6-pro-bullet-8mp-black-ip-camera	Ubiquiti UVC-G6BPRO-B is a black 8MP camera with a Multi-TOPS AI engine, 2.36x optical zoom, and a large 1/1.2" CMOS sensor for exceptional low-light clarity and long-range IR night vision up to 40 metres.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8995	12175	\N	\N	5	5	\N	UVC-G6BPRO-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nLens: F 5.9-13.8 mm; ƒ/1.5-ƒ/2.9\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Two-Way Audio\nMax Power Consumption: 15W\nMounting: Wall, Ceiling, Pole mount (Included)\nNight Mode: Up to 40m\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3at\nPower Input: 802.3at\nResolution: 8MP 3840 x 2160 (16:9)\nSensor: 1/1.2" 8MP\nVideo Compression: H.264, MJPG\n\nDimensions: Ø85.8 x 210 mm\nWeight: 980g	0	0	3	2026-06-22 00:45:50.449	2026-06-22 01:13:45.702	0	0	0	\N
ab0470a4-523f-4ca0-90b9-e549c7ab67bb	Ubiquiti UniFi Protect G6 Bullet 8MP White IP Camera	ubiquiti-unifi-protect-g6-bullet-8mp-white-ip-camera	Ubiquiti's UVC-G6B-W features an all-weather design with an 8MP image, Multi-TOPS AI Engine, and long-range IR night vision up to 30M. This white camera has a built-in microphone and an adjustable 3-axis mount for easy mounting options.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3795	5150	\N	\N	5	5	\N	UVC-G6B-W	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 9.9W\nMounting: Wall, ceiling, pole mount (Included)\nNight Mode: Built-in IR LED illumination and IR cut filter up to 30m\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 3840 x 2160 (16:9)\nSensor: 1/1.8” 8MP\nVideo Compression: H.264; MJPEG\n\nDimensions: : Ø82 x 153 mm\nWeight: 737g	0	0	3	2026-06-22 00:45:51.52	2026-06-22 01:13:46.686	0	0	0	\N
c22b1a66-dcea-44ef-b8d1-75c3c97798e6	Ubiquiti UniFi Protect G6 Bullet 8MP Black IP Camera	ubiquiti-unifi-protect-g6-bullet-8mp-black-ip-camera	Ubiquiti's UVC-G6B-B features an all-weather design with an 8MP image, Multi-TOPS AI Engine, and long-range IR night vision up to 30M. This camera has a built-in microphone and an adjustable 3-axis mount for easy mounting options.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3795	5150	\N	\N	5	5	\N	UVC-G6B-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 9.9W\nMounting: Wall, ceiling, pole mount (Included)\nNight Mode: Built-in IR LED illumination and IR cut filter up to 30m\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 3840 x 2160 (16:9)\nSensor: 1/1.8” 8MP\nVideo Compression: H.264; MJPEG\n\nDimensions: : Ø82 x 153 mm\nWeight: 737g	0	0	3	2026-06-22 00:45:52.486	2026-06-22 01:13:47.741	0	0	0	\N
bb042a39-55b5-4878-aeaf-edfc4feea0b2	Half Moon Trunking 70mm x 10mm	half-moon-trunking-70mm-x-10mm	Scoop's YT7 Half Moon Trunking is a 70mm x 10mm available in 2 metre lengths.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	195	275	\N	\N	5	5	\N	YT7	f	t	f	\N	\N	More Information\nSKU\tYT7\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tColour: Grey\nLength: 2m\nMaterial: PVC\n\nDimensions: 2000 x 70 x 10 mm (L x W x H)	0	0	3	2026-06-21 22:33:05.905	2026-06-22 01:13:18.078	0	0	0	\N
f319b1bf-aa36-4cac-b96d-540811bf98c3	Ubiquiti UISP Wave AP Micro Mount	ubiquiti-uisp-wave-ap-micro-mount	Ubiquiti WAVE-MM is a corrosion-resistant pole mount which supports up to four WAVE-APM providing full 360° coverage.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1875	2550	\N	\N	5	5	\N	WAVE-MM	t	t	f	\N	\N	Pole Diameter: Ø25 - 76 mm (Ø1 - 3")\nWind Survivability: 200 km/h\nWind Loading: 100.9 N at 200 km/h\n\nDimensions: 175 x 148 x 133.5 mm\nWeight: 1.4 kg	0	0	3	2026-06-21 22:33:06.045	2026-06-22 01:13:31.78	0	0	0	\N
2f033d2a-8719-40ef-a9a6-34841557ef68	Ubiquiti UniFi Protect Dual Camera G6 Entry Black	ubiquiti-unifi-protect-dual-camera-g6-entry-black	Ubiquiti's UVC-G6-ENTRY is an intelligent door entry system with native UniFi Protect and UniFi Access integration. It is prioritised for full person visibility for accurate face identification and is equipped with a secondary package camera. With PoE input, the unit connects to a UniFi Access Hub and can be unlocked using an NFC card or UniFi Identity Mobile App.\n\nNote: This device needs to be paired with a UniFi Access Hub.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4595	6225	\N	\N	5	5	\N	UVC-G6-ENTRY	f	t	f	\N	\N	Specifications\tConnectivity: BLE 4.1 and NFC\nEthernet Ports: 1x 10/100/1000\nMax Frame Rate: Main camera: 30 FPS; Package camera: 3 FPS\nHardware Button: Reset\nLens: Fixed focal length\nMicrophone: Two-Way Audio\nMax Power Consumption: 16W\nMounting: Surface Mount (Included)\nNight Mode: Built-in IR LED illumination and IR cut filter\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3at\nPower Input: 802.3at\nResolution: Main camera: 5MP, 1920 x 2560 (3:4) ; Package camera: 8MP 3264 x 2448 (4:3)\nSensor: Main camera: 5MP CMOS ; Package camera: 8MP CMOS\nVideo Compression: H.264, MJPG\n\nDimensions: 176 x 45 x 29.6 mm\nWeight: 275g	0	0	3	2026-06-22 00:45:54.63	2026-06-22 01:13:50.225	0	0	0	\N
428ba69e-f8b9-4f37-8690-224a49e3f8a0	Ubiquiti UISP Power TransPort Cable 20M	ubiquiti-uisp-power-transport-cable-20m	Ubiquiti's UACC-TPC-20M is a 20m UISP Power Transport Cable for use between the UISP-BOX and the included power supply of the UISP-R or UISP-S.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1395	1885	\N	\N	5	5	\N	UACC-TPC-20M	f	t	f	\N	\N	Connector: Power TransPort\nFlame rating: VW-1\nConductor wire gauge: 12 AWG\nConductor type: Tin stranded copper\nJacket material: Thermoplastic elastomer\nJacket diameter: 11 x 6.5 mm\nOperating temperature: -40 to 80°C\nCable Length: 20m	0	0	3	2026-06-22 00:48:24.897	2026-06-22 01:15:58.387	0	0	0	\N
0e098af3-771d-4d34-abf5-6af71c78a693	38mm Aluminium Pole / Mast 2M	38mm-aluminium-pole-mast-2m	Scoop's TUB-AU is a lightweight, 2-meter aluminum utility pole featuring a 38mm diameter. It provides a naturally rust-resistant and durable mounting solution ideal for securing smaller outdoor wireless equipment, antennas, or cameras.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	175	250	\N	\N	5	5	\N	TUB-AU	f	t	f	\N	\N	Diameter: 38mm\nLength: 2m\nAluminium Thickness: 2mm	0	0	3	2026-06-22 01:16:49.692	2026-06-22 01:16:49.692	0	0	0	\N
df8218af-bc92-4c23-bef1-51aebd1e3d3c	DC Terminal to 2.1mm Jack Adapter	dc-terminal-to-2-1mm-jack-adapter	Scoop’s TERM-JACK is a DC terminal block to 2.1mm barrel jack adapter, designed to easily bridge a raw-wire power supply or battery pack to a standard DC input.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5	6.75	\N	\N	5	5	\N	TERM-JACK	f	t	f	\N	\N	DC Connector: 2.1mm Jack\nMarkings: Positive & Negative\nTerminal Connector: Screw Terminal Block	0	0	3	2026-06-22 01:16:57.677	2026-06-22 01:16:57.677	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
942c7c43-0c55-4cd8-84d5-e761a834d612	Ubiquiti UniFi Express WiFi 7 Tri-Band 10Gbps Cloud Gateway	ubiquiti-unifi-express-wifi-7-tri-band-10gbps-cloud-gateway	Ubiquiti's UX7 is a compact UniFi Cloud Gateway with an integrated WiFi 7 tri-band access point that runs UniFi Network. The integrated WiFi 7 access point delivers an aggregate data rate of 10Gbps over its 6GHz (2x2 MU-MIMO), 5GHz (2x2 MU-MIMO) and 2.4GHz (2x2 MU-MIMO) bands. It features an LCM (Liquid Crystal Monitor) colour screen to display key system and connection information.\n\nThe UX is configured and managed with the pre-installed UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3425	4650	\N	\N	5	5	\N	UX7	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi ; 5.8GHz: 7dBi ; 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps ; 5.8GHz: 4.3Gbps; 6GHz: 5.7Gbps\nEthernet Ports: 1x 10/100/1000/10000 (WAN); 1x 10/100/1000/2500 (LAN)\nHardware Button: Reset\nMax. Power Consumption: 22W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: USB Type C (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 5V 5A\nUSB Ports: USB Type C (Powering device only)\n\nDimensions: 117 x 117 x 42.5 mm\nWeight: 422 g	0	0	3	2026-06-22 00:45:38.829	2026-06-22 01:13:37.822	0	0	0	\N
ce5cc491-6943-46eb-81a9-9883de34389a	Ubiquiti UniFi Protect G6 Turret White 8MP IP Camera	ubiquiti-unifi-protect-g6-turret-white-8mp-ip-camera	Ubiquiti's UVC-G6T-W is an IP66, IK04 tamper-resistant, 8MP PoE camera with Multi-TOPS AI Engine, and 3-axis manual adjustment for flexible installation. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance up to 30 metres.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3795	5150	\N	\N	5	5	\N	UVC-G6T-W	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 12.5W\nMounting: Wall or Pole-Mount\nNight Mode: IR LED illumination and IR cut filter\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 3864 x 2160 (16:9)\nSensor: 1/1.8" 8MP\nVideo Compression: H.264 ; MJPEG\n\nDimensions: : Ø100 x 95 mm\nWeight: 550g	0	0	3	2026-06-22 00:45:40.016	2026-06-22 01:13:38.793	0	0	0	\N
dd7974c3-23c5-433d-90f6-e99b4182e70f	Ubiquiti UniFi Protect G6 PTZ 8MP White IP Camera	ubiquiti-unifi-protect-g6-ptz-8mp-white-ip-camera	Ubiquiti's UVC-G6PTZ-W is an IP66, 8MP, 4K PoE+ (802.3at 30W) white camera with 5x Optical and 2x digital zoom, Multi-TOPS AI Engine, IR night vision up to 30 metres and enhanced AI detection capabilities such as face recognition, license plate recognition and smart detections (People, Vehicles, Animals). This white camera has a built-in two-way microphone and multiple mounting options.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	7595	10275	\N	\N	5	5	\N	UVC-G6PTZ-W	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: 5x Optical , 2x Digital Zoom\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Two-Way Audio\nMax Power Consumption: 24.5W\nMounting: Wall, Surface, Ceiling, Pole mount (Included)\nNight Mode: Up to 30m\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3at\nPower Input: 802.3at\nResolution: 8MP 3840 x 2160 (16:9)\nSensor: 1/1.8" 8MP\nVideo Compression: H.264, MJPG\n\nDimensions: Ø107.2 x 111 x 230.2 mm\nWeight: 1.1kg	0	0	3	2026-06-22 00:45:43.665	2026-06-22 01:13:40.63	0	0	0	\N
6656a49d-05cb-4875-bd44-177c3be28e05	Ubiquiti UniFi Protect G6 Instant 8MP White WiFi 5 IP Camera	ubiquiti-unifi-protect-g6-instant-8mp-white-wifi-5-ip-camera	Ubiquiti's UVC-G6INS is a compact IPX5 rated, white, 8MP wide-angle WiFi 5 IP Camera with two-way audio and Multi-TOPS AI Engine. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance up to 6m.\n\nIt can be configured and managed using the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3395	4595	\N	\N	5	5	\N	UVC-G6INS-W	f	t	f	\N	\N	Specifications\tEthernet Ports: None\nHardware Button: Reset\nLens: Fixed focal length\nMax Frame Rate: 30 FPS (Resolution Dependant)\nMicrophone: Yes\nMax. Power Consumption: 7W\nMounting: Wall Mount\nNight Mode: Built-in IR LED illumination and IR cut filter\nOperating Temperature: -20°C to 40°C\nPoE Input: None\nPower Input: 5V, 2A USB Adapter (Included) or POE-USBC (Not Included)\nResolution: 3840 x 2160 (16:9)\nSensor: 1/1.8” 8MP\nVideo Compression: H.264/MJPEG\n\nDimensions: 81.7 x 50.1 x 57.2 mm\nWeight: 180g	0	0	3	2026-06-22 00:45:45.784	2026-06-22 01:13:42.728	0	0	0	\N
67e72262-4099-4c4c-bd02-15bc103f39e1	Ubiquiti UniFi Protect G6 Dome 8MP Black IP Camera	ubiquiti-unifi-protect-g6-dome-8mp-black-ip-camera	Ubiquiti's UVC-G6D-B black dome IP camera features an 8MP image sensor with an ultra-wide viewing angle, Multi-TOPS AI Engine and long-range IR night vision up to 30m. It is both IP66 rated as well as IK10 vandal-resistant with a built-in microphone.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5375	6180	\N	\N	5	5	\N	UVC-G6D-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependant)\nMicrophone: Yes\nMax. Power Consumption: 9.25W\nMounting: Wall or Ceiling Mount\nNight Mode: IR LEDs with Mechanical IR Cut Filter\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3af/at PoE\nPower Input: 802.3af/at PoE\nResolution: 3840 x 2160 (16:9)\nSensor: 1/1.8" 8MP\nVideo Compression: H.264; MJPEG\n\nDimensions: Ø144.7x 96.3 mm\nWeight: 820g	0	0	3	2026-06-22 00:45:47.845	2026-06-22 01:13:43.751	0	0	0	\N
43254a07-1a21-4484-bce8-429ac4f339ca	Ubiquiti UniFi Protect G5 PTZ 4MP White IP Camera	ubiquiti-unifi-protect-g5-ptz-4mp-white-ip-camera	Ubiquiti's UVC-G5PTZ-W features a 4MP image with a built-in microphone, 2x optical zoom and AI smart detection. It is also IP66 rated with both wall and pole-mount options for both indoor and outdoor installations. The camera has built-in IR & white LED illumination with IR cut filter.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5395	7295	\N	\N	5	5	\N	UVC-G5PTZ-W	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: F 3.42–6.85 mm; ƒ/1.85–ƒ/2.4\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 14W\nMounting: Wall or Pole-Mount\nNight Mode: IR LED illumination and IR cut filter (20m)\nOperating Temperature: -30°C to 45°C\nPoE Input: 802.3af/at PoE\nPower Input: 37-57V PoE\nResolution: 4MP 2688 x 1512 (16:9)\nSensor: 5MP 1/2.7" CMOS\nVideo Compression: H.264; MJPEG\n\nDimensions: 90 x 94 x 179.5 mm\nWeight: 650g	0	0	3	2026-06-22 00:45:58.41	2026-06-22 01:13:53.067	0	0	0	\N
5a07d156-74ca-4d10-952d-005fadd42cb5	Ubiquiti UniFi Protect G5 Pro 8MP IP Camera	ubiquiti-unifi-protect-g5-pro-8mp-ip-camera	Ubiquiti's UVC-G5PRO features an 8MP image with a built-in microphone, 3x optical zoom and AI event detection. It is also IP65 rated with a versatile 3-axis mount for both indoor and outdoor installations. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance up to 25 metres.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5995	8125	\N	\N	5	5	\N	UVC-G5PRO	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 10W\nMounting: Wall/Pole\nNight Mode: IR LED illumination and IR cut filter\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 3840 x 2160 (16:9)\nSensor: 1/2" 8MP\nVideo Compression: H.264 ; MJPEG\n\nDimensions: Ø86 x 153.8 mm\nWeight: 670g	0	0	3	2026-06-22 00:46:00.409	2026-06-22 01:13:54.737	0	0	0	\N
b6675315-0c88-4386-84a5-c33acf287ff6	Ubiquiti UniFi Protect G5 Bullet 4MP IP Camera 3pk	ubiquiti-unifi-protect-g5-bullet-4mp-ip-camera-3pk	Ubiquiti's UVC-G5B-3 offers 3x UVC-G5B in a single package. The units feature a 4MP image with a built-in microphone and a versatile 3-axis mount that enables quick and easy adjustment for both indoor and outdoor mounting. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance up to 10 metres.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6995	9475	\N	\N	5	5	\N	UVC-G5B-3	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 4W\nMounting: Wall/Pole\nNight Mode: IR LED illumination and IR cut filter\nOperating Temperature: -20°C to 40°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 2688 x 1512 (16:9)\nSensor: 5MP CMOS Sensor\nVideo Compression: H.264 ; MJPEG\n\nDimensions: : Ø75.5 x 150 mm\nWeight: 315g	0	0	3	2026-06-22 00:46:01.561	2026-06-22 01:13:55.795	0	0	0	\N
894d53b8-f3f7-4534-9772-2fd044baa90b	Ubiquiti UniFi Protect G4 Instant 4MP WiFi IP Camera	ubiquiti-unifi-protect-g4-instant-4mp-wifi-ip-camera	Ubiquiti's UVC-G4INS is a compact, wide-angle, 5MP image, weather-resistant WiFi IP Camera with two-way audio. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance.\n\nIt can be configured and managed using the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2125	2875	\N	\N	5	5	\N	UVC-G4INS	f	t	f	\N	\N	Ethernet Ports: None\nHardware Button: Reset\nLens: Fixed focal length EFL 2.8 mm, f/1.6\nMax Frame Rate: 30 FPS (Resolution Dependant)\nMicrophone: Yes\nMax. Power Consumption: 6W\nMounting: Wall Mount\nNight Mode: Built-in IR LED illumination and IR cut filter\nOperating Temperature: -20°C to 40°C\nPoE Input: None\nPower Input: 5V, 2A USB Adapter (Included)\nResolution: 2688 x 1512 (16:9)\nSensor: 5 MP CMOS Sensor\nVideo Compression: H.264/MJPEG\n\nDimensions: 81.6 x 50 x 47.2 mm\nWeight: 163g	0	0	3	2026-06-22 00:46:03.926	2026-06-22 01:13:57.561	0	0	0	\N
f6109600-3cb9-4ecc-8166-4732d1c4fa75	Ubiquiti UniFi Protect Doorbell Lite 5MP Black	ubiquiti-unifi-protect-doorbell-lite-5mp-black	Ubiquiti's UVC-DBLITE-B is a Black 5MP video doorbell that integrates with UniFi Protect. It features two-way audio, IR night vision up to 5 metres, and is powered by 802.3af PoE.\n\nIt can be configured and managed using the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	UVC-DBLITE-B	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed focal length\nMax Frame Rate: 24 FPS (Resolution Dependent)\nMicrophone: Two-Way Audio\nMax Power Consumption: 8W\nMounting: Wall, 20° wedge (Included)\nNight Mode: Up to 5m\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af\nPower Input: 802.3af\nResolution: 5MP 1920 x 2560 (3:4)\nSensor: 1/2.7" 5MP\nVideo Compression: H.264, MJPG\n\nDimensions: 137 x 40 x 26.4 mm\nWeight: 142g	0	0	3	2026-06-22 00:46:06.38	2026-06-22 01:13:59.416	0	0	0	\N
acf801c0-9c01-455a-8c8a-b376a0994f77	Linkbasic 305m Box Cat5e Stranded Grey UTP Cable	linkbasic-305m-box-cat5e-stranded-grey-utp-cable	Linkbasic's 305m Cat5e Flexible Cable.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2695	3650	\N	\N	5	5	\N	UTP-F	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP - Stranded Bare Copper\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:07.443	2026-06-22 01:14:00.401	0	0	0	\N
625f35eb-3219-423a-903f-22bd84c664a1	Scoop 500m Drum Cat6 CCA Grey UTP Cable	scoop-500m-drum-cat6-cca-grey-utp-cable	Scoop's UTP-6500C is a 500m Cat6 CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat6 cable includes a PVC outer sheath, an AWG rating of 23 and is supplied in a 500m drum.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1225	1650	\N	\N	5	5	\N	UTP-6500C	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 500m\nColour: Grey\nConductor Dimensions: 0.56mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 330 x 330 x 300mm	0	0	3	2026-06-22 00:46:08.636	2026-06-22 01:14:01.461	0	0	0	\N
fcf4e53b-800e-4fb4-aea1-4b6cc98f40cb	Linkbasic 500m Drum Cat6 Solid Grey UTP Cable	linkbasic-500m-drum-cat6-solid-grey-utp-cable	Linkbasic's UTP-6500 is a 4 pair solid copper Category 6 500m Grey Ethernet Cable supplied on a 500m drum.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4295	5825	\N	\N	5	5	\N	UTP-6500	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 500m\nColour: Grey\nConductor Dimensions: 0.565mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:09.937	2026-06-22 01:14:02.34	0	0	0	\N
68a77d74-4a3a-40cb-8f97-19f9b68c67d7	Cable Ties T50I 300 x 4.8mm	cable-ties-t50i-300-x-4-8mm	Crafted from durable Nylon 66, Scoop’s T50I cable ties combine exceptional tensile strength with a low-insertion force design for fast, effortless tightening. They provide a highly reliable bundling solution for standard cable management and general organizing tasks.\n\nPack Size: Supplied in convenient packs of 100 units.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	45	65	\N	\N	5	5	\N	T50I	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:14.995	2026-06-22 01:17:14.995	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
e86268b0-7401-4a57-a469-963ae34061f0	Scoop 305m Box Cat6 CCA White UTP Cable	scoop-305m-box-cat6-cca-white-utp-cable	Scoop's UTP-6305CW is a 305m Cat6 CCA White UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat6 cable includes a PVC outer sheath, an AWG rating of 23 and is supplied in an easy pull 100m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	775	1050	\N	\N	5	5	\N	UTP-6305CW	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: White\nConductor Dimensions: 0.56mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 310 x 280.5 x 80.5mm	0	0	3	2026-06-22 00:46:11.167	2026-06-22 01:14:03.284	0	0	0	\N
7f587e8d-a676-4bd8-9814-f32fe13648c7	Scoop Unbranded 305m Box Cat6 CCA Grey UTP Cable	scoop-unbranded-305m-box-cat6-cca-grey-utp-cable	Scoop's UTP-6305C is an unbranded 305m Cat6 CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat6 cable includes a PVC outer sheath, an AWG rating of 23 and is supplied in an easy pull 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	775	1050	\N	\N	5	5	\N	UTP-6305CU	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.56mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 420 x 420 x 240mm	0	0	3	2026-06-22 00:46:12.114	2026-06-22 01:14:04.095	0	0	0	\N
fbd7e9f2-1b04-494e-a400-6e722498521d	Scoop 305m Box Cat6 CCA Grey UTP Cable	scoop-305m-box-cat6-cca-grey-utp-cable	Scoop's UTP-6305C is a 305m Cat6 CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat6 cable includes a PVC outer sheath, an AWG rating of 23 and is supplied in an easy pull 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	775	1050	\N	\N	5	5	\N	UTP-6305C	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.56mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 420 x 420 x 240mm	0	0	3	2026-06-22 00:46:13.277	2026-06-22 01:14:05.105	0	0	0	\N
f6c74d32-9bd3-4ccb-a669-402302d7430d	Linkbasic 305m Drum Cat6a Solid Grey UTP Cable	linkbasic-305m-drum-cat6a-solid-grey-utp-cable	Linkbasic's UTP-6305A CAT6A 305m Drum of Cable can support data rates of 10Gbps at 100m's. The cable includes a crosstalk filler to improve signal-to-noise ratio and the conductor dimension of 0.575 mm is greater than that of the standard CAT6 cable we stock allowing for faster and more reliable data transmission.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2850	3850	\N	\N	5	5	\N	UTP-6305A	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.575mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:14.311	2026-06-22 01:14:05.999	0	0	0	\N
a485300c-6079-40ed-bd08-8814c6e7809e	Linkbasic 305m Box Cat6 Solid Grey UTP Cable	linkbasic-305m-box-cat6-solid-grey-utp-cable	Linkbasic's UTP-6305 is a 4 pair solid copper Category 6 305m Grey Ethernet Cable supplied in a 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2595	3525	\N	\N	5	5	\N	UTP-6305	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.565mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:15.416	2026-06-22 01:14:06.966	0	0	0	\N
756e299c-9065-4b2b-94e4-179bd2b25887	Scoop 100m Box Cat6 CCA Grey UTP Cable	scoop-100m-box-cat6-cca-grey-utp-cable	Scoop's UTP-6100C is a 100m Cat6 CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat6 cable includes a PVC outer sheath and carries an AWG rating of 24.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	250	350	\N	\N	5	5	\N	UTP-6100C	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 100m\nColour: Grey\nConductor Dimensions: 0.56mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 310 x 280.5 x 80.5mm	0	0	3	2026-06-22 00:46:17.709	2026-06-22 01:14:08.839	0	0	0	\N
05bc7559-e504-4cd6-890b-94076eb5b956	Linkbasic 100m Box Cat6 Solid Grey UTP Cable	linkbasic-100m-box-cat6-solid-grey-utp-cable	Linkbasic's UTP-6100 is a 4 pair solid copper Category 6 100m Grey Ethernet Cable supplied in a 100m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	825	1125	\N	\N	5	5	\N	UTP-6100	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 100m\nColour: Grey\nConductor Dimensions: 0.565mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:18.813	2026-06-22 01:14:09.748	0	0	0	\N
a277e9a8-beae-46ea-aa39-6f281ad193c4	Linkbasic 500m Drum Cat5e Solid Grey UTP Cable	linkbasic-500m-drum-cat5e-solid-grey-utp-cable	Linkbasic's UTP-500 is a 4 pair solid copper Category 5e 500m Grey Ethernet Cable supplied on a 500m drum.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2995	4050	\N	\N	5	5	\N	UTP-500	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 500m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:20.965	2026-06-22 01:14:11.636	0	0	0	\N
83b52130-9c92-47c0-9675-966deff96477	Linkbasic 305m Drum Cat5e Solid Shielded Grey FTP Cable	linkbasic-305m-drum-cat5e-solid-shielded-grey-ftp-cable	Linkbasic's UTP-305, CAT5e, shielded cable will protect your network from devastating electrostatic discharge (ESD) attacks. The CAT5e also contains a tinned copper drain wire to draw static and shocks away from the devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2295	3095	\N	\N	5	5	\N	UTP-305S	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.515mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:21.951	2026-06-22 01:14:12.708	0	0	0	\N
bb84cc92-3791-4822-a2cc-b14029c0c581	Linkbasic 305m Box Cat5e Solid Red UTP Cable	linkbasic-305m-box-cat5e-solid-red-utp-cable	Linkbasic's UTP-305R is a 4 pair, solid copper, Category 5E, 305m, Red Ethernet Cable supplied in a 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	UTP-305R	f	t	f	\N	\N	AWG Rating: 24\nBox/Drum Size: 305m\nColour: Red\nConductor Dimensions: 0.50mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: No\nOuter Jacket: PVC\nNumber of Pairs: 4	0	0	3	2026-06-22 00:46:22.966	2026-06-22 01:14:13.523	0	0	0	\N
d19e4d3b-30af-4c63-a748-f9752a008c7f	Ubiquiti UniFi Access Gate Hub 5x Input, 4x Relay	ubiquiti-unifi-access-gate-hub-5x-input-4x-relay	Ubiquiti's UA-HUB-GATE is a compact, indoor, access control hub which provides access control for a single gate. It features 1x 802.3at PoE input and 4x Gigabit Ethernet Ports with PoE out. The hub also has 5x input terminals (1x Gate exit request, 1x Gate position, 1x Side door exit request, 1x Side door position 1x Emergency), all of which can be unlocked using an NFC card, UniFi Identity Endpoint Mobile App, or Licence Plate Recognition if paired with a UniFi Protect AI Camera.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4650	6295	\N	\N	5	5	\N	UA-HUB-GATE	f	t	f	\N	\N	Button: Reset; Dry/Wet Switch\nBluetooth: None\nInput Terminals: 1x Gate Exit Request ; 1x Gate Position, 1x Side Door Exit, 1x Side Door\nPosition, 1x Emergency\nEthernet Ports: 5x 10/100/1000\nDry Output Relay: 2x Operator: rated 30V DC, up to 1A , 1x Aux: rated 30V DC, up to 1A\nWet Output Relay: Side door lock: 12V DC, up to 1A\nMounting: DIN-rail (Included)\nOperating Temperature: -30 to 60° C\nMax Power Consumption: 22W\nPower Input: 802.3at (PoE++)(Not Included)\n\nDimensions: 175 x 126 x 26 mm\nWeight: 460g	0	0	3	2026-06-22 00:48:49.693	2026-06-22 01:16:19.537	0	0	0	\N
c9321f7a-5078-42c3-b80a-d57ff088d58e	Scoop 305m Box Cat5e CCA Grey UTP Cable	scoop-305m-box-cat5e-cca-grey-utp-cable	Scoop's UTP-305C is a 305m Cat5e CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes a PVC outer sheath, an AWG rating of 24 and is supplied in an easy pull 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	595	795	\N	\N	5	5	\N	UTP-305C	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP - CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 370.5 x 370.5 x 230.5mm	0	0	3	2026-06-22 00:46:26.471	2026-06-22 01:14:17.224	0	0	0	\N
1b3c33b5-62c0-4d95-b394-36a99275558c	Linkbasic 305m Box Cat5e Solid Blue UTP Cable	linkbasic-305m-box-cat5e-solid-blue-utp-cable	Linkbasic's UTP-305B is a 4 pair, solid copper, Category 5E, 305m, blue Ethernet Cable supplied in a 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	UTP-305B	f	t	f	\N	\N	AWG Rating: 24\nBox/Drum Size: 305m\nColour: Blue\nConductor Dimensions: 0.50mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: No\nOuter Jacket: PVC\nNumber of Pairs: 4	0	0	3	2026-06-22 00:46:27.508	2026-06-22 01:14:18.494	0	0	0	\N
ff5e9a26-54b2-4003-893d-6351c2564b69	Linkbasic 305m Box Cat5e Solid Grey UTP Cable	linkbasic-305m-box-cat5e-solid-grey-utp-cable	Linkbasic's UTP-305, CAT5e, shielded cable will protect your network from devastating electrostatic discharge (ESD) attacks. The CAT5e also contains a tinned copper drain wire to draw static and shocks away from the devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	UTP-305	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.515mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:28.538	2026-06-22 01:14:19.473	0	0	0	\N
39a17af5-4c02-43c3-a2df-46b3a928d314	Scoop 100m Box Cat5e CCA Grey UTP Cable	scoop-100m-box-cat5e-cca-grey-utp-cable	Scoop's UTP-100C is a 100m Cat5e CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes a PVC outer sheath and carries an AWG rating of 24.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	195	275	\N	\N	5	5	\N	UTP-100C	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 100m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 260 x 270 x 70.5mm	0	0	3	2026-06-22 00:46:30.693	2026-06-22 01:14:22.045	0	0	0	\N
f1c702a7-c49a-4d64-8980-c2d1fcbacbe7	Linkbasic 100m Box Cat5e Solid Grey UTP Cable	linkbasic-100m-box-cat5e-solid-grey-utp-cable	Linkbasic's UTP-100 is a 4 pair solid copper Category 5e 100m Grey Ethernet Cable supplied in a 100m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	650	875	\N	\N	5	5	\N	UTP-100	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 100m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC	0	0	3	2026-06-22 00:46:32.215	2026-06-22 01:14:23.164	0	0	0	\N
0e43b654-2fe4-4784-808a-54ec77325a49	Ubiquiti UniFi WAN Switch with 3SFP+	ubiquiti-unifi-wan-switch-with-3sfp	Ubiquiti's USW-WAN is a 10G SFP+ WAN Switch which enables the linking of two shadow mode, high-availability UniFi gateways to a single ISP. The unit features 3x 10Gbps SFP+ Slots, 1x Gigabit management port and dual power supplies for redundancy.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4425	5995	\N	\N	5	5	\N	USW-WAN	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 13W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 2x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 3x 10Gbps (SFP+)\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 120 x 43.7 mm\nWeight: 2.3kg	0	0	3	2026-06-22 00:46:34.71	2026-06-22 01:14:25.278	0	0	0	\N
b057b2df-a5fd-4920-96bf-c9a67e68ad61	Ubiquiti UniFi Switch Ultra 8 Port Gigabit 1PoE Input 7 PoE Out 52W	ubiquiti-unifi-switch-ultra-8-port-gigabit-1poe-input-7-poe-out-52w	Ubiquiti's USW-U60 is a compact Layer 2 switch featuring 8 Gigabit Ports with 1x PoE input, 7x PoE output, and a PoE budget of 52W when powered with the included Power Supply.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2425	3295	\N	\N	5	5	\N	USW-U60	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8W (with included power supply)\nMounting: Desktop or Wall Mount\nOperating System: UniFi\nOperating Temperature: -20°C to 45°C (when powered with included power supply)\nPoE Input: 802.3af/at/bt\nPoE Output: 802.3af/at on Ports 2~8\nPower Input: 802.3at/at/bt PoE or Included power Supply\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 44–57V\n\nDimensions: 203 x 76 x 33 mm\nWeight: 320kg	0	0	3	2026-06-22 00:46:37.253	2026-06-22 01:14:27.227	0	0	0	\N
e579282b-ea4d-4189-84f3-961b26cff0c3	Ubiquiti UniFi Switch Pro 8 Port 6PoE+ 2PoE++ 120W	ubiquiti-unifi-switch-pro-8-port-6poe-2poe-120w	Ubiquiti's USW-PRO8P is a fully managed 8-Port Gigabit Layer 3 UniFi switch. It has 6x 802.3at PoE+ Ports, 2x 802.3bt PoE++ Ports, 2x 10Gbps SFP+ and a PoE budget of 120W. It features innovative near-silent cooling and a 1.3" touch LCM (Liquid Crystal Monitor) to provide status information.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5195	6995	\N	\N	5	5	\N	USW-PRO8P	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 30W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: -5°C to 45°C\nPoE Input: None\nPoE Output: 6x 802.3af/at ; 2x 802.3bt\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 200 x 248 x 44mm\nWeight: 2.1kg	0	0	3	2026-06-22 00:46:38.663	2026-06-22 01:14:28.38	0	0	0	\N
0bce5a81-fee7-4dc6-a002-a678d70e307c	Cable Ties T30R 150 x 3.6mm	cable-ties-t30r-150-x-3-6mm	Crafted from durable Nylon 66, Scoop’s T30R cable ties combine reliable tensile strength with a low-insertion force design for fast, effortless tightening. They provide a highly efficient bundling solution for lightweight cable management and everyday organizing tasks.\n\nPack Size: Supplied in convenient packs of 100 units.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	15	20	\N	\N	5	5	\N	T30R	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:15.961	2026-06-22 01:17:15.961	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
5d8b07da-fb1f-4402-8da4-7a4b2e779ab2	Ubiquiti UniFi Pro XG Switch 8 x 10Gbps PoE++ 2SFP+ 155W	ubiquiti-unifi-pro-xg-switch-8-x-10gbps-poe-2sfp-155w	Ubiquiti's USW-PRO-XG8P is a compact desktop or wall-mountable, 8-port, fully managed, Layer 3 Etherlighting™ switch. The unit features a 155W PoE budget with 8x 10Gbps PoE++ Ports and 2x SFP+ uplink Ports.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8795	11895	\N	\N	5	5	\N	USW-PRO-XG8P	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 61W\nMounting: Desktop or Wall Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 45°C\nPoE Input: None\nPoE Output: 8x PoE++ (60W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 210.4 x 173.8 x 43.7 mm\nWeight: 1.6Kg	0	0	3	2026-06-22 00:46:43.852	2026-06-22 01:14:32.246	0	0	0	\N
d996bf30-87a3-4ec0-9e46-ef707158b18e	Ubiquiti UniFi Pro XG Switch 32 x 10Gbps 16 x 2.5Gbps PoE+++ 2SFP28 1080W	ubiquiti-unifi-pro-xg-switch-32-x-10gbps-16-x-2-5gbps-poe-2sfp28-1080w	Ubiquiti's USW-PRO-XG48P is a 48 port, fully managed, Layer 3 Etherlighting™ switch. The unit features a 1080W PoE budget with 32x 10Gbps and 16 x 2.5Gbps PoE+++ (802.3bt 90W) Ports as well as 4x SFP28 uplink Ports.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	42995	58175	\N	\N	5	5	\N	USW-PRO-XG48P	f	t	f	\N	\N	Ethernet Ports: 32x 10/100/1000/2500/10000 ; 16x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 250W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 48x PoE+++ (90W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 25Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442 x 480 x 44 mm\nWeight: 7.6kg	0	0	3	2026-06-22 00:46:44.947	2026-06-22 01:14:33.25	0	0	0	\N
848f7d63-6934-4a7a-ac59-75aabebd0b38	Ubiquiti UniFi Pro XG Switch 10 x 10Gbps PoE+++ 2SFP+ 400W	ubiquiti-unifi-pro-xg-switch-10-x-10gbps-poe-2sfp-400w	Ubiquiti's USW-PRO-XG10P is a 10 port, fully managed, Layer 3 Etherlighting™ switch. The unit features a 400W PoE budget with 10x 10Gbps PoE+++ (802.3bt 90W) Ports and 2x SFP+ uplink Ports.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	12450	16850	\N	\N	5	5	\N	USW-PRO-XG10P	f	t	f	\N	\N	Ethernet Ports: 10x 10/100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 65W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 10x PoE+++ (90W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442.4 x 285 x 44 mm\nWeight: 4.7kg	0	0	3	2026-06-22 00:46:47.345	2026-06-22 01:14:35.002	0	0	0	\N
842ab21a-5a7b-4c36-b563-10cdc9c1221c	Ubiquiti UniFi Pro Max Switch 48 with 32 Gigabit 16x 2.5Gbps 4SFP+	ubiquiti-unifi-pro-max-switch-48-with-32-gigabit-16x-2-5gbps-4sfp	Ubiquiti's USW-PRO-MAX48 is a 48 port, fully managed, Layer 3, Etherlighting™ switch. The unit features 32x Gigabit Ports, 16x 2.5Gbps ports and 4x SFP+ uplink Ports. This configuration makes provision for 2.5Gbps Ethernet as well as 10Gbps fibre uplinks to your network.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	11295	15295	\N	\N	5	5	\N	USW-PRO-MAX48	f	t	f	\N	\N	Ethernet Ports: 32x 10/100/1000; 16x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 100W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442 x 325 x 44mm\nWeight: 5.2kg	0	0	3	2026-06-22 00:46:50.24	2026-06-22 01:14:37.034	0	0	0	\N
81160b7f-8dac-41ac-8a33-790c256afa19	Ubiquiti UniFi Pro Max Switch 24 with 16PoE 8x 2.5Gbps PoE++ 400W	ubiquiti-unifi-pro-max-switch-24-with-16poe-8x-2-5gbps-poe-400w	Ubiquiti's USW-PRO-MAX24P is a 24 port, fully managed, Layer 3 Etherlighting™ switch. The unit features a 400W PoE budget with 16 Gigabit PoE Ports (8x PoE++ and 8x PoE+), 8x 2.5Gbps PoE++ ports and 2x SFP+ uplink Ports. This configuration makes provision for 2.5Gbps PoE links to your WiFi 6 devices as well as 10Gbps fibre uplinks to your network.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	13595	18395	\N	\N	5	5	\N	USW-PRO-MAX24P	f	t	f	\N	\N	Ethernet Ports: 16x 10/100/1000; 8x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 50W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 2.5Gbps: 8x PoE++ (60W) ; Gigabit: 8x PoE+ ; 8x PoE++ (60W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442 x 325 x 44mm\nWeight: 5.2kg	0	0	3	2026-06-22 00:46:51.419	2026-06-22 01:14:37.924	0	0	0	\N
ddf468a3-1a64-4a90-ae7b-437983258c0b	Ubiquiti UniFi Pro HD Switch 2x 10Gbps 22x 2.5Gbps PoE++ 2SFP+ 600W	ubiquiti-unifi-pro-hd-switch-2x-10gbps-22x-2-5gbps-poe-2sfp-600w	Ubiquiti's USW-PRO-HD24P is a 24-port fully-managed, multi-gigabit, Layer 3, PoE++ switch with Etherlighting™. The unit features 2x 10Gbps and 22x 2.5Gbps PoE++ ports, 4x SFP+ ports and a PoE budget of 600W.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	17295	23395	\N	\N	5	5	\N	USW-PRO-HD24P	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000/2500/10000; 22x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 60W\nMounting: Rack-Mount\nOperating System: UniFi OS\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 24 x 802.3af/at/bt (64W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442 x 400 x 44 mm\nWeight: 6.3kg	0	0	3	2026-06-22 00:46:54.01	2026-06-22 01:14:39.641	0	0	0	\N
948cd420-4fab-4645-a608-0de452c715a9	Ubiquiti UniFi 24 Port 2x 10Gbps 22x 2.5Gbps 4SFP+ Pro HD Switch	ubiquiti-unifi-24-port-2x-10gbps-22x-2-5gbps-4sfp-pro-hd-switch	Ubiquiti's USW-PRO-HD24 is a professional-grade, high-performance Layer 3 Etherlighting™ switch with 2x 10Gbps Ports, 22x 2.5Gbps Ports and 4x 10G SFP+ ports. It also features a 1.3' touchscreen with AR switch management, layer 3 switching features and can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	10595	14350	\N	\N	5	5	\N	USW-PRO-HD24	f	t	f	\N	\N	Ethernet Ports: 22x 10/100/1000/2500; 2x 10/100/100/2500/10000\nHardware Button: Reset\nMax Power Consumption: 60W\nMounting: Rack-Mount\nOperating System: UniFi\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 10Gbps\nSupported Voltage Range: 100 to 240V AC\n\nDimensions: 442 x 285 x 44 mm	0	0	3	2026-06-22 00:46:55.214	2026-06-22 01:14:40.626	0	0	0	\N
377a32e6-e626-4a8b-b24f-d96c2e79bd43	Ubiquiti UISP Power TransPort Cable 1.5M	ubiquiti-uisp-power-transport-cable-1-5m	Ubiquiti's UACC-TPC-1.5M is a 1.5m UISP Power Transport Cable for use between the UISP-BOX and the included power supply of the UISP-R or UISP-S.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	285	385	\N	\N	5	5	\N	UACC-TPC-1.5M	f	t	f	\N	\N	Connector: Power TransPort\nFlame rating: VW-1\nConductor wire gauge: 12 AWG\nConductor type: Tin stranded copper\nJacket material: Thermoplastic elastomer\nJacket diameter: 11 x 6.5 mm\nOperating temperature: -40 to 80°C\nCable Length: 1.5m	0	0	3	2026-06-22 00:48:25.969	2026-06-22 01:15:59.414	0	0	0	\N
fd6594df-c27a-4445-8236-871c44d09669	Ubiquiti UniFi Access Door Hub Mini 2x Input, 1x Relay	ubiquiti-unifi-access-door-hub-mini-2x-input-1x-relay	Ubiquiti's UA-HUB-DM is a compact, indoor, access control hub which provides access control for a single door. It features 1x 802.3at PoE input and 2x Gigabit Ethernet Ports with PoE out. The hub also has 2x input terminals (1x Door exit request, 1x door position) for simplified user exit, all of which can be unlocked using an NFC card or UniFi Identity Mobile App.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1825	2475	\N	\N	5	5	\N	UA-HUB-DM	f	t	f	\N	\N	Button: Reset; Dry/Wet Switch\nBluetooth: None\nInput Terminals: 1x Door Exit Request ; 1x Door Position\nEthernet Ports: 3x 10/100/1000\nDry Output Relay: 30V DC 1A\nWet Output Relay: 12V DC 1A\nMounting: DIN-rail (Included)\nOperating Temperature: -30 to 40° C\nMax Power Consumption: 19W\nPower Input: 802.3at (PoE++)(Not Included)\n\nDimensions: 113 x 66 x 27.6mm\nWeight: 190g	0	0	3	2026-06-22 00:48:51.788	2026-06-22 01:16:21.6	0	0	0	\N
1fccc1b8-46c9-4f06-8c9b-6d9770839e47	Ubiquiti UniFi Switch Lite 16 Port Gigabit 8PoE 45W	ubiquiti-unifi-switch-lite-16-port-gigabit-8poe-45w	Ubiquiti's USW-LITE16P is a fully managed layer 2 switch with 16x Gigabit Ethernet ports, 8x 802.3af/at PoE+ ports and a PoE budget of 45W. The device offers an extensive suite of advanced layer 2 switching protocols and features. A wall-mountable kit is included with the switch. The device is fanless, meaning that it will be silent no matter where it is used.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3550	4825	\N	\N	5	5	\N	USW-LITE16P	f	t	f	\N	\N	Ethernet Ports: 16x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 15W\nMounting: Desktop or Wall-Mount\nOperating System: UniFi\nOperating Temperature: -15 to 40° C\nPoE Input: None\nPoE Output: 802.3af/at on Ports 1 to 8\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 99.6 x 163.7 x 31.7mm\nWeight: 450g	0	0	3	2026-06-22 00:46:58.332	2026-06-22 01:14:43.622	0	0	0	\N
1fdd49fe-9c54-4b7a-a5b0-7d9b21a4869d	Ubiquiti UniFi Flex Switch Utility Outdoor Enclosure	ubiquiti-unifi-flex-switch-utility-outdoor-enclosure	Ubiquiti's USW-FLEXU is an outdoor, weatherproof enclosure designed for use with the USW-5FLEX. Included with the unit are an Ethernet patch lead and a 60W PoE Injector providing a maximum PoE budget of 46W. The unit can be pole mounted and is easy to secure using the screw lock.\n\n*Note: USW-5FLEX not Included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	850	1150	\N	\N	5	5	\N	USW-FLEXU	f	t	f	\N	\N	US-FLEXU Specifications\nCompatibility: US5-FLEX\n\nDimensions: 249 x 218 x 60mm\nWeight: 740g\n\n60W PoE Adapter Specifications\nEthernet Ports: 1x 10/100/1000\nOperating Temperature: -20°C to 60°C\nPoE Output: 54V 1.11A Passive PoE\nPower Input: Terminal Block\nSupported Voltage Range: 100V-240V\n\nDimensions: 118.5 x 63 x 34.7mm\nWeight: 206g	0	0	3	2026-06-22 00:46:59.529	2026-06-22 01:14:44.535	0	0	0	\N
111375ae-8016-4890-9e22-9292d99f7dad	Ubiquiti UniFi Flex 2.5G PoE 8 Port PoE with 10G Combo Uplink	ubiquiti-unifi-flex-2-5g-poe-8-port-poe-with-10g-combo-uplink	Ubiquiti's USW-8FLEX-2.5GP is an indoor, compact, 8 Port 2.5Gbps 802.3bt PoE switch that can be powered via PoE or the UACC-PSU-210W AC power adapter (Not Included). It also features a 10Gbps Ethernet or 10Gbps SFP+ combination uplink port.\n\nIt can be configured and managed with the UniFi Network Application.\n\n*Note: No PSU supplied with the product. Please see the UACC-PSU-210W adapter.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3495	4775	\N	\N	5	5	\N	USW-8FLEX-2.5GP	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000/2500; 1x 10/100/1000/10000 (Combo)\nHardware Button: None\nMax. Power Consumption: PoE: 14W; PSU: 17W\nMounting: Desktop\nOperating System: UniFi\nOperating temperature: 20 to 45°C\nPoE Input: 802.3bt 90W (PoE+++) on Port 8\nPoE Output: 802.3bt 60W (PoE++)\nPower Input: 802.3bt 90W (PoE+++) or UACC-PSU-210W (Not Included)\nSerial Interface: None\nSFP Ports: 10Gbps SFP+ (Combo)\nSupported Voltage Range: 50-57V\n\nDimensions: 212.9 x 99.4 x 33.5 mm\nWeight: 567g	0	0	3	2026-06-22 00:47:03.024	2026-06-22 01:14:46.367	0	0	0	\N
ed7dcf9f-0f88-4d94-be36-c3d3ca330426	Ubiquiti UniFi Flex Mini 5 Port Gigabit 1PoE Input	ubiquiti-unifi-flex-mini-5-port-gigabit-1poe-input	Ubiquiti's USW-5FLEXMINI is an indoor, fully managed, 5 port, Gigabit UniFi switch with 1x 802.3af PoE+ input on port 1.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	550	750	\N	\N	5	5	\N	USW-5FLEXMINI	f	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: None\nMax. Power Consumption: 2.5W\nMounting: Desktop\nOperating System: UniFi\nOperating temperature: -5°C to 45°C\nPoE Input: 802.3af/at on Port 1\nPoE Output: None\nPower Input: 5V 1A USB-C Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 4.7V-5.3V DC or 802.3af/at PoE\n\nDimensions: 107.16 x 70.15 x 21.17mm\nWeight: 150g	0	0	3	2026-06-22 00:47:05.503	2026-06-22 01:14:48.574	0	0	0	\N
8ff208d6-3c34-4b9f-b271-963fd6e1c97e	Ubiquiti UniFi Flex Mini 2.5Gbps 5 Port Switch with PoE Input	ubiquiti-unifi-flex-mini-2-5gbps-5-port-switch-with-poe-input	Ubiquiti's USW-5FLEX-2.5G is an indoor, compact, 5 Port 2.5Gbps switch that can be powered via PoE on Port 5 or via the included USB-C adapter. It can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	915	1250	\N	\N	5	5	\N	USW-5FLEX-2.5G	f	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000/2500\nHardware Button: None\nMax. Power Consumption: AC/DC: 5W ; PoE: 6.4W\nMounting: Desktop\nOperating System: UniFi\nOperating temperature: 20 to 45°C\nPoE Input: 802.3af/at on Port 5\nPoE Output: None\nPower Input: 5V USB-C Adapter (Included) or PoE on Port 5\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: AC/DC: 5V ; PoE: 44-57V\n\nDimensions: 117.1 x 90 x 21.2 mm\nWeight: 206g	0	0	3	2026-06-22 00:47:07.024	2026-06-22 01:14:49.966	0	0	0	\N
a85b19bf-7713-4c37-bd8c-ce7fb2d8159d	Ubiquiti UniFi Switch 48 Port Gigabit 32PoE 195W 4SFP	ubiquiti-unifi-switch-48-port-gigabit-32poe-195w-4sfp	Ubiquiti's USW-48P is a managed Layer 2 switch with 48x Gigabit Ports. It includes 32x 802.3at PoE+ ports, 4x 1.25Gbps SFP uplink ports and a PoE budget of 195W. The unit features a 1.3" touch LCM to provide status information.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	10295	13975	\N	\N	5	5	\N	USW-48P	f	t	f	\N	\N	Ethernet Ports: 48x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 45W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5 to 40° C\nPoE Input: None\nPoE Output: 802.3af/at on Ports 1~32\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 1.25Gbps\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 285 x 43.7mm\nWeight: 4.61kg	0	0	3	2026-06-22 00:47:09.936	2026-06-22 01:14:52.645	0	0	0	\N
a535d8c6-6524-4168-8ee3-c38bf331be1f	Ubiquiti AI Port Rack-Mount Kit	ubiquiti-ai-port-rack-mount-kit	Ubiquiti's UACC-AIPORT-RM is a 1U rack-mount accessory that supports up to 6x UP-AI-PORT.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1425	1925	\N	\N	5	5	\N	UACC-AIPORT-RM	f	t	f	\N	\N	Enclosure Material: SGCC steel, polycarbonate\nMounting: Mini rack/rack\nAmbient Operating Temperature: -20° to 40° C (-4° to 104° F)\n\nDimensions: 442.4 x 158.5 x 42.8 mm\nWeight: 650g	0	0	3	2026-06-22 00:48:45.446	2026-06-22 01:16:15.779	0	0	0	\N
d456c186-52ca-417f-8288-796ac3012c25	Ubiquiti UniFi Access Reader Pro Black	ubiquiti-unifi-access-reader-pro-black	The Ubiquiti UA-G3PRO-B is a black IP55-rated intercom with a built-in NFC card reader featuring a 4.7'' Touchscreen, Face Recognition, 2-way Audio and Touch Pass support, for which users will receive 10 free Touch Passes in the first year. Thereafter, passes are billed annually per user. Powered via PoE, it's designed for seamless integration with UniFi Access Hubs.\n\nNote: This device needs to be paired with a UniFi Access Hub.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5995	8125	\N	\N	5	5	\N	UA-G3PRO-B	f	t	f	\N	\N	Button: Reset\nConnectivity: BLE 4.2 or NFC\nEthernet Ports: 1x 10/100/1000\nMounting: Wall-Mount & Gang-box (Included); Angle mount, junction box (Optional)\nOperating Temperature: Device: -30°C to 45°C; Display: -10°C to 45°C\nMax Power Consumption: 6W\nPower Input: 802.3af PoE (Not Included)\n\nDimensions: 160 x 40.4 x 40.55 mm\nWeight: 136g	0	0	3	2026-06-22 00:48:53.885	2026-06-22 01:16:24.08	0	0	0	\N
a9ab6c8b-0471-4100-bb9a-47e1e2cd9641	Ubiquiti UniFi Switch 24 Port Gigabit 2SFP	ubiquiti-unifi-switch-24-port-gigabit-2sfp	Ubiquiti's USW-24 is a managed, Layer 2, UniFi switch. It has 24x Gigabit Ethernet ports and 2x 1.25Gbps SFP uplink ports. The unit features a fanless design with a 1.3" touchscreen that displays the current switch state and other information for quick and easy reference.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3995	5395	\N	\N	5	5	\N	USW-24	f	t	f	\N	\N	Ethernet Ports: 24x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 25W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 200 x 43.7 mm\nWeight: 2.79kg	0	0	3	2026-06-22 00:47:13.357	2026-06-22 01:14:55.383	0	0	0	\N
a9519996-6295-406f-be95-68939f10f34f	Ubiquiti UniFi SuperLink Environmental Sensor	ubiquiti-unifi-superlink-environmental-sensor	Ubiquiti's USL-ENVIRO is a battery-powered SuperLink sensor that detects water leaks, temperature, humidity, and ambient light when used in conjunction with a Superlink Gateway.\n\nIt is configured and managed through the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	850	1150	\N	\N	5	5	\N	USL-ENVIRO	f	t	f	\N	\N	Connectivity: SuperLink (Proprietary)\nMax. Range: 2km\nMax. Power Consumption: 34.9mW\nMounting: Adhesive and screw mount\nOperating Temperature: -20 to 40°C\nPower Input: Lithium battery CR123A (up to 6 years battery life)\n\nDimensions: Device: 53 x 49 x 23.5 mm ; Mount: 41.3 x 36.6 x 3.1 mm\nWeight: 70g	0	0	3	2026-06-22 00:47:15.813	2026-06-22 01:14:57.379	0	0	0	\N
59e0d23b-2a21-4337-a812-28f11d4905a4	Ubiquiti UniFi SuperLink Entry Sensor	ubiquiti-unifi-superlink-entry-sensor	Ubiquiti's USL-ENTRY is a SuperLink sensor with up to 6 years of battery life for monitoring doors and windows open/closed status when used in conjunction with a Superlink Gateway.\n\nIt is configured and managed through the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	695	950	\N	\N	5	5	\N	USL-ENTRY	f	t	f	\N	\N	Connectivity: SuperLink (Proprietary)\nMax. Range: 2km\nMax. Power Consumption: 27.7mW\nMounting: Adhesive and screw mount\nOperating Temperature: 0°C to 40°C\nPower Input: Lithium battery CR123A\n\nDimensions: Device: 75.5 x 23.5 x 22.5 mm ; Magnet: 39 x 15.1 x 12.9 mm\nWeight: Device: 41g; Magnet: 22g	0	0	3	2026-06-22 00:47:16.952	2026-06-22 01:14:58.549	0	0	0	\N
871876ad-ff01-471c-bd97-bce384388267	Ubiquiti UniFi UPS 2U 8 Outlet 1000W	ubiquiti-unifi-ups-2u-8-outlet-1000w	Ubiquiti's UPS-2U is a UniFi-managed 1.5kVA/1000W rack-mount UPS (uninterruptible power supply) with 8 outlets, a field-replaceable battery, 216Wh, and a half-load (500W) runtime of 8 minutes. The unit enables safe shutdown for UniFi storage devices and provides compatibility with NUT (Network UPS Tools) for third‑party devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5295	7175	\N	\N	5	5	\N	UPS-2U	f	t	f	\N	\N	Battery Type: 2x Lead Acid 12V, 9Ah\nCapacity: 1,500VA / 1,000W\nEthernet Ports: 1x 10/100 (MGMT); 2x 10/100/1000 (Surge Protect)\nHardware Button: Reset, Power\nMounting: 2U Rack-Mount\nOperating System: UniFi Network\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nRuntime: Full load: 2.3 min, Half load: 8 min\nSerial Interface: 1x RJ45 Serial Port\nVoltage Input Range: 170V-280V AC\nVoltage Output Range: 220V-240V AC\n\nDimensions: 442.4 x 300 x 87.4 mm\nWeight: 13.7kg	0	0	3	2026-06-22 00:47:19.453	2026-06-22 01:15:00.433	0	0	0	\N
82a6b87f-cf05-4e3f-9576-b2c2eb7d6c87	Ubiquiti 10Gbps 54V 60W PoE Adapter with No Cable	ubiquiti-10gbps-54v-60w-poe-adapter-with-no-cable	Ubiquiti's UPOE54-60W-10G is a 54V, 1.15A, 10Gbps, PoE injector. The unit is compatible with products that require 802.3bt PoE and features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power cable not included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	725	995	\N	\N	5	5	\N	UPOE54-60W-10G	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000/2500/10000\nPoE Output: 54V 1.15A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V	0	0	3	2026-06-22 00:47:20.439	2026-06-22 01:15:01.696	0	0	0	\N
cd5c7ced-f6ed-41e2-8429-36045f1f8c3a	Ubiquiti Gigabit PoE Adapter 48V 60W with No Cable	ubiquiti-gigabit-poe-adapter-48v-60w-with-no-cable	Ubiquiti's UPOE48-60W is a 48V, 1.25A, Gigabit, PoE injector, compatible with Ubiquiti's AF-11. The unit features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power Cable Not Included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	525	750	\N	\N	5	5	\N	UPOE48-60W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nOperating Temperature: 0°C to 40°C\nPoE Output: 48V 1.25A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V\n\nDimensions: 106 x 63 x 34mm\nWeight: 210g	0	0	3	2026-06-22 00:47:21.514	2026-06-22 01:15:02.592	0	0	0	\N
85a69eed-c1a9-4734-a3de-ad0eae384169	Ubiquiti Gigabit PoE Adapter 48V 30W with No Cable	ubiquiti-gigabit-poe-adapter-48v-30w-with-no-cable	Ubiquiti's UPOE48-30W is a 48V, 0.65A, Gigabit, PoE injector. The unit is compatible with products that require 802.3at PoE and features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power Cable Not Included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	295	395	\N	\N	5	5	\N	UPOE48-30W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nPoE Output: 48V 0.65A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V	0	0	3	2026-06-22 00:47:25.399	2026-06-22 01:15:04.478	0	0	0	\N
00a14fe2-2c5b-4963-bd70-051e31121144	Linkbasic UTP Cable Tester	linkbasic-utp-cable-tester	The Linkbasic UTP Cable Tester is an essential diagnostic tool for inspecting and verifying network cables, including LAN RJ45 and RJ11 connections. Engineered to test both unshielded (UTP) and shielded cables, it easily identifies open circuits, shorts, reversals, and mis-wiring. The main unit and its companion remote terminal feature cyclic, sequential LED indicators that flash one by one to help you quickly determine correct pinouts or find wiring errors.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	125	175	\N	\N	5	5	\N	TOOL-TEST	f	t	f	\N	\N	Compatibility: RJ45 & RJ11\nFunctions: Cable Tester	0	0	3	2026-06-22 01:16:50.696	2026-06-22 01:16:50.696	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
68ec4ed1-f939-4886-aa25-bf7499f2f5c5	Ubiquiti Gigabit PoE Adapter 24V 24W with No Cable	ubiquiti-gigabit-poe-adapter-24v-24w-with-no-cable	Ubiquiti's UPOE24-24W is a 24V, 1A, Gigabit PoE injector. The unit features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power Cable Not Included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	195	275	\N	\N	5	5	\N	UPOE24-24W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nOperating Temperature: 0°C to 40°C\nPoE Output: 24V 1A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V\n\nDimensions: 88 x 57 x 33mm\nWeight: 158.5g	0	0	3	2026-06-22 00:47:29.106	2026-06-22 01:15:07.526	0	0	0	\N
c25ab3fe-d03f-42e7-9c2e-7513704b748e	Ubiquiti Gigabit PoE Adapter 24V 12W with No Cable	ubiquiti-gigabit-poe-adapter-24v-12w-with-no-cable	Ubiquiti's UPOE24-12W is a 24V, 0.5A, Gigabit PoE injector. The unit features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power Cable Not Included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	175	250	\N	\N	5	5	\N	UPOE24-12W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nOperating Temperature: 0°C to 40°C\nPoE Output: 24V 0.5A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range:100V-240V\n\nDimensions: 89 x 46 x 33mm\nWeight: 75g	0	0	3	2026-06-22 00:47:30.206	2026-06-22 01:15:08.561	0	0	0	\N
7b1236de-2c47-49d3-855e-aabf8d3f2312	Ubiquiti UniFi PowerAmp Black	ubiquiti-unifi-poweramp-black	Ubiquiti's UPL-AMP-B is a premium WiFi 5 speaker amplifier with 2x Gigabit Ethernet Ports designed for high-fidelity multi-zone audio streaming and immersive spatial sound experiences. It features low-latency wireless audio streaming with Apple AirPlay 2 and Spotify, 130W per channel at 8 ohms, 2x speaker terminal outputs with 2x custom-designed banana plugs included. Also included is 1x RCA analog subwoofer output, 2x RCA analog inputs for left and right channels, 1x HDMI eARC input with immersive spatial sound powered by Dolby Atmos as well as a 1.43" rotary knob with touchscreen.\n\nThis unit can be configured and managed via the UniFi Play mobile app.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	12195	16495	\N	\N	5	5	\N	UPL-AMP-B	f	t	f	\N	\N	Amplifier class: Class D\nAudio input: 1x HDMI eARC input, 2x RCA analog inputs L/R\nAudio output: 1x RCA analog subwoofer output, 2x Speaker terminal outputs with 2x banana plugs\nData Rate: 2.4GHz: 300Mbps ; 5.8GHz: 867Mbps\nEthernet Ports: 2x 10/100/1000\nGrouping: Up to 32 PowerAmps\nMax. Power Consumption: 17W\nMounting: Desktop\nOperating System: UniFi Play\nOperating Temperature: -5 to 40° C\nOutput: Mono / Stereo sound\nPer channel power (Continuous power): 130 W, 8 Ω, 1 kHz, < 0.05% THD+N, EIA (CEA-490-A) 260 W, 4 Ω, 1 kHz, < 0.09% THD+N, EIA (CEA-490-A)\nStreaming: AirPlay2, Spotify Connect, Soundtrack Your Brand\n\nDimensions: 217 x 236.8 x 63.7 mm\nWeight: 2.4kg	0	0	3	2026-06-22 00:47:32.866	2026-06-22 01:15:10.328	0	0	0	\N
4d32b2a9-bbfe-4635-8af3-20cb201ae1b0	Ubiquiti UniFi Protect 110dB PoE Siren	ubiquiti-unifi-protect-110db-poe-siren	Ubiquiti's UP-SIREN-POE is an all-weather siren powered by PoE, delivering a 110dB alarm and emergency LED lighting. It can be configured and managed using the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1825	2475	\N	\N	5	5	\N	UP-SIREN-POE	f	t	f	\N	\N	Buttons: Factory-reset & Tamper switch\nEthernet Ports: 1x 10/100\nMax. Power Consumption: 5W\nMounting: Wall, ceiling mounting plate (Included)\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af/at\nPoE Output: None\nPower Input: PoE+ (802.3af/at)\nRating: IP56\n\nDimensions: 139.9 x 139.9 x 35 mm\nWeight: 308g	0	0	3	2026-06-22 00:47:33.979	2026-06-22 01:15:11.389	0	0	0	\N
bce5c576-ebd4-4901-bf69-67303634c937	Ubiquiti UniFi Protect AI Port	ubiquiti-unifi-protect-ai-port	Ubiquiti's UVC-AI-PORT enhances any UniFi or third-party ONVIF camera with AI detection, classification, and recognition capabilities. It features advanced AI for people detection, license plate recognition and is wall, pole or rack-mountable with the UACC-AIPORT-RM.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3395	4595	\N	\N	5	5	\N	UP-AI-PORT	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nMax. camera resolution: 3840 x 2160 (16:9)\nOperating Temperature: -20°C to 40°C\nPoE Input: PoE+ required for PoE output (12.95W) ; PoE++ required for PoE+ output (25.5W)\nPoE Output: 802.3af/at (Dependent on Input)\n\nDimensions: 152.7 x 69 x 47.8 mm\nWeight: 294g	0	0	3	2026-06-22 00:47:36.775	2026-06-22 01:15:13.609	0	0	0	\N
ecf76421-e3f5-4123-bf5f-079bb7bbd3c7	Ubiquiti UniFi Protect Network Video Recorder Instant	ubiquiti-unifi-protect-network-video-recorder-instant	Ubiquiti UNVR-INSTANT is a compact desktop UniFi Protect NVR with 1x 3.5" HDD bay, featuring an integrated 6-port PoE switch with a 40W PoE budget and integrated HDMI View Port.\n\n*Note: Hard drives are not included. Please ensure your HDDs meet Ubiquiti's general guidelines and aren't included in the list of incompatible models.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3850	5195	\N	\N	5	5	\N	UNVR-INSTANT	f	t	f	\N	\N	Ethernet Ports: 7x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 9W\nMounting: Desktop or Wall Mount\nOperating System: UniFi Protect\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af on Ports 1~6\nPower Input: 1x Figure 8 Power Cord (Included)\nProcessor: Quad-Core ARM Cortex-A55 at 1.7 GHz\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 100-240V\nSystem Memory: 4GB DDR4\nUSB Ports: None\n\nDimensions: 220 x 220 x 47 mm\nWeight: 1.04kg	0	0	3	2026-06-22 00:47:40.182	2026-06-22 01:15:15.638	0	0	0	\N
845dfcea-78c5-4768-8e86-0ff38de5de07	Ubiquiti UniFi Protect 4 Bay 1SFP+ Gigabit Ethernet NVR	ubiquiti-unifi-protect-4-bay-1sfp-gigabit-ethernet-nvr	Ubiquiti's UNVR is a Network Video Recorder and UniFi OS Console. It runs the pre-installed UniFi Protect Application and makes provision for up to 4 compatible 2.5” or 3.5" hard drives.\n\n*Note: Hard drives are not included. Please ensure your HDDs meet Ubiquiti's general guidelines and aren't included in the list of incompatible models.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5895	7975	\N	\N	5	5	\N	UNVR	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 100W\nMounting: Rack-Mount\nOperating System: UniFi Protect\nOperating Temperature: -5 to 40° C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nProcessor: Quad-Core ARM Cortex-A57 at 1.7 GHz\nSerial Interface: None\nSFP Ports: 1x 10Gbps\nSupported Voltage Range:100-240V\nSystem Memory: 4GB DDR4\nUSB Ports: None\n\nDimensions: 442.4 x 325 x 43.7mm\nWeight: 5.20kg	0	0	3	2026-06-22 00:47:41.084	2026-06-22 01:15:16.586	0	0	0	\N
83abb981-3c37-4911-a1ed-1eeb0328cd74	Linkbasic UTP Cable Stripper Tool	linkbasic-utp-cable-stripper-tool	Linkbasic's cable stripping tool is engineered to significantly speed up prep time for both coaxial and twisted-pair network cables before termination. It features a fully adjustable cutting blade designed to cleanly strip away outer cable jackets without nicking or damaging the internal conductors—making it ideal for standard 4-pair cables.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	30	40	\N	\N	5	5	\N	TOOL-STRIP	f	t	f	\N	\N	Compatibility: 2p; 4p; 6p; 8p; 10p; and Network Cabling\nFunctions: Stripper & Cutter\nMaterial: Carbon Steel	0	0	3	2026-06-22 01:16:51.601	2026-06-22 01:16:51.601	0	0	0	\N
7255b5bf-0caa-4cf2-be78-0affddac9065	Ubiquiti UniFi White UNAS 2.5Gbps Ethernet 2x 3.5" HDD bays	ubiquiti-unifi-white-unas-2-5gbps-ethernet-2x-3-5-hdd-bays	Ubiquiti's UNAS-2-W is a white UniFi Network Attached Storage device featuring 2x 3.5" HDD bays, 1x 2.5 Gbps Ethernet Port, USB-C connectivity, and an included PoE++ adapter, all in a compact footprint.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3895	5275	\N	\N	5	5	\N	UNAS-2-W	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 60W\nMax. Power Budget for Drives: 52W\nMounting: Desktop\nOperating System: UniFi Drive\nOperating Temperature: -5°C to 40°C\nPoE Input: 802.3bt\nPoE Output: None\nPower Input: 48V 60W PoE++ adapter (Included)\nProcessor: Quad-Core ARM® Cortex®-A55 at 1.7 GHz\nSerial Interface: 1x RJ45 Serial Port\nSFP Ports: None\nSupported Voltage Range: 802.3bt PoE\nSystem Memory: 4GB\nUSB Ports: 1x USB-C\n\nDimensions: 135 x 129 x 223.7 mm\nWeight: 1.3kg	0	0	3	2026-06-22 00:47:43.366	2026-06-22 01:15:18.676	0	0	0	\N
9eac4668-c31d-4d7e-a02e-7b05bd916c8b	Ubiquiti UniFi Mobile Industrial Router	ubiquiti-unifi-mobile-industrial-router	Ubiquiti's UMR-IND is a compact, IP66-ruggedised, and carrier-unlocked LTE Cat 4 mobile WiFi router with 2x Gigabit Ethernet ports designed for indoor and outdoor IoT applications. It features detachable long-range LTE antennas, site-to-site VPN and client VPN routing, GPS tracking, a nano SIM slot and can be powered by PoE+ (802.3at, 48-54V DC), USB Type-C (5V DC Included) or 4-pin ATX DC (9-30V DC).\n\n*Note: UMR-IND comes with a 30 day mobility cloud free trial and is available for purchase thereafter from UI. 4-pin ATX adapter not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3295	4475	\N	\N	5	5	\N	UMR-IND	f	t	f	\N	\N	Antenna Gain: LTE 2x External Antennas ; 2.4GHz: 1x External Antenna\nBeam-width: 360°\nData Rate: LTE: 150Mbps Downlink; 50Mbps Uplink 2.4GHz: 300Mbps\nEthernet Ports: 2x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 12.5W\nMounting: DIN-rail or Wall-Mount (Included)\nOperating System: UniFi\nOperating Temperature: -40°C to 70°C\nPoE Input: 802.3at\nPoE Output: 802.3af (Max 10W)\nPower Input: USB Type-C (5V DC/3A) (Included)\nSerial Interface: None\nSIM Slots: 1 (Nano SIM)\nSupported Voltage Range: PoE+(802.3at, 48-54V DC), USB Type-C (5V DC), 4-pin ATX DC (9-30V DC)\nUSB Ports: None\n\nDimensions: 217 x 94 x 32 mm\nWeight: 395g	0	0	3	2026-06-22 00:47:47.111	2026-06-22 01:15:22.29	0	0	0	\N
aa1da2b1-c1fd-45ce-9896-103f91904ae6	Ubiquiti UniFi Swiss Army Knife Ultra WiFi 5 AP	ubiquiti-unifi-swiss-army-knife-ultra-wifi-5-ap	Ubiquiti's UK-ULTRA is an indoor and outdoor, IPX6 WiFi 5 dual band access point with versatile mounting options and external antenna support via two RP SMA connectors. It is capable of reaching up to 1167Mbps aggregate over both 2.4GHz and 5GHz 2x2 MIMO radios.\n\nIt can be configured and managed with the UniFi Network Application.\n\n*Note: PoE injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1395	1895	\N	\N	5	5	\N	UK-ULTRA	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 6dBi ; 5.8GHz: 6dBi (2x RP-SMA for optional external antennas)\nBeam-width: 360°\nData Rate: 2.4GHz: 300Mbps ; 5.8GHz: 867Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8W\nMounting: Wall, Ceiling or Pole Mount\nOperating System: UniFi\nOperating Temperature: -40°C to 60°C\nPoE Input: 802.3af/at\nPoE Output: None\nPower Input: 802.3af/at PoE (44-57V)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44-57V\nUSB Ports: None\n\nDimensions: 137 x 84 x 34 mm\nWeight: 173g	0	0	3	2026-06-22 00:47:48.378	2026-06-22 01:15:24.024	0	0	0	\N
539195e4-c72d-4a3a-b31b-a4339512cb45	Ubiquiti UISP Router Pro 9 Port Gigabit 4SFP+	ubiquiti-uisp-router-pro-9-port-gigabit-4sfp	Ubiquiti's UISP-RPRO is a professional router featuring 9x Gigabit Ethernet ports, and 4x 10Gbps SFP+ ports. Its quad-core 1.7GHz processor is ideal for ISP applications and can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	7295	9875	\N	\N	5	5	\N	UISP-RPRO	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000 (LAN) ; 1x 10/100/1000 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 50W\nMounting: Desktop\nOperating System: UISP\nOperating Temperature: -10°C to 50°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cable (Included)\nProcessor: Quad-core ARM® Cortex®-A57 at 1.7 GHz\nSerial Interface: None\nSFP Ports: 4x 10Gbps\nSupported Voltage Range: 100-240V\nSystem Memory: 4 GB DDR4\nUSB Ports: None\n\nDimensions: 442.4 x 200 x 43.7 mm\nWeight: 3.3kg	0	0	3	2026-06-22 00:47:51.035	2026-06-22 01:15:25.79	0	0	0	\N
f27ad17c-ab47-497b-b26c-bc86c6bf395d	Ubiquiti UISP IPX6 Enclosure for UISP-R and UISP-S	ubiquiti-uisp-ipx6-enclosure-for-uisp-r-and-uisp-s	Ubiquiti's UISP-BOX is a Pole or wall-mountable, compact weatherproof enclosure for the UISP Router and UISP Switch.\n\n*Note: Power supply and transport cable not included. Connects to an existing UISP R/S power supply.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1095	1495	\N	\N	5	5	\N	UISP-BOX	f	t	f	\N	\N	Compatibility: UISP-R & UISP-S\nEnclosure material: UV-stabilized polycarbonate\nWind endurance: Up to 200 km/hr\nPole mount diameter: 35 to 60mm\n\nDimensions: 320 x 250 x 46.28mm\nWeight: 1.42 kg	0	0	3	2026-06-22 00:47:53.11	2026-06-22 01:15:28.658	0	0	0	\N
0416e6f2-5ccb-4589-a2ac-8d7ca4ffc194	Ubiquiti UniFi CyberSecure 1 Year Subscription	ubiquiti-unifi-cybersecure-1-year-subscription	Ubiquiti UniFi UI-CS1Y is an annual subscription license which significantly enhances protection capabilities on UniFi Gateway devices powered by Proofpoint and Cloudflare.\n\nExpanded IPS/IDS threat signatures to 55,000+\nWeekly signature updates\nReduced false positives on signatures\n50+ additional threat categories with targeted filtering options\nThis license is compatible with all UniFi Gateway models with the exception of the EFG.\n\nWe will send through your license key via email on completion of your purchase.\n\nFor more information, please refer to our blog: Ubiquiti UniFi CyberSecure.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1495	1725	\N	\N	5	5	\N	UI-CS1Y	f	t	f	\N	\N	More Information\nSKU\tUI-CS1Y\nBrand\tUbiquiti\nSupplier Code\tUI-CS1Y\nDownload\tN/A	0	0	3	2026-06-22 00:47:54.073	2026-06-22 01:15:29.59	0	0	0	\N
08c1effb-5fb4-4027-942d-fefd5a33b39a	U.FL to SMA Female Bulkhead	u-fl-to-sma-female-bulkhead	Scoop's UFL-SMAF can be used to allow external LTE antenna connections to our Mikrotik LTE Antenna (ANT-MLTE). The pigtail can also be used for a number of other RF applications.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	35	48	\N	\N	5	5	\N	UFL-SMAF	f	t	f	\N	\N	More Information\nSKU\tUFL-SMAF\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tN/A	0	0	3	2026-06-22 00:47:55.307	2026-06-22 01:15:30.646	0	0	0	\N
b503a967-f162-4850-b5b8-62a4f4909a54	Passive and 802.3af/at PoE Detector	passive-and-802-3af-at-poe-detector	Linkbasic's cable stripping tool is engineered to significantly speed up prep time for both coaxial and twisted-pair network cables before termination. It features a fully adjustable cutting blade designed to cleanly strip away outer cable jackets without nicking or damaging the internal conductors—making it ideal for standard 4-pair cables.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	65	95	\N	\N	5	5	\N	TOOL-POE	f	t	f	\N	\N	Compatibility: Passive PoE; 802.3af/at/bt; 568A/B; Reverse PoE\nLED Indicators: Mode A/B; Passive 24V; Passive 48/56V; 802.3af/at; Reverse PoE	0	0	3	2026-06-22 01:16:52.801	2026-06-22 01:16:52.801	0	0	0	\N
9a25f628-7e09-43f7-a2b9-1104d63b2b1a	Linkbasic UTP Krone Tool	linkbasic-utp-krone-tool	Linkbasic’s versatile Krone Tool streamlines network installations by terminating and trimming wires in a single punch. It is the ultimate, all-in-one solution for effortlessly adding, modifying, or removing Krone connections.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	35	48	\N	\N	5	5	\N	TOOL-KRONE	f	t	f	\N	\N	Compatibility: 110 Termination Blocks\nFunctions: Termination Tool	0	0	3	2026-06-22 01:16:54.131	2026-06-22 01:16:54.131	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
98c573c3-6c31-481f-b820-798372b8d357	Ubiquiti UISP Fiber WiFi GPON CPE with 4 Gigabit Ports	ubiquiti-uisp-fiber-wifi-gpon-cpe-with-4-gigabit-ports	Ubiquiti's UF-WIFI is a robust, high-performance GPON CPE. It features an LED display, 4x Gigabit Ethernet ports, 1x SC APC port and 2.4GHz WiFi connectivity. It provides powerful Layer 2/3 management features. The unit can be powered using 24V Passive PoE on Port 1, or by a 24V power supply.\n\nIt can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1250	1695	\N	\N	5	5	\N	UF-WIFI	f	t	f	\N	\N	Antenna Gain: 1dBi\nBeam-width: 360°\nData Rate: 300Mbps\nEthernet Ports: 4x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 7W\nMounting: Desktop\nOperating System: UFiber\nOperating Temperature: -10°C to 45°C\nPoE Input: 24V Passive PoE\nPoE Output: None\nPower Input: 24V 0.5A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 20V-28V\nUSB Ports: None\nOther: 1x 2.5/1.25Gbps SC APC GPON\n\nDimensions: 126.34 x 126.09 x 31.65mm\nWeight: 190g	0	0	3	2026-06-22 00:47:57.118	2026-06-22 01:15:32.432	0	0	0	\N
23669c9c-fa15-4ee6-898d-184c688a6935	Ubiquiti GPON C+ SC/UPC 20km SFP Module	ubiquiti-gpon-c-sc-upc-20km-sfp-module	Ubiquiti's UF-GPC module increases the capacity of your UFiber OLT and allows you to connect with your new customers quickly. The UFiber UF-GPC module is designed for use with the Ubiquiti UISP UFiber GPON OLT (UF-OLT-4).\n\nIt can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1395	1895	\N	\N	5	5	\N	UF-GPC	f	t	f	\N	\N	Connector: 1x SC/UPC\nData Rate: Downstream: 2.5Gbps; Upstream: 1.25Gbps\nForm Factor: SFP\nMode: Single Mode\nSupported Distance: 20km\nWavelength: 1490nm	0	0	3	2026-06-22 00:47:59.295	2026-06-22 01:15:34.285	0	0	0	\N
877ee7f3-9bb5-41b6-92f3-d51c8c20b4a0	Ubiquiti UniFi Dream Machine Pro Max 8 Port Gigabit 1x2.5G 2SFP+	ubiquiti-unifi-dream-machine-pro-max-8-port-gigabit-1x2-5g-2sfp	Ubiquiti's UDM-PRO-MAX is an all-in-one enterprise-grade UniFi OS Console. It supports the full UniFi application suite and features an advanced security gateway with dual-WAN ports (2.5Gbps Ethernet & SFP+), 8 port Gigabit switch, a 10G SFP+ LAN Port and 2x 3.5" HDD Bays for NVR Storage (2.5" HDD also supported). It features a 1.3" LCM (Liquid Crystal Monitor) colour touchscreen to display key system and connection information.\n\n*Note: Hard drives not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	10395	14075	\N	\N	5	5	\N	UDM-PRO-MAX	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000 (LAN) ; 1x 10/100/1000/2500 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 100W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included); 1x RPS DC Input\nProcessor: 2.0GHz Arm Cortex-A57 Quad-Core\nSerial Interface: None\nSFP Ports: 2x 10Gbps (1xLAN 1xWAN)\nSupported Voltage Range: 100V-240V\nSystem Memory: 8 GB DDR4\nUSB Ports: None\n\nDimensions: 442.4 x 43.7 x 285.6 mm\nWeight: 4.7kg	0	0	3	2026-06-22 00:48:01.278	2026-06-22 01:15:36.013	0	0	0	\N
3a2c9a58-45a8-4b54-b95f-7a7a7a6c9ca7	Ubiquiti UniFi Device Bridge WiFi 7 Switch 35W 7x 2.5G PoE 1x 10G PoE	ubiquiti-unifi-device-bridge-wifi-7-switch-35w-7x-2-5g-poe-1x-10g-poe	Ubiquiti's UDB-SWITCH is a compact UniFi Device Bridge PoE Switch, featuring WiFi 7, 7x 2.5Gbps PoE+ ports and 1x 10Gbps PoE+ port. It provides 35W of PoE power with the included 60W adapter or 185W with the UACC-PSU-210W.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4995	6775	\N	\N	5	5	\N	UDB-SWITCH	f	t	f	\N	\N	Antenna Gain: 5GHz: 8dBi ; 6GHz: 8dBi\nBeam-width: 360°\nData Rate: 5GHz: 4.3Gbps ; 6GHz: 5.8Gbps\nEthernet Ports: 7x 10/100/1000/2500; 1x 10/100/1000/10000\nHardware Button: Reset\nMax. Power Consumption: 25W\nMounting: Desktop or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at on Ports 1~8\nPower Input: 54V 1.1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5–57V DC\nUSB Ports: None\n\nDimensions: 212.9 x 113 x 32.5 mm\nWeight: 548g	0	0	3	2026-06-22 00:48:03.441	2026-06-22 01:15:37.675	0	0	0	\N
4a778adf-534e-4768-b561-f1ce9588557b	Ubiquiti UniFi Device Bridge Pro 5GHz 17dBi 90° Sector	ubiquiti-unifi-device-bridge-pro-5ghz-17dbi-90-sector	Ubiquiti's UDB-PRO-SEC is a UniFi 5GHz, 17dBi point-to-multipoint, 90° integrated sector which can connect up to 40+ UDB-PRO devices at distances of up to 5km. It features an outdoor IPX6 rating, 2 spatial streams, and up to 400Mbps throughput on its 5GHz radio. It can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3695	4995	\N	\N	5	5	\N	UDB-PRO-SEC	f	t	f	\N	\N	Antenna Gain: 5.8GHz: 17dBi\nBeam-width: 90°\nData Rate: 5.8GHz: 400Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 6W\nMounting: Pole-Mount\nOperating System: UniFi\nOperating Temperature: -40°C to 60°C\nPoE Input: 802.3af/at\nPoE Output: None\nPower Input: 802.3af/at PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5–57V DC\nUSB Ports: None\n\nDimensions: 360.9 x 129.6 x 71.4 mm\nWeight: 835g	0	0	3	2026-06-22 00:48:04.424	2026-06-22 01:15:38.678	0	0	0	\N
63cbe2fd-0220-4a05-a9bc-a8cb73dfd6c6	Ubiquiti UniFi Device Bridge Pro with PoE Input and PoE Output	ubiquiti-unifi-device-bridge-pro-with-poe-input-and-poe-output	Ubiquiti's UDB-PRO is a UniFi long range outdoor radio with integrated UniFi WiFi Auto-Link. It features 2x Gigabit Ethernet ports, one for PoE input and the other with PoE output. PoE+ (802.3at) input is required for PoE passthrough on port 2. The UDB-PRO is sold as a single unit, and can be bridged to any UniFi Access point or used as a pair for PtP connections. It can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3595	4875	\N	\N	5	5	\N	UDB-PRO	f	t	f	\N	\N	Antenna Gain: 5.8GHz: 19dBi\nBeam-width: 12°\nData Rate: 5.8GHz: 867Mbps\nEthernet Ports: 2x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 9W\nMounting: Pole-Mount\nOperating System: UniFi\nOperating Temperature: -40°C to 60°C\nPoE Input: 802.3af/at\nPoE Output: 48V PoE Passthrough when powered with PoE+ (802.3at)\nPower Input: 48V 0.32 Gigabit PoE Injector (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5–57V DC\nUSB Ports: None\n\nDimensions: Ø189.5 x 64.3 mm\nWeight: 515g	0	0	3	2026-06-22 00:48:05.453	2026-06-22 01:15:39.736	0	0	0	\N
11e5d88f-865f-4092-822b-59fd5e333247	Ubiquiti 10G Multi-WAN UniFi Cloud Gateway Fiber with M.2 SSD Tray	ubiquiti-10g-multi-wan-unifi-cloud-gateway-fiber-with-m-2-ssd-tray	Ubiquiti's UCG-FIBER-TRAY is a desktop 10Gbps dual-WAN UniFi Cloud Gateway with selectable NVR storage via SSD up to 2TB and an included M.2 SSD Tray. The unit runs the complete UniFi application suite for full-stack network management and features 1x 10Gbps WAN port, 4x 2.5Gbps LAN Ports, one with 802.3at (PoE+) PoE output, as well as 2x SFP+ ports.\n\nIt can be configured and managed with the UniFi Network Application.\n\n*Note: This version of the UCG-FIBER includes an M.2 SSD Tray. SSD not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5325	7195	\N	\N	5	5	\N	UCG-FIBER-TRAY	f	t	f	\N	\N	Ethernet Ports: 4x 10/100/1000/2500 (LAN); 1x 10/100/1000/10000 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 29.4W\nMounting: Desktop\nOperating System: UniFi OS\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3at (PoE+) on Port 4\nPower Input: 54V 1.1A Power Adapter (Included)\nProcessor: Quad-core ARM® Cortex®-A73 at 2.2 GHz\nSerial Interface: None\nSFP Ports: 2 x SFP+ (1x WAN; 1 x LAN)\nSupported Voltage Range: 50-57V\nSystem Memory: 3GB\nUSB Ports: None\n\nDimensions: 212.8 x 127.6 x 30 mm\nWeight: 675g	0	0	3	2026-06-22 00:48:12.336	2026-06-22 01:15:44.655	0	0	0	\N
3ce85696-4739-4cbe-90ed-e25155cb0dcc	Ubiquiti 10G Multi-WAN UniFi Cloud Gateway Fiber without M.2 SSD Tray	ubiquiti-10g-multi-wan-unifi-cloud-gateway-fiber-without-m-2-ssd-tray	Ubiquiti's UCG-FIBER is a desktop 10Gbps dual WAN, UniFi cloud gateway with selectable NVR storage via SSD up to 2TB. The unit runs the complete UniFi application suite for full stack network management and features 1x 10Gbps WAN port, 4x 2.5Gbps LAN Ports, one with 802.3at (PoE+) PoE output, as well as 2 x SFP+ ports.\n\nIt can be configured and managed with the UniFi Network Application.\n\nNote: NVMe SSD not included. SSD installation requires UACC-SSD-TRAY accessory. Alternatively purchase the UCG-FIBER-TRAY.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4850	6575	\N	\N	5	5	\N	UCG-FIBER	f	t	f	\N	\N	Ethernet Ports: 4x 10/100/1000/2500 (LAN); 1x 10/100/1000/10000 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 29.4W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3at (PoE+) on Port 4\nPower Input: 54V 1.1A Power Adapter (Included)\nProcessor: Quad-core ARM® Cortex®-A73 at 2.2 GHz\nSerial Interface: None\nSFP Ports: 2 x SFP+ (1x WAN ; 1 x LAN)\nSupported Voltage Range: 50-57V\nSystem Memory: 3GB\nUSB Ports: None\n\nDimensions: 212.8 x 127.6 x 30 mm\nWeight: 675g	0	0	3	2026-06-22 00:48:13.651	2026-06-22 01:15:47.068	0	0	0	\N
32c33dbd-2000-43ae-87b1-a8ace9aa0c3f	Ubiquiti UniFi Dual Band WiFi 6 HDMI Display Cast Lite	ubiquiti-unifi-dual-band-wifi-6-hdmi-display-cast-lite	Ubiquiti's UC-CAST-LITE is a digital signage player designed for media playback on HDMI displays. It is powered by the included USB-C adapter and has a single HDMI output. It features Dual-Band WiFi for seamless integration with UniFi Access points.\n\nThis product is managed and configured using the UniFi Connect application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3075	4195	\N	\N	5	5	\N	UC-CAST-LITE	f	t	f	\N	\N	Buttons: Reset\nConnectivity: 2.4GHz (20/40 MHz) ; 5GHz (20/40/80 MHz)\nDisplay Output: HDMI\nMax. Power Consumption: 5W\nOperating Temperature: 0 to 40°C\nPower Input: USB-C 5V 1A Power Supply (Included)\nProcessor: Quad-Core Arm® Cortex®-A55, 1.9 GHz\n\nDimensions: 92.1 x 56.3 x 40.8 mm\nWeight: 180g	0	0	3	2026-06-22 00:48:15.006	2026-06-22 01:15:48.238	0	0	0	\N
acae9831-050a-4ba6-b5b0-6c9cfc7d23f2	U-Bolt 50mm Mild Steel	u-bolt-50mm-mild-steel	Scoop's UBOLT is a 50mm mild steel U-Bolt.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	9.5	13	\N	\N	5	5	\N	UBOLT	f	t	f	\N	\N	More Information\nSKU\tUBOLT\nBrand\tLocally Sourced\nDownload\tN/A\nSpecifications\tN/A	0	0	3	2026-06-22 00:48:16.58	2026-06-22 01:15:49.285	0	0	0	\N
42bc9667-7530-4092-8f32-bd44f00b9564	Ubiquiti Universal Antenna Mount	ubiquiti-universal-antenna-mount	Ubiquiti's UB-AM universal arm bracket is a versatile, robust solution designed for wall or pole mounting.\n\n*Note: The UB-AM does not include screws for wall mounting. Please order separately.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	125	175	\N	\N	5	5	\N	UB-AM	f	t	f	\N	\N	SKU\tUB-AM\nBrand\tUbiquiti\nSupplier Code\tUB-AM	0	0	3	2026-06-22 00:48:19.069	2026-06-22 01:15:51.181	0	0	0	\N
e003bc2d-cb44-4050-af51-9ee87f783909	Ubiquiti USB-C Cable with Charge Display Black	ubiquiti-usb-c-cable-with-charge-display-black	Ubiquiti's UACC-USB1M-B is a braided power and data cable with a double-sided charge display. It features a durable braided cable design with an integrated power meter, 100W max power output and 480Mbps maximum data transfer rate (0.3 - 2m only).	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	525	715	\N	\N	5	5	\N	UACC-USB1M-B	f	t	f	\N	\N	Cable Length: 1M\nConductor Type: Stranded tinned copper\nConnector: USB Type-C\nOperating Temperature: -20°C to 60°C\nPower Output: Max. 100W PD	0	0	3	2026-06-22 00:48:21.225	2026-06-22 01:15:53.386	0	0	0	\N
d3999541-674a-4edd-85e2-2c2d6e92563b	Ubiquiti UniFi Panel Antenna for Swiss Army Knife Ultra	ubiquiti-unifi-panel-antenna-for-swiss-army-knife-ultra	Ubiquiti's UACC-UKPA is an IPx6, clip-on external antenna for the Swiss Army Knife (UK-ULTRA) that provides extended 90-degree directional coverage.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	695	950	\N	\N	5	5	\N	UACC-UKPA	f	t	f	\N	\N	SKU\tUACC-UKPA\nBrand\tUbiquiti\nSupplier Code\tUACC-UK-Ultra-Panel-Antenna\nAntenna Gain: 2.4GHz: 10dBi ; 5.8GHz: 15dBi\nBeam-width: 90°\nConnector: 2x RP SMA Female\nWind Loading: 75 N at 200 km/h\n\nDimensions: 138 x 207 x 43 mm\nWeight: 450g	0	0	3	2026-06-22 00:48:22.327	2026-06-22 01:15:54.429	0	0	0	\N
eb20c6b0-e559-4c9d-854d-1beba19f6d6f	Ubiquiti UISP Power TransPort Cable 50M	ubiquiti-uisp-power-transport-cable-50m	Ubiquiti's UACC-TPC-50M is a 50m UISP Power Transport Cable for use between the UISP-BOX and the included power supply of the UISP-R or UISP-S.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3495	4730	\N	\N	5	5	\N	UACC-TPC-50M	f	t	f	\N	\N	Connector: Power TransPort\nFlame rating: VW-1\nConductor wire gauge: 12 AWG\nConductor type: Tin stranded copper\nJacket material: Thermoplastic elastomer\nJacket diameter: 11 x 6.5 mm\nOperating temperature: -40 to 80°C\nCable Length: 50m	0	0	3	2026-06-22 00:48:23.235	2026-06-22 01:15:56.782	0	0	0	\N
2bc879e6-9b12-4ad9-9dad-52234a5407cb	Ubiquiti UISP Power TransPort Cable 30M	ubiquiti-uisp-power-transport-cable-30m	Ubiquiti's UACC-TPC-30M is a 30m UISP Power Transport Cable for use between the UISP-BOX and the included power supply of the UISP-R or UISP-S.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2075	2815	\N	\N	5	5	\N	UACC-TPC-30M	f	t	f	\N	\N	Connector: Power TransPort\nFlame rating: VW-1\nConductor wire gauge: 12 AWG\nConductor type: Tin stranded copper\nJacket material: Thermoplastic elastomer\nJacket diameter: 11 x 6.5 mm\nOperating temperature: -40 to 80°C\nCable Length: 30m	0	0	3	2026-06-22 00:48:24.087	2026-06-22 01:15:57.642	0	0	0	\N
bdd9a983-08c0-42e9-b0e6-b284ededb7ea	Cable Ties T18R 100 x 2.5mm	cable-ties-t18r-100-x-2-5mm	Crafted from durable Nylon 66, Scoop’s T18R cable ties combine reliable tensile strength with a low-insertion force design for fast, effortless tightening. They provide a highly efficient bundling solution for miniature cable management and precise organizing tasks.\n\nPack Size: Supplied in convenient packs of 100 units.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8	11.5	\N	\N	5	5	\N	T18R	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:17.132	2026-06-22 01:17:17.132	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
58912b3d-6ac3-4c2c-b5b3-a9321647303b	Ubiquiti Single Mode 10G LC SFP+  1310nm 10km	ubiquiti-single-mode-10g-lc-sfp-1310nm-10km	Ubiquiti's UACC-SM10G allows for long-distance, single-mode fibre connections. It can deliver up to 10Gbps speeds at distances of up to 10km.\n\n*Note: The price reflected is for a pair (one box of 2 units). This product is only sold as a pair and no single units are available.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1595	2145	\N	\N	5	5	\N	UACC-SM10G	f	t	f	\N	\N	Connector: 2x LC\nData Rate: 10Gbps\nForm Factor: SFP\nMode: Single Mode\nSupported Distance: 10km\nWavelength: 1310nm	0	0	3	2026-06-22 00:48:29.568	2026-06-22 01:16:02.391	0	0	0	\N
138f14a7-9d34-490d-8e48-6f6ba610e4c5	Ubiquiti 1.25G SFP to RJ45 Gigabit Ethernet Module	ubiquiti-1-25g-sfp-to-rj45-gigabit-ethernet-module	Ubiquiti's UACC-RJ451G enables you to convert unused SFP+ Ports to 1G Ethernet RJ45 Ports.\n\n*Note: The UACC-RJ451G module is not compatible with MikroTik devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	315	450	\N	\N	5	5	\N	UACC-RJ451G	f	t	f	\N	\N	Connector: RJ45\nData Rate: 1.25Gbps\nForm Factor: SFP\nMode: Copper\nSupported Distance: 100m\nWavelength: None	0	0	3	2026-06-22 00:48:30.709	2026-06-22 01:16:03.465	0	0	0	\N
27d97f60-bb9f-42bd-a574-4f45f823e301	Ubiquiti RJ45 Dust Cover 24-Pack	ubiquiti-rj45-dust-cover-24-pack	Ubiquiti's UACC-RJ45-COVER is a protective insert that keeps dust and debris out of unused RJ45 ports. They are easy to install and remove and are supplied in a pack of 24.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	350	475	\N	\N	5	5	\N	UACC-RJ45-COVER	f	t	f	\N	\N	Material: Polycarbonate\nTreatment: Painting\n\nDimensions: 15.8 x 13.8 x 10.6 mm\nWeight: 0.6g	0	0	3	2026-06-22 00:48:31.785	2026-06-22 01:16:04.537	0	0	0	\N
3ae24105-2c48-4d1a-9bb0-978d692ef9e3	Ubiquiti 54V 210W AC Power Supply	ubiquiti-54v-210w-ac-power-supply	Ubiquiti's UACC-PSU-210W is a wall mountable AC power adapter which delivers 210W at 54V DC, ideal for powering PoE Switches.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1475	1995	\N	\N	5	5	\N	UACC-PSU-210W	f	t	f	\N	\N	Compatibility: USW-ULTRA, USW-U60, USW-PRO-MAX16P\nConnector: IEC\nDC plug: 5.5 x 2.1 x 11.5 mm\nDC cable: UL11353 16AWG 1.5 m\nVoltage: 54V\nWattage: 210W\n\nDimensions: 190 x 86 x 26 mm\nWeight: 2kg	0	0	3	2026-06-22 00:48:32.815	2026-06-22 01:16:05.517	0	0	0	\N
c6c1067b-2b0a-4476-872c-8b741a260b6b	Ubiquiti Access Point Pro Arm Mount for UniFi Pro AP's	ubiquiti-access-point-pro-arm-mount-for-unifi-pro-ap-s	Ubiquiti's UACC-PM is an easy-to-install wall mount bracket for the U7-PRO or  U6-PRO.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	450	595	\N	\N	5	5	\N	UACC-PM	f	t	f	\N	\N	Dimensions: 174 x 189 x 30 mm\nWeight: 136g	0	0	3	2026-06-22 00:48:33.918	2026-06-22 01:16:06.592	0	0	0	\N
44ee0af1-8ed2-431f-a280-29c119a75f8d	Ubiquiti Multi Mode 1.25G LC SFP 850nm 550m	ubiquiti-multi-mode-1-25g-lc-sfp-850nm-550m	Ubiquiti's UACC-MM1G allows for multi-mode fibre connections delivering up to 1.25Gbps speeds at distances of up to 550m.\n\n*Note: The price reflected is for a pair (one box of 2 units). This product is only sold as a pair and no single units are available.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	315	430	\N	\N	5	5	\N	UACC-MM1G	f	t	f	\N	\N	Connector: 2x LC\nData Rate: 1.25Gbps\nForm Factor: SFP\nMode: Multi Mode\nSupported Distance: 550m\nWavelength: 850nm	0	0	3	2026-06-22 00:48:35.051	2026-06-22 01:16:07.657	0	0	0	\N
3f08b152-03f0-466b-bc8d-5d125b9dbb16	Ubiquiti Multi Mode 10G LC SFP+ 850nm 300m	ubiquiti-multi-mode-10g-lc-sfp-850nm-300m	Ubiquiti's UACC-MM10G allows for multi-mode fibre connections delivering up to 10Gbps speeds at distances of up to 300m.\n\n*Note: The price reflected is for a pair (one box of 2 units). This product is only sold as a pair and no single units are available.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	725	995	\N	\N	5	5	\N	UACC-MM10G	f	t	f	\N	\N	Connector: 2x LC\nData Rate: 10Gbps\nForm Factor: SFP\nMode: Multi Mode\nSupported Distance: 300m\nWavelength: 850nm	0	0	3	2026-06-22 00:48:36.342	2026-06-22 01:16:08.538	0	0	0	\N
04d1b696-63a1-4c80-91b1-d7cf5545806f	Ubiquiti UniFi Protect G4/G6 Instant PoE to USB-C Cable 4.5M	ubiquiti-unifi-protect-g4-g6-instant-poe-to-usb-c-cable-4-5m	Ubiquiti's UACC-INS-4.5M is a 4.5 metre USB-C cable that connects the UVC-G4INS and UVC-G6INS-W to a POE-USBC adapter.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	625	850	\N	\N	5	5	\N	UACC-INS-4.5M	f	t	f	\N	\N	Cable length: 4.5m\nCable Color: White\nOperating Temperature: -20°C to 60°C\nShielding: Shielded twisted pair (STP)\n\nWeight: 117g	0	0	3	2026-06-22 00:48:38.99	2026-06-22 01:16:10.573	0	0	0	\N
7e509b2c-b686-4f50-a33b-1e1e59e668b2	Ubiquiti Standard 3.5" SATA 4TB Hard Drive	ubiquiti-standard-3-5-sata-4tb-hard-drive	Ubiquiti's UACC-HDD4S is a standard grade 3.5" 4TB SATA hard drive, optimised for small-scale UniFi Protect camera deployments and NVR storage.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2275	3075	\N	\N	5	5	\N	UACC-HDD4S	f	t	f	\N	\N	Capacity: 4TB\nHard Disk Form Factor: 3.5-inch\nMean Time Between Failure (MTBF): 1,000,000 h\nManagement Interface: SATA 6Gb/s\nOperating Temperature: 0 to 65°C\nPower Method: 5V/12V input\nRotation Speed: 5400 RPM\nWorkload Rating: 180 TB/year\n\nDimensions: 147 x 101.6 x 26.1 mm\nWeight: 570g	0	0	3	2026-06-22 00:48:40.015	2026-06-22 01:16:11.523	0	0	0	\N
61d126b4-4f8e-41b3-9e69-8f441fe25ea9	Ubiquiti UniFi Protect G6 PTZ White In-Ceiling Mount	ubiquiti-unifi-protect-g6-ptz-white-in-ceiling-mount	Ubiquiti's UACC-G6PTZ-ICMW is a weatherproof in-ceiling mount accessory for UVC-G6PTZ-W.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	675	925	\N	\N	5	5	\N	UACC-G6PTZ-ICMW	f	t	f	\N	\N	Compatibility: UVC-G6-PTZ\n\nDimensions: ⌀151 x 140.6 mm\nWeight: 259g	0	0	3	2026-06-22 00:48:41.988	2026-06-22 01:16:12.717	0	0	0	\N
4a4b14d0-050d-48a8-99d5-5c3eaf67669a	Ubiquiti UniFi Protect G5/G6 White PTZ Corner Mount	ubiquiti-unifi-protect-g5-g6-white-ptz-corner-mount	Ubiquiti's UVC-G5PTZ-CMW is a white corner mount accessory for UVC-G5PTZ-B, UVC-G5PTZ-W, UVC-G6PTZ-W and UVC-G6PTZ-B cameras.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	350	475	\N	\N	5	5	\N	UACC-G5PTZ-CMW	f	t	f	\N	\N	Compatibility: UVC-G5PTZ-B, UVC-G5PTZ-W, UVC-G6PTZ-W and UVC-G6PTZ-B\nEnclosure Material: Polycarbonate\nMounting Material: Stainless steel\n\nDimensions: 91.1 x 42.2 x 48.2mm\nWeight: 74g	0	0	3	2026-06-22 00:48:43.025	2026-06-22 01:16:13.6	0	0	0	\N
044f199b-1201-4cfa-84a5-0561b8b8b269	Ubiquiti UniFi 10Gbps Direct Attach 0.5M Cable	ubiquiti-unifi-10gbps-direct-attach-0-5m-cable	Ubiquiti's UACC-DAC-0.5M is a SFP+ direct attach cable with a 1.25Gbps/10Gbps maximum data rate, compatible with both SFP and SFP+ connections.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	275	375	\N	\N	5	5	\N	UACC-DAC-0.5M	f	t	f	\N	\N	Cable Length: 0.5M\nConnectors: 2x SFP+ Modules\nData Rate: 1.25Gbps / 10Gbps\nForm Factor: SFP\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 00:48:44.416	2026-06-22 01:16:14.639	0	0	0	\N
6dd364d8-3249-4e12-a82c-83cc51975a7b	Ubiquiti UniFi Access Rescue Manual Key Switch	ubiquiti-unifi-access-rescue-manual-key-switch	Ubiquiti's UA-RESCUE is a single pole, dual throw, manual KeySwitch designed to work with the UniFi Access system. In the event of a system malfunction, the UA-Rescue KeySwitch allows a user to manually unlock any door controlled by the UniFi Access Hub. The key is compatible with both Fail Safe and Fail Secure lock systems.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	895	1215	\N	\N	5	5	\N	UA-RESCUE	f	t	f	\N	\N	Key Switch: Brass internal wave key, 28VDC, 4A\nOperating Temperature: -30° to 65° C\nTerminal block: COM/NO/NC - 18-24 AWG\n\nDimensions: Ø60 x 74 mm\nWeight: 94g	0	0	3	2026-06-22 00:48:48.646	2026-06-22 01:16:17.809	0	0	0	\N
35ce684f-a511-4e9f-819c-0602722e929b	Ubiquiti UniFi Access Door Hub 4x Input, 4x Relay	ubiquiti-unifi-access-door-hub-4x-input-4x-relay	Ubiquiti's UA-HUB-DOOR is a compact, indoor, access control hub which provides access control for a single door. It features 1x 802.3at PoE input and 4x Gigabit Ethernet Ports with PoE out. The hub also has 4x input terminals (2x door exit requests, 1x door position and 1x emergency), all of which can be unlocked using an NFC card or UniFi Identity Endpoint Mobile App.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3495	4775	\N	\N	5	5	\N	UA-HUB-DOOR	f	t	f	\N	\N	Button: Reset; Dry/Wet Switch\nBluetooth: None\nInput Terminals: 2x Door Exit Request ; 1x Door Position ; 1x Emergency\nEthernet Ports: 5x 10/100/1000\nDry Output Relay: Lock: 30V DC, 1A ; Aux: 30V DC, 1A\nWet Output Relay: Lock: 12V DC, 1A ; Aux: 12V DC, 0.33A ; 12V DC, 0.33A\nMounting: DIN-rail (Included)\nOperating Temperature: 0 to 40° C\nMax Power Consumption: 30W\nPower Input: 802.3bt (PoE++)(Not Included)\nPoE Output: 802.3af\n\nDimensions: 174.9 x 126 x 32.9 mm\nWeight: 363g	0	0	3	2026-06-22 00:48:50.855	2026-06-22 01:16:20.6	0	0	0	\N
ed7f163c-1d07-4762-9e2c-365cf8ae8488	Ubiquiti UniFi Access G3 Starter Kit Pro with Hub & 2x Readers	ubiquiti-unifi-access-g3-starter-kit-pro-with-hub-2x-readers	Ubiquiti's UA-G3SK-PRO starter kit includes a Door Hub, an IP55 G3 Reader Pro with integrated camera, an IP55 G3 Reader, and 2x Pocket Keyfobs. This starter kit provides complete entry and exit control for a single door and includes Touch Pass support, for which users will receive 10 free Touch Passes in the first year; thereafter, passes are billed annually per user. The kit can be configured and managed with the UniFi Access Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	9195	12450	\N	\N	5	5	\N	UA-G3SK-PRO	f	t	f	\N	\N	Door Hub\nButton: Reset\nTerminal Input: 2x Door exit request; 1x Door position ; 1x Emergency\nEthernet Ports: 5x 10/100/1000\nLock Terminals: 1x 12V 1A\nMounting: DIN-rail (Included)\nOperating Temperature: 0°C to 40°C\nMax Power Consumption: 30W\nPoE Input: PoE++ (50V DC, 1A)\nPoE Output: 4x 802.3af\nPower Input: PoE++ ; UL 294 Power-limited Class 2 PSU ; UL 60950-1/62368-1 LPS/PS2 PSU\nSupported Doors: 1\n\nDimensions: 174.9 x 126 x 32.9 mm\nWeight: 363g\n\nG3 Reader Pro\nButton: Reset\nConnectivity: BLE 4.2 or NFC\nEthernet Ports: 1x 10/100/1000\nMounting: Wall-Mount & Gang-box (Included); Angle mount, junction box (Optional)\nOperating Temperature: Device: -30°C to 45°C; Display: -10°C to 45°C\nMax Power Consumption: 6W\nPower Input: PoE (802.3af, Not Included), UL 294 Power-limited Class 2 PSU, UL 60950-1/62368-1 LPS/PS2 PSU\nSupported Voltage: 48V\n\nDimensions: 160 x 40.4 x 40.55 mm\nWeight: 136g\n\nG3 Reader\nButton: Reset\nConnectivity: BLE 4.1 or NFC\nEthernet Ports: 1x 10/100\nMounting: Wall, gang-box mount (Included)\nOperating Temperature: Device: -30°C to 45°C\nMax Power Consumption: 5W\nPower Input: PoE (802.3af, Not Included), UL 294 Power-limited Class 2 PSU, UL 60950-1/62368-1 LPS/PS2 PSU\nSupported Voltage: 48V\n\nDimensions: 93 x 40 x 36.5 mm\nWeight: 82g	0	0	3	2026-06-22 00:48:52.821	2026-06-22 01:16:22.522	0	0	0	\N
1cfe0aff-2388-429f-8ae9-c21a540b8c67	Ubiquiti UniFi Access Reader Flex White	ubiquiti-unifi-access-reader-flex-white	The Ubiquiti UA-G3FLEX-W is an IP55-rated NFC card reader featuring a keypad and Touch Pass support, for which users will receive 10 free Touch Passes in the first year, thereafter, passes are billed annually per user. Powered via PoE, it's designed for seamless integration with UniFi Access Hubs.\n\nNote: This device needs to be paired with a UniFi Access Hub	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3125	4225	\N	\N	5	5	\N	UA-G3FLEX-W	f	t	f	\N	\N	Button: Reset\nConnectivity: BLE 4.1 or NFC\nEthernet Ports: 1x 10/100\nMounting: Wall-Mount (Included) ; Gang-box, junction box (Optional)\nOperating Temperature: -30 to 60° C\nMax Power Consumption: 5W\nPower Input: PoE (Not Included), UL 294 Power-limited Class 2 PSU; UL 60950-1/62368-1 LPS/PS2 PSU\n\nDimensions: 84 x 84 x 40.8 mm\nWeight: 165g	0	0	3	2026-06-22 00:48:54.983	2026-06-22 01:16:25.199	0	0	0	\N
8f369e56-32a4-4b09-98d8-38f46576de2f	Ubiquiti UniFi Access Reader Flex Black	ubiquiti-unifi-access-reader-flex-black	Elevate your security with the Ubiquiti UA-G3FLEX-B, a sleek black, weather-resistant (IP55) NFC card reader and integrated keypad featuring Touch Pass authentication. Power over Ethernet (PoE) simplifies installation, allowing the reader to tie right into your UniFi Access Hub ecosystem. To get you started, enjoy 10 complimentary Touch Passes for the first year, transitioning to an annual, per-user subscription model thereafter.\n\n*Deployment Notice: This device is not standalone and must be paired with a UniFi Access Hub	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3125	4225	\N	\N	5	5	\N	UA-G3FLEX-B	f	t	f	\N	\N	Button: Reset\nConnectivity: BLE 4.1 or NFC\nEthernet Ports: 1x 10/100\nMounting: Wall-Mount (Included); Gang-box, junction box (Optional)\nOperating Temperature: -30°C to 60°C\nMax Power Consumption: 5W\nPower Input: PoE (Not Included), UL 294 Power-limited Class 2 PSU; UL 60950-1/62368-1 LPS/PS2 PSU\n\nDimensions: 84 x 84 x 40.8 mm\nWeight: 165g	0	0	3	2026-06-22 00:48:56.032	2026-06-22 01:16:26.387	0	0	0	\N
0c0496f0-7871-4ec8-bf4f-b12ad8e6b91b	Ubiquiti UniFi Access Reader	ubiquiti-unifi-access-reader	The Ubiquiti U7-PRO-XGS-W is a white, 8-stream WiFi 7 access point with a 10Gbps Ethernet port, built for interference-free performance in demanding spaces. It delivers a 15Gbps aggregate data rate across three bands—6GHz ($2\\times2$), 5GHz ($4\\times4$), and 2.4GHz ($2\\times2$) MU-MIMO—and integrates with the UniFi Network Application.\nNote: Runs on PoE++ power; injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2395	3250	\N	\N	5	5	\N	UA-G3-W	f	t	f	\N	\N	Button: Reset\nConnectivity: BLE 4.1 or NFC\nEthernet Ports: 1x 10/100\nMounting: In-wall, Gang Box\nOperating Temperature: -30 to 45° C\nMax Power Consumption: 5W\nPower Input: PoE (Not Included), UL 294 Power-limited Class 2 PSU, UL 60950-1/62368-1 LPS/PS2 PSU\n\nDimensions: 93 x 40 x 36.5 mm\nWeight: 82g	0	0	3	2026-06-22 00:48:57.054	2026-06-22 01:16:27.573	0	0	0	\N
75a695e6-c4a2-4f43-a47d-424ce37a8041	Ubiquiti UniFi WiFi 7 Tri Band Pro XG 10G In-Wall AP	ubiquiti-unifi-wifi-7-tri-band-pro-xg-10g-in-wall-ap	The Ubiquiti U7-PRO-XG-IW is a wall-mounted, Tri-Band WiFi 7 access point featuring 6 spatial streams and a 10Gbps uplink port. It offers impressive aggregate data rates across three bands: up to 5.8Gbps on 6GHz, 4.3Gbps on 5GHz, and 688Mbps on 2.4GHz (all utilizing 2x2 MU-MIMO). The device is fully compatible with the UniFi Network Application for easy configuration and management.\n\n*Note: Power delivery requires a separate PoE injector (not included).	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4775	6495	\N	\N	5	5	\N	U7-PRO-XG-IW	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5GHz: 6dBi; 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 4.3Gbps; 6GHz: 5.8Gbps\nEthernet Ports: 1x 100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 22W\nMounting: Wall-Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3af/at\nPoE Output: None\nPower Input: 802.3at\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: 155 x 108 x 33.5 mm\nWeight: 505 g	0	0	3	2026-06-22 00:49:02.802	2026-06-22 01:16:31.492	0	0	0	\N
a9ff5273-ce2d-41e8-95c5-799dcc89d1cc	Ubiquiti UniFi WiFi 7 Outdoor Pro Dual Band AP	ubiquiti-unifi-wifi-7-outdoor-pro-dual-band-ap	The Ubiquiti U7-PRO-OUT is an IP67-rated, weatherproof outdoor WiFi 7 access point featuring 4 spatial streams and a 2.5Gbps Ethernet port. Built to withstand harsh environments, it includes two external antennas and versatile hardware for seamless wall or pole mounting. The AP delivers a combined data rate of up to 5Gbps across its 5GHz and 2.4GHz bands (both utilizing 2x2 MU-MIMO). Centralized configuration and monitoring are fully supported through the UniFi Network Application.\n\n*Note: A separate PoE injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4825	6525	\N	\N	5	5	\N	U7-PRO-OUT	f	t	f	\N	\N	Antenna Gain: 2.4GHz: Internal: 8 dBi External: 6 dBi; 5GHz: Internal: 11 dBi External: 8 dBi\nBeam-width: 2.4GHz: 90° ; 5GHz: 45°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 4.3Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 21W\nMounting: Wall or Pole Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3at (PoE+) or Passive PoE\nPoE Output: None\nPower Input: 802.3at (PoE+) or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: 170 x 208 x 66.5 mm\nWeight: 1.2kg	0	0	3	2026-06-22 00:49:04.907	2026-06-22 01:16:33.235	0	0	0	\N
823ea16c-8905-4bbe-afb0-5a14973ba810	Ubiquiti UniFi WiFi 7 Tri-Band Pro In-Wall AP	ubiquiti-unifi-wifi-7-tri-band-pro-in-wall-ap	Engineered for large-scale deployments, Ubiquiti's U7-PRO-IW is a wall-mounted WiFi 7 AP featuring a 2.5Gbps Ethernet uplink and dedicated 6GHz support. It yields an aggregate throughput of up to 10.7Gbps, distributed across its 6GHz ($2\\times2$ MU-MIMO), 5GHz ($2\\times2$ MU-MIMO), and 2.4GHz ($2\\times2$ MU-MIMO) wireless bands. Management and network provisioning are handled natively through the UniFi Network Application.Power Requirement: Powered via PoE; injector sold separately.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3450	4675	\N	\N	5	5	\N	U7-PRO-IW	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5.8GHz: 5dBi : 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5.8GHz: 4.3Gbps ; 6GHz: 5.7Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 22W\nMounting: 1 Gang Electrical Wall Box (Not Included)\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3at or Passive PoE\nPoE Output: None\nPower Input: 802.3at or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44 to 57V\nUSB Ports: None\n\nDimensions: 150 x 103 x 36 mm\nWeight: 580g	0	0	3	2026-06-22 00:49:06.469	2026-06-22 01:16:34.193	0	0	0	\N
d1395924-c83a-45b0-82a2-c3491940159b	Ubiquiti UniFi WiFi 7 Pro Tri-Band AP	ubiquiti-unifi-wifi-7-pro-tri-band-ap	The Ubiquiti U7-PRO is a high-performance, Tri-Band WiFi 7 access point built to provide clean, interference-free wireless connectivity in demanding environments. Outfitted with a 2.5Gbps Ethernet port, it utilizes the 6GHz spectrum to deliver a combined data rate of up to 9.3Gbps across its 6GHz, 5GHz, and 2.4GHz bands (all featuring 2x2 MU-MIMO). The device integrates seamlessly with the UniFi Network Application for centralized configuration and management.\n\n*Note: A separate PoE injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3195	4325	\N	\N	5	5	\N	U7-PRO	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5.8GHz: 6dBi : 6GHz: 5.8dBi\nBeam-width: 360\nData Rate: 2.4GHz: 688Mbps; 5GHz: 4.3Gbps ; 6GHz: 5.7Gbps\nTotal aggregate data rate: 10.7Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 21W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3at or Passive PoE\nPoE Output: None\nPower Input: 802.3at or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44 to 57V\nUSB Ports: None\n\nDimensions: Ø206 x 46 mm\nWeight: 680g	0	0	3	2026-06-22 00:49:08.875	2026-06-22 01:16:36.124	0	0	0	\N
bfbdb201-437c-4415-9f9b-1929bc8ea267	Ubiquiti UniFi WiFi 7 Long Range Dual Band AP	ubiquiti-unifi-wifi-7-long-range-dual-band-ap	The Ubiquiti U7-LR is an indoor, long-range WiFi 7 (802.11be) access point engineered for extended dual-band coverage. It provides a combined wireless data rate of up to 5Gbps, split across its 5GHz ($3\\times3$ MU-MIMO) and 2.4GHz ($2\\times2$ MU-MIMO) bands. Designed for easy deployment, the AP can be completely configured, monitored, and managed using the centralized UniFi Network Application.\n*Note: A separate PoE injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2795	3795	\N	\N	5	5	\N	U7-LR	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5.8GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5.8GHz: 4.3Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 14W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af/at\nPoE Output: None\nPower Input: 802.3af/at PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: Ø175.7 x 43 mm\nWeight: 448g	0	0	3	2026-06-22 00:49:11.503	2026-06-22 01:16:38.965	0	0	0	\N
c635aef3-bcf3-4dc8-8760-3ead963da7f5	Ubiquiti UniFi6 Pro Dual Band WiFi 6 AP	ubiquiti-unifi6-pro-dual-band-wifi-6-ap	The Ubiquiti U6-PRO is a high-performance, dual-band WiFi 6 (802.11ax) access point designed to provide robust wireless connectivity for demanding environments. It delivers a combined data rate of up to 5.3Gbps across its 5GHz ($4\\times4$ MU-MIMO) and 2.4GHz ($2\\times2$ MU-MIMO) bands. The device integrates seamlessly with the UniFi Network Application for centralized configuration, provisioning, and management.\n*Note: A separate PoE injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2850	3850	\N	\N	5	5	\N	U6-PRO	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5.8GHz: 6dBi\nBeam-width: 360\nData Rate: 2.4GHz: 573Mbps; 5.8GHz: 4800Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 13W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3at or Passive PoE\nPoE Output: None\nPower Input: 802.3at or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44 to 57V\nUSB Ports: None\n\nDimensions: Ø197 x 35 mm\nWeight: 600g	0	0	3	2026-06-22 00:49:13.895	2026-06-22 01:16:40.711	0	0	0	\N
cb521c27-7ec1-485d-9fb3-9e724fdec654	Scoop 305m Box Cat5e CCA White UTP Cable	scoop-305m-box-cat5e-cca-white-utp-cable	Scoop's UTP-305CW is a 305m Cat5e CCA White UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes a PVC outer sheath, an AWG rating of 24 and is supplied in an easy pull 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	595	795	\N	\N	5	5	\N	UTP-305CW	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: White\nConductor Dimensions: 0.50mm\nConstruction: UTP - CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 370.5 x 370.5 x 230.5mm	0	0	3	2026-06-22 00:46:24.474	2026-06-22 01:14:14.6	0	0	0	\N
e49fb2d3-18ae-4491-8e51-42ff6dd083e3	Ubiquiti UniFi6 Mesh Indoor / Outdoor  WiFi 6 AP	ubiquiti-unifi6-mesh-indoor-outdoor-wifi-6-ap	The Ubiquiti U6-MESH is a dual-band WiFi 6 (802.11ax) mesh access point housed in a compact, IPX5-rated indoor/outdoor enclosure. Built for flexible deployment, it delivers an aggregate wireless data rate of up to 5.3Gbps across its 5GHz ($4\\times4$ MU-MIMO) and 2.4GHz ($2\\times2$ MU-MIMO) bands. The device integrates seamlessly with the UniFi Network Application for centralized configuration, provisioning, and management.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3325	4475	\N	\N	5	5	\N	U6-MESH	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 3dBi ; 5.8GHz: 5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps ; 5.8GHz: 4800Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 11.4W\nMounting: Desktop ; Wall-Mount ; Pole Mount ; Ceiling Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 60°C\nPoE Input: 802.3af PoE\nPoE Output: None\nPower Input: 48V; 0.32A PoE Injector (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44V-57V\nUSB Ports: None\n\nDimensions: Ø 48.50 x 159.49mm\nWeight: 400g	0	0	3	2026-06-22 00:49:16.067	2026-06-22 01:16:42.846	0	0	0	\N
6bd11f49-215c-4320-8cd1-e0346d761475	Ubiquiti UniFi6 Dual Band WiFi 6 Range Extender	ubiquiti-unifi6-dual-band-wifi-6-range-extender	Eliminate dead zones instantly with the Ubiquiti U6-EXT. This plug-and-play WiFi 6 range extender effortlessly boosts your existing network coverage, delivering blistering aggregate speeds of up to 5.3Gbps over its 5GHz and 2.4GHz bands ($4\\times4$ and $2\\times2$ MU-MIMO, respectively). Scale, monitor, and configure your extended wireless environment through the intuitive UniFi Network Application.Please Note: The Schuko (EUR-SCH) adapter is not included in the standard package.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2825	3825	\N	\N	5	5	\N	U6-EXT	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 5dBi ; 5.8GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 573.5Mbps ; 5.8GHz: 4800Mbps\nEthernet Ports: None\nHardware Button: Reset\nMax. Power Consumption: 11W\nMounting: Plug Point\nOperating System: UniFi\nOperating Temperature: -10°C to 50°C\nPoE Input: None\nPoE Output: None\nPower Input: 2-Pin Schuko\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 100-240V\nUSB Ports: None\n\nDimensions: 169.7 x 112.2 x 77.6 mm\nWeight: 340g	0	0	3	2026-06-22 00:49:17.032	2026-06-22 01:16:43.731	0	0	0	\N
bf11b8e1-935d-4c42-9bee-9ea4c4d21ea7	Galvanised 50mm Pole / Mast 6M	galvanised-50mm-pole-mast-6m	Scoop's TUBE-6M is a 6-meter galvanized steel utility pole with a 50mm diameter. Built for durability, it is ideal for mounting networking, wireless, or antenna hardware securely.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	695	950	\N	\N	5	5	\N	TUBE-6M	f	t	f	\N	\N	Diameter: 50mm\nLength: 6m\nSteel Thickness: 2mm	0	0	3	2026-06-22 00:49:17.993	2026-06-22 01:16:44.416	0	0	0	\N
fd607937-8ac5-415f-a217-fb47a10a4001	Galvanised 50mm Pole / Mast 3M	galvanised-50mm-pole-mast-3m	Scoop's TUBE-3M is a 3-meter galvanized steel mounting pole featuring a 50mm diameter. Built to withstand outdoor elements, it offers a sturdy foundation for securing wireless equipment and antennas.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	350	475	\N	\N	5	5	\N	TUBE-3M	f	t	f	\N	\N	Diameter: 50mm\nLength: 3m\nSteel Thickness: 2mm	0	0	3	2026-06-22 00:49:19.038	2026-06-22 01:16:45.33	0	0	0	\N
bfde01f1-af1e-4eb6-a2c9-83c65b3825fa	Galvanised 50mm Pole / Mast 2M	galvanised-50mm-pole-mast-2m	Scoop's TUBE-2M is a 2-meter galvanized steel mounting pole featuring a 50mm diameter. Engineered to withstand outdoor elements, it provides a rigid foundation for securely mounting antennas, satellite dishes, and wireless hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	225	315	\N	\N	5	5	\N	TUBE-2M	f	t	f	\N	\N	Diameter: 50mm\nLength: 2m\nSteel Thickness: 2mm	0	0	3	2026-06-22 00:49:19.881	2026-06-22 01:16:46.204	0	0	0	\N
3deea999-a3c1-4233-bccd-e4413319a678	Galvanised 50mm Pole / Mast 1M	galvanised-50mm-pole-mast-1m	Scoop's TUBE-1M is a 1-meter galvanized steel mounting pole featuring a 50mm diameter. Engineered to withstand outdoor elements, it provides a compact and rigid foundation for securely mounting antennas, cameras, and wireless hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	115	165	\N	\N	5	5	\N	TUBE-1M	f	t	f	\N	\N	Diameter: 50mm\nLength: 1m\nSteel Thickness: 2mm	0	0	3	2026-06-22 00:49:20.735	2026-06-22 01:16:46.988	0	0	0	\N
7369989d-6324-49dd-aa8a-674d8d28b37c	50mm Aluminium Pole / Mast 6M	50mm-aluminium-pole-mast-6m	Scoop's TUB-AU6 is a lightweight, high-durability aluminum utility pole measuring 6 meters in length. It features a 50mm diameter combined with a robust 5mm wall thickness, making it an excellent choice for corrosion-resistant outdoor equipment mounting.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1495	2025	\N	\N	5	5	\N	TUB-AU6	f	t	f	\N	\N	Diameter: 50mm\nLength: 6m\nAluminium Thickness: 5mm	0	0	3	2026-06-22 00:49:22.016	2026-06-22 01:16:47.922	0	0	0	\N
dbfccadf-afac-444b-b42b-48ffa3d260a0	Ubiquiti UISP 60GHz/5GHz Wave Nano Radio	ubiquiti-uisp-60ghz-5ghz-wave-nano-radio	Ubiquiti's WAVE-NANO is a 60GHz radio system with an integrated high-gain antenna, GPS, and a 5GHz backup radio. It features Wave technology with true duplex gigabit performance PtP links up to 12 km. In PtMP mode, it can be used as a CPE and paired with the WAVE-AP (up to 5km) or WAVE-APM (4km) with a total throughput of up to 2Gbps.\n\nAlso included is a built-in Bluetooth management radio for easy setup via the UISP network management platform. An alignment tool is included with the unit to assist with accurate and reliable aligning of the antennas.\n\n*Note: For PtP links, firmware v.3.2.0 or later is required.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4995	6775	\N	\N	5	5	\N	WAVE-NANO	f	t	f	\N	\N	Antenna Gain: 60GHz: 41dBi ; 5.8GHz: 19dBi\nBeamwidth: 60GHz: 1° ; 5GHz: 17°\nData Rate: 60GHz: Up to 2Gbps ; 5.8GHz: 800Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 18W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 24V or 48V Passive PoE\nPoE Output: None\nPower Input: 48V 0.65A Gigabit PoE Injector (included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 24V or 48V\nUSB Ports: None\n\nDimensions: Ø256.5 x 113.5 mm\nWeight: 1.2kg	0	0	3	2026-06-21 22:33:06.035	2026-06-22 01:13:30.749	0	0	0	\N
bf4b174f-5cd5-4d33-ad44-7519cc0057c2	Ubiquiti UISP Wave MLO5 5GHz WiFi 7 PtP Radio	ubiquiti-uisp-wave-mlo5-5ghz-wifi-7-ptp-radio	Ubiquiti's WAVE-MLO5 is a high-performance dual 5GHz, WiFi 7-based Point-to-Point radio with Multi-Link Operation (MLO) technology for enhanced throughput. It features an outdoor IPX6 rating, 1x 10Gbps Ethernet port, 1x 10Gbps SFP+ port and is powered by the included 10Gbps PoE Injector. It offers an aggregate data rate of up to 5Gbps on its dual 5GHz (2x2 MU-MIMO) radios. It can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6995	9475	\N	\N	5	5	\N	WAVE-MLO5	f	t	f	\N	\N	Antenna Gain: Antenna Dependent (2x RP SMA Female)\nBeam-width: Antenna Dependent\nData Rate: 5Gbps\nEthernet Ports: 1x 10/100/1000/10000\nHardware Button: Reset\nMax. Power Consumption: 20W\nMounting: Pole-Mount\nOperating System: UISP\nOperating Temperature: -40°C to 60°C\nPoE Input: 22-27V (4-pairs) or 44-54V Passive PoE\nPoE Output: None\nPower Input: 54V 0.56A, 10Gbps PoE Adapter (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44-54V or 22–27V\nUSB Ports: None\nOther: 1x RP SMA GPS Connector, 1x 10G SFP+\n\nDimensions: 249.3 x 82 x 47.6 mm\nWeight: 575g	0	0	3	2026-06-21 22:33:06.054	2026-06-22 01:13:32.817	0	0	0	\N
9c71c626-5341-4bdc-be0d-2aa9a1480d90	Ubiquiti UISP 60GHz/5GHz Wave Professional Radio	ubiquiti-uisp-60ghz-5ghz-wave-professional-radio	Ubiquiti's WAVE-PRO is a high-capacity 60GHz radio system with 5GHz backup radio, an integrated high-gain antenna, 2x 2.5Gbps Ethernet Ports, 1x 10Gbps SFP+ as well as integrated GPS and precision mount bracket. It features Wave technology with true duplex gigabit performance PtP links up to 15 km. In PtMP mode, it can be used as a CPE and paired with the WAVE-AP (up to 8km) or WAVE-APM (6km) with a total throughput of up to 5.4Gbps.\n\nAlso included is a built-in Bluetooth management radio for easy setup via the UISP network management platform. An alignment tool is included with the unit to assist with accurate and reliable aligning of the antennas.\n\n*Note: For PtP links, firmware v.3.2.0 or later is required.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	10995	14875	\N	\N	5	5	\N	WAVE-PRO	f	t	f	\N	\N	Antenna Gain: 60GHz: 46dBi ; 5.8GHz: 22dBi\nBeamwidth: 60GHz: 1.3° ; 5GHz: 8°\nData Rate: 60GHz: Up to 5.4Gbps ; 5.8GHz: 800Mbps\nEthernet Ports: 2x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 26W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 44–54V or 22–27V Passive PoE\nPoE Output: None\nPower Input: 48V 0.65A Gigabit PoE Injector (included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44–54V or 22–27V\nUSB Ports: None\nOther: 1x SFP+\n\nDimensions: Ø424.4 x 166.2mm\nWeight: 4kg	0	0	3	2026-06-21 22:33:06.002	2026-06-22 01:13:27.877	0	0	0	9cd67eab-3117-4ee3-bc46-103e8271773d
9f05776c-0660-49c4-b23e-8259a871e243	Ubiquiti UISP 60GHz/5GHz Wave Pico Radio	ubiquiti-uisp-60ghz-5ghz-wave-pico-radio	Ubiquiti's WAVE-PICO is a 60GHz radio system with an integrated high-gain antenna, and a WiFi 6, 5GHz backup radio. It features Wave technology with true duplex gigabit performance PtP links up to 3km. In PtMP mode, it can be used as a CPE and paired with the WAVE-AP (up to 1.3km) or WAVE-APM (900m) with a total throughput of up to 2Gbps.\n\nAlso included is a built-in Bluetooth management radio for easy setup via the UISP network management platform. An alignment tool is included with the unit to assist with accurate and reliable aligning of the antennas.\n\n*Note: For PtP links, firmware v.3.2.0 or later is required.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3250	4395	\N	\N	5	5	\N	WAVE-PICO	f	t	f	\N	\N	Antenna Gain: 60GHz: 27.7dBi ; 5.8GHz: 9dBi\nBeamwidth: 60GHz: 6° ; 5GHz: 50°\nData Rate: 60GHz: Up to 2Gbps ; 5.8GHz: 800Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 10W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 24V or 48V Passive PoE\nPoE Output: None\nPower Input: 48V 0.5A, Gigabit PoE Injector (Included)\nSerial Interface: None\nSFP Ports: None\nSIM Slots: None\nSupported Voltage Range: 44–54V or 22–27V Passive PoE\nUSB Ports: None\n\nDimensions: Ø152.1 x 55.8 mm\nWeight: 347g	0	0	3	2026-06-22 01:06:15.352	2026-06-22 01:13:27.889	0	0	0	\N
36715641-4659-4e1f-aa4c-94a2a92ad99a	Ubiquiti UISP WaveFiber SC/APC 2.5Gbps Ethernet ONU 20pk	ubiquiti-uisp-wavefiber-sc-apc-2-5gbps-ethernet-onu-20pk	Ubiquiti's WAVE-ONU20 is a 20-pack with no PoE Injectors. The units are GPON optical network units with 1x SC/APC port and a 2.5Gbps Ethernet port, which takes 24V PoE Input. The unit delivers 1.2Gbps uplink and 2.5Gbps downlink at distances up to 20 km.\n\n*Note: PoE Injectors Not Included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	11595	15695	\N	\N	5	5	\N	WAVE-ONU20	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 5W\nMounting: Desktop or Wall Mount\nOperating System: UFiber\nOperating Temperature: -15°C to 45°C\nPoE Input: 24V Passive PoE\nPoE Output: None\nPower Input: 24V 0.5A PoE Adapter (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 20-28V\nUSB Ports: None\nOther: 1x SC/APC GPON WAN port\n\nDimensions: 76.5 x 76.5 x 26.4 mm\nWeight: 78g	0	0	3	2026-06-21 22:33:06.02	2026-06-22 01:13:28.914	0	0	0	\N
7a7f331a-118c-4bb2-94bb-20f9f4888d7b	Ubiquiti UniFi Protect G6 180 16MP Black IP Camera	ubiquiti-unifi-protect-g6-180-16mp-black-ip-camera	Ubiquiti UVC-G6180-B is a black indoor and outdoor 16MP camera with dual sensors, 20 Frames Per Second footage, a Multi-TOPS AI Engine and 180° panoramic coverage.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5750	7795	\N	\N	5	5	\N	UVC-G6180-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: 2x Fixed focal length\nMax Frame Rate: 20 FPS (Resolution Dependent)\nMicrophone: Two-Way Audio\nMax Power Consumption: 15W\nMounting: Surface Mount (Included)\nNight Mode: Up to 15m\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3at\nPower Input: 802.3at\nResolution: 16MP 7680 x 2160 (3.5:1)\nSensor: Dual 1/1.8" 8MP\nVideo Compression: H.264, MJPG\n\nDimensions: 136 x 64 x 92 mm\nWeight: 839g	0	0	3	2026-06-22 00:45:53.563	2026-06-22 01:13:49.231	0	0	0	\N
686fef89-e035-4439-9b37-211f842454e8	Ubiquiti UISP 60GHz/5GHz Wave Long Range Radio	ubiquiti-uisp-60ghz-5ghz-wave-long-range-radio	Ubiquiti's WAVE-LR is a long-range 60GHz radio system with an integrated high-gain antenna, GPS, precision mount bracket, and a 5GHz backup radio. It features Wave technology with true duplex gigabit performance PtP links up to 15 km. In PtMP mode, it can be used as a CPE and paired with the WAVE-AP (up to 8km) or WAVE-APM (6km) with a total throughput of up to 2Gbps.\n\nAlso included is a built-in Bluetooth management radio for easy setup via the UISP network management platform. An alignment tool is included with the unit to assist with accurate and reliable aligning of the antennas.\n\n*Note: For PtP links, firmware v.3.2.0 or later is required.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6950	9425	\N	\N	5	5	\N	WAVE-LR	t	t	f	\N	\N	Antenna Gain: 60GHz: 46dBi ; 5.8GHz: 22dBi\nBeamwidth: 60GHz: 1.1° ; 5GHz: 10°\nData Rate: 60GHz: Up to 2Gbps ; 5.8GHz: 800Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 18W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 24V or 48V Passive PoE\nPoE Output: None\nPower Input: 48V 0.65A Gigabit PoE Injector (included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 24V or 48V\nUSB Ports: None\n\nDimensions: Ø424.4 x 166.2mm\nWeight: 2.59kg	0	0	3	2026-06-21 22:33:06.063	2026-06-22 01:13:33.868	0	0	0	\N
e1c3ed76-c0b4-485b-b955-36fccc77ce4a	Ubiquiti UISP 60GHz/5GHz PtMP Wave Access Point Micro	ubiquiti-uisp-60ghz-5ghz-ptmp-wave-access-point-micro	Ubiquiti's WAVE-APM is a UISP 60GHz Point-to-MultiPoint Access Point featuring 5GHz failover, 1x 2.5Gbps Ethernet Port and an integrated GPS antenna. Utilising 60GHz point-to-multipoint technology, it can connect up to 15 stations with a total throughput of 5Gbps at distances of up to 900m when paired with the WAVE-PICO, 4km when paired with the WAVE-NANO, and 6km when paired with the WAVE-LR. Mount up to 4x WAVE-APM using the WAVE-MM mounting for full 360° coverage.\n\nThe dedicated Bluetooth radio allows for easy set-up via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8495	11495	\N	\N	5	5	\N	WAVE-APM	f	t	f	\N	\N	Antenna Gain: 60GHz: 20dBi ; 5.8GHz: 13.5dBi\nBeamwidth: 60GHz/5GHz: 90°\nData Rate: 60GHz: Up to 5.4Gbps ; 5.8GHz: 800Mbps\nEthernet Ports: 1x 2.5Gbps\nHardware Button: Reset\nMax. Power Consumption: 24W\nMounting: Pole-Mount, or WAVE-MM for 360° coverage\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 24V or 48V Passive PoE\nPoE Output: None\nPower Input: 48V 0.65A 2.5GbE PoE Injector (included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44–54V or 22–27V\nUSB Ports: None\n\nDimensions: 284 x 156 x 76 mm\nWeight: 1.3kg	0	0	3	2026-06-21 22:33:06.07	2026-06-22 01:13:34.832	0	0	0	\N
341c5ccf-dc30-4a47-ba5d-fe47c31f66d5	Ubiquiti UISP 60GHz/5GHz PtMP Wave Access Point	ubiquiti-uisp-60ghz-5ghz-ptmp-wave-access-point	Ubiquiti's WAVE-AP is a UISP 60GHz Point-to-MultiPoint Access Point featuring 5GHz failover, 1x 10Gbps SFP+ Port, 1x 2.5Gbps Ethernet Port and an integrated GPS antenna. Utilising 60GHz point-to-multipoint technology, it can connect up to 15 stations with a total throughput of 5.4Gbps at distances of up to 1.3km when paired with the WAVE-PICO, 5km when paired with the WAVE-NANO, and 8km when paired with the WAVE-LR.\n\nThe dedicated Bluetooth radio allows for easy set-up via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8895	12095	\N	\N	5	5	\N	WAVE-AP	f	t	f	\N	\N	Antenna Gain: 60GHz: 24dBi ; 5.8GHz: 12dBi\nBeamwidth: 60GHz/5GHz: 30°\nData Rate: 60GHz: Up to 5.4Gbps ; 5.8GHz: 800Mbps\nEthernet Ports: 1x 2.5Gbps\nHardware Button: Reset\nMax. Power Consumption: 24W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 60°C\nPoE Input: 24V or 48V Passive PoE\nPoE Output: None\nPower Input: 48V 0.65A 2.5GbE PoE Injector (included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 44–54V or 22–27V\nUSB Ports: None\nOther: 1x SFP+\n\nDimensions: 212 x 205 x 187mm\nWeight: 2.3kg	0	0	3	2026-06-22 00:45:37.609	2026-06-22 01:13:36.872	0	0	0	\N
b002389c-df8b-4c8d-a22c-6283fc04bef2	Ubiquiti UniFi Protect G6 Black 8MP IP Camera	ubiquiti-unifi-protect-g6-black-8mp-ip-camera	Ubiquiti's UVC-G6T-B is a black IP66, IK04 tamper-resistant, 8MP PoE camera with Multi-TOPS AI Engine and 3-axis manual adjustment for flexible installation. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance up to 30 metres.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3795	5150	\N	\N	5	5	\N	UVC-G6T-B	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 12.5W\nMounting: Wall or Ceiling-Mount (Included)\nNight Mode: IR LED illumination and IR cut filter (Up to 30m)\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 3864 x 2160 (16:9)\nSensor: 1/1.8" 8MP\nVideo Compression: H.264; MJPEG\n\nDimensions: : Ø100 x 95 mm\nWeight: 550g	0	0	3	2026-06-22 00:45:41.164	2026-06-22 01:13:39.694	0	0	0	\N
c21f63ea-e7d7-4ad0-a1a3-7fe492caf55c	Ubiquiti UniFi Protect G6 PTZ 8MP Black IP Camera	ubiquiti-unifi-protect-g6-ptz-8mp-black-ip-camera	Ubiquiti's UVC-G6PTZ-B is an IP66, 8MP, 4K PoE+ (802.3at 30W) black camera with 5x Optical and 2x digital zoom, Multi-TOPS AI Engine, IR night vision up to 30m and enhanced AI detection capabilities such as face recognition, license plate recognition and smart detections (People, Vehicles, Animals). This camera has a built-in two-way microphone and multiple mounting options. It can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	7595	10275	\N	\N	5	5	\N	UVC-G6PTZ-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: 5x Optical, 2x Digital Zoom\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Two-Way Audio\nMax Power Consumption: 24.5W\nMounting: Wall, Surface, Ceiling, Pole mount (Included)\nNight Mode: Up to 30m\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3at\nPower Input: 802.3at\nResolution: 8MP 3840 x 2160 (16:9)\nSensor: 1/1.8" 8MP\nVideo Compression: H.264, MJPG\n\nDimensions: Ø107.2 x 111 x 230.2 mm\nWeight: 1kg	0	0	3	2026-06-22 00:45:44.707	2026-06-22 01:13:41.754	0	0	0	\N
40d4899f-50c2-48e1-9828-cbe8b46f4b92	Ubiquiti UniFi Protect G6 Pro Bullet 8MP White IP Camera	ubiquiti-unifi-protect-g6-pro-bullet-8mp-white-ip-camera	Ubiquiti's UVC-G6BPRO-W features an all-weather IP66 design with an 8MP image, Multi-TOPS AI Engine, 2.36x optical zoom, and a large 1/1.2" CMOS sensor for exceptional low-light clarity and long-range IR night vision up to 40M. This camera also features enhanced AI detection capabilities such as face recognition, license plate recognition and smart detections (People, Vehicles, Animals).\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8995	12175	\N	\N	5	5	\N	UVC-G6BPRO-W	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nLens: F 5.9-13.8 mm; ƒ/1.5-ƒ/2.9\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Two-way audio\nMax. Power Consumption: 15W\nMounting: Wall, ceiling, pole mount (Included)\nNight Mode: Built-in IR LED illumination and IR cut filter up to 40m\nOperating Temperature: -20°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 3840 x 2160 (16:9)\nSensor: 1/1.2" 8MP\nVideo Compression: H.264; MJPEG\nOther: MicroSD card slot\n\nDimensions: : Ø85.8 x 210 mm\nWeight: 737g	0	0	3	2026-06-22 00:45:49.403	2026-06-22 01:13:44.668	0	0	0	\N
e31238a3-7c2b-468e-b11f-5c42cd0c35fc	Ubiquiti UniFi Protect G5 Turret Ultra White 4MP IP Camera	ubiquiti-unifi-protect-g5-turret-ultra-white-4mp-ip-camera	Ubiquiti's UVC-G5TU-W is a compact, tamper-resistant white IP Camera featuring a 4MP ultra-wide image and integrated microphone housed in a weatherproof IP66 enclosure with integrated long-range IR night vision up to 30m.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1650	2250	\N	\N	5	5	\N	UVC-G5TU-W	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 4W\nMounting: Wall/Ceiling (optional mounting arm: UACC-G5TAM)\nNight Mode: IR LED illumination and IR cut filter\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 2688 x 1512 (16:9)\nSensor: 1/2.4" CMOS\nVideo Compression: H.264 ; MJPEG\n\nDimensions: Ø90 x 71.2 mm\nWeight: 330g	0	0	3	2026-06-22 00:45:55.663	2026-06-22 01:13:51.069	0	0	0	\N
ccaae4e1-7d67-4862-9319-b703d44b83b3	Ubiquiti UniFi Protect G5 Turret Ultra Black 4MP IP Camera	ubiquiti-unifi-protect-g5-turret-ultra-black-4mp-ip-camera	Ubiquiti's UVC-G5TU-B is a compact, tamper-resistant black IP Camera featuring a 4MP ultra-wide image and integrated microphone housed in a weatherproof IP66 enclosure with integrated 30m long-range IR night vision.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1650	2250	\N	\N	5	5	\N	UVC-G5TU-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 4W\nMounting: Wall/Ceiling (optional mounting arm: UACC-G5TAM)\nNight Mode: IR LED illumination and IR cut filter\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 2688 x 1512 (16:9)\nSensor: 1/2.4"" CMOS\nVideo Compression: H.264 ; MJPEG\n\nDimensions: Ø90 x 71.2 mm\nWeight: 330g	0	0	3	2026-06-22 00:45:57.059	2026-06-22 01:13:52.031	0	0	0	\N
8429141b-7af4-485c-9aa6-402275e61e87	Ubiquiti UniFi Protect G5 PTZ 4MP Black IP Camera	ubiquiti-unifi-protect-g5-ptz-4mp-black-ip-camera	Ubiquiti's UVC-G5PTZ-B is a black PTZ camera featuring a 4MP image with a built-in microphone, 2x optical zoom and AI smart detection. It is also IP66 rated with wall and pole-mount options for both indoor and outdoor installations. The camera has built-in IR & white LED illumination with IR cut filter.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5395	7295	\N	\N	5	5	\N	UVC-G5PTZ-B	f	t	f	\N	\N	Specifications\tEthernet Ports: 1x 10/100\nHardware Button: Reset\nLens: F 3.42–6.85 mm; ƒ/1.85–ƒ/2.4\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 14W\nMounting: Wall or Pole-Mount\nNight Mode: IR LED illumination and IR cut filter (20m)\nOperating Temperature: -30°C to 45°C\nPoE Input: 802.3af/at PoE\nPower Input: 37-57V PoE\nResolution: 4MP 2688 x 1512 (16:9)\nSensor: 5MP 1/2.7" CMOS\nVideo Compression: H.264; MJPEG\n\nDimensions: 90 x 94 x 179.5 mm\nWeight: 650g	0	0	3	2026-06-22 00:45:59.401	2026-06-22 01:13:53.888	0	0	0	\N
6eb8b299-e7e6-412b-8e7a-89e8530496c2	Ubiquiti UniFi Protect G5 Bullet 4MP IP Camera	ubiquiti-unifi-protect-g5-bullet-4mp-ip-camera	Ubiquiti's UVC-G5B features a 4MP image with a built-in microphone and a versatile 3-axis mount that enables quick and easy adjustment for both indoor and outdoor mounting. The camera has infrared LEDs with an automatic IR cut filter for both day and night surveillance up to 10 metres.\n\nIt can be configured and managed using the UniFi Protect Application.\n\n*Note: PoE Injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2550	3450	\N	\N	5	5	\N	UVC-G5B	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed Focal Length\nMax Frame Rate: 30 FPS (Resolution Dependent)\nMicrophone: Yes\nMax. Power Consumption: 4W\nMounting: Wall/Pole\nNight Mode: IR LED illumination and IR cut filter\nOperating Temperature: -20°C to 40°C\nPoE Input: 802.3af PoE\nPower Input: 37-57V PoE\nResolution: 2688 x 1512 (16:9)\nSensor: 5MP CMOS Sensor\nVideo Compression: H.264 ; MJPEG\n\nDimensions: : Ø75.5 x 150 mm\nWeight: 315g	0	0	3	2026-06-22 00:46:02.714	2026-06-22 01:13:56.63	0	0	0	\N
9ca6dea1-2738-4f73-ac34-9dd414894c26	Ubiquiti UniFi Protect Doorbell Lite 5MP White	ubiquiti-unifi-protect-doorbell-lite-5mp-white	Ubiquiti's UVC-DBLITE-W is a white 5MP video doorbell that integrates with UniFi Protect. It features two-way audio, IR night vision up to 5 metres, and is powered by 802.3af PoE.\n\nIt can be configured and managed using the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	UVC-DBLITE-W	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nHardware Button: Reset\nLens: Fixed focal length\nMax Frame Rate: 24 FPS (Resolution Dependent)\nMicrophone: Two-Way Audio\nMax Power Consumption: 8W\nMounting: Wall, 20° wedge (Included)\nNight Mode: Up to 5m\nOperating Temperature: -30°C to 50°C\nPoE Input: 802.3af\nPower Input: 802.3af\nResolution: 5MP 1920 x 2560 (3:4)\nSensor: 1/2.7" 5MP\nVideo Compression: H.264, MJPG\n\nDimensions: 137 x 40 x 26.4 mm\nWeight: 142g	0	0	3	2026-06-22 00:46:05.069	2026-06-22 01:13:58.415	0	0	0	\N
71e95670-5e1d-4abd-9490-93643aff0842	Scoop 100m Box Cat6 CCA White UTP Cable	scoop-100m-box-cat6-cca-white-utp-cable	Scoop's UTP-6100CW is a 100m Cat6 CCA White UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat6 cable includes a PVC outer sheath and carries an AWG rating of 24.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	250	350	\N	\N	5	5	\N	UTP-6100CW	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 100m\nColour: White\nConductor Dimensions: 0.56mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 310 x 280.5 x 80.5mm	0	0	3	2026-06-22 00:46:16.652	2026-06-22 01:14:08.001	0	0	0	\N
fa2c5f9e-9fdc-44c3-8dfd-042cd320e385	Scoop 500m Drum Cat5e CCA Grey UTP Cable	scoop-500m-drum-cat5e-cca-grey-utp-cable	Scoop's UTP-500C is a 500m Cat5e CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes a PVC outer sheath, an AWG rating of 24 and is supplied in a 500m drum.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	950	1295	\N	\N	5	5	\N	UTP-500C	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 500m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 290 x 290 x 290mm	0	0	3	2026-06-22 00:46:19.755	2026-06-22 01:14:10.654	0	0	0	\N
96af299e-2302-41aa-b143-89bcd5c7b337	Cudy 5 Port Metal Gigabit Desktop Switch	cudy-5-port-metal-gigabit-desktop-switch	Cudy's CD-GS105 is a 5-port switch with a metal casing, supporting full Gigabit speeds on all 5 ports and can be either desktop or wall-mounted.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	115	175	\N	\N	5	5	\N	CD-GS105	f	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: None\nMax. Power Consumption: 1.2W\nMounting: Desktop or Wall-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 5V 0.5A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 5V\n\nDimensions: 86.5×53×23 mm\nWeight: 115g	0	0	3	2026-06-22 01:18:09.151	2026-06-22 01:18:09.151	0	0	0	\N
d6828599-9352-4d51-bc94-f2620f3160c9	Scoop Unbranded 305m Box Cat5e CCA Grey UTP Cable	scoop-unbranded-305m-box-cat5e-cca-grey-utp-cable	Scoop's UTP-305CU is an unbranded 305m Cat5e CCA UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes a PVC outer sheath, an AWG rating of 24 and is supplied in an easy pull 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	595	795	\N	\N	5	5	\N	UTP-305CU	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Grey\nConductor Dimensions: 0.50mm\nConstruction: UTP - CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 370.5 x 370.5 x 230.5mm	0	0	3	2026-06-22 00:46:25.518	2026-06-22 01:14:16.04	0	0	0	\N
fd3b8110-4557-4779-8e3b-7d4d6ace4913	Scoop 100m Box Cat5e CCA White UTP Cable	scoop-100m-box-cat5e-cca-white-utp-cable	Scoop's UTP-100CW is a 100m Cat5e CCA White UTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes a PVC outer sheath and carries an AWG rating of 24.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	195	275	\N	\N	5	5	\N	UTP-100CW	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 100m\nColour: White\nConductor Dimensions: 0.50mm\nConstruction: UTP – CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: None\nNumber of Pairs: 4\nOuter Jacket: PVC\n\nDimensions: 260 x 270 x 70.5mm	0	0	3	2026-06-22 00:46:29.648	2026-06-22 01:14:20.669	0	0	0	\N
4d393b97-870d-4a32-9674-d2fed4a79b4c	Ubiquiti UniFi WAN Switch RJ45 3x10Gbps Ethernet Ports	ubiquiti-unifi-wan-switch-rj45-3x10gbps-ethernet-ports	Ubiquiti's USW-WAN-RJ45 is a 10Gbps WAN Switch, linking two Shadow Mode High Availability UniFi Gateways to a single ISP. The unit features 3x 10Gbps Ethernet Ports, 1x Gigabit Ethernet Management port and redundant power supplies.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4425	5995	\N	\N	5	5	\N	USW-WAN-RJ45	f	t	f	\N	\N	Ethernet Ports: 3x 10/100/1000/2500/10000; 1x 10/100/1000 (Management)\nHardware Button: Reset\nMax. Power Consumption: 18W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 2x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 120 x 43.7 mm\nWeight: 2.4kg	0	0	3	2026-06-22 00:46:33.497	2026-06-22 01:14:24.356	0	0	0	\N
0d537d44-e56f-4c8f-bad4-b1d9143be4d9	Ubiquiti UniFi Switch Ultra 8 Port Gigabit 1PoE Input 7 PoE Out	ubiquiti-unifi-switch-ultra-8-port-gigabit-1poe-input-7-poe-out	Ubiquiti's USW-ULTRA is a compact Layer 2 switch featuring 8 Gigabit Ports with 1x PoE input, 7x PoE output, and a PoE budget dependent on the power source.\n\nIt can be configured and managed with the UniFi Network Application.\n\n*Note: Power Supply not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1725	2350	\N	\N	5	5	\N	USW-ULTRA	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8W (Using a Power Supply) 9W (Using a PoE Adapter)\nMounting: Desktop or Wall Mount\nOperating System: UniFi\nOperating Temperature: PoE++ input: -30 to 60°C ; 60W AC input: -20 to 45°C ; 210W AC input: -20 to 60°C\nPoE Input: 802.3af/at/bt\nPoE Output: 802.3af/at on Ports 2~8\nPower Input: 802.3af/at/bt on Port 1 ; 44-57V DC terminal ; 57V Power Supply (Not Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 44–57V\n\nDimensions: 203 x 76 x 33 mm\nWeight: 320g	0	0	3	2026-06-22 00:46:36.05	2026-06-22 01:14:26.345	0	0	0	\N
21c51057-3424-4e06-b337-5b8fee49a037	Ubiquiti UniFi Switch Pro 48 Port 40PoE+ 8PoE++ 600W 4SFP+	ubiquiti-unifi-switch-pro-48-port-40poe-8poe-600w-4sfp	Ubiquiti’s USW-PRO48P is a fully managed 48-Port Gigabit Layer 3 UniFi Switch. It has 40x 802.3at PoE+ Ports, 8x 802.3bt PoE++ Ports, 4x 10Gbps SFP+ and a PoE budget of 600W. It features innovative near-silent cooling and a 1.3" touch LCM (Liquid Crystal Monitor) to provide status information.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	18695	25295	\N	\N	5	5	\N	USW-PRO48P	f	t	f	\N	\N	Ethernet Ports: 48x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 60W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 40x PoE+ ; 8x PoE++ (60W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 10Gbps\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 399.6 x 43.7mm\nWeight: 6.34kg	0	0	3	2026-06-22 00:46:40.054	2026-06-22 01:14:29.266	0	0	0	\N
c64bf349-781c-452b-89ea-8bb74d64989f	Ubiquiti UniFi Switch Pro 24 Port 16PoE+ 8PoE++ 400W	ubiquiti-unifi-switch-pro-24-port-16poe-8poe-400w	Ubiquiti's USW-PRO24P is a fully managed 24-Port Gigabit Layer 3 UniFi switch. It has 16x 802.3at PoE+ Ports, 8x 802.3bt PoE++ Ports, 2x 10Gbps SFP+ and a PoE budget of 400W. It features innovative near-silent cooling and a 1.3" touch LCM (Liquid Crystal Monitor) to provide status information.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	11995	16275	\N	\N	5	5	\N	USW-PRO24P	f	t	f	\N	\N	Ethernet Ports: 24x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 50W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 16x PoE+ ; 8x PoE++ (60W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442.4 x 285.4 x 43.7mm\nWeight: 4.39kg	0	0	3	2026-06-22 00:46:41.147	2026-06-22 01:14:30.257	0	0	0	\N
b2d3b9a1-b742-48e2-861d-d007581faa18	Ubiquiti UniFi Switch Pro 24 Port Gigabit 2SFP+	ubiquiti-unifi-switch-pro-24-port-gigabit-2sfp	Ubiquiti's USW-PRO24 is a fully managed, Layer 3, UniFi switch with 24x Gigabit Ports and 2x 10G SFP+ uplink ports. It features innovative near-silent cooling and a 1.3" touch LCM (Liquid Crystal Monitor) to provide status information. It offers a rich set of layer 2 capabilities with integrated layer 3 functionality.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6895	9375	\N	\N	5	5	\N	USW-PRO24	f	t	f	\N	\N	Ethernet Ports: 24x 10/100/1000\nHardware Button: Reset\nMax Power Consumption: 30W\nMounting: Rack-Mount\nOperating System: UniFi\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100 to 240VAC	0	0	3	2026-06-22 00:46:42.181	2026-06-22 01:14:31.274	0	0	0	\N
a5313401-20d6-428c-a1b9-ef394fee15b2	Ubiquiti UniFi Pro XG Switch 32 Port 10Gbps 16 x 2.5Gbps 2SFP28	ubiquiti-unifi-pro-xg-switch-32-port-10gbps-16-x-2-5gbps-2sfp28	Ubiquiti's USW-PRO-XG48P is a 48 port, fully managed, Layer 3 Etherlighting™ switch. The unit features 32x 10Gbps and 16 x 2.5Gbps Ports as well as 4x SFP28 uplink Ports.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	34995	47350	\N	\N	5	5	\N	USW-PRO-XG48	f	t	f	\N	\N	Ethernet Ports: 32x 10/100/1000/2500/10000 ; 16x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 250W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 25Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442 x 480 x 44 mm\nWeight: 7.6kg	0	0	3	2026-06-22 00:46:46.121	2026-06-22 01:14:34.156	0	0	0	\N
74d18311-0e1f-4ff6-ad68-daa892289fb1	Ubiquiti UniFi Pro Max Switch 48 with 32PoE 16x 2.5Gbps PoE++ 720W	ubiquiti-unifi-pro-max-switch-48-with-32poe-16x-2-5gbps-poe-720w	Ubiquiti's USW-PRO-MAX48P is a 48 port, fully managed, Layer 3 Etherlighting™ switch. The unit features a 720W PoE budget with 32 Gigabit PoE Ports (24x PoE+ and 8x PoE++), 16x 2.5Gbps PoE ports (8x PoE+ and 8x PoE++) and 4x SFP+ uplink Ports. This configuration makes provision for 2.5Gbps PoE links to your WiFi 6 devices as well as 10Gbps fibre uplinks to your network.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	21995	29775	\N	\N	5	5	\N	USW-PRO-MAX48P	f	t	f	\N	\N	Ethernet Ports: 32x 10/100/1000; 16x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 100W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 2.5Gbps Ports: 8x PoE++ (60W) ; 8x PoE+ ; Gigabit Ports: 24x PoE+ ; 8x PoE++ (60W)\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 442 x 325 x 44mm\nWeight: 5.2kg	0	0	3	2026-06-22 00:46:48.725	2026-06-22 01:14:36.08	0	0	0	\N
5b443e26-373a-480f-a534-52457bbffb38	Ubiquiti UniFi Pro Max Switch 16 with 12 Gigabit 4x 2.5Gbps 2SFP+	ubiquiti-unifi-pro-max-switch-16-with-12-gigabit-4x-2-5gbps-2sfp	Ubiquiti's USW-PRO-MAX16 is a 16 port, fully managed, Layer 3, Etherlighting™ switch. The unit features 12x Gigabit Ports, 4x 2.5Gbps ports and 2x SFP+ uplink Ports. This configuration makes provision for 2.5Gbps Ethernet as well as 10Gbps fibre uplinks to your network.\n\nNote: It can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4850	6575	\N	\N	5	5	\N	USW-PRO-MAX16	f	t	f	\N	\N	Ethernet Ports: 12x 10/100/1000; 4x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 50W\nMounting: Desktop & 10-Inch Wall-Mount, or 19-Inch Rack Mount with UACC-MAX16P-RM (Not Included)\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 10Gbps\nSupported Voltage Range: 100V to 240V\n\nDimensions: 325.1 x 160 x 43.7 mm\nWeight: 1.95kg	0	0	3	2026-06-22 00:46:52.716	2026-06-22 01:14:38.806	0	0	0	\N
ec7b35b6-d3fe-408f-a083-e36cf6b406fa	Ubiquiti UniFi Pro XG Aggregation Switch 32 SFP28	ubiquiti-unifi-pro-xg-aggregation-switch-32-sfp28	Ubiquiti's USW-PRO-XGAGG is a fully managed Layer 3, Etherlighting™ switch with 32x SFP28 ports and up to 1.6Tbps switching capacity. It features a 1.3" touchscreen with AR switch management. It provides link aggregation for higher capacity and increased availability.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	42995	58175	\N	\N	5	5	\N	USW-PRO-AGGXG	f	t	f	\N	\N	Ethernet Ports: None\nHardware Button: Reset\nMax. Power Consumption: 200W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 32x 25Gbps (SFP28)\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 43.7 x 480 mm\nWeight: 7kg	0	0	3	2026-06-22 00:46:56.41	2026-06-22 01:14:41.712	0	0	0	\N
d72b001d-28f8-4234-bf96-fffab7afe66d	Ubiquiti UniFi Switch Lite 8 Port Gigabit 4PoE 52W	ubiquiti-unifi-switch-lite-8-port-gigabit-4poe-52w	Ubiquiti's USW-LITE8P is a fully managed, Layer 2, UniFi switch with 8x Gigabit Ethernet ports, 4x auto-sensing 802.3at PoE+ ports and a PoE budget of 52W. The device offers an extensive suite of advanced layer 2 switching protocols and features. A wall-mountable kit is included with the switch. The device is fanless, meaning that it will be silent no matter where it is used.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1950	2650	\N	\N	5	5	\N	USW-LITE8P	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8W\nMounting: Desktp or Wall-Mount\nOperating System: UniFi\nOperating Temperature: -15 to 40° C\nPoE Input: None\nPoE Output: 802.3af/at on Ports 1 to 4\nPower Input: 54V 1A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 50-57V\n\nDimensions: 99.6 x 163.7 x 31.7 mm\nWeight: 450g	0	0	3	2026-06-22 00:46:57.295	2026-06-22 01:14:42.677	0	0	0	\N
87f164f8-149d-4e26-af77-3bf3d7afb226	Ubiquiti UniFi Aggregation Switch 8SFP+	ubiquiti-unifi-aggregation-switch-8sfp	Ubiquiti's USW-AGG is a fully managed Layer 2 switch with 8x SFP+ ports and up to 160Gbps switching capacity. It features a compact 4.7" depth and fanless design. It is easy to mount and silent even under full load. It provides link aggregation for higher capacity and increased availability. The unit features a 1.3" touch LCM to provide status information.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4675	6325	\N	\N	5	5	\N	USW-AGG	f	t	f	\N	\N	Ethernet Ports: None\nHardware Button: Reset\nMax. Power Consumption: 30W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 8x 10Gbps+\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 120 x 43.7 mm\nWeight: 2.74kg	0	0	3	2026-06-22 00:47:01.557	2026-06-22 01:14:45.47	0	0	0	\N
558e8106-a086-40cb-8dd9-fa07b06d6b47	Ubiquiti UniFi Flex 2.5G 8 Port 2.5G with 10G Combo Uplink	ubiquiti-unifi-flex-2-5g-8-port-2-5g-with-10g-combo-uplink	Ubiquiti's USW-8FLEX-2.5G is an indoor, compact, 8 Port 2.5Gbps switch powered via PoE or the included USB-C adapter. It also features a 10Gbps Ethernet or 10Gbps SFP+ combination uplink port.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2750	3725	\N	\N	5	5	\N	USW-8FLEX-2.5G	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000/2500; 1x 10/100/1000/2500/10000 (Combo)\nHardware Button: None\nMax. Power Consumption: PoE: 14W; PSU: 14W\nMounting: Desktop, wall-mount, DIN (Not Included)\nOperating System: UniFi\nOperating temperature: -20°C to 45°C\nPoE Input: 802.3at (PoE+) on Port 9\nPoE Output: None\nPower Input: USB Type-C 5V 3A or PoE+\nSerial Interface: None\nSFP Ports: 10Gbps SFP+ (Combo)\nSupported Voltage Range: 4.8-5.2V DC/USB or 44-57V PoE\n\nDimensions: 212.9 x 76 x 33.5mm\nWeight: 395g	0	0	3	2026-06-22 00:47:04.272	2026-06-22 01:14:47.51	0	0	0	\N
703be67e-8ad6-489f-85ea-e94011903c90	Ubiquiti Gigabit PoE Adapter 24V 7W with No Cable	ubiquiti-gigabit-poe-adapter-24v-7w-with-no-cable	Ubiquiti's UPOE24-7W is a 24V, 0.3A, Gigabit PoE injector. The unit features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power Cable Not Included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	125	175	\N	\N	5	5	\N	UPOE24-7W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nOperating Temperature: 0°C to 40°C\nPoE Output: 24V 0.3A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V\n\nDimensions: 72 x 45 x 33mm\nWeight: 72.1g	0	0	3	2026-06-22 00:47:28.19	2026-06-22 01:15:06.405	0	0	0	\N
6ff67c45-e5e8-4e39-92d4-31f28c12efa8	Ubiquiti UniFi Flex Switch 5 Port Gigabit 1PoE In 4PoE Out	ubiquiti-unifi-flex-switch-5-port-gigabit-1poe-in-4poe-out	Ubiquiti's USW-5FLEX is a managed, Layer 2, UniFi switch with 5x Gigabit Ethernet Ports. It includes 4x 802.3af PoE+ Ports and 1x 802.3af/at/bt PoE input. It is designed for indoor or outdoor use with its weatherproof housing and versatile mounting options. The USW-Flex provides both flexibility and durability for environments with extreme temperature variations.\n\nIt can be configured and managed with the UniFi Network Application.\n\n*Note: PoE injector not included.\nWe recommend using the UPOE48-60W or a Ubiquiti UniFi Switch to power these devices. When making use of the UPOE48-60W be sure to set the power source on the UniFi Network Application to injector.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1775	2395	\N	\N	5	5	\N	USW-5FLEX	f	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 5W\nMounting: Desktop, Wall and Pole-Mount\nOperating System: UniFi\nOperating Temperature: -40°C to 55°C\nPoE Input: 802.3af/at/bt\nPoE Output: 802.3af/at on Ports 2~5\nPower Input: 802.3af/at/bt on Port 1\nSerial Interface: 1x RJ45 Ethernet In-Band\nSFP Ports: None\nSupported Voltage Range: 44–57V (802.3af) 50-57V (802.3bt)\n\nDimensions: 122.5 x 107.1 x 28.0mm\nWeight: 230g	0	0	3	2026-06-22 00:47:08.653	2026-06-22 01:14:51.336	0	0	0	\N
1996d855-c657-4f2a-98b3-3bf9bc8379ae	Ubiquiti UniFi Switch 48 Port Gigabit 4SFP	ubiquiti-unifi-switch-48-port-gigabit-4sfp	Ubiquiti's USW-48 is a managed, Layer 2, UniFi switch. It features 48x Gigabit Ethernet ports and 4x 1.25Gbps SFP uplink ports. The unit features a fan-less design and a 1.3" touchscreen with AR switch management which displays the current switch state and other information for quick, easy reference.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6995	9475	\N	\N	5	5	\N	USW-48	f	t	f	\N	\N	Ethernet Ports: 48x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 40W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -15°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 4x 1.25Gbps\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 285 x 43.7 mm\nWeight: 4kg	0	0	3	2026-06-22 00:47:11.131	2026-06-22 01:14:53.325	0	0	0	\N
d84f8cb9-2c72-4507-a0fd-12fa17dd4b3d	Ubiquiti UniFi Switch 24 Port Gigabit 16PoE 95W 2SFP	ubiquiti-unifi-switch-24-port-gigabit-16poe-95w-2sfp	Ubiquiti's USW-24P is a managed Layer 2 switch with 24x Gigabit Ethernet ports. It consists of 16x auto-sensing 802.3at PoE+ ports, 2x 1.25Gbps SFP uplink ports and a PoE budget of 95W. The unit features a 1.3" touch LCM to provide status information.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6650	8995	\N	\N	5	5	\N	USW-24P	f	t	f	\N	\N	Ethernet Ports: 24x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 25W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at on Ports 1~16\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps\nSupported Voltage Range: 100 to 240VAC\n\nDimensions: 442.4 x 200 x 43.7mm\nWeight: 3.09kg	0	0	3	2026-06-22 00:47:12.348	2026-06-22 01:14:54.31	0	0	0	\N
f9b74c4d-4419-47cb-96e7-fcb0a9adc1db	Ubiquiti UniFi Switch 16 Port Gigabit 8PoE 42W 2SFP	ubiquiti-unifi-switch-16-port-gigabit-8poe-42w-2sfp	Ubiquiti's USW-16P is a configurable Layer 2 switch. It has 16x Gigabit Ethernet ports that are made up of 8x auto-sensing 802.3at PoE+ ports, 2x 1.25Gbps SFP uplink ports and a PoE budget of 42W. It features a 1.3" touch LCM to provide status information and with a depth of 7.9", the compact fanless design can be easily installed in a SOHO network cabinet.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5295	7175	\N	\N	5	5	\N	USW-16P	f	t	f	\N	\N	Ethernet Ports: 16x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 18W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at on Ports 1~8\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps\nSupported Voltage Range: 100-240VAC; 50/60Hz\n\nDimensions: 442.4 x 200 x 43.7 mm\nWeight: 2.8kg	0	0	3	2026-06-22 00:47:14.65	2026-06-22 01:14:56.307	0	0	0	\N
f524a5b2-2dd8-4d89-9283-368f9e56af9c	Ubiquiti UniFi UPS Tower 10 Outlet 600W	ubiquiti-unifi-ups-tower-10-outlet-600w	Ubiquiti's UPS-TOWER is a UniFi-managed 1kVA/600W UPS (uninterruptible power supply) with 10 outlets and a hot-swappable battery, featuring a 108Wh capacity and a half-load (300W) runtime of 7 minutes. The unit enables safe shutdown for UniFi storage devices and provides compatibility with NUT (Network UPS Tools) for third‑party devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3025	4095	\N	\N	5	5	\N	UPS-TOWER	f	t	f	\N	\N	Battery Type: 1x Lead Acid 12V, 9Ah\nCapacity: 1,000VA / 600W\nEthernet Ports: 1x 10/100 (MGMT); 2x 10/100/1000 (Surge Protect)\nHardware Button: Reset, Power\nMounting: Desktop\nOperating System: UniFi Network\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nRuntime: Full load: 2.3 min, Half load: 8 min\nSerial Interface: 1x RJ45 Serial Port\nVoltage Input Range: 170V-280V AC\nVoltage Output Range: 220V-240V AC\n\nDimensions: 288 x 99 x 280.5 mm\nWeight: 7.85kg	0	0	3	2026-06-22 00:47:18.127	2026-06-22 01:14:59.479	0	0	0	\N
7c52e49a-4910-4776-b515-10cbe3426cd0	Ubiquiti 2.5Gbps 48V 30W PoE Adapter with No Cable	ubiquiti-2-5gbps-48v-30w-poe-adapter-with-no-cable	Ubiquiti's UPOE48-30W-2G is a 48V, 0.65A, 2.5Gbps, PoE injector. The unit is compatible with products that require 802.3at PoE and features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power cable not included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	350	475	\N	\N	5	5	\N	UPOE48-30W-2G	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000/2500\nPoE Output: 48V 0.65A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V	0	0	3	2026-06-22 00:47:23.854	2026-06-22 01:15:03.446	0	0	0	\N
98e20bac-80ec-428f-abbd-651b6f854aea	Ubiquiti Gigabit PoE Adapter 48V 15W with No Cable	ubiquiti-gigabit-poe-adapter-48v-15w-with-no-cable	Ubiquiti's UPOE48-15W is a 48V, 0.32A, Gigabit, PoE injector. The unit is compatible with products that require 802.3af PoE and features Electrostatic Discharge (ESD) protection, surge protection, clamping protection, peak pulse current and maximum surge discharge, all of which aid in protecting your PoE devices.\n\n*Note: Power Cable Not Included, we recommend POWU.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	150	215	\N	\N	5	5	\N	UPOE48-15W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nOperating Temperature: 0°C to 40°C\nPoE Output: 48V 0.32A Passive PoE\nPower Input: Clover Power Cord (Not Included)\nSupported Voltage Range: 100V-240V\n\nDimensions: 86 x 46 x 33mm\nWeight: 100g	0	0	3	2026-06-22 00:47:26.716	2026-06-22 01:15:05.433	0	0	0	\N
28edb63e-1954-4d99-97c5-c7dcb3b7020b	Cudy USB-A to Gigabit Ethernet Adapter	cudy-usb-a-to-gigabit-ethernet-adapter	Cudy's CD-UE10A is a plug and play, portable USB-A 3.0 to Gigabit RJ45 adapter.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	95	130	\N	\N	5	5	\N	CD-UE10A	f	t	f	\N	\N	Data Rate: Auto Negotiation 10/100/1000Mbps\nHardware: Requires USB-A 3.0 or higher on host device\nOperating Temperature: 0° - 40°C	0	0	3	2026-06-22 01:18:10.06	2026-06-22 01:18:10.06	0	0	0	\N
49864b40-11c5-4bba-a0b4-4776f81aa8b8	Ubiquiti UniFi PoE Audio Port Audio Streamer	ubiquiti-unifi-poe-audio-port-audio-streamer	Ubiquiti's UPL-PORT-B is a black digital audio streamer with an ultra-compact, versatile design and an intuitive control system, supporting multiple music streaming services and scalable multi-zone installations. It supports up to 32 PowerAmps, and features 1x PoE input, 2x RCA analogue inputs (L/R), 1x HDMI eARC input, 1x Optical In, as well as 2x RCA analogue outputs (L/R), 1x Optical Out and 1x USB-C versatile I/O port.\n\nThe unit is managed and controlled via the UniFi Play App.amer	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3495	4775	\N	\N	5	5	\N	UPL-PORT-B	f	t	f	\N	\N	Audio Input: 2x RCA L/R; HDMI eARC input; Optical In; USB-C (I/O)\nAudio Output: 2x RCA L/R; Optical In; USB-C (I/O)\nButton: Reset\nData Rate: 2.4GHz: 600Mbps; 5GHz: 1200Mbps\nEthernet Ports: 1x 10/100\nMax. Power Consumption: 10W\nMounting: Desktop\nOperating System: UniFi Play\nOperating Temperature: -5°C to 40°C\nOutput: Mono / Stereo sound\nPower Input: 802.3af PoE or 12V DC Adapter (Included)\nSurround Format: PCM\nStreaming: AirPlay, Spotify Connect, Soundtrack Your Brand\nZone: Up to 32 PowerAmps and PoE Audio Ports\n\nDimensions: 109 x 109 x 40.5 mm\nWeight: 250g	0	0	3	2026-06-22 00:47:31.453	2026-06-22 01:15:09.415	0	0	0	\N
d5c59a34-cfe1-4177-8c13-d52b8c27a67c	Ubiquiti UniFi AI Horn Speaker 120dB	ubiquiti-unifi-ai-horn-speaker-120db	Ubiquiti's UP-AI-SPEAKER is an all-weather PoE 120dB horn speaker with advanced AI alert functionality and versatile wall, corner and pole mounting options. The unit can be used as a direct intercom/PA system or with pre-configured messages to be played over the speaker once the event is triggered. It can be configured and managed using the UniFi Protect Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5695	7695	\N	\N	5	5	\N	UP-AI-SPEAKER	f	t	f	\N	\N	Ethernet Ports: 1x 10/100\nMax. Power Consumption: 14.3W\nMounting: Articulating mount for wall, pole mount (Included)\nRating: IP66\nPoE Input: 802.3at\nPoE Output: None\nPower Input: PoE+ (802.3af/at)\n\nDimensions: 267 x 195 x 254 mm\nWeight: 3.8kg	0	0	3	2026-06-22 00:47:35.818	2026-06-22 01:15:12.474	0	0	0	\N
1c42516d-904e-4cb4-92f4-7d36aaeb123c	Ubiquiti UniFi Protect 7 Bay 1SFP+ Gigabit Ethernet NVR Pro	ubiquiti-unifi-protect-7-bay-1sfp-gigabit-ethernet-nvr-pro	Ubiquiti's UNVR-PRO is a Network Video Recorder and UniFi OS Console. It runs the pre-installed UniFi Protect Application and makes provision for up to 7 compatible 2.5'' or 3.5'' hard drives. The UVC-NVR-PRO also features 1x SFP+, 1x Gigabit Ethernet Port and a 1.3” touchscreen display.\n\n*Note: Hard drives are not included. Please ensure your HDDs meet Ubiquiti's general guidelines and aren't included in the list of incompatible models.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	9895	13395	\N	\N	5	5	\N	UNVR-PRO	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 160W\nMounting: Rack-Mount\nOperating System: UniFi Protect\nOperating Temperature: -5 to 40° C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 1x 10Gbps\nSupported Voltage Range:100-240V\nUSB Ports: None\n\nDimensions: 442 x 325 x 87 mm\nWeight: 9.45Kg	0	0	3	2026-06-22 00:47:38.998	2026-06-22 01:15:14.649	0	0	0	\N
b72ce05d-c0fb-4507-a706-5cf54c08bf18	Ubiquiti UniFi NAS Pro 2U 7 Drive Bays	ubiquiti-unifi-nas-pro-2u-7-drive-bays	Ubiquiti UNAS-PRO is a 2U rack-mount NAS with 7x 2.5/3.5" hard drive bays, 1x Gigabit Ethernet Port and 1x 10Gbps SFP+ port designed for large-scale file storage and sharing. The UNAS-PRO also has a 1.3" touchscreen for easy management, data protection with RAID storage technology and a 1.7GHz Quad Core CPU.\n\n*Note: Hard drives are not included. Please ensure your HDDs meet Ubiquiti's general guidelines and aren't included in the list of incompatible models.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	9095	12295	\N	\N	5	5	\N	UNAS-PRO	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 160W\nMax. Power Budget for Drives: 135W\nMounting: 2U Rack-Mount\nOperating System: UniFi Drive\nOperating Temperature: -5°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included)\nProcessor: Quad-Core ARM® Cortex®-A57 at 1.7 GHz\nSerial Interface: 1x RJ45 Serial Port\nSFP Ports: 1x 10Gbps\nSupported Voltage Range: 100V-240V\nSystem Memory: 8GB\nUSB Ports: None\n\nDimensions: 442 x 325 x 87 mm	0	0	3	2026-06-22 00:47:42.127	2026-06-22 01:15:17.698	0	0	0	\N
63422a18-d703-4268-a192-ac56c5f6f94b	Ubiquiti UniFi Black UNAS 2.5Gbps Ethernet 2x 3.5" HDD bays	ubiquiti-unifi-black-unas-2-5gbps-ethernet-2x-3-5-hdd-bays	Ubiquiti's UNAS-2-B is a black UniFi Network Attached Storage device featuring 2x 3.5" HDD bays, 1x 2.5 Gbps Ethernet Port, USB-C connectivity, and an included PoE++ adapter, all in a compact footprint.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3895	5275	\N	\N	5	5	\N	UNAS-2-B	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 60W\nMax. Power Budget for Drives: 52W\nMounting: Desktop\nOperating System: UniFi Drive\nOperating Temperature: -5°C to 40°C\nPoE Input: 802.3bt\nPoE Output: None\nPower Input: 48V 60W PoE++ adapter (Included)\nProcessor: Quad-Core ARM® Cortex®-A55 at 1.7 GHz\nSerial Interface: 1x RJ45 Serial Port\nSFP Ports: None\nSupported Voltage Range: 802.3bt PoE\nSystem Memory: 4GB\nUSB Ports: 1x USB-C\n\nDimensions: 135 x 129 x 223.7 mm\nWeight: 1.3kg	0	0	3	2026-06-22 00:47:44.966	2026-06-22 01:15:19.739	0	0	0	\N
979f3d6e-3e99-43df-9f79-3a40fe4ab64c	Ubiquiti UniFi LTE4 Managed WiFi 4 Mobile Router Ultra	ubiquiti-unifi-lte4-managed-wifi-4-mobile-router-ultra	Ubiquiti's UMR-ULTRA is an ultra-compact, WiFi 4 managed LTE4 mobile router with 2x Fast Ethernet Ports for IoT applications. It features detachable LTE antennas, wired WAN, automatic failover, and can be powered by either USB-C (5V 2A) or 4-pin ATX DC power socket (9-30V DC).\n\n*Note: UMR-ULTRA comes with a 180 days mobility cloud free trial and is available for purchase thereafter from UI. PSU and 4-pin ATX adapter not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1675	2275	\N	\N	5	5	\N	UMR-ULTRA	f	t	f	\N	\N	Antenna Gain: LTE 2x External Antennas ; 2.4GHz: 1x External Antenna\nBeam-width: 360°\nData Rate: LTE: 150Mbps Downlink; 50Mbps Uplink 2.4GHz: 300Mbps\nEthernet Ports: 2x 10/100\nHardware Button: Reset\nMax. Power Consumption: 5.7W\nMounting: DIN-rail or Wall-Mount (Included)\nOperating System: UniFi\nOperating Temperature: -30°C to 70°C\nPoE Input: None\nPoE Output: None\nPower Input: USB-C 5V 2A (Not Included)\nSerial Interface: None\nSIM Slots: 1 (Nano SIM)\nSupported Voltage Range: USB-C: 5V 2A ; ATX DC: 9V-30V\nUSB Ports: None\n\nDimensions: 193.5 x 82 x 26 mm\nWeight: 220g	0	0	3	2026-06-22 00:47:46.03	2026-06-22 01:15:20.54	0	0	0	\N
ccd65b18-2b32-4777-bbbf-ba310c50f03d	Ubiquiti UISP Switch 8 Port Gigabit PoE 110W 1SFP	ubiquiti-uisp-switch-8-port-gigabit-poe-110w-1sfp	Ubiquiti's UISP-S features Layer 2 switching capabilities, 8x Gigabit 27V Passive PoE ports, 1x SFP and a PoE budget of 110W when powered with the included Power Supply. The UISP Switch can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2025	2750	\N	\N	5	5	\N	UISP-S	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8W\nMounting: Desktop or Outdoors with the UISP-BOX\n\nOperating System: UISP\nOperating Temperature: -10°C to 50°C\nPoE Input: None\nPoE Output: 27V Passive PoE Output on Ports 1~8\nPower Input: 27V, 4.4A Power Supply (Included)\nSerial Interface: None\nSFP Ports: 1x 1.25Gbps\nSupported Voltage Range: 27V\n\nDimensions: 210.4 x 95 x 29 mm\nWeight: 610g	0	0	3	2026-06-22 00:47:49.425	2026-06-22 01:15:25.014	0	0	0	\N
366cc49c-623e-4e26-99b5-53bce4e4d1aa	Ubiquiti UISP Console 9 Port Gigabit 2SFP+	ubiquiti-uisp-console-9-port-gigabit-2sfp	Ubiquiti's UISP-CON is a UISP Console with the pre-installed UISP application which features a built-in switch with 8x Gigabit Ethernet Ports and 1x 10Gbps SFP+ Port. It also offers 1x 10Gbps SFP+ and 1x Gigabit Ethernet WAN connections and can be wall or rack mounted with the included kit.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4995	6775	\N	\N	5	5	\N	UISP-CON	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000 (LAN) 1x 10/100/1000 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 30W\nMounting: Desktop, Wall or Rack-Mount\nOperating System: UISP\nOperating Temperature: -10°C to 50°C\nPoE Input: None\nPoE Output: None\nPower Input: 24V 2.5A power supply (Included)\nProcessor: Quad-Core 1.7 GHz ARM® Cortex®-A57\nSerial Interface: None\nSFP Ports: 1x 10Gbps (LAN) 1x 10Gbps (WAN)\nSupported Voltage Range: 24-28V\nSystem Memory: 4 GB DDR4\nUSB Ports: None\nOther: 1x MicroSD card slot\n\nDimensions: 210.4 x 140.2 x 43.7 mm\nWeight: 1.5kg	0	0	3	2026-06-22 00:47:52.118	2026-06-22 01:15:26.781	0	0	0	\N
0bd22bb1-fe86-4411-b356-3f6f6fc0d480	Ubiquiti UISP Fiber WiFi 6 GPON CPE with 4 Gigabit Ports	ubiquiti-uisp-fiber-wifi-6-gpon-cpe-with-4-gigabit-ports	Ubiquiti's UF-WIFI6 is a dual band, WiFi 6 (802.11ax) GPON CPE. It features an LED display, 4x Gigabit Ethernet Ports, 1xSC APC GPON WAN port and provides powerful Layer 2/3 management features. The unit is capable of distances of up to 20km with speeds of up to 2.4Gbps downstream and 1.2Gbps upstream. The UF-WIFI6 can be powered by either the included 5V 3A USB-C or 24V Passive PoE.\n\nIt can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1775	2395	\N	\N	5	5	\N	UF-WIFI6	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 1dBi ; 5.8GHz: 3dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 300Mbps ; 5.8GHz: 1.2Gbps\nEthernet Ports: 4x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 11W\nMounting: Desktop\nOperating System: UFiber\nOperating Temperature: -15°C to 45°C\nPoE Input: 24V Passive PoE\nPoE Output: None\nPower Input: 5V 3A USB-C (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 10-30V Passive PoE ; 5VDC USB-C\nUSB Ports: None\nOther: 1x 2.5/1.25Gbps SC APC GPON\n\nDimensions: 140.8 x 141.5 x 31.65 mm\nWeight: 415g	0	0	3	2026-06-22 00:47:56.223	2026-06-22 01:15:31.585	0	0	0	\N
6f511958-e8cf-4440-a90e-2fe367513541	Ubiquiti UISP Fiber GPON OLT 8 PON Ports 2SFP+	ubiquiti-uisp-fiber-gpon-olt-8-pon-ports-2sfp	Ubiquiti's UF-OLT is a fibre solution that anyone can deploy. No command lines, manuals or paid support licenses are required. The UISP Fiber UF-OLT features 8x PON ports to connect up to 1024 ONUs (128x ONUs per port), 2x SFP+ ports and 2x Gigabit Ethernet Management ports. The unit also features 2x Hotswap AC/DC PSUs for power redundancy.\n\nIt can be managed via the UISP network management platform.\n\n*Note: 1x UF-GP-B+ included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	25595	34675	\N	\N	5	5	\N	UF-OLT-8	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000 (Management Port)\nHardware Button: Reset\nMax. Power Consumption: 40W\nMounting: Rack-Mount\nOperating System: UFiber\nOperating Temperature: -10°C to 45°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included) ; 24V DC (Not Included)\nSerial Interface: 1x RJ45 Serial Console Port\nSFP Ports: 8x 2.5/1.25Gbps GPON Ports ; 2x 10Gbps SFP+\nSupported Voltage Range: 100V – 240V\nUSB Ports: 1x USB 2.0\n\nDimensions: 442.4 x 285.6 x 43.7 mm\nWeight: 4.5kg	0	0	3	2026-06-22 00:47:58.176	2026-06-22 01:15:33.234	0	0	0	\N
2fee61aa-a3e5-49b8-96ca-b8d0e7145a4a	Ubiquiti UniFi Dream Machine Special Edition 8 PoE 1SFP+	ubiquiti-unifi-dream-machine-special-edition-8-poe-1sfp	Ubiquiti's UDM-SE is an all-in-one enterprise-grade UniFi OS Console. It is designed to host the full UniFi application suite. It comes with an advanced security gateway feature set and a built-in 8-Port Switch with 6 PoE and 2 PoE+ ports. It also features Dual WAN Ports (one 10G SFP+ and one 2.5Gbps RJ45), a 10G SFP+ LAN Port and a 3.5" HDD Bay for NVR Storage (2.5" HDD also supported). It features a 1.3" LCM (Liquid Crystal Monitor) colour touchscreen to display key system and connection information. PoE budget on the unit is 190W.\n\n*Note: Hard drive not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	8950	12095	\N	\N	5	5	\N	UDM-SE	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000/2500 (WAN); 8x 10/100/1000 (LAN)\nHardware Button: Reset\nMax. Power Consumption: 50W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: 6x 802.3af ; 2x 802.3at\nPower Input: 1x IEC Power Cord (Included); 1x RPS DC Input\nProcessor: Quad-Core ARM® Cortex®-A57 at 1.7 GHz\nSerial Interface: None\nSFP Ports: 2x 10Gbps (1xLAN; 1xWAN)\nSupported Voltage Range: 100V-240V ; 44-57V (802.3af) ; 50-57V (802.3at)\nSystem Memory: 4 GB DDR4\nUSB Ports: None\n\nDimensions: 442.4 x 43.7 x 285.6 mm\nWeight: 4.95kg	0	0	3	2026-06-22 00:48:00.331	2026-06-22 01:15:35.297	0	0	0	\N
e5a717be-3c98-4f29-b291-c28001fb41c8	Ubiquiti UniFi Dream Machine Pro 9 Port Gigabit with 2SFP+	ubiquiti-unifi-dream-machine-pro-9-port-gigabit-with-2sfp	Ubiquiti's UDM-PRO is an all-in-one enterprise-grade UniFi OS Console. It supports the full UniFi application suite and features an advanced security gateway with dual-WAN ports, 8 port Gigabit switch, a 10G SFP+ LAN Port and a 3.5" HDD Bay for NVR Storage (2.5" HDD also supported). It features a 1.3" LCM (Liquid Crystal Monitor) colour touchscreen to display key system and connection information.\n\n*Note: Hard drive not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	6895	9425	\N	\N	5	5	\N	UDM-PRO	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000 (LAN) ; 1x 10/100/1000 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 33W\nMounting: Rack-Mount\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x IEC Power Cord (Included); 1x RPS DC Input\nProcessor: 1.7Ghz Arm Cortex-A57 Quad-Core\nSerial Interface: None\nSFP Ports: 2x 10Gbps (1xLAN 1xWAN)\nSupported Voltage Range: 100V-240V\nSystem Memory: 4 GB DDR4\nUSB Ports: None\n\nDimensions: 442.4 x 43.7 x 285.6mm\nWeight: 3.90kg	0	0	3	2026-06-22 00:48:02.524	2026-06-22 01:15:36.832	0	0	0	\N
079acd38-89da-4983-948e-d93fef5f9bf0	Ubiquiti UniFi WiFi Device Bridge for IoT	ubiquiti-unifi-wifi-device-bridge-for-iot	Ubiquiti's UDB-IOT is an ultra-compact wireless bridge for IoT devices and features integrated UniFi WiFi Auto-Link, versatile mounting options, and is powered by USB Type-C or 4-pin DC socket.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	895	1225	\N	\N	5	5	\N	UDB-IOT	f	t	f	\N	\N	Antenna Gain: Internal: 4dBi External: 3dBi\nData Rate: 2.4GHz: 300Mbps\nEthernet Ports: 1x 10/100\nMax. Power Consumption: 2.3W\nMounting: Wall or DIN-rail\nOperating Temperature: -10°C to 50°C\nPower Input: USB Type-C (5V DC, 1A) or 4-pin DC (9–30V DC)\nPoE Input: None\nSupported Voltage Range: USB-C: 5V DC or Socket: 9–30V DC\n\nDimensions: Device: 63 x 44.5 x 25.5 mm\nWith external antenna: 89 x 44.5 x 25.5 mm\nWeight: 45g	0	0	3	2026-06-22 00:48:06.474	2026-06-22 01:15:40.686	0	0	0	\N
3afb39be-85c8-43db-9c31-9da11bfbd2fa	Cudy Gigabit Ethernet Media Converter	cudy-gigabit-ethernet-media-converter	Cudy's CD-MC220 is a Gigabit Ethernet to Fibre media converter. The unit supports both half and full duplex and includes support for jumbo frames up to 9 KB.\n\n*Note: SFP module sold separately.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	150	215	\N	\N	5	5	\N	CD-MC220	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000\nMax. Power Consumption: 3W\nOperating Temperature: -40°C to 70°C\nPoE Input: None\nPoE Output: None\nPower Input: 5V 1A Power Supply (Included)\nSFP Ports: 1x 1.25Gbps\nSupported Voltage Range: 5V 1A	0	0	3	2026-06-22 01:18:11.15	2026-06-22 01:18:11.15	0	0	0	\N
9ca26b4b-cdf8-4db4-8441-91b3e1bd60c7	Ubiquiti UniFi Device Bridge WiFi Bridging PoE Adapter	ubiquiti-unifi-device-bridge-wifi-bridging-poe-adapter	Ubiquiti's UDB is a UniFi Plug-and-play, wireless bridging PoE adapter with integrated UniFi WiFi Auto-Link. It features 1xGE LAN port that provides 48V 15W PoE output, a 5GHz band with up to 867 Mbps throughput and is compatible with UniFi Protect PoE cameras and various IoT devices via an Ethernet connection. It can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1695	2295	\N	\N	5	5	\N	UDB	f	t	f	\N	\N	Antenna Gain: 5.8GHz: 5dBi (Internal Antenna ) or 4 dBi (External Omni Antenna)\nBeam-width: 360°\nData Rate: 5.8GHz: 867Mbps\nEthernet Ports: 2x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 10W\nMounting: Wall Mount\nOperating System: UniFi\nOperating Temperature: -10 to 40°C\nPoE Input: None\nPoE Output: 48V 15W\nPower Input: 1x Clover Power Cable (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 100—240V\nUSB Ports: None\n\nDimensions: 130 x 55 x 34 mm\nWeight: 200g	0	0	3	2026-06-22 00:48:07.624	2026-06-22 01:15:41.736	0	0	0	\N
673e708d-3023-48f5-b9c9-8ac50a9d54a1	Ubiquiti UniFi CloudKey+ Console with 1TB SSD	ubiquiti-unifi-cloudkey-console-with-1tb-ssd	Ubiquiti's UCK-G2-SSD is a compact UniFi console running the complete UniFi application suite for full stack network management and features a pre-installed 1TB SSD. The unit can be powered by PoE or a USB-C quick charge adapter.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4495	6095	\N	\N	5	5	\N	UCK-G2-SSD	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 9.6W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: 0°C to 35°C\nPoE Input: 802.3af/at (PoE)\nPoE Output: None\nPower Input: 802.03af/at (PoE) or 9V 2A USB-C Power Supply (Not Included)\nProcessor: Octa-core Arm® Cortex®-A53 based chip\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 9V 2A (USB-C)\nSystem Memory: 3 GB DDR4\nUSB Ports: None\n\nDimensions: 131.2 x 27.1 x 134.2 mm\nWeight: 560g	0	0	3	2026-06-22 00:48:09.092	2026-06-22 01:15:42.625	0	0	0	\N
e0250c58-c5e4-4743-bff4-d1af736f7fff	Ubiquiti 2.5Gbps Multi-WAN UniFi Cloud Gateway Max	ubiquiti-2-5gbps-multi-wan-unifi-cloud-gateway-max	Ubiquiti's UCG-MAX is a powerful and compact 2.5Gbps multi-WAN UniFi Cloud Gateway with a full suite of advanced routing and security features with 1.5Gbps IPS routing and a 512GB SSD for NVR storage. The unit can run all UniFi applications for full-stack network management and features 4x 2.5Gbps Ethernet ports, 1x 2.5Gbps WAN Port, a quad-core 1.5GHz CPU, 0.96" LCM status display, and Multi-WAN load balancing.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4895	6625	\N	\N	5	5	\N	UCG-MAX	f	t	f	\N	\N	Ethernet Ports: 4x 10/100/1000/2500 (LAN); 1x 10/100/1000/2500 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 16.1W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x 5V 5A USB Power Adapter (Included)\nProcessor: Quad-core ARM® Cortex®-A53 at 1.5GHz\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 5V 3A via USB\nSystem Memory: 3GB DDR4\nUSB Ports: None\n\nDimensions: 141.8 x 127.6 x 30 mm\nWeight: 0.52kg	0	0	3	2026-06-22 00:48:11.114	2026-06-22 01:15:43.645	0	0	0	\N
99674d6b-d843-4230-bc71-6cd092d116e1	Ubiquiti UniFi WiFi 7 Pro XGS Tri-Band White AP	ubiquiti-unifi-wifi-7-pro-xgs-tri-band-white-ap	Built for high-density, enterprise environments, the Ubiquiti U7-PRO-XGS-W is a white, Tri-Band WiFi 7 access point featuring 8 spatial streams and a high-speed 10Gbps Ethernet port. By utilizing the 6GHz spectrum for interference-free wireless performance, it delivers a massive aggregate data rate of up to 15Gbps across three bands: 6GHz ($2\\times2$ MU-MIMO), 5GHz ($4\\times4$ MU-MIMO), and 2.4GHz ($2\\times2$ MU-MIMO). This PoE++ powered AP is fully managed via the UniFi Network Application.\n*Note: A PoE++ injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5495	7450	\N	\N	5	5	\N	U7-PRO-XGS-W	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5GHz: 6dBi; 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 8.6Gbbps ; 6GHz: 5.8Gbps\nEthernet Ports: 1x 10/100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 29W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3bt (PoE++)\nPoE Output: None\nPower Input: 802.3bt (PoE++) (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: Ø215 x 32.5 mm\nWeight: 800g	0	0	3	2026-06-22 00:48:58.446	2026-06-22 01:16:28.483	0	0	0	\N
24f71c0e-de3e-4fe5-baad-e652941cb8e8	Ubiquiti UniFi WiFi 7 Pro XGS Tri-Band Black AP	ubiquiti-unifi-wifi-7-pro-xgs-tri-band-black-ap	Designed for heavy traffic and enterprise environments, the Ubiquiti U7-PRO-XGS-B is a black, Tri-Band WiFi 7 access point boasting 8 spatial streams and a 10Gbps Ethernet port. It utilizes the clean 6GHz spectrum for interference-free connectivity, reaching an aggregate data rate of up to 15Gbps across its three bands: 6GHz ($2\\times2$ MU-MIMO), 5GHz ($4\\times4$ MU-MIMO), and 2.4GHz ($2\\times2$ MU-MIMO). The AP is powered via 802.3bt PoE++ and integrates seamlessly with the UniFi Network Application.*Note: A PoE++ injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5495	7450	\N	\N	5	5	\N	U7-PRO-XGS-B	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5GHz: 6dBi; 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 8.6Gbbps ; 6GHz: 5.8Gbps\nEthernet Ports: 1x 10/100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 29W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3bt (PoE++)\nPoE Output: None\nPower Input: 802.3bt (PoE++) (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: Ø215 x 32.5 mm\nWeight: 800g	0	0	3	2026-06-22 00:48:59.674	2026-06-22 01:16:29.493	0	0	0	\N
e2cfae11-66f2-4fa6-b68f-154e776956a1	Ubiquiti UniFi WiFi 7 Pro XG Tri-Band White AP	ubiquiti-unifi-wifi-7-pro-xg-tri-band-white-ap	The Ubiquiti U7-PRO-XG-W is a white, Tri-Band WiFi 7 access point built for high-density, large-scale deployments. It features 6 spatial streams, a 10Gbps Ethernet port, and leverages the 6GHz band for interference-free wireless performance. Capable of hitting an aggregate throughput of up to 10.78Gbps across its 6GHz, 5GHz, and 2.4GHz bands (all 2x2 MU-MIMO), this PoE+ powered AP is easily managed and configured through the UniFi Network Application.\n\n*Note: PoE+ injector is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3695	4995	\N	\N	5	5	\N	U7-PRO-XG-W	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5GHz: 5dBi; 6GHz: 6dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 4.3Gbps ; 6GHz: 5.8Gbps\nEthernet Ports: 1x 10/100/1000/2500/10000\nHardware Button: Reset\nMax. Power Consumption: 22W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3at (PoE+)\nPoE Output: None\nPower Input: 802.3at (PoE+) (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: Ø206 x 32.5 mm\nWeight: 750g	0	0	3	2026-06-22 00:49:00.807	2026-06-22 01:16:30.394	0	0	0	\N
d094d202-b400-44c6-8093-0c190826b2b0	Linkbasic 15m Shielded UV Protected Cat5e Flylead	linkbasic-15m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY15 is a 15-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for outdoor runs, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	215	295	\N	\N	5	5	\N	TC-FLY15	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 15m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:01.742	2026-06-22 01:17:01.742	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
3fbc9bec-f8c8-4602-932c-4c77110ccfe8	Linkbasic 10m Shielded UV Protected Cat5e Flylead	linkbasic-10m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY10 is a 10-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for outdoor deployment, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	150	215	\N	\N	5	5	\N	TC-FLY10	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 10m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:03.033	2026-06-22 01:17:03.033	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
97014011-8f9c-4d7d-8d2e-0a8fa03f7cdb	Linkbasic 5m Shielded UV Protected Cat5e Flylead	linkbasic-5m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY05 is a 5-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for outdoor deployment, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	85	115	\N	\N	5	5	\N	TC-FLY05	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 5m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:04.213	2026-06-22 01:17:04.213	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
13caa7d9-693a-47a4-b60c-1402913383e8	Linkbasic 2m Shielded UV Protected Cat5e Flylead	linkbasic-2m-shielded-uv-protected-cat5e-flylead	Engineered for harsh outdoor environments, the Linkbasic TC-FLY02 is a 2-meter Category 5e shielded flylead featuring a UV-resistant jacket and an integrated ESD (electrostatic discharge) drain wire. This heavy-duty FTP cable is optimized for outdoor deployment, offering enhanced power handling alongside superior Ethernet link stability, faster speeds, and reliable data throughput.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	40	60	\N	\N	5	5	\N	TC-FLY02	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 2m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:05.256	2026-06-22 01:17:05.256	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
8b5f3f12-b7e4-4d40-ab86-0778ae788ffc	Linkbasic 500m Shielded UV Protected Cat6 Cable	linkbasic-500m-shielded-uv-protected-cat6-cable	Designed for heavy-duty deployments, Linkbasic’s TC-6500 is a Category 6 outdoor shielded bulk cable featuring 4-pair solid copper conductors and a UV-resistant jacket. This high-grade FTP cable shields network infrastructure from static buildup and environmental wear, while its optimized architecture enhances power delivery over long runs. The result is significantly improved link stability, faster speeds, and reliable network performance.\n\nCompatibility Note: This Cat6 outdoor cable requires specific RJ45-6FTP connectors for proper termination.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	5375	7275	\N	\N	5	5	\N	TC-6500	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 500m\nColour: Black\nConductor Dimensions: 0.573mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:06.207	2026-06-22 01:17:06.207	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
5b569768-00c6-4ca4-b8ec-4b5935ae2c6b	Scoop 305m Box CAT6 Outdoor FTP CCA Cable	scoop-305m-box-cat6-outdoor-ftp-cca-cable	Scoop’s TC-6305C is a budget-friendly 305m outdoor Category 6 FTP bulk cable designed for cost-conscious network installations. It features 23 AWG twisted pairs made from Copper-Clad Aluminium (CCA), which offers an economical alternative to solid copper while carrying a higher DC resistance. Engineered for outdoor durability, the cable includes a UV-protected outer sheath and an integrated ESD drain wire, all packaged in a convenient, easy-pull dispenser box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	950	1285	\N	\N	5	5	\N	TC-6305C	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: Black\nConductor Dimensions: 0.56mm\nConstruction: FTP – CCA Copper Clad Aluminium\nCross Filter: Yes\nESD Drain Wire: Yes – Copper Clad Aluminium\nNumber of Pairs: 4\nOuter Jacket: UV-PE\n\nDimensions: 420 x 420 x 265mm	0	0	3	2026-06-22 01:17:07.28	2026-06-22 01:17:07.28	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
c5a5a110-d8e7-4a59-9ff7-58c49b4f2d58	Linkbasic 305m Shielded UV Protected Cat6 Cable	linkbasic-305m-shielded-uv-protected-cat6-cable	Designed for heavy-duty deployments, Linkbasic’s TC-6305 is a Category 6 outdoor shielded bulk cable featuring 4-pair solid copper conductors and a UV-resistant jacket. This high-grade FTP cable shields network infrastructure from static buildup and environmental wear, while its optimized architecture enhances power delivery over long runs. The result is significantly improved link stability, faster speeds, and reliable network performance.\n\nCompatibility Note: This Cat6 outdoor cable requires specific RJ45-6FTP connectors for proper termination.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	3295	4475	\N	\N	5	5	\N	TC-6305	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 305m\nColour: Black\nConductor Dimensions: 0.573mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:08.445	2026-06-22 01:17:08.445	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
71b00bd5-e15b-4f8f-8098-f6f376805d2b	Linkbasic 100m Shielded UV Protected Cat6 Cable	linkbasic-100m-shielded-uv-protected-cat6-cable	Designed for heavy-duty deployments, Linkbasic’s TC-6100 is a Category 6 outdoor shielded bulk cable featuring 4-pair solid copper conductors and a UV-resistant jacket. This high-grade FTP cable shields network infrastructure from static buildup and environmental wear, while its optimized architecture enhances power delivery over long runs. The result is significantly improved link stability, faster speeds, and reliable network performance.\n\nCompatibility Note: This Cat6 outdoor cable requires specific RJ45-6FTP connectors for proper termination.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1150	1595	\N	\N	5	5	\N	TC-6100	f	t	f	\N	\N	AWG Rating: 23\nCable Length: 100m\nColour: Black\nConductor Dimensions: 0.573mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: Yes\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:09.469	2026-06-22 01:17:09.469	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
fc684adc-50ed-4cb5-a1ec-ee08a7f1d2cc	Linkbasic 500m Shielded UV Protected Cat5e Cable	linkbasic-500m-shielded-uv-protected-cat5e-cable	Built to withstand harsh outdoor deployments, Linkbasic’s TC-500 is a Category 5e outdoor shielded bulk cable featuring 4-pair solid copper conductors and a UV-resistant jacket. This high-grade FTP cable effectively safeguards your network infrastructure against static buildup and environmental exposure. Its optimized internal architecture enhances power delivery over extended distances, ensuring highly stable link-states, maximum throughput speeds, and reliable data transmission.\n\nCompatibility Note: This specialized outdoor cable is designed exclusively for use with RJ45-FTP shielded connectors and is incompatible with standard unshielded RJ45 plugs.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	4350	5895	\N	\N	5	5	\N	TC-500	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 500m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:10.495	2026-06-22 01:17:10.495	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
cbe2268d-8889-4c11-9faa-7004af148523	Linkbasic 305m Shielded UV Protected Cat5e Cable	linkbasic-305m-shielded-uv-protected-cat5e-cable	Built to withstand harsh outdoor deployments, Linkbasic’s TC-305 is a Category 5e outdoor shielded bulk cable featuring 4-pair solid copper conductors and a UV-resistant jacket. This high-grade FTP cable effectively safeguards your network infrastructure against static buildup and environmental exposure. Its optimized internal architecture enhances power delivery over extended distances, ensuring highly stable link-states, maximum throughput speeds, and reliable data transmission.\n\nCompatibility Note: This specialized outdoor cable is designed exclusively for use with RJ45-FTP shielded connectors and is incompatible with standard unshielded RJ45 plugs.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2675	3625	\N	\N	5	5	\N	TC-305	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:11.397	2026-06-22 01:17:11.397	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
34b7bbe6-4a9c-4806-982d-07d260f441ac	Linkbasic 100m Shielded UV Protected Cat5e Cable	linkbasic-100m-shielded-uv-protected-cat5e-cable	Built to withstand harsh outdoor deployments, Linkbasic’s TC-100 is a Category 5e outdoor shielded bulk cable featuring 4-pair solid copper conductors and a UV-resistant jacket. This high-grade FTP cable effectively safeguards your network infrastructure against static buildup and environmental exposure. Its optimized internal architecture enhances power delivery over extended distances, ensuring highly stable link-states, maximum throughput speeds, and reliable data transmission.\n\nCompatibility Note: This specialized outdoor cable is designed exclusively for use with RJ45-FTP shielded connectors and is incompatible with standard unshielded RJ45 plugs.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	895	1225	\N	\N	5	5	\N	TC-100	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 100m\nColour: Black\nConductor Dimensions: 0.510mm\nConstruction: FTP - Solid Bare Copper\nCross Filter: None\nESD Drain Wire: Yes; Tinned Copper\nNumber of Pairs: 4\nOuter Jacket: UV-PE	0	0	3	2026-06-22 01:17:12.264	2026-06-22 01:17:12.264	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
1a3bd56e-c5e2-48de-8ba1-0d6fdd9d34d4	Cable Ties T50R 200 x 4.8mm	cable-ties-t50r-200-x-4-8mm	Crafted from durable Nylon 66, Scoop’s T50R cable ties combine exceptional tensile strength with a low-insertion force design for fast, effortless tightening. They provide a highly reliable bundling solution for cable management and general organizing tasks.\n\nPack Size: Supplied in convenient packs of 100 units.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	30	40	\N	\N	5	5	\N	T50R	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:13.193	2026-06-22 01:17:13.193	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
3b6ce164-e78b-4007-91d3-e02bc69eb445	Cable Ties T50L 370 x 4.8mm	cable-ties-t50l-370-x-4-8mm	Crafted from durable Nylon 66, Scoop’s T50L cable ties combine exceptional tensile strength with a low-insertion force design for fast, effortless tightening. They provide a highly reliable bundling solution for extended cable management and general organizing tasks.\n\nPack Size: Supplied in convenient packs of 100 units.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	55	75	\N	\N	5	5	\N	T50L	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:14.091	2026-06-22 01:17:14.091	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
57cb164e-143d-4419-9905-2814d8e6705c	Cabinet Cage Nuts	cabinet-cage-nuts	Designed for standard 19-inch server cabinets and open racks, the Scoop ST-CAGE (by Linkbasic) provides a reliable mounting solution for square-hole racking systems. These cage nuts slide easily into square mounting profiles to create the secure, threaded anchor point required for traditional hardware installation. While some modern servers feature toolless rails, cage nuts remain essential for mounting shelves, switches, routers, UPS systems, and KVM equipment.\n\nOrdering Information: Sold individually. Each unit includes one screw and one matching cage nut.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2	2.75	\N	\N	5	5	\N	ST-CAGE	f	t	f	\N	\N	- Nut: M6 square nut\n- Cage: M6*12 general type cage\n- Surface finish: Orchid Zinc\n- Loading capability: 50 Kg	0	0	3	2026-06-22 01:17:18.124	2026-06-22 01:17:18.124	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
6fea70b1-0201-43c5-897d-a19f37a21ef6	Scoop 8 Port Gigabit PoE 96W 2SFP Switch	scoop-8-port-gigabit-poe-96w-2sfp-switch	Scoop’s SPS-8G2S is an unmanaged 8-port Gigabit Ethernet AI PoE switch equipped with 2 x 1.25Gbps SFP uplink ports for high-speed fiber connectivity. All 8 Ethernet ports are IEEE 802.3af/at compliant, automatically detecting and delivering power to compatible devices. The switch features a total PoE power budget of 96W, supporting up to a maximum of 36W on a single port.\n\nTo optimize network performance and troubleshooting, the SPS-8G2S features a physical toggle supporting 4 Intelligent Working Modes:\n\nExtend Mode: Boosts PoE and data transmission distance on ports 1–8 up to 250 meters (capped at 10Mbps, requiring solid copper Cat6 cable).\n\nVLAN Mode: Activates port isolation on ports 1–8 to prevent broadcast storms and enhance security.\n\nQoS Mode: Automatically prioritizes network bandwidth based on real-time traffic history and analytics.\n\nAI PoE Mode: Actively monitors connected devices and automatically power-cycles a PoE device if no data traffic is detected for a predetermined period.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	795	1075	\N	\N	5	5	\N	SPS-8G2S	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 6W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~8\nPower Input: 52V 1.85A Power Adapter (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps Ports\nSupported Voltage Range: 52V\n\nDimensions: 185mm x 95mm x 28mm\nWeight: 0.95kg	0	0	3	2026-06-22 01:17:19.068	2026-06-22 01:17:19.068	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
f6b18f48-d127-4a8b-a01d-cd787344ffc5	Scoop 10 Port Gigabit 8 PoE 96W Switch	scoop-10-port-gigabit-8-poe-96w-switch	Scoop’s SPS-8G2G is an unmanaged 8-port Gigabit Ethernet AI PoE switch featuring 2 dedicated Gigabit Ethernet uplink ports for seamless network integration. All 8 PoE ports are fully IEEE 802.3af/at compliant, allowing them to auto-detect and safely deliver power only to compatible devices. The switch offers a total PoE budget of 96W, with a maximum capacity of 36W per individual port.\n\nTo maximize network efficiency, the SPS-8G2G includes a toggle switch supporting 4 Intelligent Working Modes:\n\nVLAN Mode (Port Isolation): Isolates ports 1–8 from one another to minimize broadcast storms and enhance local security.\n\nExtend Mode: Extends data and power transmission on ports 1–8 up to 250 meters (negotiates down to 10Mbps; requires solid copper Cat6 cable).\n\nAI PoE Mode (Watchdog): Automatically reboots a connected PoE device by power-cycling the port if no data traffic is detected for a set period.\n\nQoS Mode: Prioritizes network bandwidth dynamically based on real-time traffic history and analytics.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	775	1050	\N	\N	5	5	\N	SPS-8G2G	f	t	f	\N	\N	Ethernet Ports: 10x 10/100/1000\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 6W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~8\nPower Input: 52V 1.85A Power Adapter (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 52V\n\nDimensions: 184 x 94 x 27mm	0	0	3	2026-06-22 01:17:19.996	2026-06-22 01:17:19.996	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
b61eb77f-f642-45d8-b5c8-380103fc50a5	Scoop 8 Port Fast Ethernet PoE 96W 2 Gigabit Switch	scoop-8-port-fast-ethernet-poe-96w-2-gigabit-switch	Scoop’s SPS-8F2G is an unmanaged 8-port Fast Ethernet AI PoE switch equipped with 2 Gigabit Ethernet uplink ports for high-speed backbone connectivity. All 8 downlink ports are IEEE 802.3af/at compliant, automatically detecting and delivering power only to compatible devices. The switch features an overall PoE budget of 96W, supporting up to a maximum of 30W on any single port.\n\nTo maximize network efficiency, the SPS-8F2G includes a physical toggle supporting 4 Intelligent Working Modes:\n\nExtend Mode: Increases PoE and data transmission distance on ports 1–8 up to 250 meters (negotiates down to 10Mbps; requires solid copper Cat6 cable).\n\nVLAN Mode: Activates port isolation on ports 1–8 to prevent broadcast storms and improve security.\n\nQoS Mode: Automatically prioritizes network bandwidth based on real-time traffic history and usage analytics.\n\nAI PoE Mode (Watchdog): Actively monitors connected devices and automatically power-cycles the port to reboot a PoE device if no data traffic is detected for a set time.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	595	825	\N	\N	5	5	\N	SPS-8F2G	f	t	f	\N	\N	Ethernet Ports: 8x 10/100 ; 2x 10/100/1000\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 5W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~8\nPower Input: 52V 1.85A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 52V\n\nDimensions: 184mm x 95mm x 28mm	0	0	3	2026-06-22 01:17:21.104	2026-06-22 01:17:21.104	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
7c63ccb8-5a72-4be3-a5be-5371770947b3	Scoop 10 Port Fast Ethernet 8 PoE 96W Switch	scoop-10-port-fast-ethernet-8-poe-96w-switch	Scoop’s SPS-8F2F is an unmanaged 8-port Fast Ethernet AI PoE switch equipped with 2 Fast Ethernet uplink ports for budget-friendly network expansion. All 8 PoE ports are fully IEEE 802.3af/at compliant, allowing them to auto-detect and safely deliver power only to compatible devices. The switch offers an overall PoE budget of 96W, with a high-capacity maximum of 36W per individual port.\n\nTo maximize network efficiency, the SPS-8F2F includes a physical toggle supporting 4 Intelligent Working Modes:\n\nVLAN Mode (Port Isolation): Isolates ports 1–8 from one another to minimize broadcast storms and enhance local network security.\n\nExtend Mode: Increases data and power transmission on ports 1–8 up to 250 meters (negotiates down to 10Mbps; requires solid copper Cat6 cable).\n\nAI PoE Mode (Watchdog): Actively monitors connected nodes and automatically power-cycles the port to reboot a PoE device if no data traffic is detected for a set time.\n\nQoS Mode: Prioritizes network bandwidth dynamically based on real-time traffic history and usage analytics.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	525	750	\N	\N	5	5	\N	SPS-8F2F	f	t	f	\N	\N	Ethernet Ports: 10x 10/100\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 3W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~8\nPower Input: 52V 1.85A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 52V\n\nDimensions: 184 x 94 x 27mm	0	0	3	2026-06-22 01:17:22.213	2026-06-22 01:17:22.213	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
7b030388-d5c6-4652-93c3-736da62ce16d	Scoop 6 Port Gigabit 4 PoE 60W Switch	scoop-6-port-gigabit-4-poe-60w-switch	Scoop’s SPS-4G2G is an unmanaged 4-port Gigabit Ethernet AI PoE switch featuring 2 dedicated Gigabit Ethernet uplink ports for seamless network integration. All 4 PoE ports are fully IEEE 802.3af/at compliant, allowing them to auto-detect and safely deliver power only to compatible devices. The switch offers a total PoE budget of 60W, with a high-capacity maximum of 36W per individual port.\n\nTo maximize network efficiency, the SPS-4G2G includes a physical toggle supporting 4 Intelligent Working Modes:\n\nVLAN Mode (Port Isolation): Isolates ports 1–4 from one another to minimize broadcast storms and enhance local network security.\n\nExtend Mode: Increases data and power transmission on ports 1–4 up to 250 meters (negotiates down to 10Mbps; requires solid copper Cat6 cable).\n\nAI PoE Mode (Watchdog): Actively monitors connected nodes and automatically power-cycles the port to reboot a PoE device if no data traffic is detected for a set time.\n\nQoS Mode: Prioritizes network bandwidth dynamically based on real-time traffic history and usage analytics.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	495	675	\N	\N	5	5	\N	SPS-4G2G	f	t	f	\N	\N	Ethernet Ports: 6x 10/100/1000\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 6W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~4\nPower Input: 52V 1.15A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 52V\n\nDimensions: 125 x 75 x 27mm	0	0	3	2026-06-22 01:17:23.523	2026-06-22 01:17:23.523	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
ef5a311d-3935-494a-a7e8-67f912197f6a	Scoop 6 Port Fast Ethernet 4 PoE 60W Switch	scoop-6-port-fast-ethernet-4-poe-60w-switch	Scoop’s SPS-4F2F is an unmanaged 4-port Fast Ethernet AI PoE switch equipped with 2 Fast Ethernet uplink ports for budget-friendly network expansion. All 4 PoE ports are fully IEEE 802.3af/at compliant, allowing them to auto-detect and safely deliver power only to compatible devices. The switch offers an overall PoE budget of 60W, with a high-capacity maximum of 36W per individual port.\n\nTo maximize network efficiency, the SPS-4F2F includes a physical toggle supporting 4 Intelligent Working Modes:\n\nVLAN Mode (Port Isolation): Isolates ports 1–4 from one another to minimize broadcast storms and enhance local network security.\n\nExtend Mode: Increases data and power transmission on ports 1–4 up to 250 meters (negotiates down to 10Mbps; requires solid copper Cat6 cable).\n\nAI PoE Mode (Watchdog): Actively monitors connected nodes and automatically power-cycles the port to reboot a PoE device if no data traffic is detected for a set time.\n\nQoS Mode: Prioritizes network bandwidth dynamically based on real-time traffic history and usage analytics.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	325	450	\N	\N	5	5	\N	SPS-4F2F	f	t	f	\N	\N	Ethernet Ports: 6x 10/100\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 3W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~4\nPower Input: 52V 1.15A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 52V\n\nDimensions: 125 x 75 x 27mm	0	0	3	2026-06-22 01:17:24.642	2026-06-22 01:17:24.642	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
59c6c3b1-9b6e-4ac1-8f70-5590d62aa824	Scoop 24 Port Gigabit PoE 250W 2SFP Switch	scoop-24-port-gigabit-poe-250w-2sfp-switch	Scoop’s SPS-24G2S is an unmanaged 24-port Gigabit Ethernet AI PoE switch equipped with 2 x 1.25Gbps SFP uplink ports for high-capacity fiber backhaul. All 24 Gigabit Ethernet ports are IEEE 802.3af/at compliant, allowing them to auto-detect and safely deliver power only to compatible devices. The switch features an expansive total PoE power budget of 250W, supporting up to a maximum of 30W on any single port.\n\nTo maximize network efficiency, the SPS-24G2S includes a physical toggle supporting 4 Intelligent Working Modes:\n\nExtend Mode (Ports 1–8): Increases PoE and data transmission distance on the first 8 ports up to 250 meters (negotiates down to 10Mbps; requires solid copper Cat6 cable).\n\nVLAN Mode (Port Isolation): Activates port isolation across all downlink ports (1–24) to eliminate broadcast storms and enhance security.\n\nQoS Mode: Automatically prioritizes network bandwidth based on real-time traffic history and usage analytics.\n\nAI PoE Mode (Watchdog): Actively monitors connected nodes and automatically power-cycles the port to reboot a PoE device if no data traffic is detected for a set time.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2425	3295	\N	\N	5	5	\N	SPS-24G2S	f	t	f	\N	\N	Ethernet Ports: 24x 10/100/1000\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 15W\nMounting: Desktop or Rack-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~24\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps\nSupported Voltage Range: 100V-240V\n\nDimensions: 440mm x 180mm x 44mm	0	0	3	2026-06-22 01:17:25.706	2026-06-22 01:17:25.706	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
8100ce57-7b29-4ca4-8030-2dd8599c1638	Scoop 24 Port Fast Ethernet PoE 250W 2 Gigabit 1SFP Switch	scoop-24-port-fast-ethernet-poe-250w-2-gigabit-1sfp-switch	Power and manage high-density security systems with Scoop's SPS-24F2G2 unmanaged AI switch. Combining 24 Fast Ethernet PoE ports with dual Gigabit copper uplinks and a shared SFP combo port for fiber backhaul, it provides a massive 250W power pool (up to 30W per port) to effortlessly run large IP camera installations and access control equipment.\n\nAdvanced AI Intelligent Modes:\n250m Extend (Ports 1-8): Push power and data further for long-distance perimeter device runs.\n\nOne-Key VLAN (Ports 1-24): Isolate all 24 downlink ports from one another to minimize network congestion and isolate threats.\n\nSmart QoS: Prioritize critical data traffic automatically to ensure smooth video streaming and clear VoIP quality.\n\nAI PoE Watchdog: Minimize maintenance site visits by letting the switch automatically reboot frozen or unresponsive PoE devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	SPS-24F2GS	f	t	f	\N	\N	Ethernet Ports: 24x 10/100 ; 2x 10/100/1000 (Combo)\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 10W\nMounting: Desktop or Rack-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~24\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 1x 1.25Gbps (Combo)\nSupported Voltage Range: 100V-240V\n\nDimensions: 440mm x 180mm x 44mm	0	0	3	2026-06-22 01:17:26.662	2026-06-22 01:17:26.662	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
53cd042b-904b-41c7-a963-cd39acabdfee	Linkbasic Direct Attached Copper 3m 10G SFP+ Uplink Cable	linkbasic-direct-attached-copper-3m-10g-sfp-uplink-cable	Linkbasic's SFP-DC3 is a 3-meter, high-performance SFP+ Direct Attach Copper (DAC) cable engineered for 10G Ethernet and high-speed fiber networking architectures. This twinaxial assembly provides a highly cost-effective alternative to optical transceivers and fiber patch leads, simplifying short-range equipment links and server-to-switch patching within the same server rack.\n\nMulti-Vendor Compatibility: Tested and fully compatible for seamless integration with Mikrotik, Ubiquiti, and Scoop networking hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	215	295	\N	\N	5	5	\N	SFP-DC3	f	t	f	\N	\N	Cable Length: 3M\nConnectors: 2x SFP+ Modules\nData Rate: 10Gbps\nForm Factor: Direct Attached\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:34.271	2026-06-22 01:17:34.271	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
fcba0d3f-d2d4-4481-b9be-91f5ba9632a1	Scoop 16 Port Gigabit PoE 150W 2SFP Switch	scoop-16-port-gigabit-poe-150w-2sfp-switch	Power and connect mid-to-large scale network deployments seamlessly with Scoop's SPS-16G2S unmanaged Gigabit switch. Blending 16 Gigabit PoE ports with 2 dedicated SFP fiber uplinks, it delivers a generous 150W total PoE power pool (up to 30W per port) to run arrays of IP cameras, wireless access points, and VoIP hardware.\n\nAdvanced AI Intelligent Modes:\n250m Extend (Ports 1-8): Push power and data further for long-distance perimeter device runs.\n\nOne-Key VLAN (Ports 1-16): Isolate all 16 downlink ports from one another to minimize network congestion and isolate threats.\n\nSmart QoS: Prioritize critical data traffic automatically to ensure smooth video streaming and clear VoIP quality.\n\nAI PoE Watchdog: Minimize maintenance site visits by letting the switch automatically reboot frozen or unresponsive PoE devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1995	2695	\N	\N	5	5	\N	SPS-16G2S	f	t	f	\N	\N	Ethernet Ports: 16x 10/100/1000\nHardware Button: VLAN, Extender, PoE, QOS\nMax. Power Consumption: 12W\nMounting: Desktop or Rack-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~16\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps\nSupported Voltage Range: 100V-240V\n\nDimensions: 440mm x 180mm x 44mm	0	0	3	2026-06-22 01:17:27.754	2026-06-22 01:17:27.754	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
bc35833d-8720-4a29-aa4a-56422d6f87eb	Scoop 16 Port Fast Ethernet PoE 150W 2 Gigabit 1SFP Switch	scoop-16-port-fast-ethernet-poe-150w-2-gigabit-1sfp-switch	Power and manage mid-sized security systems with Scoop's SPS-16F2GS unmanaged AI switch. Combining 16 Fast Ethernet PoE ports with dual Gigabit copper uplinks and a shared SFP combo port for fiber backhaul, it provides a generous 150W power pool (up to 30W per port) to effortlessly run IP camera installations and access control equipment.\n\nAdvanced AI Intelligent Modes:\n250m Extend (Ports 1-8): Push power and data further for long-distance perimeter device runs.\n\nOne-Key VLAN (Ports 1-16): Isolate all 16 downlink ports from one another to minimize network congestion and isolate threats.\n\nSmart QoS: Prioritize critical data traffic automatically to ensure smooth video streaming and clear VoIP quality.\n\nAI PoE Watchdog: Minimize maintenance site visits by letting the switch automatically reboot frozen or unresponsive PoE devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1325	1795	\N	\N	5	5	\N	SPS-16F2GS	f	t	f	\N	\N	Ethernet Ports: 16x 10/100 ; 2x 10/100/1000 (Combo)\nHardware Button: VLAN; Extender; PoE; QOS\nMax. Power Consumption: 8W\nMounting: Desktop or Rack-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~16\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 1x 1.25Gbps (Combo)\nSupported Voltage Range: 100V-240V\n\nDimensions: 280mm x 180mm x 44mm	0	0	3	2026-06-22 01:17:28.666	2026-06-22 01:17:28.666	0	0	0	6d8db5ba-c261-41f5-baec-2ea276029ba8
54f7228c-ff37-4033-a1af-bdf3e1b4e454	Linkbasic Breakout Cable 3m 1 QSFP to 4 SFP+ Uplink Cable	linkbasic-breakout-cable-3m-1-qsfp-to-4-sfp-uplink-cable	Linkbasic's SFP-DQB4 is a high-performance copper breakout cable designed to bridge high-density hardware configurations. Delivering an aggregate bandwidth of up to 40 Gbps, it efficiently splits a single 40G port into four separate, high-speed 10 Gbps data channels. This Direct Attach Copper (DAC) breakout solution provides an energy-efficient, low-latency alternative to optical transceivers for short-distance interconnections within server racks.\n\nApplication Note: Perfect for connecting 40G switches or network interface cards (NICs) to standard 10G upstream or downstream equipment.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	850	1150	\N	\N	5	5	\N	SFP-DQB4	f	t	f	\N	\N	Cable Length: 3m\nConnectors: 1x QSFP to 4x 10Gbps SFP+ Modules\nData Rate: 40Gbps\nForm Factor: Breakout Cable\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:29.669	2026-06-22 01:17:29.669	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
0db20290-7d09-47b1-9fe4-2d30f7787658	Linkbasic Breakout Cable 1m 1 QSFP28 to 4 SFP28 Uplink Cable	linkbasic-breakout-cable-1m-1-qsfp28-to-4-sfp28-uplink-cable	Linkbasic's SFP-DQB100 is a high-performance copper breakout cable engineered to bridge next-generation, high-density network hardware. Delivering an impressive aggregate bandwidth of up to 100 Gbps, it efficiently splits a single 100G port into four separate, high-speed 25 Gbps data channels. This Direct Attach Copper (DAC) breakout solution provides an energy-efficient, ultra-low-latency alternative to optical transceivers for short-distance interconnections within high-speed data racks.\n\nApplication Note: Perfect for connecting a 100G core switch or network interface card (NIC) directly to up to four standard 25G upstream or downstream devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1050	1425	\N	\N	5	5	\N	SFP-DQB100	f	t	f	\N	\N	Cable Length: 1m\nConnectors: 1x QSFP28 to 4x SFP28\nData Rate: 100Gbps\nForm Factor: Breakout Cable\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:30.892	2026-06-22 01:17:30.892	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
8053b227-34ac-45ba-9c0f-041bf9fe1686	Linkbasic Direct Attached 1m 40G QSFP+ Uplink Cable	linkbasic-direct-attached-1m-40g-qsfp-uplink-cable	Linkbasic's SFP-DQ1 is a high-performance Direct Attach Copper (DAC) cable engineered to provide up to 40 Gbps of bandwidth capacity. Featuring very low power consumption, this twinaxial cable offers an exceptionally cost-effective alternative to optical transceivers for establishing short-range 40G links between QSFP+ ports in high-speed uplink scenarios.\n\nApplication Note: Ideal for top-of-rack (ToR) patching, connecting adjacent switches, routers, or network interface cards (NICs) within the same server cabinet.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	475	650	\N	\N	5	5	\N	SFP-DQ1	f	t	f	\N	\N	Cable Length: 1M\nConnectors: 2x SFP Modules\nData Rate: 40Gbps\nForm Factor: Direct Attached\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:31.903	2026-06-22 01:17:31.903	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
83fe8c70-afd0-43ef-9652-017fc608e950	Linkbasic Direct Attached Copper 5m 10G SFP+ Uplink Cable	linkbasic-direct-attached-copper-5m-10g-sfp-uplink-cable	Linkbasic's SFP-DC5 is a 5-meter, high-performance SFP+ Direct Attach Copper (DAC) cable engineered for 10G Ethernet and high-speed fiber networking architectures. This twinaxial assembly provides a highly cost-effective alternative to optical transceivers and fiber patch leads, simplifying short-range equipment links and server-to-switch patching within or across adjacent server racks.\n\nMulti-Vendor Compatibility: Tested and fully compatible for seamless integration with Mikrotik, Ubiquiti, and Scoop networking hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	325	450	\N	\N	5	5	\N	SFP-DC5	f	t	f	\N	\N	Cable Length: 5M\nConnectors: 2x SFP+ Modules\nData Rate: 10Gbps\nForm Factor: Direct Attached\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:33.175	2026-06-22 01:17:33.175	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
1d75da1f-0ac9-4c80-a0a8-e3ac8e66173d	Linkbasic Direct Attached Copper 1m 10G SFP+ Uplink Cable	linkbasic-direct-attached-copper-1m-10g-sfp-uplink-cable	Linkbasic's SFP-DC1 is a 1-meter, high-performance SFP+ Direct Attach Copper (DAC) cable engineered for up to 10G Ethernet and high-speed fiber networking architectures. This twinaxial assembly provides a highly cost-effective alternative to optical transceivers and fiber patch leads, simplifying ultra-short-range equipment links and server-to-switch patching within the same server rack.\n\nMulti-Vendor Compatibility: Tested and fully compatible for seamless integration with MikroTik, Ubiquiti, and Scoop networking hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	175	250	\N	\N	5	5	\N	SFP-DC1	f	t	f	\N	\N	Cable Length: 1M\nConnectors: 2x SFP+ Modules\nData Rate: 10Gbps\nForm Factor: Direct Attached\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:35.237	2026-06-22 01:17:35.237	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
bc9d5835-c50f-4b2a-886c-4602118f96fb	Linkbasic Direct Attached Copper 0.5M 10G SFP+ Uplink Cable	linkbasic-direct-attached-copper-0-5m-10g-sfp-uplink-cable	Linkbasic's SFP-DC0.5 is a 0.5-meter, high-performance SFP+ Direct Attach Copper (DAC) cable engineered for up to 10G Ethernet and high-speed fiber networking architectures. This ultra-short twinaxial assembly provides a highly cost-effective alternative to optical transceivers and fiber patch leads, simplifying immediate adjacent equipment links and server-to-switch patching within the same rack frame.\n\nMulti-Vendor Compatibility: Tested and fully compatible for seamless integration with MikroTik, Ubiquiti, and Scoop networking hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	160	225	\N	\N	5	5	\N	SFP-DC0.5	f	t	f	\N	\N	Cable Length: 0.5M\nConnectors: 2x SFP+ Modules\nData Rate: 10Gbps\nForm Factor: Direct Attached\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:36.247	2026-06-22 01:17:36.247	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
df594ca2-0fe7-4a37-98e9-20f0e71a2eae	Linkbasic Direct Attached SFP28 1m 25G Uplink Cable	linkbasic-direct-attached-sfp28-1m-25g-uplink-cable	Linkbasic's SFP-D25G1 is a 1-meter, high-performance Direct Attach Copper (DAC) twinaxial cable designed to handle demanding 25Gbps enterprise networks. Equipped with factory-terminated SFP28 connectors, this passive copper assembly delivers ultra-low latency and minimal power consumption, making it an ideal, cost-effective solution for short-range, high-capacity uplink scenarios within server racks.\n\nApplication Note: Perfectly optimized for high-bandwidth switch-to-switch stacking, server-to-switch clustering, and top-of-rack (ToR) cross-connects.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	275	375	\N	\N	5	5	\N	SFP-D25G1	f	t	f	\N	\N	Cable Length: 1M\nConnectors: 2x SFP28 Modules\nData Rate: 25Gbps\nForm Factor: SFP\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:37.417	2026-06-22 01:17:37.417	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
b0869b74-34e0-4ecc-9b91-0055ed486323	Linkbasic Direct Attached Copper 0.5M 25G SFP28 Uplink Cable	linkbasic-direct-attached-copper-0-5m-25g-sfp28-uplink-cable	Linkbasic's SFP-D25G0.5 is a 0.5-meter, high-performance Direct Attach Copper (DAC) twinaxial cable designed to handle demanding 25Gbps enterprise networks. Equipped with factory-terminated SFP28 connectors, this passive copper assembly delivers ultra-low latency and minimal power consumption. Its short length makes it an ideal, cost-effective solution for immediate, high-capacity uplink scenarios within the same server rack.\n\nMulti-Vendor Compatibility: Tested and fully compatible for seamless integration with MikroTik, Ubiquiti, and Scoop networking hardware.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	250	340	\N	\N	5	5	\N	SFP-D25G0.5	f	t	f	\N	\N	Cable Length: 0.5M\nConnectors: 2x SFP28 Modules\nData Rate: 25Gbps\nForm Factor: SFP\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:38.347	2026-06-22 01:17:38.347	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
1421dabe-2031-44fe-bdb9-99f27ca96320	Linkbasic Direct Attached QSFP28 1m 100G Uplink Cable	linkbasic-direct-attached-qsfp28-1m-100g-uplink-cable	Linkbasic's SFP-D100G1 is a 1-meter, ultra-high-performance Direct Attach Copper (DAC) twinaxial cable engineered for enterprise-grade 100Gbps network backbones and data centers. Equipped with factory-terminated QSFP28 connectors, this passive copper assembly delivers line-rate data transfers with ultra-low latency and minimal power consumption, providing a highly cost-effective alternative to optical modules for short-range deployments.\n\nApplication Note: Perfectly optimized for high-capacity spine-leaf architectures, core switch stacking, and top-of-rack (ToR) server-to-switch interconnections.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	625	850	\N	\N	5	5	\N	SFP-D100G1	f	t	f	\N	\N	Cable Length: 1M\nConnectors: 2x QSFP28 Modules\nData Rate: 100Gbps\nForm Factor: SFP\nMode: Copper\nWavelength: None	0	0	3	2026-06-22 01:17:39.346	2026-06-22 01:17:39.346	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
bbabfdf7-34f5-4212-9c2f-a0e010f3fc68	Linkbasic Active Optical Cable 5m 10G SFP+ Uplink Cable	linkbasic-active-optical-cable-5m-10g-sfp-uplink-cable	Linkbasic's SFP-AOC5 is a 5-meter, high-performance Active Optical Cable (AOC) designed to deliver seamless 10Gbps data transmission across enterprise network environments. Utilizing premium Multi-Mode OM3 fiber optic cabling and factory-terminated SFP+ transceivers, this integrated assembly offers a highly flexible, lightweight, and low-latency alternative to heavy copper DAC cables for mid-range interconnections.\n\nApplication Note: Perfectly optimized for high-capacity uplink scenarios, including switch-to-switch stacking, core routing, and high-speed server-to-switch data paths.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	495	675	\N	\N	5	5	\N	SFP-AOC5	f	t	f	\N	\N	Cable Length: 5m\nConnectors: 2x SFP Modules\nData Rate: 10Gbps\nForm Factor: Active Optical Cable (OM3)\nMode: Multi-Mode\nWavelength: 850nm	0	0	3	2026-06-22 01:17:40.218	2026-06-22 01:17:40.218	0	0	0	a2e1b6e1-6c3e-4657-8f8c-c6cdec0dd08c
2e20abfd-8579-4b5f-8bb6-0d812b4359b7	Rackstuds Duo 2.2mm/3.2mm 20 Pack Black	rackstuds-duo-2-2mm-3-2mm-20-pack-black	The Rackstuds RS-DUOB20 offers a revolutionary, toolless alternative to traditional cage nuts, providing a fast and effortless way to mount IT equipment. Engineered to fit most 19-inch server racks with square-punched vertical rails, these 1U-compatible studs insert directly from the rear of the rail, eliminating the need for awkward washers. Once inserted, they act as a stable peg to hold your switches, routers, or servers in place while you secure them with the lock nut, making single-handed installation of heavy hardware safe and simple.\n\nRail Compatibility Note: Designed as a universal dual-gauge fit, these studs are fully compatible with both 2.2mm and 3.2mm vertical rack rails.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	350	475	\N	\N	5	5	\N	RS-DUOB20	f	t	f	\N	\N	Colour: Black\nPack Size: 20\nSize: 2.2mm and 3.2mm	0	0	3	2026-06-22 01:17:41.376	2026-06-22 01:17:41.376	0	0	0	3ee4b8f5-0eb6-48dc-8e3d-0c6ca00fbdbd
adc8fae0-70e2-4cf6-995e-2f590db41f7a	Procet Gigabit 48V 15W PoE Adapter with No Cable	procet-gigabit-48v-15w-poe-adapter-with-no-cable	Procet’s POE-48V15W is a Gigabit, 48V, 15W, surge-protected, passive PoE injector enclosed in an IP40 fire-retardant plastic case ideal for powering 802.3af PoE devices.\n\n*Note: Clover Power Cable Not Included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	95	130	\N	\N	5	5	\N	POE-48V15W	f	t	f	\N	\N	Ethernet Ports: 2x 10/100/1000\nOperating Temperature: 0°C to 40°C\nPoE Output: 48V 0.32A Passive PoE\nPower Input: 1x Clover Power Cable (Not Included)\nSupported Voltage Range: 100V-240V\n\nDimensions: 86.5mm x 46mm x 30.5mm\nWeight: 91g	0	0	3	2026-06-22 01:17:49.157	2026-06-22 01:17:49.157	0	0	0	\N
b9cc7791-cc15-4c50-84d3-1ea60eaa79eb	Rackstuds 2.2mm 20 Pack Red	rackstuds-2-2mm-20-pack-red	The Rackstuds RS-2R20 provides a fast, toolless alternative to traditional cage nuts, simplifying how you mount IT and networking equipment. Designed to fit most standard 19-inch server racks with square-punched vertical rails, these studs are engineered for convenient front-insertion. Once clicked into place from the front of the rack, they create a stable, load-bearing peg to support your switches, patch panels, or servers while you tighten the lock nut—making single-handed installation of heavy hardware safe and effortless.\n\nRail Compatibility Note: This specific model is designed for standard, thin-gauge vertical rack rails up to 2.2mm in thickness only.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	150	190	\N	\N	5	5	\N	RS-2R20	f	t	f	\N	\N	Colour: Red\nPack Size: 20\nSize: 2.2mm	0	0	3	2026-06-22 01:17:42.313	2026-06-22 01:17:42.313	0	0	0	3ee4b8f5-0eb6-48dc-8e3d-0c6ca00fbdbd
3ea8c5c8-1cc7-4390-b062-8e6606cdb57e	Rackstuds 2.2mm 100 Pack Red	rackstuds-2-2mm-100-pack-red	The Rackstuds RS-2R100 provides a fast, toolless alternative to traditional cage nuts, simplifying how you mount IT and networking equipment. Designed to fit most standard 19-inch server racks with square-punched vertical rails, these studs are engineered for convenient front-insertion. Once clicked into place from the front of the rack, they create a stable, load-bearing peg to support your switches, patch panels, or servers while you tighten the lock nut—making single-handed installation of heavy hardware safe and effortless.\n\nRail Compatibility Note: This specific model is designed for standard, thin-gauge vertical rack rails up to 2.2mm in thickness only.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	650	875	\N	\N	5	5	\N	RS-2R100	f	t	f	\N	\N	Colour: Red\nPack Size: 100\nSize: 2.2mm	0	0	3	2026-06-22 01:17:43.206	2026-06-22 01:17:43.206	0	0	0	3ee4b8f5-0eb6-48dc-8e3d-0c6ca00fbdbd
b2524d44-821d-421b-82c7-fd265185c7a1	Ubiquiti UISP airMAX Rocket Lite AC 5GHz Radio	ubiquiti-uisp-airmax-rocket-lite-ac-5ghz-radio	Ubiquiti's Rocket AC Lite (ROCKETAC-LITE) is a high-performance, 5GHz airMAX® ac radio basestation designed for flexible deployment across demanding wireless networks. Engineered to pair seamlessly with Ubiquiti's extensive range of carrier-class antennas, it serves as a highly efficient Point-to-Multipoint (PtMP) access point in low-to-moderate interference environments, or as a high-capacity, long-range Point-to-Point (PtP) backhaul link. Initial deployment and on-site tuning are simplified via an integrated, dedicated 2.4GHz management radio that connects directly to the UISP® network management platform or mobile app.\n\nDeployment Note: This is a standalone radio basestation; a compatible Ubiquiti airMAX antenna (such as a RocketDish™ or airMAX Sector Antenna) is required and sold separately.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2095	2850	\N	\N	5	5	\N	ROCKETAC-LITE	f	t	f	\N	\N	Antenna Gain: Antenna Dependant (2x RP SMA Female)\nBeam-width: Antenna Dependant\nData Rate: 867Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 8.5W\nMounting: Pole-Mount\nOperating System: airOS\nOperating Temperature: -40°C to 80°C\nPoE Input: 24V Passive PoE\nPoE Output: None\nPower Input: 24V 0.5A Gigabit PoE Injector (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 20V-26V\nUSB Ports: None\n\nDimensions: 162 x 84 x 37mm\nWeight: 250g	0	0	3	2026-06-22 01:17:44.287	2026-06-22 01:17:44.287	0	0	0	9cd67eab-3117-4ee3-bc46-103e8271773d
3a4e95e3-047b-483c-a09c-7a4c80027b06	Ubiquiti UISP airCube ISP WiFi Access Point	ubiquiti-uisp-aircube-isp-wifi-access-point	Ubiquiti's ACB-ISP is a 2.4Ghz, WiFi 4 Router/Access Point. It features 24V PoE pass-through to easily integrate with airMAX® CPEs. It is designed to work with the UISP network management platform.\n\n*Note: PoE injector and power supply not included. Recommended PoE injector POE-24G-24W.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	475	650	\N	\N	5	5	\N	ACB-ISP	f	t	f	\N	\N	Antenna Gain: 4dBi\nBeam-width: 360°\nData Rate: 300Mbps\nEthernet Ports: 4x 10/100\nHardware Button: Reset\nMax. Power Consumption: 5W\nMounting: Desktop\nOperating System: airOS\nOperating Temperature: -10°C to 50°C\nPoE Input: 24V Passive PoE\nPoE Output: 24V Passive PoE Passthrough\nPower Input: 24V Passive PoE or 2A Micro USB Adapter (Not Included)\nSerial Interface: WiFi / Ethernet\nSIM Slots: None\nSupported Voltage Range: 4.95V-5.05V\nUSB Ports: Micro USB for Power\n\nDimensions: 87.80 x 89.50 x 89.25mm\nWeight: 215g	0	0	3	2026-06-22 01:17:45.316	2026-06-22 01:17:45.316	0	0	0	\N
1e3f9717-1072-474b-ab3c-7c36aace5bc8	TP-Link AC1200 Whole Home Mesh Wi-Fi Router (1-pack)	tp-link-ac1200-whole-home-mesh-wi-fi-router-1-pack	Uses a system of units to achieve seamless whole-home Wi-Fi coverage\nDeco Mesh Technology, units work together to form a unified network\nProvides fast and stable Wi-Fi up to 185 square metres\nProvides fast and stable connections with speeds of up to 1167Mbps\nProvides lag-free connections for up to 100 devices\nParental Controls limits online time and blocks inappropriate websites\nSetup is easier than ever with the Deco app	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	688	830	\N	\N	5	5	\N	Deco M4(1-pack)	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:46.098	2026-06-22 01:17:46.098	0	0	0	\N
9f250a2d-0fda-4265-9ef0-2daf44d57c3f	Dedicated 3 pin to Clover Cable	dedicated-3-pin-to-clover-cable	Scoop's POWU is a dedicated 0.5 metre Clover Power Cord.\n\n*Note: Cables may vary in colour between black or white. We will supply the version available at the time of order.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	25	36	\N	\N	5	5	\N	POWU	f	t	f	\N	\N	\N	0	0	3	2026-06-22 01:17:47.089	2026-06-22 01:17:47.089	0	0	0	\N
84ed1112-59ac-45a7-b940-2df896d43982	Reyee Dual Band WiFi 6 3000Mbps Gigabit Ceiling Mount AP	reyee-dual-band-wifi-6-3000mbps-gigabit-ceiling-mount-ap	Reyee's RG-RAP2266GX is a WiFi 6 (802.11ax) dual-band ceiling mount access point featuring 1x Gigabit Ethernet port, seamless roaming and speeds of up to 3000Mbps. It supports Ruijie’s smart networking feature, which with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud.\n\n*Note: This device requires an 802.3at PoE injector or 12V 2A Power Supply which are not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1195	1625	\N	\N	5	5	\N	RG-RAP2266GX	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 3.5dBi; 5.8GHz: 5.15dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps; 5.8GHz: 2402Mbps\nEthernet Ports: 1x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 18W\nMounting: Wall or Ceiling Mount\nOperating System: Reyee\nOperating Temperature: 0°C to 40°C\nPoE Input: 802.3at\nPoE Output: None\nPower Input: 802.3at or 12V 2A Power Supply (not included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 37-57V (PoE) 12V (DC Input)\nUSB Ports: None\n\nDimensions: 220 x 220 x 52.6 mm\nWeight: 560g	0	0	3	2026-06-22 01:17:48.001	2026-06-22 01:17:48.001	0	0	0	26a5a808-02b0-4f61-9837-6c473236a4ec
5a32e2b3-843b-417c-8b4a-246acba39d4b	Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh 2-Pack	cudy-dual-band-wifi-6-3000mbps-multi-gigabit-mesh-2-pack	Cudy's CD-M30002 is a 2-Pack dual band WiFi 6 (802.11ax) mesh system featuring 1x Gigabit Ethernet Port, 1x 2.5Gbps Ethernet Port, integrated antennas and an aggregate data rate of up to 3000Mbps. The router supports Cudy's Whole Home Mesh system, seamless roaming and multiple VPN Client protocols including PPTP, L2TP, OpenVPN, WireGuard and IPSec.\n\n*Note: Easily manage this device on-site or remotely using the mobile app.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	950	1295	\N	\N	5	5	\N	CD-M30002	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4.2dBi ; 5.8GHz: 5.1dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps; 5.8GHz: 2402Mbps\nEthernet Ports: 1x 10/100/1000 (LAN) ; 1x 10/100/1000/2500 (WAN)\nHardware Button: Reset ; Pair\nMax. Power Consumption: 11W\nMounting: Desktop\nOperating System: Cudy\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None	0	0	3	2026-06-22 01:17:50.396	2026-06-22 01:17:50.396	0	0	0	\N
dbc5f223-a996-4be4-b2b7-47c609a8df97	Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh 3-Pack	cudy-dual-band-wifi-6-3000mbps-multi-gigabit-mesh-3-pack	Cudy's CD-M30003 is a 3-Pack dual band WiFi 6 (802.11ax) mesh system featuring 1x Gigabit Ethernet Port, 1x 2.5Gbps Ethernet Port, integrated antennas and an aggregate data rate of up to 3000Mbps. The router supports Cudy's Whole Home Mesh system, seamless roaming and multiple VPN Client options including PPTP, L2TP, OpenVPN, WireGuard and IPSec.\n\n*Note: Easily manage this device on-site or remotely using the mobile app.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1425	1925	\N	\N	5	5	\N	CD-M30003	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 4.2dBi ; 5.8GHz: 5.1dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps; 5.8GHz: 2402Mbps\nEthernet Ports: 1x 10/100/1000 (LAN) ; 1x 10/100/1000/2500 (WAN)\nHardware Button: Reset ; Pair\nMax. Power Consumption: 11W\nMounting: Desktop\nOperating System: Cudy\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None	0	0	3	2026-06-22 01:17:51.439	2026-06-22 01:17:51.439	0	0	0	\N
55b7fe5e-73b1-407c-a7dd-af3ae593e7ae	Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh Router	cudy-dual-band-wifi-6-3000mbps-multi-gigabit-mesh-router	Cudy's CD-M30001 is a dual band WiFi 6 (802.11ax) mesh router featuring 1x Gigabit Ethernet Port, 1x 2.5Gbps Ethernet Port, integrated antennas and an aggregate data rate of up to 3000Mbps. The router supports Cudy's Whole Home Mesh system, seamless roaming and multiple VPN Client options including PPTP, L2TP, OpenVPN, WireGuard and IPSec.\n\n*Note: Easily manage this device on-site or remotely using the mobile app.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	475	650	\N	\N	5	5	\N	CD-M30001	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 4.2dBi ; 5.8GHz: 5.1dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps; 5.8GHz: 2402Mbps\nEthernet Ports: 1x 10/100/1000 (LAN) ; 1x 10/100/1000/2500 (WAN)\nHardware Button: Reset ; Pair\nMax. Power Consumption: 11W\nMounting: Desktop\nOperating System: Cudy\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None	0	0	3	2026-06-22 01:17:52.527	2026-06-22 01:17:52.527	0	0	0	\N
dd51a596-7d92-4737-b8c9-97b5ff543a83	Reyee Dual Band WiFi 6 3000Mbps 5dBi Gigabit Mesh Router	reyee-dual-band-wifi-6-3000mbps-5dbi-gigabit-mesh-router	Reyee's RG-EW3000GX is a WiFi 6, dual-band, 2x2 MU-MIMO Gigabit router featuring dual WAN aggregation, 5x high gain antennas and an aggregate wireless data rate of up to 3000Mbps. It can be used as a stand-alone router or an access point, but can also be used in a mesh topology via Ethernet or wireless with other Reyee wireless devices.\n\nIt supports Ruijie’s smart networking feature which, with Ruijie's free cloud service, allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud. In addition, the unit also supports Ruijie’s Router App, specifically designed for home users for a quick and easy setup with remote management.\n*Note: The Mesh button on this unit is only for use with other Reyee devices.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	615	850	\N	\N	5	5	\N	RG-EW3000GX	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 5dBi; 5.8GHz: 5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 574Mbps; 5.8GHz: 2402Mbps\nEthernet Ports: 1x 10/100/1000 (LAN/WAN) ; 3x 10/100/1000 (LAN) ; 1x 10/100/1000 (WAN)\nHardware Button: Reset ; Mesh\nMax. Power Consumption: 12W\nMounting: Desktop\nOperating System: Reyee\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1.0A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1.0A\nUSB Ports: None\n\nDimensions: 240mm × 130mm × 32mm\nWeight: 0.48kg	0	0	3	2026-06-22 01:17:53.726	2026-06-22 01:17:53.726	0	0	0	26a5a808-02b0-4f61-9837-6c473236a4ec
bf33cbbc-deb1-46ad-8008-a502bf2161f7	Reyee Dual Band WiFi 5 1300Mbps Gigabit Mesh Router	reyee-dual-band-wifi-5-1300mbps-gigabit-mesh-router	Reyee's RG-EW1300G is a dual-band Gigabit Ethernet router featuring 4x Gigabit Ethernet ports and WiFi 5, MU-MIMO Wave 2 technology with speeds up to 1267Mbps. It can be used as a stand-alone router or access point but can also be used in a mesh topology via Ethernet or wireless with other Reyee wireless devices. It supports Ruijie’s smart networking feature, which with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud. In addition, the unit also supports Ruijie’s Router App, specifically designed for home users for a quick and easy setup with remote management.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	425	575	\N	\N	5	5	\N	RG-EW1300G	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 4.5dBi, 5.8GHz: 5.5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 400Mbps; 5.8GHz: 867Mbps\nEthernet Ports: 4x 10/100/1000\nHardware Button: Reset ; Mesh\nMax. Power Consumption: 12W\nMounting: Desktop\nOperating System: Reyee\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None\n\nDimensions: 230 × 130 × 30mm\nWeight: 980g	0	0	3	2026-06-22 01:17:54.834	2026-06-22 01:17:54.834	0	0	0	26a5a808-02b0-4f61-9837-6c473236a4ec
171a8370-7e82-4927-908b-37757ca40a65	Cudy 8 Port Metal Gigabit Desktop Switch	cudy-8-port-metal-gigabit-desktop-switch	Cudy's CD-GS108 is an 8-port switch with a metal casing, supporting full Gigabit speeds on all 8 ports and can be either desktop or wall-mounted.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	195	275	\N	\N	5	5	\N	CD-GS108	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: None\nMax. Power Consumption: 1.8W\nMounting: Desktop or Wall-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 5V 0.5A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 5V\n\nDimensions: 138 x 78 x 25 mm\nWeight: 205g	0	0	3	2026-06-22 01:18:08.304	2026-06-22 01:18:08.304	0	0	0	\N
f487927b-973b-4568-888c-4ef3f9994b37	Reyee Dual Band WiFi 5 1200Mbps 4dBi Mesh Range Extender	reyee-dual-band-wifi-5-1200mbps-4dbi-mesh-range-extender	Reyee's RG-EW1200R is a dual band, 802.11ac (WiFi 5) range extender featuring 1x Fast Ethernet Port, 2x 4dBi external antennas and dual band 2x2 MU-MIMO with speeds up to 1167Mbps. It supports Ruijie’s smart networking feature, which with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud. In addition, the unit also supports Ruijie’s Router App, specifically designed for home users for a quick and easy setup with remote management.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	450	625	\N	\N	5	5	\N	RG-EW1200R	f	t	f	\N	\N	Antenna Gain: 2x4dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 300Mbps; 5.8GHz: 867Mbps\nEthernet Ports: 1x 10/100\nHardware Button: Reset ; Mesh ; Reset\nMax. Power Consumption: 15W\nMounting: Plug Point\nOperating System: Reyee\nOperating Temperature: -10°C to 45°C\nPoE Input: None\nPoE Output: None\nPower Input: 2 Pin 5A\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 100-240V\nUSB Ports: None\n\nDimensions: 128 x 102 x 60 mm\nWeight: 250g	0	0	3	2026-06-22 01:17:56.205	2026-06-22 01:17:56.205	0	0	0	\N
7cc92472-dab0-4f6b-822b-3f0c0837eafc	Reyee Dual Band WiFi 5 1200Mbps 5dBi Fast Ethernet Mesh Router	reyee-dual-band-wifi-5-1200mbps-5dbi-fast-ethernet-mesh-router	Reyee's RG-EW1200F is a dual-band Fast Ethernet router featuring 802.11ac (WiFi 5) MU-MIMO Wave 2 technology with speeds up to 1167Mbps. It can be used as a stand-alone router or access point but can also be used in a mesh topology via Ethernet or wireless with other Reyee wireless devices. It supports Ruijie’s smart networking feature, which with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud. In addition, the unit also supports Ruijie’s Router App, specifically designed for home users for a quick and easy setup with remote management.\n\n*Note: This device does not support WPS for third party devices. WiFi password settings do not support special characters.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	295	395	\N	\N	5	5	\N	RG-EW1200F	t	t	f	\N	\N	Antenna Gain: 4x5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 300Mbps; 5.8GHz: 867Mbps\nEthernet Ports: 4x 10/100\nHardware Button: Reset ; Mesh\nMax. Power Consumption: 7W\nMounting: Desktop\nOperating System: Reyee\nOperating Temperature: 0°C to 45°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None\n\nDimensions: 182 x 120 x 32mm\nWeight: 400g	0	0	3	2026-06-22 01:17:56.882	2026-06-22 01:17:56.882	0	0	0	26a5a808-02b0-4f61-9837-6c473236a4ec
557a037e-8666-49d7-9fd9-68c6eb4e1188	Reyee 5GHz WiFi 5 Gigabit 15dBi 120° Integrated Sector	reyee-5ghz-wifi-5-gigabit-15dbi-120-integrated-sector	Reyee's RG-EST450G is a Dual Band, WiFi 5 sector antenna featuring a 15dBi antenna, 3x Gigabit Ethernet Ports, a maximum throughput of up to 1017Mbps over its 5GHZ (2x2 MIMO) radio and a 5km range when paired with the RG-EST350G and a 3km range when paired with the RG-EST330FP. The dedicated 2.4GHz management radio allows for easy setup via the Reyee mobile app.\n\nIt supports Ruijie’s smart networking feature, which, with Ruijie's free cloud service, allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1095	1495	\N	\N	5	5	\N	RG-EST450G	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 2dBi 5GHz: 15dBi\nBeam-width: 120°\nData Rate: 2.4GHz: 150Mbps ; 5GHz: 867Mbps\nEthernet Ports: 3x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 12W\nMounting: Wall or Pole Mount\nOperating System: Reyee\nOperating Temperature: -30°C ~ 65°C\nPoE Input: 24V Passive PoE or 802.3af/at\nPoE Output: None\nPower Input: 12V DC ; 24V Passive PoE or 802.3af/at\nSerial Interface: None\nSFP Ports: None\nSIM Slots: None\nSupported Voltage Range: 12V/ 1.2A; 24V/ 0.6A\nUSB Ports: None\n\nDimensions: 355 x 124 x 48 mm\nWeight: 830g	0	0	3	2026-06-22 01:17:57.693	2026-06-22 01:17:57.693	0	0	0	\N
dfc8b29f-f27e-4643-9442-59d060214c75	Reyee 5GHz WiFi 5 Gigabit 16dBi 30° Pre-Paired Kit	reyee-5ghz-wifi-5-gigabit-16dbi-30-pre-paired-kit	Reyee's RG-EST350G is a 5GHz, WiFi 5 pre-paired kit featuring a 16dBi antenna, 3x Gigabit Ethernet Ports, a maximum throughput of up to 867Mbps over its 5GHz (2x2 MIMO) radio and a 5km coverage range when used in a Point-to-Point installation. The dedicated 2.4GHz management radio allows for easy setup via the Reyee mobile app.\n\nIt supports Ruijie’s smart networking feature, which, with Ruijie's free cloud service, allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1895	2575	\N	\N	5	5	\N	RG-EST350G	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 2dBi 5GHz: 16dBi\nBeam-width: 30°\nData Rate: 2.4GHz: 150Mbps (Management Radio) ; 5GHz: 867Mbps\nEthernet Ports: 3x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 12W\nMounting: Wall or Pole Mount\nOperating System: Reyee\nOperating Temperature: -30°C ~ 65°C\nPoE Input: 24v Passive PoE or 802.3af/at\nPoE Output: None\nPower Input: 24V Passive PoE, 802.3af/at or 12V DC (Included)\nSerial Interface: None\nSFP Ports: None\nSIM Slots: None\nSupported Voltage Range: 12V/ 1.2A; 24V/ 0.6A\nUSB Ports: None\n\nDimensions: 240 x 133 x 108 mm\nWeight: 730g	0	0	3	2026-06-22 01:17:58.734	2026-06-22 01:17:58.734	0	0	0	\N
acddb4a2-5281-4605-bc9e-689e3a2e8c13	Reyee 5GHz WiFi 5 Fast Ethernet 13dBi 30° CPE with 2xPoE Output	reyee-5ghz-wifi-5-fast-ethernet-13dbi-30-cpe-with-2xpoe-output	Reyee's RG-EST330FP is a 5GHz WiFi 5 CPE featuring a 13dBi antenna, 3x Fast Ethernet Ports, 2x PoE Output, a maximum throughput of up to 867Mbps over its 5GHz (2x2 MIMO) radio and a 3km coverage range when used in a Point-to-Point or Point-to-MultiPoint installation with the RG-EST450G. The dedicated 2.4GHz management radio allows for easy setup via the Reyee mobile app.\n\nIt supports Ruijie’s smart networking feature, which, with Ruijie's free cloud service, allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud.\n\n*NOTE: If 802.3af PoE output is required on the 2 additional ports, make use of the included Power Supply or a 24V 1A PoE Injector.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	795	1075	\N	\N	5	5	\N	RG-EST330FP	f	t	f	\N	\N	Antenna Gain: 2.4GHz: 2dBi 5GHz: 13dBi\nBeam-width: 30°\nData Rate: 2.4GHz: 150Mbps (Management Radio) ; 5GHz: 867Mbps\nEthernet Ports: 3x 10/100\nHardware Button: Reset\nMax. Power Consumption: 9W\nMounting: Wall or Pole Mount\nOperating System: Reyee\nOperating Temperature: -30°C ~ 55°C\nPoE Input: 24V Passive PoE or 802.3af/at\nPoE Output: 2x 802.3af PoE\nPower Input: 24V Passive PoE, 802.3af/at or DC\nSerial Interface: None\nSFP Ports: None\nSIM Slots: None\nSupported Voltage Range: 12V/ 1A or 24V/ 1.5A (Included)\nUSB Ports: None\n\nDimensions: 199 x 102 x 54 mm\nWeight: 370g	0	0	3	2026-06-22 01:17:59.715	2026-06-22 01:17:59.715	0	0	0	\N
4a0d9986-12ba-4019-b7f8-9cb89e9a989f	Reyee 5GHz AC 10dBi 60° Pre-Paired Kit	reyee-5ghz-ac-10dbi-60-pre-paired-kit	Reyee's RG-EST310 is a 5GHz, 802.11ac (WiFi 5) dual stream pre-paired wireless kit. It is IP54 rated with a wide temperature range, supports 2x2 MIMO and provides up to 867Mbps throughput. The unit also features power redundancy with concurrent 12V DC and 24V PoE power modes. It supports Ruijie’s smart networking feature which, with Ruijie's free cloud service, allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1325	1795	\N	\N	5	5	\N	RG-EST310	f	t	f	\N	\N	Antenna Gain: 5GHz: 10dBi\nBeam-width: 60°\nData Rate: 5.8GHz: 867Mbps\nEthernet Ports: 1x 10/100\nHardware Button: Reset\nMax. Power Consumption: 7W\nMounting: Wall or Pole Mount\nOperating System: Reyee\nOperating Temperature: -30°C ~ 55°C\nPoE Input: 24v Passive PoE\nPoE Output: None\nPower Input: 24V Passive PoE (Included) or 12V 1A Power Supply (Not Included)\nSerial Interface: None\nSFP Ports: None\nSIM Slots: None\nSupported Voltage Range: 24v PoE PoE or 12V 1A DC\nUSB Ports: None\n\nDimensions: 400 x 231 x 88 mm\nWeight: 0.35g	0	0	3	2026-06-22 01:18:00.742	2026-06-22 01:18:00.742	0	0	0	\N
0e5d8faf-3fdc-4d6e-b5af-fe4b8e1a9fa0	Reyee 2.4GHz 300Mbps 8dBi 70° Pre-Paired Kit	reyee-2-4ghz-300mbps-8dbi-70-pre-paired-kit	Reyee's RG-EST100 is a 2.4GHz, 300Mbps, dual stream IP55-rated pre-paired wireless kit. It supports Ruijie’s smart networking feature which, with Ruijie's free cloud service, allows users to quickly and easily auto-provision, deploy and manage devices remotely. Use the Reyee auto-discovery feature or scan the QR code using the mobile application to easily add devices to new or existing projects via the cloud.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	595	825	\N	\N	5	5	\N	RG-EST100	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 8dBi\nBeam-width: 70°\nData Rate: 2.4GHz: 300Mbps\nEthernet Ports: 2x 10/100\nHardware Button: Reset\nMax. Power Consumption: 5W\nMounting: Wall or Pole Mount\nOperating System: Reyee\nOperating Temperature: -30°C ~ 60°C\nPoE Input: 12V Passive PoE\nPoE Output: None\nPower Input: 12V Passive PoE or 12V Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSIM Slots: None\nSupported Voltage Range: 12V\nUSB Ports: None\n\nDimensions: 165.5 × 68.7 x 42mm\nWeight: 0.30kg	0	0	3	2026-06-22 01:18:02.486	2026-06-22 01:18:02.486	0	0	0	26a5a808-02b0-4f61-9837-6c473236a4ec
1b012ff8-a334-4d3a-aeef-24fc698fbde4	MikroTik PowerBox Pro 5 Port Gigabit 1SFP Outdoor Router	mikrotik-powerbox-pro-5-port-gigabit-1sfp-outdoor-router	MikroTik's PowerBox Pro is an outdoor five Gigabit Ethernet port router with PoE output on four ports. Since the device has a waterproof outdoor case, you can mount it on a tower, or in other outdoor locations. It also supports passive or standard 802.3at/af PoE input/output. Ethernet ports 2-5 can power other PoE capable devices with the same voltage as applied to the unit. The PowerBox Pro can power 802.3at and af mode B compatible devices, if 48-57 input voltage is used.\n\nThe device has a SFP port for adding optical fiber connectivity. It is affordable, small, easy to use, with a very powerful 800MHz CPU, capable of all the advanced configurations that RouterOS supports.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1625	2175	\N	\N	5	5	\N	RB-PBPRO	f	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 6W\nMounting: Pole-Mount & DIN Mount\nOperating System: RouterOS (Level 4 Licence)\nOperating Temperature: -40°C to 70°C\nPoE Input: 12V-57V (Passive PoE; 802.3af/at)\nPoE Output: 12V-57V Passive PoE; 802.3af/at on Ports 2~5\nPower Input: 24V 2.5A Power Supply (Included)\nProcessor: 1 Core 800MHz; QCA9557\nSerial Interface: None\nSFP Ports: 1x 1.25Gbps\nSupported Voltage Range: 12V-57V\nSystem Memory: 128MB\nUSB Ports: None\nOther: None\n\nDimensions: 125 x 52 x 225mm	0	0	3	2026-06-22 01:18:03.364	2026-06-22 01:18:03.364	0	0	0	\N
4cd06318-ed10-42e4-9d18-a992b1e2f1e8	Cudy 4G LTE4 Dual Band 1200Mbps WiFi 5 Router	cudy-4g-lte4-dual-band-1200mbps-wifi-5-router	Cudy's CD-LT500 is a dual band WiFi 5 (802.11ac) Fast Ethernet router with an integrated LTE Cat 4 Modem with speeds of up to 50Mbps uplink and 150Mbps downlink. The router features 4x Fast Ethernet ports, 4x 5dBi high gain antennas and an aggregate wireless data rate of up to 1167Mbps. The router supports Cudy's whole home mesh system as well as multiple VPN Client options including PPTP, L2TP, OpenVPN, WireGuard, IPSec and ZeroTier.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	575	775	\N	\N	5	5	\N	CD-LT500	t	t	f	\N	\N	Antenna Gain: 5dBi (2x WiFi, 2x LTE)\nBeam-width: 360°\nData Rate: LTE: 150Mbps Downlink; 50Mbps Uplink; Wireless: 2.4GHz: 300Mbps ; 5.8GHz: 867Mbps\nEthernet Ports: 3x 10/100 (LAN); 1x 10/100 (LAN/WAN)\nHardware Button: Reset ; WPS\nMax. Power Consumption: 10W\nMounting: Desktop\nOperating System: Cudy\nOperating Temperature: 0° to 40°\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: 1 (Nano SIM)\nSupported Voltage Range: 12V 1A\nUSB Ports: None\n\nDimensions: 200 x 130 x 40mm\nWeight: 299g	0	0	3	2026-06-22 01:18:04.315	2026-06-22 01:18:04.315	0	0	0	\N
810efb3d-6fc3-41ab-9ecd-3f805dce8493	Cudy Multi Mode 25G LC SFP28 850nm 100m	cudy-multi-mode-25g-lc-sfp28-850nm-100m	Cudy's CD-SFP-MM25 is a duplex module designed for Multi-Mode fibre deployments up to 100m at 25Gbps. Ideal for short-distance fibre links or to provide uplink between switches, routers, and media converters.\n\n*Note: This module is multi-vendor compatible. To achieve 25Gbps over 100m, we recommend using OM4 fibre cable.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	250	350	\N	\N	5	5	\N	CD-SFP-MM25	f	t	f	\N	\N	Connector: 2x LC\nData Rate: 25Gbps\nForm Factor: SFP28\nMode: Multi-Mode\nSupported Distance: 100m\nWavelength: 850nm	0	0	3	2026-06-22 01:18:05.266	2026-06-22 01:18:05.266	0	0	0	\N
11c40ecd-0fc4-4eec-a59d-931ac008d196	Cudy Single Mode 1.25G LC SFP 1310nm 20km	cudy-single-mode-1-25g-lc-sfp-1310nm-20km	Cudy's CD-SFP-SM is a duplex module designed for Single Mode fibre deployments up to 20km at 1.25Gbps. Ideal for long-distance fibre links or to provide uplink between switches, routers and media converters.\n\n*Note: This module is multi vendor compatible.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	75	100	\N	\N	5	5	\N	CD-SFP-SM	f	t	f	\N	\N	Connector: 2x LC\nData Rate: 1.25Gbps\nForm Factor: SFP\nMode: Single Mode\nSupported Distance: 20km\nWavelength: 1310nm	0	0	3	2026-06-22 01:18:06.258	2026-06-22 01:18:06.258	0	0	0	\N
f3951734-a182-47c7-9652-b02e9d9cc235	Cudy Multi Mode 10G LC SFP+ 850nm 300m	cudy-multi-mode-10g-lc-sfp-850nm-300m	Cudy's CD-SFP-MM10 is a duplex module designed for Multi-Mode fibre deployments up to 300m at 10Gbps. Ideal for short-distance fibre links or to provide uplink between switches, routers and media converters.\n\n*Note: This module is multi vendor compatible	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	125	175	\N	\N	5	5	\N	CD-SFP-MM10	f	t	f	\N	\N	Connector: 2x LC\nData Rate: 10Gbps\nForm Factor: SFP\nMode: Multi Mode\nSupported Distance: 300m\nWavelength: 850nm	0	0	3	2026-06-22 01:18:07.35	2026-06-22 01:18:07.35	0	0	0	\N
6224c310-07c5-4500-8d72-0c1098cd9418	Cudy Dual Band WiFi 5 xPON Router	cudy-dual-band-wifi-5-xpon-router	Cudy's CD-GP1200 is an xPON WiFi 5 router featuring 4-Stream dual-band WiFi 5, 1x SC/APC Slot, 4x Gigabit Ethernet Ports, GPON/EPON dual modes, CWMP, OMCI, 4-queue QoS, and EasyMesh.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	375	515	\N	\N	5	5	\N	CD-GP1200	f	t	f	\N	\N	Antenna Gain: 2x 5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 300Mbps; 5.8GHz: 867Mbps\nGPON: 2.488Gbps Downstream / 1.244Gbps Upstream\nEPON: 1.25 Gbps Downstream / Upstream\nEthernet Ports: 4x 10/100/1000\nHardware Button: Power, Reset, WPS, Wi-Fi On/Off\nMax. Power Consumption: 9.6W\nMax Transmission Distance: 20km\nMounting: Desktop or Wall-mount\nOperating System: Cudy\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None\nWavelength: TX: 1310nm ; RX: 1490nm\n\nDimensions: 173 × 123.8 × 33mm\nWeight: 288g	0	0	3	2026-06-22 01:18:12.244	2026-06-22 01:18:12.244	0	0	0	\N
16e91a00-0689-4f6e-8d33-9060b6aa0a1e	Cudy Dual Band WiFi 7 6500Mbps 5dBi Gigabit Router	cudy-dual-band-wifi-7-6500mbps-5dbi-gigabit-router	Cudy's CD-WR6500 is a dual-band WiFi 7 (802.11be) 6 stream OFDMA router featuring MLO technology, 5x Gigabit Ethernet ports, and an aggregate data rate of up to 6500Mbps over its 2.4GHz (2x2 MU-MIMO) and 5GHz (4x4 MU-MIMO) radios. The router supports DNS over TLS (DoT), and various VPN server or client protocols as well as TR-069 and Cudy's whole home mesh.\n\n*Note: Easily manage this device on-site or remotely using the Cudy mobile app.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1095	1495	\N	\N	5	5	\N	CD-WR6500	t	t	f	\N	\N	Antenna Gain: 6x 5.5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 5765Mbps\nEthernet Ports: 5x 10/100/1000\nHardware Button: Reset; WPS; Power\nMax. Power Consumption: 17W\nMounting: Desktop or Wall-Mount\nOperating System: Cudy\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1.5A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1.5A\nUSB Ports: None\n\nDimensions: 431 x 324 x 58mm\nWeight: 580g	0	0	3	2026-06-22 01:18:13.356	2026-06-22 01:18:13.356	0	0	0	\N
3c6e4ced-5ab0-44e1-a928-3fa18a494135	Cudy 10 Port Gigabit 8 PoE 100W PoE Switch	cudy-10-port-gigabit-8-poe-100w-poe-switch	Cudy's CD-GS1010P is a 10-Port Gigabit switch with 8x 802.3af/at PoE ports and 2x Gigabit Uplink ports. The switch offers a 100W PoE budge with up to 30W per port. Both VLAN and Extender modes are supported with the integrated toggle switch. VLAN mode enables port isolation on ports 1-8 while Extender mode increases the transmission distance on ports 7-8 to 250m at 10Mbps. The watchdog function continuously monitors PoE connections when in VLAN or Extender Mode. If an error is detected on the device, the switch immediately restarts the port. The unit features a PoE Max LED that blinks at 90% usage and stays solid at 95%.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	450	625	\N	\N	5	5	\N	CD-GS1010P	f	t	f	\N	\N	Ethernet Ports: 10x 10/100/1000\nHardware Button: VLAN ; Extender ; Default\nMax. Power Consumption: 20W\nMounting: Desktop, Wall or Rack-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~8\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 100-240V\n\nDimensions: 220 x 150 x 44 mm\nWeight: 1kg	0	0	3	2026-06-22 01:18:14.405	2026-06-22 01:18:14.405	0	0	0	\N
bd65dddd-78aa-4fa2-8f62-e66894689391	Cudy 8 Port Gigabit PoE 110W 2SFP 2 Gigabit Ethernet Switch	cudy-8-port-gigabit-poe-110w-2sfp-2-gigabit-ethernet-switch	Cudy's CD-GS1010PS is an 8 Port Gigabit switch with 8x 802.3af/at PoE ports, 2x SFP and 2x Gigabit Ethernet Uplink ports. The switch offers a 110W PoE budget with up to 30W per PoE port and includes Extender Mode, VLAN and Watchdog toggle switch. The unit features a PoE Max LED that blinks at 90% usage and stays solid at 95%. A PoE LED button lights per-port LEDs to indicate active power delivery.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	650	875	\N	\N	5	5	\N	CD-GS1010PS	f	t	f	\N	\N	Ethernet Ports: 10x 10/100/1000\nHardware Button: Extender; Default\nMax. Power Consumption: 10W\nMounting: Desktop or Rack-Mount\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 802.3af/at PoE on Ports 1~8\nPower Input: 1x IEC Power Cord (Included)\nSerial Interface: None\nSFP Ports: 2x 1.25Gbps\nSupported Voltage Range: 100-240V\n\nDimensions: 256×170×44 mm\nWeight: 934g	0	0	3	2026-06-22 01:18:15.596	2026-06-22 01:18:15.596	0	0	0	\N
8409ba3c-eb33-4677-89ea-f80604833341	Cudy Dual Band WiFi 7 3600Mbps Gigabit Mesh Router	cudy-dual-band-wifi-7-3600mbps-gigabit-mesh-router	Cudy's CD-M36002 is a 2-Pack, dual band WiFi 7 (802.11be) mesh router featuring 3x Gigabit Ethernet Ports, integrated antennas and an aggregate data rate of up to 3600Mbps. The router supports Cudy's Whole Home Mesh system, seamless roaming and multiple VPN Client options including PPTP, L2TP, OpenVPN, WireGuard and IPSec.\n\n*Note: Easily manage this device on-site or remotely using the mobile app.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1650	2250	\N	\N	5	5	\N	CD-M36002	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 5.4dBi ; 5GHz: 5.5dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 688Mbps; 5GHz: 2882Mbps\nEthernet Ports: 3x 10/100/1000\nHardware Button: Reset; WPS\nMax. Power Consumption: 9W\nMounting: Desktop\nOperating System: Cudy\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 12V 1A\nUSB Ports: None\n\nDimensions: Φ110×154.5 mm	0	0	3	2026-06-22 01:18:16.741	2026-06-22 01:18:16.741	0	0	0	\N
e0cb4f8a-32d9-48a8-b7d5-4c7732a59ff9	Ubiquiti UISP Router 8 Port Gigabit PoE 110W 1SFP	ubiquiti-uisp-router-8-port-gigabit-poe-110w-1sfp	Ubiquiti's UISP-R is a router featuring 8x Gigabit PoE ports, 1x SFP and a PoE budget of 110W when powered with the included Power Supply. Its dual-core, 880MHz processor is ideal for MicroPoP applications and can be managed via the UISP network management platform.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2025	2750	\N	\N	5	5	\N	UISP-R	f	t	f	\N	\N	Ethernet Ports: 8x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 10W\nMounting: Desktop or Outdoors with the UISP-BOX\nOperating System: UISP\nOperating Temperature: -10°C to 50°C\nPoE Input: None\nPoE Output: 27V Passive PoE Output on Ports 1~8\nPower Input: 27V, 4.4A Power Supply (Included)\nProcessor Dual-core 880 MHz, MIPS1004Kc\nSerial Interface: None\nSFP Ports: 1x 1.25Gbps\nSupported Voltage Range: 24-28V\nSystem Memory: 512 MB DDR3\nUSB Ports: None\n\nDimensions: 210.4 x 95 x 29 mm\nWeight: 600g	0	0	3	2026-06-22 01:18:17.903	2026-06-22 01:18:17.903	0	0	0	\N
2daec726-bf76-4f22-9ac9-1c49a8d51485	Linkbasic EZ RJ45 CAT5e FTP Modular Plug	linkbasic-ez-rj45-cat5e-ftp-modular-plug	Linkbasic's RJ45-FTPEZ is an FTP Cat5e EZ RJ45 connector which allows all eight strands of an FTP cable to pass through the head of the connector. Then using the TOOL-EZCRIMP you can crimp and cut off the excess copper. This ensures a strong connection and eliminates possible packet loss on partially crimped cables. The RJ45-FTPEZ connector is only compatible with pass through crimpers such as TOOL-EZCRIMP.\n\n*Note: The EZ crimping tool is not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	2.95	4	\N	\N	5	5	\N	RJ45-FTPEZ	f	t	f	\N	\N	Compatibility: 23-26AWG\nConductor Material: 50 Micron Inches of Gold Plating over Copper Alloy\nDesign: 8 Conductors\nMaterial: Polycarbonate	0	0	3	2026-06-22 01:18:18.682	2026-06-22 01:18:18.682	0	0	0	\N
54f50be7-2369-4604-b773-57adf7f33561	Ubiquiti Multi-WAN UniFi Cloud Gateway Ultra	ubiquiti-multi-wan-unifi-cloud-gateway-ultra	Ubiquiti's UCG-ULTRA is a powerful and compact multi-WAN UniFi Cloud Gateway with a full suite of advanced routing and security features. The unit runs UniFi Network for full-stack network management and features 4x Gigabit Ethernet ports, 1x 2.5Gbps WAN Port, a quad-core 1.5GHz CPU, 0.96" LCM status display and Multi-WAN load balancing.\n\nIt can be configured and managed with the UniFi Network Application.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1495	2025	\N	\N	5	5	\N	UCG-ULTRA	f	t	f	\N	\N	Ethernet Ports: 1x 10/100/1000 (WAN) : 1x 10/100/1000 (LAN)\nHardware Button: Reset\nMax. Power Consumption: 3.83W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 5V USB-C Power Supply (Included)\nProcessor: Dual-core 1GHz\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 5V\nSystem Memory: 1 GB DDR3L\nUSB Ports: None\n\nDimensions: 98 x 98 x 30 mm\nWeight: 320g	0	0	3	2026-06-22 01:18:19.641	2026-06-22 01:18:19.641	0	0	0	\N
36769af4-8b37-4371-9f87-1552b6bf7049	Ubiquiti UniFi Security Gateway Lite	ubiquiti-unifi-security-gateway-lite	Ubiquiti's UXG-LITE features a compact design, a 1GHz dual-core processor, 1x Gigabit Ethernet WAN and 1x Gigabit Ethernet LAN port. It also features next-generation security with intrusion detection and prevention systems (IDS/IPS), advanced networking features, and is powered by the included USB-C adapter.\n\nIt can be configured and managed with a Cloudkey, Official UniFi hosting, or UniFi Network Server with UniFi Network 8.0.7 and later.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1495	1995	\N	\N	5	5	\N	UXG-LITE	f	t	f	\N	\N	Ethernet Ports: 3x 10/100/1000 (LAN); 1x 10/100/1000 (LAN / WAN);1x 10/100/1000/2500 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 6.2W\nMounting: Desktop\nOperating System: UniFi\nOperating Temperature: -10°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 1x 5V 3A USB Power Adapter (Included);\nProcessor: Quad-core ARM® Cortex®-A53 at 1.5 GHz\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 5V 3A via USB\nSystem Memory: 3 GB DDR4\nUSB Ports: None\n\nDimensions: 141.8 x 127.6 x 30 mm\nWeight: 0.52kg	0	0	3	2026-06-22 01:18:20.619	2026-06-22 01:18:20.619	0	0	0	\N
f6c0b44d-e13d-4cae-b4c8-8d04a25f496e	MikroTik hEX PoE 5 Port Gigabit 1SFP PoE Out Desktop Router	mikrotik-hex-poe-5-port-gigabit-1sfp-poe-out-desktop-router	MikroTik's RB-HEXPOE is a five port Gigabit Ethernet router for locations where wireless connectivity is not required. The device has a USB 2.0 port and an SFP port for adding optical fibre connectivity. Ports 2-5 can power other PoE capable devices with the same voltage as applied to the unit. This powerful 800MHz CPU is a cost-effective, small, easy to use and capable of all the advanced configurations supported by RouterOS. The maximum current is 1A per port and the Ethernet ports are shielded.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1325	1795	\N	\N	5	5	\N	RB-HEXPOE	f	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 6W\nMounting: Desktop\nOperating System: RouterOS (Level 4 Licence)\nOperating Temperature: -40°C to 60°C\nPoE Input: 12V-57V (Passive PoE, 802.3af/at)\nPoE Output: 12V-57V Passive PoE, 802.3af/at on Ports 2 to 5\nPower Input: 24V 2.5A Power Supply (Included)\nProcessor: 1 Core 800MHz, QCA9557\nSerial Interface: None\nSFP Ports: 1x 1.25Gbps\nSupported Voltage Range: 12V-57V\nSystem Memory: 128 MB\nUSB Ports: 1x USB 2.0\nOther: None\n\nDimensions: 114 x 137 x 29mm	0	0	3	2026-06-22 01:18:21.784	2026-06-22 01:18:21.784	0	0	0	\N
7c183db2-071f-4419-a2ce-bd384c4b509a	Reyee 5 Port Gigabit 2 WAN 4 PoE 54W 100 User Cloud Router	reyee-5-port-gigabit-2-wan-4-poe-54w-100-user-cloud-router	Reyee's RG-EG105GP is a cloud-managed router featuring 5x Gigabit Ethernet Ports with up to x2 WAN ports and 4x 802.3af/at PoE ports. It supports up to 100 users with a maximum WAN bandwidth of 600Mbps. The router integrates with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1150	1550	\N	\N	5	5	\N	RG-EG105GP	f	t	f	\N	\N	Ethernet Ports: 3x 10/100/1000 (LAN); 1x 10/100/1000 (WAN); 1x 10/100/1000 (LAN/WAN)\nHardware Button: Reset\nMax. Power Consumption: 6W\nMounting: Desktop or Wall-Mount\nOperating System: Reyee\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: 4x 802.3af/at on Ports 1-4\nPower Input: 54V 1.11A Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 220V\nSystem Memory: 128MB\nUSB Ports: None\n\nDimensions: 206.5 x 108.5 x 28mm\nWeight: 840g	0	0	3	2026-06-22 01:18:22.801	2026-06-22 01:18:22.801	0	0	0	\N
64a17dfb-ab8d-4221-ae42-6d920da4d441	Reyee 5 Port Gigabit WiFi 5 Wave 2 150 User Cloud Router	reyee-5-port-gigabit-wifi-5-wave-2-150-user-cloud-router	Reyee's RG-EG105GW is a cloud-managed, WiFi 5 MU-MIMO Wave 2 router with 5 Gigabit Ethernet ports and up to 4 WAN ports. With concurrent 2.4G and 5G wireless, the unit supports up to 1267Mbps aggregate over wireless, as well as up to 150 users with a maximum WAN bandwidth of 600Mbps. The router integrates with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1075	1450	\N	\N	5	5	\N	RG-EG105GW	f	t	f	\N	\N	Antenna Gain: 2.4GHz : 3dBi; 5.8GHz : 4dBi\nBeam-width: 360°\nData Rate: 2.4GHz: 400Mbps; 5.8GHz: 867Mbps\nEthernet Ports: 1x 10/100/1000 (LAN); 1x 10/100/1000 (WAN); 3x 10/100/1000 (LAN/WAN)\nHardware Button: Reset, MESH\nMax. Power Consumption: 15W\nMounting: Desktop or Wall-Mount\nOperating System: Reyee\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: DC 12V 1.5A\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 220V\nUSB Ports: 1x USB 2.0\n\nDimensions: 120 x 120 x 28mm\nWeight: 0.251Kg	0	0	3	2026-06-22 01:18:23.826	2026-06-22 01:18:23.826	0	0	0	\N
e26f0476-9ca9-44cb-8cbd-172c796a0028	Scoop 500m Drum Cat5e Outdoor FTP CCA Cable	scoop-500m-drum-cat5e-outdoor-ftp-cca-cable	Scoop's TC-500C is a 500m outdoor Cat5e CCA FTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes an ESD drain wire, UV protected outer sheath, an AWG rating of 24 and is supplied in a 500m drum.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1295	1750	\N	\N	5	5	\N	TC-500C	f	t	f	\N	\N	AWG Rating: 24\nCable Length: 500m\nColour: Black\nConductor Dimensions: 0.50mm\nConstruction: FTP – CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: Yes – Copper Clad Aluminium\nNumber of Pairs: 4\nOuter Jacket: UV-PE\n\nDimensions: 310 x 310 x 300mm	0	0	3	2026-06-22 01:18:24.702	2026-06-22 01:18:24.702	0	0	0	\N
355e18e6-3026-4096-9324-793c3f67ae90	Scoop 100m Box Cat5e Outdoor FTP CCA Cable	scoop-100m-box-cat5e-outdoor-ftp-cca-cable	Scoop's TC-100C is a 100m outdoor Cat5e CCA FTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes an ESD drain wire, UV protected outer sheath and carries an AWG rating of 24.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	275	375	\N	\N	5	5	\N	TC-100C	t	t	f	\N	\N	AWG Rating: 24\nCable Length: 100m\nColour: Black\nConductor Dimensions: 0.50mm\nConstruction: FTP – CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: Yes – Copper Clad Aluminium\nNumber of Pairs: 4\nOuter Jacket: UV-PE\n\nDimensions: 280 x 290 x 80mm	0	0	3	2026-06-22 01:18:25.736	2026-06-22 01:18:25.736	0	0	0	\N
9471d50a-f678-494d-8401-3ea6eb181c63	Scoop 305m Box Cat5e Outdoor FTP CCA Cable	scoop-305m-box-cat5e-outdoor-ftp-cca-cable	Scoop's TC-305C is a 305m outdoor Cat5e CCA FTP cable designed as a cost-effective network cabling solution. Each twisted pair is made from copper-coated aluminium with higher DC resistance than solid copper cable. The Cat5e cable includes an ESD drain wire, UV protected outer sheath, an AWG rating of 24 and is supplied in an easy pull 305m box.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	825	1125	\N	\N	5	5	\N	TC-305C	t	t	f	\N	\N	AWG Rating: 24\nCable Length: 305m\nColour: Black\nConductor Dimensions: 0.50mm\nConstruction: FTP – CCA Copper Clad Aluminium\nCross Filter: None\nESD Drain Wire: Yes – Copper Clad Aluminium\nNumber of Pairs: 4\nOuter Jacket: UV-PE\n\nDimensions: 400 x 400 x 240mm	0	0	3	2026-06-22 01:18:26.708	2026-06-22 01:18:26.708	0	0	0	\N
48bcfa3e-bced-4bbf-9d0e-b5ec2278523d	Cudy 5 Port Gigabit Multi-WAN VPN Router	cudy-5-port-gigabit-multi-wan-vpn-router	Cudy's CD-R700 features 5x Gigabit Ethernet Ports which are comprised of 3x LAN/WAN ports, 1x dedicated WAN and 1x LAN port. The router supports multi-WAN load balancing, flexible traffic control, DNS over TLS (DoT), various VPN server/client protocols and a variety of security mechanisms.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	450	625	\N	\N	50	50	\N	CD-R700	t	t	f	\N	\N	Ethernet Ports: 3x 10/100/1000 (LAN/WAN) ; 1x 10/100/1000 (LAN) ; 1x 10/100/1000 (WAN)\nHardware Button: Reset\nMax. Power Consumption: 6W\nMounting: Desktop\nOperating System: None\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12V 1A Power Supply (Included)\nProcessor: MT7621DA\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 12V\nSystem Memory: 128MB DDR\nUSB Ports: None\n\nDimensions: 119 x 85 x 28 mm	0	0	3	2026-06-22 01:18:27.833	2026-06-22 01:18:27.833	0	0	0	\N
d39aad8f-6dd6-4fb8-b3c0-9579dbf6cb44	Ubiquiti UniFi WiFi 7 Lite Dual Band AP	ubiquiti-unifi-wifi-7-lite-dual-band-ap	Ubiquiti's U7-LITE is a Dual-Band WiFi 7 access point featuring high gain integrated antennas and 1x 2.5Gbps Ethernet port. It delivers an aggregate data rate of up to 5Gbps over its 5GHz (2x2 MU-MIMO) and 2.4GHz (2x2 MU-MIMO) bands.\n\nIt can be configured and managed with the UniFi Network Application.\n\n*Note: PoE injector not included.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	1750	2375	\N	\N	5	5	\N	U7-LITE	t	t	f	\N	\N	Antenna Gain: 2.4GHz: 4dBi; 5.8GHz: 5dBi\nBeam-width: 360\nData Rate: 2.4GHz: 688Mbps 5.8GHz: 4.3Gbps\nEthernet Ports: 1x 10/100/1000/2500\nHardware Button: Reset\nMax. Power Consumption: 13W\nMounting: Ceiling or Wall Mount\nOperating System: UniFi\nOperating Temperature: -30°C to 40°C\nPoE Input: 802.3af or Passive PoE (Not Included)\nPoE Output: None\nPower Input: 802.3af or Passive PoE (Not Included)\nSerial Interface: None\nSIM Slots: None\nSupported Voltage Range: 42.5 to 57V\nUSB Ports: None\n\nDimensions: Ø171.5 x 33 mm\nWeight: 313 g	0	0	3	2026-06-22 01:18:28.815	2026-06-22 01:18:28.815	0	0	0	\N
e7598b60-e84c-43b5-b314-c301f03a2a92	MikroTik hEX Lite 5 Port Ethernet Desktop Router	mikrotik-hex-lite-5-port-ethernet-desktop-router	MikroTik's RB-HEXLITE is a small five port ethernet router in a practical plastic case. It is well priced and the perfect choice when it comes to managing your wired home network.\nNo more compromise between price and features - RB-HEXLITE has both. With its compact design and clean looks, it will fit perfectly into any SOHO environment.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	625	850	\N	\N	5	5	\N	RB-HEXLITE	f	t	f	\N	\N	Ethernet Ports: 5x 10/100\nHardware Button: Reset\nMax. Power Consumption: 2W\nMounting: Desktop\nOperating System: RouterOS (Level 4 Licence)\nOperating Temperature: -40°C to 70°C\nPoE Input: 6V-30V (Passive PoE)\nPoE Output: None\nPower Input: 12V 0.5A Power Supply (Included)\nProcessor: 1 Core 850MHz, QCA9533\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 6V-30V\nSystem Memory: 64MB\nUSB Ports: None\nOther: None\n\nDimensions: 113 x 89 x 28mm	0	0	3	2026-06-22 01:18:29.76	2026-06-22 01:18:29.76	0	0	0	\N
a399afb3-b165-4ac5-80fe-73edc79f6cfc	MikroTik hEX 5 Port Gigabit Desktop Router	mikrotik-hex-5-port-gigabit-desktop-router	MikroTik's RB-HEX is a five port Gigabit Ethernet router for locations where wireless connectivity is not required. The device has a full-size USB port, affordable, small and easy to use. It features a very powerful dual-core 950MHz CPU and 512MB RAM, capable of all the advanced configurations supported by RouterOS.\nIPsec Hardware encryption (~470Mbps) and dude server package is also supported.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	875	1195	\N	\N	5	5	\N	RB-HEX	t	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: Reset\nMax. Power Consumption: 4W\nMounting: Desktop\nOperating System: RouterOS (Level 4 Licence)\nOperating Temperature: -40°C to 70°C\nPoE Input: 12V-28V (Passive PoE)\nPoE Output: None\nPower Input: 24V 0.38A Power Supply (Included)\nProcessor: 2 Core 950MHz , EN7562CT\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 12V-28V\nSystem Memory: 512MB\nUSB Ports: 1x USB 2.0\nOther: None\n\nDimensions: 113 x 89 x 28mm	0	0	3	2026-06-22 01:18:30.71	2026-06-22 01:18:30.71	0	0	0	\N
d17b627e-c5ba-4eec-ae6c-2cfd9e984576	MikroTik hEX PoE Lite 5 Port Ethernet 4 PoE Router	mikrotik-hex-poe-lite-5-port-ethernet-4-poe-router	MikroTik's RB-HEXPOEL is a compact 5 port router featuring 5x shielded Fast Ethernet ports and 1x USB port. It accepts passive PoE input on Port 1 and Ports 2-5 can power other PoE-capable devices with the same voltage as applied to the unit with a maximum of 1A per port.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	895	1225	\N	\N	5	5	\N	RB-HEXPOEL	t	t	f	\N	\N	Ethernet Ports: 5x 10/100\nHardware Button: Reset\nMax. Power Consumption: 3W\nMounting: Desktop\nOperating System: RouterOS (Level 4 Licence)\nOperating Temperature: -40°C to 70°C\nPoE Input: 6-30V (Passive PoE)\nPoE Output: 6-30V (Passive PoE) on Ports 2 to 5\nPower Input: 24V 2.5A Power Supply (Included)\nProcessor: 1 Core 650MHz, QCA9531\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 6-30V\nSystem Memory: 64 MB\nUSB Ports: 1x USB 2.0\nOther: None\n\nDimensions: 113 x 89 x 28mm	0	0	3	2026-06-22 01:18:31.78	2026-06-22 01:18:31.78	0	0	0	\N
3c3d8f03-7ec3-4fda-9e54-25b5e21820a7	MikroTik hEX S 5 Port Gigabit 1x 2.5G SFP Desktop Router	mikrotik-hex-s-5-port-gigabit-1x-2-5g-sfp-desktop-router	MikroTik's RB-HEXS is a five-port Gigabit Ethernet router for locations where wireless connectivity is not required. Compared to the RB-HEX, the RB-HEXS also features an SFP port and PoE output on the last port.\n\nIt is small and easy to use, but comes with a very powerful dual-core ARM 950 MHz CPU and 512 MB RAM, capable of all the advanced configurations that RouterOS supports. The device has a USB 3.0 Type A port, PoE output on Ethernet port 5, and a 2.5G SFP cage	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	995	1350	\N	\N	5	5	\N	RB-HEXS	t	t	f	\N	\N	Ethernet Ports: 5x 10/100/1000\nHardware Button: Rest\nMax. Power Consumption: 5W\nMounting: Desktop or Wall\nOperating System: RouterOS (Level 4 Licence)\nOperating Temperature: -40°C to 70°C\nPoE Input: 18V-57V (Passive PoE, 802.3af/at)\nPoE Output: 18V-57V Passive PoE, 802.3af/at on Port 5\nPower Input: 24V 1.2A Power Supply (Included)\nProcessor: 2 Core 950MHz, EN7562CT\nSerial Interface: None\nSFP Ports: 1x 2.5Gbps\nSupported Voltage Range: 12V-57V\nSystem Memory: 512MB\nUSB Ports: 1x USB 3.0 Type A\nOther: None\n\nDimensions: 113 x 89 x 28mm	0	0	3	2026-06-22 01:18:32.831	2026-06-22 01:18:32.831	0	0	0	\N
9fa90335-467e-4906-811f-e5b55ee1769d	Reyee 5 Port Gigabit 2 WAN 100 User Cloud Router	reyee-5-port-gigabit-2-wan-100-user-cloud-router	Reyee's RG-EG105G is a cloud-managed router featuring 5x Gigabit Ethernet Ports with up to x2 WAN ports. It supports up to 100 users with a maximum WAN bandwidth of 600Mbps. The router integrates with Ruijie's free cloud service allows users to quickly and easily auto-provision, deploy and manage devices remotely.	91c4222c-dcb8-4770-9937-f3a5eecf2503	NEW	995	1350	\N	\N	5	5	\N	RG-EG105G	f	t	f	\N	\N	Ethernet Ports: 3x 10/100/1000 (LAN); 1x 10/100/1000 (WAN); 1x 10/100/1000 (LAN/WAN)\nHardware Button: Reset\nMax. Power Consumption: 6W\nMounting: Desktop or Wall-Mount\nOperating System: Reyee\nOperating Temperature: 0°C to 40°C\nPoE Input: None\nPoE Output: None\nPower Input: 12v Power Supply (Included)\nSerial Interface: None\nSFP Ports: None\nSupported Voltage Range: 220V\nSystem Memory: 128MB\nUSB Ports: None\n\nDimensions: 206.5 x 108.5 x 28mm\nWeight: 840g	0	0	3	2026-06-22 01:18:33.65	2026-06-22 01:18:33.65	0	0	0	\N
\.


--
-- TOC entry 5358 (class 0 OID 412027)
-- Dependencies: 248
-- Data for Name: return_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_attachments (id, "returnRequestId", "fileUrl", "fileName", "fileType", "uploadedBy", "createdAt") FROM stdin;
\.


--
-- TOC entry 5357 (class 0 OID 412019)
-- Dependencies: 247
-- Data for Name: return_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_items (id, "returnRequestId", "orderItemId", "productId", quantity, "unitPrice", total, reason, "conditionReceived", "inspectionNote", "createdAt", "updatedAt") FROM stdin;
660fee30-e5d9-4ae7-ad3e-e7a1ab1b5633	e9c5c8b7-3518-4374-b947-70db8295a44e	d4da0c27-bee6-404a-bddd-8d4ff0f4eb4d	686fef89-e035-4439-9b37-211f842454e8	1	9425	9425	Wrong item received	\N	\N	2026-06-21 23:27:28.409	2026-06-21 23:27:28.409
\.


--
-- TOC entry 5356 (class 0 OID 412009)
-- Dependencies: 246
-- Data for Name: return_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_requests (id, "returnNumber", "orderId", "customerId", status, "requestedResolution", "customerReason", "customerComment", "adminNote", "customerVisibleNote", "totalReturnValue", "completedAt", "createdAt", "updatedAt") FROM stdin;
e9c5c8b7-3518-4374-b947-70db8295a44e	RMA-00001	5106015b-e423-46a6-a5ee-024a6caaa615	533b4a46-5854-46e9-b084-65a7138731c4	APPROVED	REFUND	Wrong item received	8t7tuit7 8ui	gtu;iku;pu9uioio	98u0908798789o6y	9425	\N	2026-06-21 23:27:28.409	2026-06-21 23:30:46.767
\.


--
-- TOC entry 5359 (class 0 OID 412035)
-- Dependencies: 249
-- Data for Name: return_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_status_history (id, "returnRequestId", "oldStatus", "newStatus", note, "changedByAdminId", "createdAt") FROM stdin;
c03926f9-7883-4d95-8cf9-227d65e0aedf	e9c5c8b7-3518-4374-b947-70db8295a44e	REQUESTED	REQUESTED	Return request submitted by customer	\N	2026-06-21 23:27:28.409
534da059-dcb2-44bc-a2f5-44288882079b	e9c5c8b7-3518-4374-b947-70db8295a44e	REQUESTED	UNDER_REVIEW	\N	533b4a46-5854-46e9-b084-65a7138731c4	2026-06-21 23:29:45.868
24bb7148-9eec-4520-aec9-29bac8c1d2bd	e9c5c8b7-3518-4374-b947-70db8295a44e	UNDER_REVIEW	APPROVED	\N	533b4a46-5854-46e9-b084-65a7138731c4	2026-06-21 23:30:46.767
\.


--
-- TOC entry 5336 (class 0 OID 362725)
-- Dependencies: 226
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "userId", "productId", rating, title, comment, "isApproved", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5347 (class 0 OID 362824)
-- Dependencies: 237
-- Data for Name: service_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_bookings (id, "bookingNumber", "customerName", "customerEmail", "customerPhone", company, "serviceType", status, address, city, province, "postalCode", "preferredDate", "scheduledDate", "scheduledTime", "technicianId", "technicianName", description, "internalNotes", "estimatedCost", "finalCost", "userId", "createdAt", "updatedAt", "emailCount", "emailSentAt") FROM stdin;
050929ce-605f-4e90-a7dc-cce393651166	BK-1780871394342	Fortune Matenda	fortunematenda5@gmail.com	0612685933	Bretune Technologies	WIFI_INSTALLATION	CONFIRMED	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	2026-06-11 00:00:00	2026-06-08 00:00:00	\N	\N	aegzcvvsz	hbdzgnbgfnfgbngb	 ghfnghnbgcbvbv	\N	\N	\N	2026-06-07 22:29:54.351	2026-06-07 22:36:52.103	0	\N
\.


--
-- TOC entry 5349 (class 0 OID 362845)
-- Dependencies: 239
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, "group", description, "isPublic", "createdAt", "updatedAt") FROM stdin;
4213c151-36fb-40ed-88d8-3d5162f1d01e	hero_settings	{"badge":{"text":"","visible":false,"position":{"horizontal":"center","vertical":"center"}},"headline":"","headlineHighlight":"","subheadline":"","ctaButtons":[],"trustIndicators":[{"text":"Certified Partners","visible":false},{"text":"24/7 Support","visible":false},{"text":"Nationwide Delivery","visible":false}],"backgroundGradient":"linear-gradient(135deg, #0f172a 0%, #1e293b 100%)","nodes":[{"x":10,"y":20,"size":"12px","delay":0,"color":"#003d7a"},{"x":25,"y":60,"size":"16px","delay":0.5,"color":"#0055a4"},{"x":15,"y":80,"size":"10px","delay":1,"color":"#003d7a"},{"x":80,"y":15,"size":"14px","delay":0.3,"color":"#003d7a"},{"x":90,"y":50,"size":"18px","delay":0.8,"color":"#0055a4"},{"x":75,"y":75,"size":"12px","delay":1.2,"color":"#003d7a"},{"x":50,"y":30,"size":"20px","delay":0.2,"color":"#f97316"},{"x":45,"y":70,"size":"15px","delay":0.7,"color":"#f97316"}],"connectionLines":[{"x1":10,"y1":20,"x2":25,"y2":60,"delay":0.2},{"x1":25,"y1":60,"x2":15,"y2":80,"delay":0.4},{"x1":80,"y1":15,"x2":90,"y2":50,"delay":0.3},{"x1":90,"y1":50,"x2":75,"y2":75,"delay":0.5},{"x1":50,"y1":30,"x2":25,"y2":60,"delay":0.6},{"x1":50,"y1":30,"x2":90,"y2":50,"delay":0.7},{"x1":45,"y1":70,"x2":15,"y2":80,"delay":0.8},{"x1":45,"y1":70,"x2":75,"y2":75,"delay":0.9}],"wifiSignals":[{"x":50,"y":30,"delay":0},{"x":25,"y":60,"delay":1},{"x":90,"y":50,"delay":2}],"particleConfig":{"count":20,"speed":4,"sizeMin":2,"sizeMax":6},"animationSpeed":{"nodeDuration":4,"lineDuration":3,"wifiDuration":2,"particleDuration":4},"height":"clamp(280px, 35vh, 400px)","backgroundImageUrl":"","contentImageUrl":"https://res.cloudinary.com/dojzkljaa/image/upload/v1781940896/bretunetech/hero/chatgpt-image-jun-20--2026--09_34_40-am.jpg","backgroundColor":"#000000","contentPosition":{"horizontal":"right","vertical":"center"},"subheadlinePosition":{"horizontal":"right","vertical":"center"},"contentImagePosition":{"horizontal":"center","vertical":"center"},"headlineHighlightPosition":{"horizontal":"right","vertical":"center"}}	hero	Hero banner settings	t	2026-06-20 07:19:15.35	2026-06-20 22:36:27.87
\.


--
-- TOC entry 5346 (class 0 OID 362816)
-- Dependencies: 236
-- Data for Name: stock_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_history (id, "productId", "changeType", "quantityChange", "previousQty", "newQty", "orderId", note, "createdAt") FROM stdin;
\.


--
-- TOC entry 5354 (class 0 OID 388254)
-- Dependencies: 244
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, "contactPerson", email, phone, website, address, city, notes, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5327 (class 0 OID 362637)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", "firstName", "lastName", phone, role, "avatarUrl", "isDeleted", "createdAt", "updatedAt", "emailOtp", "emailOtpExpiry", "isVerified") FROM stdin;
be3542a2-9c4a-4d3c-ade3-e7f75f683343	admin@voltnet.co.za	$2b$12$y.XVElZbhfmlSvJVeMHNUOeOQLEObsGfHCBo5pjHNs.llyZ2c1fDe	Fortune	Matenda	+27612685933	ADMIN	\N	f	2026-06-03 19:18:54.276	2026-06-18 23:44:12.146	\N	\N	t
7fb306d0-f047-4146-bb07-49e5385a3cdc	fortunematenda5@gmail.com	$2b$12$FIoPJPKP3pUYLy.fUw6SPuqyI9hFwM8tgRUgIFYAYvekCGjmLwHfG	Fortune	Matenda	+27612685933	CUSTOMER	\N	f	2026-06-03 19:20:39.118	2026-06-18 23:44:12.146	\N	\N	t
b4b9237d-4e20-4771-96b9-07ef09c80631	fortunematenda@gmail.com	$2b$12$cRHc6v7ruGbBqzW/34SbX.HLBzxYL1aldKtpR.7EsKQ7SUoSOJOo2	fortune	Matenda	0612685933	CUSTOMER	\N	f	2026-06-07 12:55:24.514	2026-06-18 23:44:12.146	\N	\N	t
0b3b9867-cc5a-43b2-8be0-52567d5f736d	brianshoko@gmail.com	$2b$12$HW51HZjZTcsVpoSaGCvSdO8e3oK3ojq.gMg3esnCtiupDLFrgDEZS	Brian	Shoko	0276859234	CUSTOMER	\N	f	2026-06-08 07:38:02.943	2026-06-18 23:44:12.146	\N	\N	t
533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com	$2b$12$Ftnqxu2MBYqYnlqhETM3y.DI7HhV6CAUY8O8k9LV7Oo7YSWONAGiG	Bretunetech	Admin	\N	SUPER_ADMIN	\N	f	2026-06-02 07:07:36.293	2026-06-18 23:44:12.146	\N	\N	t
27c12a03-a169-47ef-bbc6-8e0c202ee09d	fortune@bretunetech.com	$2b$12$KloG7egmKO0CJp7kGf6PG.NIIIY.0pjioekNuQXkqBqOboljb8XQm	Brenda	Gwari	+27612685933	CUSTOMER	\N	f	2026-06-18 23:48:48.849	2026-06-18 23:49:21.238	\N	\N	t
ed03c631-4984-4ed7-8fad-248032f69b04	fortune@brtetunetech.com	$2b$12$UkJgq03MFWMwrTzXuxG7pOkWjG6gx./i3bLHSBrXEn29NxHwVt5Aa	Fortune	Matenda	+27612685933	CUSTOMER	\N	f	2026-06-18 23:45:34.32	2026-06-18 23:56:58.466	\N	\N	t
\.


--
-- TOC entry 5329 (class 0 OID 362656)
-- Dependencies: 219
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, "userId", "businessName", slug, description, "logoUrl", "commissionRate", "isApproved", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5335 (class 0 OID 362717)
-- Dependencies: 225
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- TOC entry 5112 (class 2606 OID 363082)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 362655)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 362763)
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 362753)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 362781)
-- Name: bundle_items bundle_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT bundle_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 362773)
-- Name: bundles bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundles
    ADD CONSTRAINT bundles_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 368490)
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 362797)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 362789)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 362674)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5110 (class 2606 OID 363073)
-- Name: enquiries enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);


--
-- TOC entry 5102 (class 2606 OID 362844)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 5126 (class 2606 OID 411133)
-- Name: marketing_ads marketing_ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_ads
    ADD CONSTRAINT marketing_ads_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 367631)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 362815)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5079 (class 2606 OID 362808)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 362709)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 362700)
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5036 (class 2606 OID 362716)
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 362743)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 362691)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5140 (class 2606 OID 412034)
-- Name: return_attachments return_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_attachments
    ADD CONSTRAINT return_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5137 (class 2606 OID 412026)
-- Name: return_items return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 412018)
-- Name: return_requests return_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5143 (class 2606 OID 412042)
-- Name: return_status_history return_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_status_history
    ADD CONSTRAINT return_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 362734)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5093 (class 2606 OID 362832)
-- Name: service_bookings service_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT service_bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 362854)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5089 (class 2606 OID 362823)
-- Name: stock_history stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5122 (class 2606 OID 388262)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 362646)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 362665)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 362724)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 5059 (class 1259 OID 362896)
-- Name: ads_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ads_isActive_idx" ON public.ads USING btree ("isActive");


--
-- TOC entry 5062 (class 1259 OID 362897)
-- Name: ads_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ads_sortOrder_idx" ON public.ads USING btree ("sortOrder");


--
-- TOC entry 5054 (class 1259 OID 362895)
-- Name: brands_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "brands_isActive_idx" ON public.brands USING btree ("isActive");


--
-- TOC entry 5055 (class 1259 OID 362893)
-- Name: brands_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX brands_name_key ON public.brands USING btree (name);


--
-- TOC entry 5058 (class 1259 OID 362894)
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- TOC entry 5066 (class 1259 OID 362899)
-- Name: bundle_items_bundleId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "bundle_items_bundleId_productId_key" ON public.bundle_items USING btree ("bundleId", "productId");


--
-- TOC entry 5065 (class 1259 OID 362898)
-- Name: bundles_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bundles_slug_key ON public.bundles USING btree (slug);


--
-- TOC entry 5071 (class 1259 OID 362900)
-- Name: carts_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "carts_userId_key" ON public.carts USING btree ("userId");


--
-- TOC entry 5013 (class 1259 OID 362869)
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- TOC entry 5016 (class 1259 OID 362870)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 5038 (class 1259 OID 362885)
-- Name: idx_wishlists_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_product ON public.wishlists USING btree ("productId");


--
-- TOC entry 5039 (class 1259 OID 362886)
-- Name: idx_wishlists_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_user ON public.wishlists USING btree ("userId");


--
-- TOC entry 5098 (class 1259 OID 362920)
-- Name: invoices_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_dueDate_idx" ON public.invoices USING btree ("dueDate");


--
-- TOC entry 5099 (class 1259 OID 362917)
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- TOC entry 5100 (class 1259 OID 362918)
-- Name: invoices_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_orderId_key" ON public.invoices USING btree ("orderId");


--
-- TOC entry 5103 (class 1259 OID 362919)
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- TOC entry 5104 (class 1259 OID 362921)
-- Name: invoices_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_userId_idx" ON public.invoices USING btree ("userId");


--
-- TOC entry 5123 (class 1259 OID 411136)
-- Name: marketing_ads_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "marketing_ads_createdAt_idx" ON public.marketing_ads USING btree ("createdAt");


--
-- TOC entry 5124 (class 1259 OID 411135)
-- Name: marketing_ads_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "marketing_ads_isActive_idx" ON public.marketing_ads USING btree ("isActive");


--
-- TOC entry 5127 (class 1259 OID 411134)
-- Name: marketing_ads_template_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX marketing_ads_template_idx ON public.marketing_ads USING btree (template);


--
-- TOC entry 5113 (class 1259 OID 367634)
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- TOC entry 5114 (class 1259 OID 367633)
-- Name: notifications_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_isRead_idx" ON public.notifications USING btree ("isRead");


--
-- TOC entry 5117 (class 1259 OID 367632)
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- TOC entry 5082 (class 1259 OID 362907)
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- TOC entry 5085 (class 1259 OID 362908)
-- Name: order_items_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_items_productId_idx" ON public.order_items USING btree ("productId");


--
-- TOC entry 5074 (class 1259 OID 362905)
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- TOC entry 5075 (class 1259 OID 362902)
-- Name: orders_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON public.orders USING btree ("idempotencyKey");


--
-- TOC entry 5076 (class 1259 OID 362901)
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- TOC entry 5077 (class 1259 OID 362906)
-- Name: orders_paymentMethod_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_paymentMethod_idx" ON public.orders USING btree ("paymentMethod");


--
-- TOC entry 5080 (class 1259 OID 362904)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 5081 (class 1259 OID 362903)
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- TOC entry 5032 (class 1259 OID 362881)
-- Name: product_specifications_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_specifications_productId_idx" ON public.product_specifications USING btree ("productId");


--
-- TOC entry 5037 (class 1259 OID 362882)
-- Name: product_tags_tag_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_tags_tag_idx ON public.product_tags USING btree (tag);


--
-- TOC entry 5017 (class 1259 OID 387388)
-- Name: products_brandId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_brandId_idx" ON public.products USING btree ("brandId");


--
-- TOC entry 5018 (class 1259 OID 362873)
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- TOC entry 5019 (class 1259 OID 362875)
-- Name: products_condition_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_condition_idx ON public.products USING btree (condition);


--
-- TOC entry 5020 (class 1259 OID 362880)
-- Name: products_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_createdAt_idx" ON public.products USING btree ("createdAt");


--
-- TOC entry 5021 (class 1259 OID 362877)
-- Name: products_isActive_isDeleted_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isActive_isDeleted_idx" ON public.products USING btree ("isActive", "isDeleted");


--
-- TOC entry 5022 (class 1259 OID 362876)
-- Name: products_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isFeatured_idx" ON public.products USING btree ("isFeatured");


--
-- TOC entry 5023 (class 1259 OID 362878)
-- Name: products_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_name_idx ON public.products USING btree (name);


--
-- TOC entry 5026 (class 1259 OID 362874)
-- Name: products_sellingPrice_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_sellingPrice_idx" ON public.products USING btree ("sellingPrice");


--
-- TOC entry 5027 (class 1259 OID 362872)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5028 (class 1259 OID 362871)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 5029 (class 1259 OID 362879)
-- Name: products_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_vendorId_idx" ON public.products USING btree ("vendorId");


--
-- TOC entry 5141 (class 1259 OID 412050)
-- Name: return_attachments_returnRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_attachments_returnRequestId_idx" ON public.return_attachments USING btree ("returnRequestId");


--
-- TOC entry 5135 (class 1259 OID 412049)
-- Name: return_items_orderItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_items_orderItemId_idx" ON public.return_items USING btree ("orderItemId");


--
-- TOC entry 5138 (class 1259 OID 412048)
-- Name: return_items_returnRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_items_returnRequestId_idx" ON public.return_items USING btree ("returnRequestId");


--
-- TOC entry 5128 (class 1259 OID 412047)
-- Name: return_requests_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_requests_createdAt_idx" ON public.return_requests USING btree ("createdAt");


--
-- TOC entry 5129 (class 1259 OID 412045)
-- Name: return_requests_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_requests_customerId_idx" ON public.return_requests USING btree ("customerId");


--
-- TOC entry 5130 (class 1259 OID 412044)
-- Name: return_requests_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_requests_orderId_idx" ON public.return_requests USING btree ("orderId");


--
-- TOC entry 5133 (class 1259 OID 412043)
-- Name: return_requests_returnNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "return_requests_returnNumber_key" ON public.return_requests USING btree ("returnNumber");


--
-- TOC entry 5134 (class 1259 OID 412046)
-- Name: return_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX return_requests_status_idx ON public.return_requests USING btree (status);


--
-- TOC entry 5144 (class 1259 OID 412051)
-- Name: return_status_history_returnRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "return_status_history_returnRequestId_idx" ON public.return_status_history USING btree ("returnRequestId");


--
-- TOC entry 5046 (class 1259 OID 362890)
-- Name: reviews_isApproved_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_isApproved_idx" ON public.reviews USING btree ("isApproved");


--
-- TOC entry 5049 (class 1259 OID 362889)
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- TOC entry 5050 (class 1259 OID 362891)
-- Name: reviews_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_userId_idx" ON public.reviews USING btree ("userId");


--
-- TOC entry 5051 (class 1259 OID 362892)
-- Name: reviews_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reviews_userId_productId_key" ON public.reviews USING btree ("userId", "productId");


--
-- TOC entry 5091 (class 1259 OID 362912)
-- Name: service_bookings_bookingNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "service_bookings_bookingNumber_key" ON public.service_bookings USING btree ("bookingNumber");


--
-- TOC entry 5094 (class 1259 OID 362915)
-- Name: service_bookings_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_bookings_scheduledDate_idx" ON public.service_bookings USING btree ("scheduledDate");


--
-- TOC entry 5095 (class 1259 OID 362914)
-- Name: service_bookings_serviceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_bookings_serviceType_idx" ON public.service_bookings USING btree ("serviceType");


--
-- TOC entry 5096 (class 1259 OID 362913)
-- Name: service_bookings_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX service_bookings_status_idx ON public.service_bookings USING btree (status);


--
-- TOC entry 5097 (class 1259 OID 362916)
-- Name: service_bookings_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_bookings_userId_idx" ON public.service_bookings USING btree ("userId");


--
-- TOC entry 5105 (class 1259 OID 362923)
-- Name: settings_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settings_group_idx ON public.settings USING btree ("group");


--
-- TOC entry 5106 (class 1259 OID 362922)
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- TOC entry 5086 (class 1259 OID 362910)
-- Name: stock_history_changeType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_history_changeType_idx" ON public.stock_history USING btree ("changeType");


--
-- TOC entry 5087 (class 1259 OID 362911)
-- Name: stock_history_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_history_createdAt_idx" ON public.stock_history USING btree ("createdAt");


--
-- TOC entry 5090 (class 1259 OID 362909)
-- Name: stock_history_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_history_productId_idx" ON public.stock_history USING btree ("productId");


--
-- TOC entry 5120 (class 1259 OID 388263)
-- Name: suppliers_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX suppliers_name_key ON public.suppliers USING btree (name);


--
-- TOC entry 5040 (class 1259 OID 362888)
-- Name: unique_user_product_wishlist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_product_wishlist ON public.wishlists USING btree ("userId", "productId");


--
-- TOC entry 5002 (class 1259 OID 362865)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 5003 (class 1259 OID 362864)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 5006 (class 1259 OID 362866)
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- TOC entry 5011 (class 1259 OID 362868)
-- Name: vendors_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vendors_slug_key ON public.vendors USING btree (slug);


--
-- TOC entry 5012 (class 1259 OID 362867)
-- Name: vendors_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_userId_key" ON public.vendors USING btree ("userId");


--
-- TOC entry 5043 (class 1259 OID 362884)
-- Name: wishlists_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wishlists_productId_idx" ON public.wishlists USING btree ("productId");


--
-- TOC entry 5044 (class 1259 OID 362883)
-- Name: wishlists_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wishlists_userId_idx" ON public.wishlists USING btree ("userId");


--
-- TOC entry 5045 (class 1259 OID 362887)
-- Name: wishlists_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wishlists_userId_productId_key" ON public.wishlists USING btree ("userId", "productId");


--
-- TOC entry 5145 (class 2606 OID 362924)
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5159 (class 2606 OID 362989)
-- Name: bundle_items bundle_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT "bundle_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.bundles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5160 (class 2606 OID 362994)
-- Name: bundle_items bundle_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT "bundle_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5162 (class 2606 OID 363004)
-- Name: cart_items cart_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.bundles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5163 (class 2606 OID 363009)
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5164 (class 2606 OID 363014)
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5161 (class 2606 OID 362999)
-- Name: carts carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5147 (class 2606 OID 362934)
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5172 (class 2606 OID 363054)
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5173 (class 2606 OID 363059)
-- Name: invoices invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5174 (class 2606 OID 367635)
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5167 (class 2606 OID 363029)
-- Name: order_items order_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.bundles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5168 (class 2606 OID 363034)
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5169 (class 2606 OID 363039)
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5165 (class 2606 OID 363019)
-- Name: orders orders_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5166 (class 2606 OID 363024)
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5152 (class 2606 OID 362954)
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5151 (class 2606 OID 362949)
-- Name: product_specifications product_specifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5153 (class 2606 OID 362959)
-- Name: product_tags product_tags_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5158 (class 2606 OID 362984)
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5148 (class 2606 OID 387383)
-- Name: products products_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5149 (class 2606 OID 362939)
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5150 (class 2606 OID 362944)
-- Name: products products_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5180 (class 2606 OID 412077)
-- Name: return_attachments return_attachments_returnRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_attachments
    ADD CONSTRAINT "return_attachments_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES public.return_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5177 (class 2606 OID 412067)
-- Name: return_items return_items_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT "return_items_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5178 (class 2606 OID 412072)
-- Name: return_items return_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT "return_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5179 (class 2606 OID 412062)
-- Name: return_items return_items_returnRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT "return_items_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES public.return_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5175 (class 2606 OID 412057)
-- Name: return_requests return_requests_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT "return_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5176 (class 2606 OID 412052)
-- Name: return_requests return_requests_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT "return_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5181 (class 2606 OID 412082)
-- Name: return_status_history return_status_history_returnRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_status_history
    ADD CONSTRAINT "return_status_history_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES public.return_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5156 (class 2606 OID 362974)
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5157 (class 2606 OID 362979)
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5171 (class 2606 OID 363049)
-- Name: service_bookings service_bookings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT "service_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5170 (class 2606 OID 363044)
-- Name: stock_history stock_history_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT "stock_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5146 (class 2606 OID 362929)
-- Name: vendors vendors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5154 (class 2606 OID 362964)
-- Name: wishlists wishlists_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 5155 (class 2606 OID 362969)
-- Name: wishlists wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-06-22 11:11:37

--
-- PostgreSQL database dump complete
--

