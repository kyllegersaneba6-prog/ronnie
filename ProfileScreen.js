import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';

export default function ProfileScreen() {
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const user = auth.currentUser;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = db
      .collection('appointments')
      .where('userId', '==', user.uid)
      .onSnapshot((snap) => {
        const all = snap.docs.map((d) => d.data());
        setTotalAppointments(all.length);
        setCompletedCount(all.filter((a) => a.status === 'Completed').length);
        setPendingCount(all.filter((a) => a.status === 'Pending').length);
      });
    return unsubscribe;
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const MenuItem = ({ icon, iconBg, label, value, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, { backgroundColor: iconBg || '#EEF2FF' }]}>
        <Ionicons name={icon} size={18} color="#6C63FF" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header & Avatar ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.emailText}>{email}</Text>

          {/* ── Mini Stats ── */}
          <View style={styles.statsRow}>
            {[
              { label: 'Total', value: totalAppointments, icon: 'list' },
              { label: 'Completed', value: completedCount, icon: 'checkmark-circle' },
              { label: 'Pending', value: pendingCount, icon: 'hourglass' },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statNum}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Account Section ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-circle-outline"
              iconBg="#EEF2FF"
              label="Display Name"
              value={displayName.length > 18 ? displayName.slice(0, 18) + '…' : displayName}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="mail-outline"
              iconBg="#F0FDF4"
              label="Email Address"
              value={email.length > 22 ? email.slice(0, 22) + '…' : email}
            />
            <View style={styles.divider} />
            <MenuItem icon="shield-checkmark-outline" iconBg="#FEF3C7" label="Account Security" />
          </View>
        </View>

        {/* ── Appointments Section ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Appointments</Text>
          <View style={styles.menuCard}>
            <View style={styles.appointmentStatRow}>
              {[
                { label: 'Total', value: totalAppointments, color: '#6C63FF', bg: '#EEF2FF' },
                { label: 'Done', value: completedCount, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Pending', value: pendingCount, color: '#F59E0B', bg: '#FFFBEB' },
              ].map((item) => (
                <View key={item.label} style={[styles.apptStat, { backgroundColor: item.bg }]}>
                  <Text style={[styles.apptStatNum, { color: item.color }]}>{item.value}</Text>
                  <Text style={[styles.apptStatLabel, { color: item.color }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── About Section ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="information-circle-outline" iconBg="#F0F9FF" label="App Version" value="1.0.0" />
            <View style={styles.divider} />
            <MenuItem icon="document-text-outline" iconBg="#FFF7ED" label="Terms of Service" />
            <View style={styles.divider} />
            <MenuItem icon="lock-closed-outline" iconBg="#FDF4FF" label="Privacy Policy" />
          </View>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>AppointEase v1.0.0</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },

  profileHeader: {
    backgroundColor: '#6C63FF',
    paddingTop: 52, paddingBottom: 32, alignItems: 'center',
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  displayName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  emailText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },

  statsRow: {
    flexDirection: 'row', marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, overflow: 'hidden',
    marginHorizontal: 24,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLbl: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2, fontWeight: '500' },

  sectionWrap: { paddingHorizontal: 14, paddingTop: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { color: '#94A3B8', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },

  appointmentStatRow: { flexDirection: 'row', padding: 12, gap: 10 },
  apptStat: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center',
  },
  apptStatNum: { fontSize: 24, fontWeight: '800' },
  apptStatLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 14, marginTop: 16,
    backgroundColor: '#FEF2F2', borderRadius: 16, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  footerText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 16 },
});
