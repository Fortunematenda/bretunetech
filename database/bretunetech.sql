--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-06-03 23:58:22

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
-- TOC entry 5 (class 2615 OID 345105)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 877 (class 1247 OID 345148)
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
-- TOC entry 874 (class 1247 OID 345136)
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
-- TOC entry 880 (class 1247 OID 345162)
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
-- TOC entry 886 (class 1247 OID 345180)
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
-- TOC entry 889 (class 1247 OID 345194)
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
-- TOC entry 883 (class 1247 OID 345174)
-- Name: ProductCondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductCondition" AS ENUM (
    'NEW',
    'REFURBISHED'
);


ALTER TYPE public."ProductCondition" OWNER TO postgres;

--
-- TOC entry 868 (class 1247 OID 345116)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'VENDOR',
    'STAFF'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 871 (class 1247 OID 345124)
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
-- TOC entry 217 (class 1259 OID 345106)
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
-- TOC entry 219 (class 1259 OID 345213)
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
-- TOC entry 227 (class 1259 OID 345290)
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
-- TOC entry 226 (class 1259 OID 345280)
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
-- TOC entry 229 (class 1259 OID 345306)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text,
    "bundleId" text,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 345298)
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
-- TOC entry 221 (class 1259 OID 345232)
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
-- TOC entry 233 (class 1259 OID 345342)
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
-- TOC entry 235 (class 1259 OID 345364)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    "bundleId" text,
    name text NOT NULL,
    price double precision NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 345314)
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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 345255)
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
-- TOC entry 224 (class 1259 OID 345264)
-- Name: product_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tags (
    id text NOT NULL,
    "productId" text NOT NULL,
    tag text NOT NULL
);


ALTER TABLE public.product_tags OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 345271)
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
-- TOC entry 222 (class 1259 OID 345241)
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
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 5 NOT NULL,
    "supplierName" text,
    sku text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "vendorId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 345333)
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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.service_bookings OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 345354)
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
-- TOC entry 231 (class 1259 OID 345325)
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
-- TOC entry 218 (class 1259 OID 345203)
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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 345222)
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
-- TOC entry 236 (class 1259 OID 351439)
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
-- TOC entry 5147 (class 0 OID 345106)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
48b2665b-d02c-4055-b8b4-7699ec017125	2a8eb0ee89c8e2397d15f2cad170f6567c1877cfe5149617446a7067dab72eec	2026-06-02 08:58:37.717022+02	20260408001936_init	\N	\N	2026-06-02 08:58:37.542534+02	1
\.


--
-- TOC entry 5149 (class 0 OID 345213)
-- Dependencies: 219
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "userId", label, street, city, province, "postalCode", country, "isDefault") FROM stdin;
060cc501-fee5-4342-bdd9-ee7d8397adec	7fb306d0-f047-4146-bb07-49e5385a3cdc	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
503aa365-5b5c-4e32-b487-97555a6a3d2d	7fb306d0-f047-4146-bb07-49e5385a3cdc	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
d994fbae-7cc3-44e0-b1a7-c35030c1fc26	7fb306d0-f047-4146-bb07-49e5385a3cdc	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
65f33558-8c44-4d10-b3d9-3e00ea8b6d35	7fb306d0-f047-4146-bb07-49e5385a3cdc	Shipping Address	2659 Myeza,Masiphumelele	Capetown	Western Cape	7975	South Africa	f
08f81680-c399-49f3-b2bd-6734cc6acd08	7fb306d0-f047-4146-bb07-49e5385a3cdc	Shipping Address	134 kommitjie Road	Fish Hoek	Western Cape	7975	South Africa	t
338c4517-aac6-4320-9067-b125ca987b8e	be3542a2-9c4a-4d3c-ade3-e7f75f683343	Shipping Address	134 kommitjie Road	Fish Hoek	Western Cape	7975	South Africa	t
\.


