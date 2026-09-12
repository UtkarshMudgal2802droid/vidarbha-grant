# Vidarbha Education Grant - Intake Portal

This is the intake portal for the Vidarbha Education Grant. It allows applicants to verify their identity and eligibility using zero-knowledge proofs (Anon Aadhaar) without ever sharing their actual Aadhaar number.

## Volunteer Guide: Running a Cycle End to End

This system is completely anonymous. We do not collect names, emails, or Aadhaar numbers.

### 1. Starting a New Cycle
To start a new cycle and ensure people who applied in previous cycles can apply again (if allowed), you must change the `APP_SEED` environment variable in the `.env` file before starting the server.

1. Open `.env`.
2. Change both `APP_SEED` and `NEXT_PUBLIC_APP_SEED` to a new random, secure, very large number (e.g., `98765432109876543210`).
3. Save the file.
4. If you have an old database (`dev.db`), delete it or back it up to start fresh.

### 2. Running the Application Intake
1. Ensure dependencies are installed: `npm install --legacy-peer-deps`
2. Start the server: `npm run dev -- --webpack`
3. Direct applicants to: [http://localhost:3000](http://localhost:3000)
4. Applicants will generate a ZK proof to verify they are over 18. Upon successful submission, they will receive an anonymous **Grant Ticket ID**. They must save this ID!

### 3. Reviewing Applications
1. As a volunteer, go to the Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)
2. Here you will see:
   - **Verified Entries**: The total number of valid applications.
   - **Duplicates Turned Away**: How many times someone tried to apply twice in the same cycle. (The system automatically blocks them using their Aadhaar nullifier).
   - **Pending Review**: Applications waiting for your approval.
3. Review the pending list. You can click **Approve** or **Reject** on any Application ID.
4. Since we do not have their contact info, you can publish the list of approved **Grant Ticket IDs** publicly so applicants know they received the grant!

## Technical Notes

- **Eligibility Check:** The portal checks that the applicant is at least 18 years old cryptographically.
- **Data Privacy:** Raw Aadhaar data, QR codes, and personal details never leave the applicant's browser. The server only receives and verifies a mathematical SNARK proof.
