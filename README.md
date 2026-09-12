# Vidarbha Education Grant - Intake Portal

This is the intake portal for the Vidarbha Education Grant. It allows applicants to verify their identity and eligibility using zero-knowledge proofs (Anon Aadhaar) without ever sharing their actual Aadhaar number.

## Prerequisites

1. Node.js v20.12 or newer.
2. A modern web browser.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure Environment:**
   Copy the example environment file and set your secure `APP_SEED`:
   ```bash
   cp .env.example .env
   ```
   *Make sure `APP_SEED` and `NEXT_PUBLIC_APP_SEED` match in `.env`.*

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the portal:**
   - Applicant form: [http://localhost:3000](http://localhost:3000)
   - Admin dashboard (for volunteers): [http://localhost:3000/admin](http://localhost:3000/admin)

## How It Works

- **Eligibility Check:** The portal checks that the applicant is at least 18 years old.
- **One Claim Per Human:** Each person can only apply once. The application derives a unique `nullifier` from the applicant's Aadhaar that is stored to prevent duplicates.
- **Data Privacy:** Raw Aadhaar data, QR codes, and personal details never leave the applicant's browser. Only a cryptographic proof is sent to the server.