--
-- TOC entry 5157 (class 0 OID 345290)
-- Dependencies: 227
-- Data for Name: bundle_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundle_items (id, "bundleId", "productId", quantity) FROM stdin;
624a4172-ac60-4a7d-b386-af142520f676	012f795e-5f51-4922-a74e-ac34eea76a7d	cf51442d-a760-4989-93c1-e6387e3ac053	1
46954325-7002-41ac-80d0-21c86e3afc30	012f795e-5f51-4922-a74e-ac34eea76a7d	7b05bf9e-ac1d-4543-ba5d-3614d63e320e	1
378f48eb-6cfa-40ac-b4b3-4da4a3c0ca74	ef4e7cc8-4bfa-4c9d-888d-79c8c3e0b33d	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	1
160b3549-5e7c-41da-b182-bdb6b2db014b	ef4e7cc8-4bfa-4c9d-888d-79c8c3e0b33d	f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	1
304fe1f2-5c41-4c52-b539-e9ba01569cb3	ef4e7cc8-4bfa-4c9d-888d-79c8c3e0b33d	5665deb7-4312-4d31-ab4d-f38fd79a1a2d	1
d95b411a-4480-45b1-bbd3-d9872f16b639	1a00ffde-939d-45c8-90e7-67d08c397b83	9e809ce6-dada-456d-9d4b-d464eecdcf57	1
e4cbc0cb-c5f5-4d63-b5cb-df2a699867ca	1a00ffde-939d-45c8-90e7-67d08c397b83	c39e1c53-4550-4816-858e-866d0c6801d8	1
37a25de7-122c-4c36-a62b-b1f9f04cc3eb	1a00ffde-939d-45c8-90e7-67d08c397b83	e8708e22-b7e3-4d83-88ad-e9f31212dfea	1
\.


--
-- TOC entry 5156 (class 0 OID 345280)
-- Dependencies: 226
-- Data for Name: bundles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundles (id, name, slug, description, "bundlePrice", "imageUrl", "isFeatured", "isActive", "createdAt", "updatedAt") FROM stdin;
1a00ffde-939d-45c8-90e7-67d08c397b83	Work From Home Kit	work-from-home-kit	Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals.	9499	\N	t	t	2026-06-02 07:07:36.595	2026-06-02 07:07:36.595
ef4e7cc8-4bfa-4c9d-888d-79c8c3e0b33d	Small Business Network Kit	small-business-network-kit	Professional networking setup for small businesses — router, access point, and bulk cabling.	4999	\N	t	t	2026-06-02 07:07:36.594	2026-06-02 07:08:40.418
012f795e-5f51-4922-a74e-ac34eea76a7d	Load Shedding Backup Kit	load-shedding-backup-kit	Beat load shedding with a powerful inverter and lithium battery combo. Keep your home or office running.	23999	\N	t	t	2026-06-02 07:07:36.592	2026-06-02 07:09:12.839
\.


--
-- TOC entry 5159 (class 0 OID 345306)
-- Dependencies: 229
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, "cartId", "productId", "bundleId", quantity) FROM stdin;
\.


--
-- TOC entry 5158 (class 0 OID 345298)
-- Dependencies: 228
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, "userId", "createdAt", "updatedAt") FROM stdin;
1829fd55-903d-4923-8c20-0e8820252975	7fb306d0-f047-4146-bb07-49e5385a3cdc	2026-06-03 20:31:00.789	2026-06-03 20:31:00.789
50e29a70-9bda-4638-90e5-c0c2f9094a20	be3542a2-9c4a-4d3c-ade3-e7f75f683343	2026-06-03 21:56:29.398	2026-06-03 21:56:29.398
\.


--
-- TOC entry 5151 (class 0 OID 345232)
-- Dependencies: 221
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, "imageUrl", "parentId", "sortOrder", "createdAt", "updatedAt") FROM stdin;
9e2be49e-ca8a-455f-b05d-2e48cafc64ca	Accessories	accessories	Cables, adapters, peripherals, and more	\N	\N	4	2026-06-02 07:07:36.366	2026-06-02 07:07:36.366
a8114ebf-aeff-49af-9962-f3afdbbb67bc	Technology	technology	Laptops, tablets, and computing devices	/assets/brands/mikrotik.svg	\N	1	2026-06-02 07:07:36.31	2026-06-02 07:21:18.17
e716a16b-4968-41c6-b152-7d56bef27270	Power Solutions	power-solutions	Inverters, batteries, UPS, and solar products	/assets/brands/must.svg	\N	2	2026-06-02 07:07:36.358	2026-06-02 07:21:18.184
7ff103d7-7a99-4fc2-8b4d-b667963d6548	Internet & Networking	internet-networking	Routers, switches, and networking equipment	/assets/brands/ubiquiti.png	\N	3	2026-06-02 07:07:36.36	2026-06-02 07:21:18.187
\.


