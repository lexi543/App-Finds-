# Ledger

Ledger is a mobile-first booking prototype for local service businesses in Kenya. Clients can discover businesses, choose an available appointment time, and select M-Pesa or payment in person. Business owners can review appointments, mark cash payments as collected, and mark appointments complete or no-show.

## Run locally

**Prerequisite:** Node.js

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open the local URL shown by Vite (by default, `http://localhost:3000`).

Run `npm run lint` for the TypeScript check and `npm run build` to create a production bundle.

## Prototype scope

This repository currently provides a frontend-only prototype. Example businesses and appointments are included to make the experience explorable. New bookings, businesses, and dashboard updates are persisted in this browser's local storage.

M-Pesa, SMS, OTP, refunds, server-side availability, payment callbacks, and database-backed booking locks are not connected. Selecting M-Pesa creates a payment-pending demo entry; it does not send an STK push, take payment, confirm the appointment, or hold a slot across devices. The prototype does not provide the database-level exclusion constraint or transactional guarantees required for a production booking system.

Before launch, add a trusted server API, PostgreSQL booking and payment schema with overlap constraints and transactional slot creation, Daraja callback handling, Africa's Talking SMS delivery, authentication, business-specific access controls, and booking/payment expiry and cancellation policies.
