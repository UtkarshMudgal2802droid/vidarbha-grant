"use client";

import { useEffect, useState } from "react";
import { LogInWithAnonAadhaar, useAnonAadhaar, AnonAadhaarProvider } from "@anon-aadhaar/react";

const NEXT_PUBLIC_APP_SEED = process.env.NEXT_PUBLIC_APP_SEED;
const APP_SIGNAL = "vidarbha-grant-2026";

function ApplyFormInner() {
  const [anonAadhaar] = useAnonAadhaar();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [grantId, setGrantId] = useState("");

  useEffect(() => {
    // If the user has just logged in (proof generated), auto-submit the application
    if (anonAadhaar.status === "logged-in" && anonAadhaar.anonAadhaarProofs) {
      // In @anon-aadhaar/react v2, anonAadhaarProofs is an object where keys are indices/ids
      // We take the first one or the most recent one.
      const proofs = Object.values(anonAadhaar.anonAadhaarProofs);
      if (proofs.length > 0) {
        submitApplication(proofs[proofs.length - 1]);
      }
    }
  }, [anonAadhaar]);

  const submitApplication = async (proof: any) => {
    setMessage("Submitting application...");
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonAadhaarProof: proof,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application");
        setMessage("");
      } else {
        setMessage("Success: " + data.message);
        setGrantId(data.id);
      }
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md w-full">
      <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-gray-50 text-black">
        <p className="text-sm text-center">
          Prove your eligibility (Age &gt; 18) without revealing your identity.
          We use zero-knowledge proofs to verify your Aadhaar QR securely on your device.
        </p>
        <LogInWithAnonAadhaar 
          nullifierSeed={Number(NEXT_PUBLIC_APP_SEED)}
          signal={APP_SIGNAL}
        />
      </div>

      {message && (
        <div className="p-4 text-green-700 bg-green-100 rounded flex flex-col gap-2">
          <span>{message}</span>
          {grantId && (
            <div className="font-mono text-sm bg-white p-2 rounded border border-green-200">
              Your Grant Ticket ID: <strong>{grantId}</strong><br/>
              <em>Save this ID. It is the only way to check your application status.</em>
            </div>
          )}
        </div>
      )}
      {error && <div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>}
    </div>
  );
}

export default function ApplyForm() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) return null;

  return (
    <AnonAadhaarProvider _useTestAadhaar={true}>
      <ApplyFormInner />
    </AnonAadhaarProvider>
  );
}