--
-- TOC entry 5163 (class 0 OID 345342)
-- Dependencies: 233
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "invoiceNumber", "customerName", "customerEmail", "customerPhone", "customerAddress", "businessName", "businessReg", "vatNumber", subtotal, "vatAmount", total, "amountPaid", status, "dueDate", "paidAt", "paymentMethod", "paymentRef", "orderId", "userId", items, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5165 (class 0 OID 345364)
-- Dependencies: 235
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", "bundleId", name, price, quantity) FROM stdin;
ac24c512-7e1b-4b1a-99c1-a5278be2d6c2	c91e865e-e8c2-4273-8b14-16c9767c7b1d	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	\N	MikroTik hAP ac3 Router	2299	1
69b0fc07-2178-4e2c-9b5e-08c7e4773483	11f46038-2f18-459b-8e7f-f33bd1d414d6	f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	\N	Ubiquiti UniFi U6 Lite Access Point	2199	1
a7157090-32a6-46f9-91a1-662c0035619d	bdc1fab6-488c-4e81-a250-9a5ef1bcf536	c39e1c53-4550-4816-858e-866d0c6801d8	\N	Mecer 1200VA Line-Interactive UPS	2699	1
b7961b21-508a-42fb-bbc2-967e4950c90a	b826f811-14e6-456c-9f7a-6e8ac0c20a50	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	\N	MikroTik hAP ac3 Router	2299	1
f183f019-94c4-43af-90f0-5ada678b0661	c3dba794-2d15-4fb9-b400-a420926ce7f5	e8708e22-b7e3-4d83-88ad-e9f31212dfea	\N	Logitech MK270 Wireless Keyboard & Mouse	599	1
\.


--
-- TOC entry 5160 (class 0 OID 345314)
-- Dependencies: 230
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "userId", "addressId", status, "paymentMethod", "paymentRef", "idempotencyKey", subtotal, "shippingCost", "totalPrice", notes, "createdAt", "updatedAt") FROM stdin;
c91e865e-e8c2-4273-8b14-16c9767c7b1d	VN-MPYIU7GF-7TVJ	7fb306d0-f047-4146-bb07-49e5385a3cdc	503aa365-5b5c-4e32-b487-97555a6a3d2d	PAID	EFT	\N	\N	2299	0	2299		2026-06-03 20:31:00.941	2026-06-03 20:44:36.994
11f46038-2f18-459b-8e7f-f33bd1d414d6	VN-MPYJTWVS-CUZH	7fb306d0-f047-4146-bb07-49e5385a3cdc	d994fbae-7cc3-44e0-b1a7-c35030c1fc26	PENDING	EFT	\N	\N	2199	0	2199		2026-06-03 20:58:46.856	2026-06-03 20:58:46.856
bdc1fab6-488c-4e81-a250-9a5ef1bcf536	VN-MPYJXXP0-14YF	7fb306d0-f047-4146-bb07-49e5385a3cdc	65f33558-8c44-4d10-b3d9-3e00ea8b6d35	PENDING	EFT	\N	\N	2699	0	2699		2026-06-03 21:01:54.531	2026-06-03 21:01:54.531
b826f811-14e6-456c-9f7a-6e8ac0c20a50	VN-MPYK1LMA-N79F	7fb306d0-f047-4146-bb07-49e5385a3cdc	08f81680-c399-49f3-b2bd-6734cc6acd08	COMPLETED	EFT	\N	\N	2299	0	2299		2026-06-03 21:04:45.49	2026-06-03 21:07:05.783
c3dba794-2d15-4fb9-b400-a420926ce7f5	VN-MPYLW4O6-3EIZ	be3542a2-9c4a-4d3c-ade3-e7f75f683343	338c4517-aac6-4320-9067-b125ca987b8e	PAID	EFT	\N	\N	599	150	749		2026-06-03 21:56:29.493	2026-06-03 21:56:46.9
\.


