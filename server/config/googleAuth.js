import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

/**
 * Verifies a Google ID Token (JWT) issued by Google Identity Services.
 * Returns the decoded Google payload containing user details (sub, email, name, picture).
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    return {
      success: true,
      payload: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        emailVerified: payload.email_verified,
      },
    };
  } catch (error) {
    console.error('[AUTH ERROR] Google Token Verification Failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default client;
