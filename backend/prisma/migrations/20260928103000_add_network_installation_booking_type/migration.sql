-- New bookings use NETWORK_INSTALLATION.
-- FIBRE_INSTALLATION stays so existing service bookings remain valid.
ALTER TYPE "BookingServiceType" ADD VALUE IF NOT EXISTS 'NETWORK_INSTALLATION';