--
-- TOC entry 5153 (class 0 OID 345255)
-- Dependencies: 223
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, "productId", url, "altText", "sortOrder", "isPrimary") FROM stdin;
ef885279-d864-4519-8194-45cbda8ce34e	9e809ce6-dada-456d-9d4b-d464eecdcf57	/assets/products-pics/Refurbished-Dell-Latitude-5520-p1.jfif	Dell Latitude 5520	0	t
8a299a05-2820-470c-879c-dec78b927e11	9e809ce6-dada-456d-9d4b-d464eecdcf57	/assets/products-pics/Refurbished-Dell-Latitude-5520-p2.jfif	Dell Latitude 5520 - 2	1	f
845e7e2f-2a78-409a-b663-17bffd1f5ddc	9e809ce6-dada-456d-9d4b-d464eecdcf57	/assets/products-pics/Refurbished-Dell-Latitude-5520-p3.jfif	Dell Latitude 5520 - 3	2	f
c96b55ee-1386-4931-860e-c70d6d03aa94	cf51442d-a760-4989-93c1-e6387e3ac053	/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter1.jfif	Must 3KW Hybrid Inverter	0	t
d158310f-0369-4656-8da1-4e615193912f	cf51442d-a760-4989-93c1-e6387e3ac053	/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter2.jfif	Must 3KW Hybrid Inverter - 2	1	f
345b61b6-acc5-4d05-a04a-ad97bf37df19	cf51442d-a760-4989-93c1-e6387e3ac053	/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter3.jfif	Must 3KW Hybrid Inverter - 3	2	f
b2061a2c-0f9c-4576-aedb-dbf44d1db05c	2993bca4-e5fd-453d-82b6-a1ad1b60859a	/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-1.jfif	Lenovo ThinkPad T14 Gen 3	0	t
fdbf6913-c7ab-4f48-829c-e4710484aac7	2993bca4-e5fd-453d-82b6-a1ad1b60859a	/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-2.jfif	Lenovo ThinkPad T14 Gen 3 - 2	1	f
9fdc8219-5532-4f38-8c07-10f102a61388	2993bca4-e5fd-453d-82b6-a1ad1b60859a	/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-3.jfif	Lenovo ThinkPad T14 Gen 3 - 3	2	f
cd442ebb-9765-49f4-beb5-48e38933b8e6	c39e1c53-4550-4816-858e-866d0c6801d8	/assets/products-pics/Mecer-1200VA-UPS-1.jfif	Mecer 1200VA UPS	0	t
a0ffdd08-ec7e-431f-afaa-4cb8286d8c84	c39e1c53-4550-4816-858e-866d0c6801d8	/assets/products-pics/Mecer-1200VA-UPS-2.jfif	Mecer 1200VA UPS - 2	1	f
fcdcf0fa-7fa0-4065-92e7-8ac9b867c0a2	c39e1c53-4550-4816-858e-866d0c6801d8	/assets/products-pics/Mecer-1200VA-UPS-3.jfif	Mecer 1200VA UPS - 3	2	f
a235d96f-a01c-4e78-8bb0-c7ae5b967389	7b05bf9e-ac1d-4543-ba5d-3614d63e320e	/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery1.jfif	Hubble AM-2 Lithium Battery	0	t
572c8cc1-a1d0-4436-a5d5-27a001581af0	7b05bf9e-ac1d-4543-ba5d-3614d63e320e	/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery2.jfif	Hubble AM-2 Lithium Battery - 2	1	f
058e4a67-9643-4128-8680-67ee9f97c8e2	7b05bf9e-ac1d-4543-ba5d-3614d63e320e	/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery3.jfif	Hubble AM-2 Lithium Battery - 3	2	f
905f52bc-4495-4a65-8cad-743c6c5d1d0c	f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP1.jfif	Ubiquiti UniFi U6 Lite	0	t
68647f11-49fd-4266-b6bd-87735a5ca63c	f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP2.jfif	Ubiquiti UniFi U6 Lite - 2	1	f
c26ad564-dd2e-42a3-af38-7091ed96a807	f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP3.jfif	Ubiquiti UniFi U6 Lite - 3	2	f
8dc52f1b-4880-4eb2-b0d6-f0d16658f9cf	5665deb7-4312-4d31-ab4d-f38fd79a1a2d	/assets/products-pics/CAT6-Network-Cable-305m.jfif	CAT6 Network Cable 305m	0	t
646a6d00-883e-42dd-a626-09310e32a971	5665deb7-4312-4d31-ab4d-f38fd79a1a2d	/assets/products-pics/CAT6-Network-Cable-305m2.jfif	CAT6 Network Cable 305m - 2	1	f
4a34a493-ac2a-467e-9cdf-6ded8b8b4d64	e8708e22-b7e3-4d83-88ad-e9f31212dfea	/assets/products-pics/voltnet-logo.jfif	Logitech MK270 Wireless Combo	0	t
83fdeec2-08eb-476b-b274-2b7f0c563670	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	/assets/products-pics/MikroTik-hAP-ac3-Router.jfif	MikroTik hAP ac3 Router	0	t
9c1e4da6-d3ff-4c1a-b03d-0483bce0834f	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	/assets/products-pics/MikroTik-hAP-ac3-Router2.jfif	MikroTik hAP ac3 Router - 2	1	f
\.


