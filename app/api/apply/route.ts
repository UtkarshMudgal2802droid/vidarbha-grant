import { NextResponse } from 'next/server';
import {
  init,
  artifactUrls,
  ArtifactsOrigin,
  verify,
  AnonAadhaarCore,
} from '@anon-aadhaar/core';
import db from '@/lib/db';
import crypto from 'crypto';

// Initialize the AnonAadhaar verification settings
const initArgs = {
  wasmURL: artifactUrls.v2.wasm,
  zkeyURL: artifactUrls.v2.zkey,
  vkeyURL: artifactUrls.v2.vk,
  artifactsOrigin: ArtifactsOrigin.server,
};
init(initArgs);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anonAadhaarProof } = body;

    if (!anonAadhaarProof) {
      return NextResponse.json({ error: 'Missing Anon Aadhaar proof' }, { status: 400 });
    }

    // 1. Verify the cryptographic proof
    // Assuming anonAadhaarProof is the AnonAadhaarCore object (it has `proof`, `claim`, etc)
    const isValid = await verify(anonAadhaarProof as AnonAadhaarCore, true); // true for useTestAadhaar (we are testing)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid zero-knowledge proof' }, { status: 400 });
    }

    const { proof, claim } = anonAadhaarProof as AnonAadhaarCore;

    const { hash } = await import('@anon-aadhaar/core');
    const EXPECTED_SIGNAL = 'vidarbha-grant-2026';
    const expectedSignalHash = hash(EXPECTED_SIGNAL).toString();

    // Check if the signal in the proof matches our expected hashed signal
    if (proof.signalHash !== expectedSignalHash && proof.signalHash !== EXPECTED_SIGNAL) {
      return NextResponse.json({ error: 'Signal mismatch' }, { status: 400 });
    }

    // 3. Nullifier seed fixed by the application rather than supplied by the caller
    const appSeed = process.env.APP_SEED;
    if (!appSeed) {
      return NextResponse.json({ error: 'Server configuration error: APP_SEED missing' }, { status: 500 });
    }
    
    if (proof.nullifierSeed !== appSeed) {
      return NextResponse.json({ error: 'Nullifier seed mismatch' }, { status: 400 });
    }

    // 4. Eligibility decided from the proof's revealed outputs
    if (proof.ageAbove18 !== '1') {
      return NextResponse.json({ error: 'Not eligible: Must be above 18' }, { status: 403 });
    }

    // 5. One claim per human enforced by a stored nullifier
    const nullifier = proof.nullifier;
    
    // Look up the nullifier in persistent state
    const existingEntry = db.prepare('SELECT * FROM Application WHERE nullifier = ?').get(nullifier);
    if (existingEntry) {
      // Track duplicates turned away
      db.prepare("UPDATE Stats SET duplicatesSaved = duplicatesSaved + 1 WHERE id = 'singleton'").run();
      return NextResponse.json({ error: 'Duplicate application: You have already applied.' }, { status: 409 });
    }

    // Save the application
    const newId = crypto.randomUUID();
    db.prepare('INSERT INTO Application (id, nullifier, status) VALUES (?, ?, ?)')
      .run(newId, nullifier, 'pending');

    return NextResponse.json({ success: true, message: 'Application recorded', id: newId });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
