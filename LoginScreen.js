import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Missing Fields', 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email.trim(), password);
      } else {
        const cred = await auth.createUserWithEmailAndPassword(email.trim(), password);
        await cred.user.updateProfile({ displayName: name.trim() });
        // Save user profile to Firestore so it appears in the database
        await db.collection('users').doc(cred.user.uid).set({
          uid: cred.user.uid,
          displayName: name.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try later.',
      };
      Alert.alert('Authentication Error', messages[error.code] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Hero Banner ── */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Ionicons name="calendar-sharp" size={42} color="#fff" />
            </View>
          </View>
          <Text style={styles.appName}>AppointEase</Text>
          <Text style={styles.tagline}>Smart Booking. Seamless Care.</Text>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? '👋 Welcome Back!' : '🎉 Create Account'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to manage your appointments' : 'Join us and start booking today'}
          </Text>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#CBD5E1"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#CBD5E1"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.icon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#CBD5E1"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.authBtn, loading && { opacity: 0.7 }]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isLogin ? 'log-in-outline' : 'person-add-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.authBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); setName(''); }}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?  " : 'Already have an account?  '}
              <Text style={styles.switchLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C63FF' },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },

  hero: { alignItems: 'center', paddingVertical: 48, paddingTop: 70 },
  logoRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoInner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontStyle: 'italic' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    padding: 28, paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24, lineHeight: 20 },

  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFF', borderRadius: 14,
    paddingHorizontal: 14, height: 54,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1E293B' },
  eyeBtn: { padding: 4 },

  authBtn: {
    backgroundColor: '#6C63FF', borderRadius: 14, height: 56,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 8, gap: 10,
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { color: '#94A3B8', paddingHorizontal: 12, fontSize: 13 },

  switchBtn: { alignItems: 'center' },
  switchText: { color: '#64748B', fontSize: 14 },
  switchLink: { color: '#6C63FF', fontWeight: '700' },
});