--
-- TOC entry 5154 (class 0 OID 345264)
-- Dependencies: 224
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tags (id, "productId", tag) FROM stdin;
2b100e6f-82b9-426c-9555-b7d599767a3f	9e809ce6-dada-456d-9d4b-d464eecdcf57	Best Value
d273dab3-f0ae-4f89-8e4c-a4e5ab0c98f8	9e809ce6-dada-456d-9d4b-d464eecdcf57	Work From Home
8df8fafe-7465-490a-a0ac-4ad4491946b9	cf51442d-a760-4989-93c1-e6387e3ac053	Load Shedding Ready
229283ba-1819-48e1-8db2-d68a5ad02cf4	cf51442d-a760-4989-93c1-e6387e3ac053	Solar
c8c86b29-a3ef-4891-af48-e9facbf45818	2993bca4-e5fd-453d-82b6-a1ad1b60859a	Premium
cfab985c-4753-4e5d-9ae9-df23355110ef	c39e1c53-4550-4816-858e-866d0c6801d8	Load Shedding Ready
bcc8939c-e2c3-4cba-b744-0fdc4530f125	c39e1c53-4550-4816-858e-866d0c6801d8	Best Seller
59722716-1e0e-4577-9a59-55a2254fbc62	7b05bf9e-ac1d-4543-ba5d-3614d63e320e	Load Shedding Ready
0b24e64f-f397-43dc-b5ac-27e1d7b132a1	7b05bf9e-ac1d-4543-ba5d-3614d63e320e	Premium
edd48f34-a6c0-41d8-ad36-f35d460950f0	f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	Premium
9f38580c-2a4f-4e21-abb5-f7c0802db8db	e8708e22-b7e3-4d83-88ad-e9f31212dfea	Best Value
043699ca-b47c-4fad-b951-29a8b24d331a	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	Best Seller
\.


--
-- TOC entry 5155 (class 0 OID 345271)
-- Dependencies: 225
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, "productId", name, value, "priceAdjust", "stockQuantity") FROM stdin;
\.


--
-- TOC entry 5152 (class 0 OID 345241)
-- Dependencies: 222
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, "categoryId", condition, "costPrice", "sellingPrice", "stockQuantity", "lowStockThreshold", "supplierName", sku, "isFeatured", "isActive", "isDeleted", "vendorId", "createdAt", "updatedAt") FROM stdin;
7b05bf9e-ac1d-4543-ba5d-3614d63e320e	Hubble AM-2 5.1kWh Lithium Battery	hubble-am2-51v-lithium-battery	5.12kWh lithium-ion battery. 6000+ cycle life, wall-mountable, BMS included.	e716a16b-4968-41c6-b152-7d56bef27270	NEW	12000	16999	6	5	\N	VN-PWR-003	f	t	f	\N	2026-06-02 07:07:36.477	2026-06-02 07:07:36.477
9e809ce6-dada-456d-9d4b-d464eecdcf57	Refurbished Dell Latitude 5520	refurbished-dell-latitude-5520	Intel Core i5-1145G7, 16GB RAM, 256GB SSD, 15.6" FHD. Professionally refurbished with 12-month warranty.	a8114ebf-aeff-49af-9962-f3afdbbb67bc	REFURBISHED	4500	6999	15	5	Scoop	VN-TECH-001	t	t	f	\N	2026-06-02 07:07:36.424	2026-06-02 07:07:36.424
cf51442d-a760-4989-93c1-e6387e3ac053	Must 3KW Hybrid Solar Inverter	must-3kw-hybrid-inverter	3000W hybrid inverter with MPPT charger. Compatible with lithium and lead-acid batteries.	e716a16b-4968-41c6-b152-7d56bef27270	NEW	5500	8499	10	5	\N	VN-PWR-002	t	t	f	\N	2026-06-02 07:07:36.428	2026-06-02 07:07:36.428
2993bca4-e5fd-453d-82b6-a1ad1b60859a	Lenovo ThinkPad T14 Gen 3	lenovo-thinkpad-t14-gen3	AMD Ryzen 5 PRO, 16GB RAM, 512GB SSD, 14" FHD IPS. Business-grade reliability.	a8114ebf-aeff-49af-9962-f3afdbbb67bc	NEW	8000	12499	8	5	Scoop	VN-TECH-002	t	t	f	\N	2026-06-02 07:07:36.429	2026-06-02 07:07:36.429
5665deb7-4312-4d31-ab4d-f38fd79a1a2d	CAT6 Network Cable 305m Box	cat6-network-cable-305m	CAT6 UTP network cable, 305m box. Pure copper, suitable for Gigabit networks.	9e2be49e-ca8a-455f-b05d-2e48cafc64ca	NEW	800	1299	30	5	\N	VN-ACC-001	f	t	f	\N	2026-06-02 07:07:36.497	2026-06-02 07:07:36.497
f7202be9-0fc0-4f3b-90b2-d2bf52e14b40	Ubiquiti UniFi U6 Lite Access Point	ubiquiti-unifi-u6-lite	WiFi 6 access point, PoE powered, 1500+ sq ft coverage. Enterprise-grade.	7ff103d7-7a99-4fc2-8b4d-b667963d6548	NEW	1400	2199	11	5	\N	VN-NET-002	f	t	f	\N	2026-06-02 07:07:36.488	2026-06-03 20:58:46.875
c39e1c53-4550-4816-858e-866d0c6801d8	Mecer 1200VA Line-Interactive UPS	mecer-1200va-ups	1200VA/720W UPS with AVR. Keeps your devices running during load shedding. 4x SA outlets.	e716a16b-4968-41c6-b152-7d56bef27270	NEW	1800	2699	24	5	Scoop	VN-PWR-001	t	t	f	\N	2026-06-02 07:07:36.431	2026-06-03 21:01:54.549
cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	MikroTik hAP ac3 Router	mikrotik-hap-ac3	Dual-band WiFi 5 router, 5x Gigabit ports, USB 3.0. Professional-grade networking.	7ff103d7-7a99-4fc2-8b4d-b667963d6548	NEW	1500	2299	18	5	Scoop	VN-NET-001	t	t	f	\N	2026-06-02 07:07:36.573	2026-06-03 21:04:45.504
e8708e22-b7e3-4d83-88ad-e9f31212dfea	Logitech MK270 Wireless Keyboard & Mouse	logitech-mk270-wireless-combo	Wireless keyboard and mouse combo. 2.4GHz connection, long battery life.	9e2be49e-ca8a-455f-b05d-2e48cafc64ca	NEW	350	599	39	5	\N	VN-ACC-002	t	t	f	\N	2026-06-02 07:07:36.505	2026-06-03 21:56:29.513
\.


