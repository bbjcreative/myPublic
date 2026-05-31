import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Find this in Firebase Console → Project Settings → General → Your Apps → Web App client ID
// OR: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 → Web application
export const WEB_CLIENT_ID = 'REPLACE_WITH_WEB_CLIENT_ID';

export function configureGoogleSignIn() {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
}

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  // v13 returns { type: 'success'|'cancelled', data: { idToken, ... } }
  if ((response as any).type === 'cancelled') return;
  const idToken = (response as any).data?.idToken ?? (response as any).idToken;
  if (!idToken) throw new Error('No ID token returned from Google Sign-In');
  const credential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(credential);
}

export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
  await auth().signOut();
}
