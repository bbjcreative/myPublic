import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdProvider } from '../components/ads/AdContext';
import { AdBanner } from '../components/ads/AdBanner';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { useAuthStore } from '../store/authStore';
import { useSavedRoutes } from '../hooks/useSavedRoutes';
import { t } from '../constants/i18n';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle, signOutGoogle } from '../services/googleSignIn';

export function SavedRoutesScreen() {
  const lang = usePrefsStore(s => s.lang);
  const user = useAuthStore(s => s.user);
  const { routes, remove, isCloud } = useSavedRoutes();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert('Sign In Failed', err?.message ?? 'Could not sign in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t(lang, 'signOut'),
      'Your saved routes will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t(lang, 'signOut'),
          style: 'destructive',
          onPress: () => signOutGoogle().catch(() => {}),
        },
      ],
    );
  };

  const UserHeader = () => {
    if (!user) {
      return (
        <View style={styles.authCard}>
          <View style={[styles.authIcon, { backgroundColor: Colors.primary + '1A' }]}>
            <Ionicons name="person-circle-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.authTitle}>{t(lang, 'signInTitle')}</Text>
          <Text style={styles.authSubtitle}>{t(lang, 'signInSubtitle')}</Text>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleSignIn}
            activeOpacity={0.8}
            disabled={signingIn}
          >
            {signingIn ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color={Colors.text} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>{t(lang, 'signInWithGoogle')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    const initials = (user.displayName ?? user.email ?? '?')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View style={styles.profileCard}>
        {user.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.displayName ?? t(lang, 'myAccount')}
          </Text>
          <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
          {isCloud && (
            <View style={styles.syncBadge}>
              <Ionicons name="cloud-done-outline" size={12} color={Colors.success} />
              <Text style={styles.syncText}>Synced</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <Text style={styles.signOutText}>{t(lang, 'signOut')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AdProvider visibility="BANNER">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={routes}
          keyExtractor={r => r.id}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <Text style={styles.screenTitle}>{t(lang, 'profile')}</Text>
              <UserHeader />
              <Text style={styles.sectionTitle}>{t(lang, 'savedRoutes')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.route}>
                  <Ionicons name="radio-button-on" size={14} color={Colors.success} />
                  <Text style={styles.stopName} numberOfLines={1}>{item.origin_name}</Text>
                </View>
                <View style={styles.route}>
                  <Ionicons name="location" size={14} color={Colors.error} />
                  <Text style={styles.stopName} numberOfLines={1}>{item.dest_name}</Text>
                </View>
                {item.label ? <Text style={styles.label}>{item.label}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} style={styles.delete}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color={Colors.border} />
              <Text style={styles.empty}>No saved routes yet</Text>
            </View>
          }
          ListFooterComponent={<AdBanner />}
        />
      </SafeAreaView>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 24 },
  headerWrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },

  // Auth card (signed out)
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  authIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
    minHeight: 48,
  },
  googleIcon: { marginRight: 10 },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },

  // Profile card (signed in)
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  syncText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  signOutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signOutText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Route cards
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInfo: { flex: 1 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  stopName: { fontSize: 14, color: Colors.text, flex: 1 },
  label: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  delete: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 32, paddingHorizontal: 16 },
  empty: { color: Colors.textSecondary, fontSize: 15, marginTop: 12 },
});