--
-- TOC entry 5162 (class 0 OID 345333)
-- Dependencies: 232
-- Data for Name: service_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_bookings (id, "bookingNumber", "customerName", "customerEmail", "customerPhone", company, "serviceType", status, address, city, province, "postalCode", "preferredDate", "scheduledDate", "scheduledTime", "technicianId", "technicianName", description, "internalNotes", "estimatedCost", "finalCost", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5164 (class 0 OID 345354)
-- Dependencies: 234
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, "group", description, "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5161 (class 0 OID 345325)
-- Dependencies: 231
-- Data for Name: stock_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_history (id, "productId", "changeType", "quantityChange", "previousQty", "newQty", "orderId", note, "createdAt") FROM stdin;
\.


--
-- TOC entry 5148 (class 0 OID 345203)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", "firstName", "lastName", phone, role, "avatarUrl", "isDeleted", "createdAt", "updatedAt") FROM stdin;
533b4a46-5854-46e9-b084-65a7138731c4	admin@bretunetech.com	$2b$12$rcQ3mRCLXm8uLYWBQm3Xs.NFJ35j6DCftG.iqXwOoyqeypwm2qEO2	Bretunetech	Admin	\N	ADMIN	\N	f	2026-06-02 07:07:36.293	2026-06-02 18:35:30.558
be3542a2-9c4a-4d3c-ade3-e7f75f683343	admin@voltnet.co.za	$2b$12$y.XVElZbhfmlSvJVeMHNUOeOQLEObsGfHCBo5pjHNs.llyZ2c1fDe	Fortune	Matenda	+27612685933	ADMIN	\N	f	2026-06-03 19:18:54.276	2026-06-03 19:18:54.276
7fb306d0-f047-4146-bb07-49e5385a3cdc	fortunematenda5@gmail.com	$2b$12$FIoPJPKP3pUYLy.fUw6SPuqyI9hFwM8tgRUgIFYAYvekCGjmLwHfG	Fortune	Matenda	+27612685933	CUSTOMER	\N	f	2026-06-03 19:20:39.118	2026-06-03 21:22:59.469
\.


--
-- TOC entry 5150 (class 0 OID 345222)
-- Dependencies: 220
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, "userId", "businessName", slug, description, "logoUrl", "commissionRate", "isApproved", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5166 (class 0 OID 351439)
-- Dependencies: 236
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, "userId", "productId", "createdAt") FROM stdin;
619c31b9-4bfc-4d99-aafa-82ff8ea62f6c	7fb306d0-f047-4146-bb07-49e5385a3cdc	5665deb7-4312-4d31-ab4d-f38fd79a1a2d	2026-06-03 19:27:39.52
d5cf274a-36cb-41ee-b395-99097d505de3	7fb306d0-f047-4146-bb07-49e5385a3cdc	2993bca4-e5fd-453d-82b6-a1ad1b60859a	2026-06-03 19:28:29.631
5f3526d1-e5f6-44b5-8303-9d187e5c53ff	7fb306d0-f047-4146-bb07-49e5385a3cdc	cf51442d-a760-4989-93c1-e6387e3ac053	2026-06-03 19:28:31.433
e58eebee-3a8c-47b0-af49-de4342ab08b3	7fb306d0-f047-4146-bb07-49e5385a3cdc	9e809ce6-dada-456d-9d4b-d464eecdcf57	2026-06-03 19:28:32.372
d96c4647-62ee-4ecd-ab50-6348c039dca2	7fb306d0-f047-4146-bb07-49e5385a3cdc	cdfff1e2-69c6-49cb-9b0a-fc8353bf1726	2026-06-03 19:32:38.249
b03e125c-234d-4697-ac0f-4cd05915e1d1	7fb306d0-f047-4146-bb07-49e5385a3cdc	e8708e22-b7e3-4d83-88ad-e9f31212dfea	2026-06-03 20:10:40.539
\.


