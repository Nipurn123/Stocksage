import * as jose from 'jose';

/**
 * Generates a JSON Web Key Set (JWKS) from a secret
 * This is used for JWT verification
 */
export async function getJwks(secret: string) {
  // Create a symmetric key from the secret
  const key = new TextEncoder().encode(secret);
  
  // Generate the JWK (JSON Web Key)
  const secretKey = await jose.importJWK({
    kty: "oct",
    k: Buffer.from(secret).toString('base64url'),
    alg: "HS256",
    use: "sig",
  });
  
  const jwk = await jose.exportJWK(secretKey);
  
  // Add required properties for JWKS
  jwk.alg = 'HS256';
  jwk.use = 'sig';
  jwk.kid = 'nextauth-jwt-key';
  
  // Return in JWKS format
  return {
    keys: [jwk]
  };
} 