--
-- TOC entry 4887 (class 2606 OID 345114)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 345221)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 345297)
-- Name: bundle_items bundle_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT bundle_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 345289)
-- Name: bundles bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundles
    ADD CONSTRAINT bundles_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 345313)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 345305)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 345240)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 345353)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 345370)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 345324)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 345263)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4918 (class 2606 OID 345270)
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 345279)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 345254)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 345341)
-- Name: service_bookings service_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT service_bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 345363)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 345332)
-- Name: stock_history stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 351524)
-- Name: wishlists unique_user_product_wishlist; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT unique_user_product_wishlist UNIQUE ("userId", "productId");


--
-- TOC entry 4891 (class 2606 OID 345212)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 345231)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 351446)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 1259 OID 345380)
-- Name: bundle_items_bundleId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "bundle_items_bundleId_productId_key" ON public.bundle_items USING btree ("bundleId", "productId");


--
-- TOC entry 4924 (class 1259 OID 345379)
-- Name: bundles_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bundles_slug_key ON public.bundles USING btree (slug);


--
-- TOC entry 4930 (class 1259 OID 345381)
-- Name: carts_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "carts_userId_key" ON public.carts USING btree ("userId");


--
-- TOC entry 4899 (class 1259 OID 345374)
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- TOC entry 4902 (class 1259 OID 345375)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 4968 (class 1259 OID 351529)
-- Name: idx_wishlists_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_product ON public.wishlists USING btree ("productId");


--
-- TOC entry 4969 (class 1259 OID 351527)
-- Name: idx_wishlists_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_user ON public.wishlists USING btree ("userId");


--
-- TOC entry 4953 (class 1259 OID 351451)
-- Name: invoices_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_dueDate_idx" ON public.invoices USING btree ("dueDate");


--
-- TOC entry 4954 (class 1259 OID 345480)
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- TOC entry 4955 (class 1259 OID 345481)
-- Name: invoices_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_orderId_key" ON public.invoices USING btree ("orderId");


--
-- TOC entry 4958 (class 1259 OID 351450)
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- TOC entry 4959 (class 1259 OID 351452)
-- Name: invoices_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_userId_idx" ON public.invoices USING btree ("userId");


--
-- TOC entry 4964 (class 1259 OID 351453)
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- TOC entry 4967 (class 1259 OID 351454)
-- Name: order_items_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_items_productId_idx" ON public.order_items USING btree ("productId");


--
-- TOC entry 4933 (class 1259 OID 351457)
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- TOC entry 4934 (class 1259 OID 345383)
-- Name: orders_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON public.orders USING btree ("idempotencyKey");


--
-- TOC entry 4935 (class 1259 OID 345382)
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- TOC entry 4936 (class 1259 OID 351458)
-- Name: orders_paymentMethod_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_paymentMethod_idx" ON public.orders USING btree ("paymentMethod");


--
-- TOC entry 4939 (class 1259 OID 351456)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 4940 (class 1259 OID 351455)
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- TOC entry 4919 (class 1259 OID 345378)
-- Name: product_tags_tag_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_tags_tag_idx ON public.product_tags USING btree (tag);


--
-- TOC entry 4903 (class 1259 OID 351459)
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- TOC entry 4904 (class 1259 OID 351461)
-- Name: products_condition_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_condition_idx ON public.products USING btree (condition);


--
-- TOC entry 4905 (class 1259 OID 351466)
-- Name: products_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_createdAt_idx" ON public.products USING btree ("createdAt");


--
-- TOC entry 4906 (class 1259 OID 351463)
-- Name: products_isActive_isDeleted_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isActive_isDeleted_idx" ON public.products USING btree ("isActive", "isDeleted");


--
-- TOC entry 4907 (class 1259 OID 351462)
-- Name: products_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isFeatured_idx" ON public.products USING btree ("isFeatured");


--
-- TOC entry 4908 (class 1259 OID 351464)
-- Name: products_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_name_idx ON public.products USING btree (name);


--
-- TOC entry 4911 (class 1259 OID 351460)
-- Name: products_sellingPrice_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_sellingPrice_idx" ON public.products USING btree ("sellingPrice");


--
-- TOC entry 4912 (class 1259 OID 345377)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 4913 (class 1259 OID 345376)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 4914 (class 1259 OID 351465)
-- Name: products_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_vendorId_idx" ON public.products USING btree ("vendorId");


--
-- TOC entry 4946 (class 1259 OID 345479)
-- Name: service_bookings_bookingNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "service_bookings_bookingNumber_key" ON public.service_bookings USING btree ("bookingNumber");


--
-- TOC entry 4949 (class 1259 OID 351469)
-- Name: service_bookings_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_bookings_scheduledDate_idx" ON public.service_bookings USING btree ("scheduledDate");


--
-- TOC entry 4950 (class 1259 OID 351468)
-- Name: service_bookings_serviceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_bookings_serviceType_idx" ON public.service_bookings USING btree ("serviceType");


--
-- TOC entry 4951 (class 1259 OID 351467)
-- Name: service_bookings_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX service_bookings_status_idx ON public.service_bookings USING btree (status);


--
-- TOC entry 4952 (class 1259 OID 351470)
-- Name: service_bookings_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_bookings_userId_idx" ON public.service_bookings USING btree ("userId");


--
-- TOC entry 4960 (class 1259 OID 351471)
-- Name: settings_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settings_group_idx ON public.settings USING btree ("group");


--
-- TOC entry 4961 (class 1259 OID 345482)
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- TOC entry 4941 (class 1259 OID 351473)
-- Name: stock_history_changeType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_history_changeType_idx" ON public.stock_history USING btree ("changeType");


--
-- TOC entry 4942 (class 1259 OID 351474)
-- Name: stock_history_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_history_createdAt_idx" ON public.stock_history USING btree ("createdAt");


--
-- TOC entry 4945 (class 1259 OID 351472)
-- Name: stock_history_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_history_productId_idx" ON public.stock_history USING btree ("productId");


--
-- TOC entry 4888 (class 1259 OID 351475)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 4889 (class 1259 OID 345371)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4892 (class 1259 OID 351476)
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- TOC entry 4897 (class 1259 OID 345373)
-- Name: vendors_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vendors_slug_key ON public.vendors USING btree (slug);


--
-- TOC entry 4898 (class 1259 OID 345372)
-- Name: vendors_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_userId_key" ON public.vendors USING btree ("userId");


--
-- TOC entry 4974 (class 1259 OID 351528)
-- Name: wishlists_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wishlists_productId_idx" ON public.wishlists USING btree ("productId");


--
-- TOC entry 4975 (class 1259 OID 351525)
-- Name: wishlists_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wishlists_userId_idx" ON public.wishlists USING btree ("userId");


--
-- TOC entry 4976 (class 1259 OID 351526)
-- Name: wishlists_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wishlists_userId_productId_key" ON public.wishlists USING btree ("userId", "productId");


--
-- TOC entry 4977 (class 2606 OID 345384)
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4985 (class 2606 OID 345424)
-- Name: bundle_items bundle_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT "bundle_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.bundles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 345429)
-- Name: bundle_items bundle_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT "bundle_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4988 (class 2606 OID 345449)
-- Name: cart_items cart_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.bundles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4989 (class 2606 OID 345439)
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 345444)
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4987 (class 2606 OID 345434)
-- Name: carts carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4979 (class 2606 OID 345394)
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4995 (class 2606 OID 345469)
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4996 (class 2606 OID 345474)
-- Name: invoices invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4997 (class 2606 OID 345498)
-- Name: order_items order_items_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public.bundles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4998 (class 2606 OID 345488)
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 345493)
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4991 (class 2606 OID 345483)
-- Name: orders orders_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4992 (class 2606 OID 345454)
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4982 (class 2606 OID 345409)
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4983 (class 2606 OID 345414)
-- Name: product_tags product_tags_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4984 (class 2606 OID 345419)
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4980 (class 2606 OID 345399)
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4981 (class 2606 OID 345404)
-- Name: products products_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4994 (class 2606 OID 345464)
-- Name: service_bookings service_bookings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT "service_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4993 (class 2606 OID 351487)
-- Name: stock_history stock_history_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT "stock_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4978 (class 2606 OID 345389)
-- Name: vendors vendors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5000 (class 2606 OID 351535)
-- Name: wishlists wishlists_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 351530)
-- Name: wishlists wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-06-03 23:58:22

--
-- PostgreSQL database dump complete
--

