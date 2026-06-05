import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from './firebase';

const STATUS_COLORS = {
  Confirmed: '#10B981',
  Pending: '#F59E0B',
  Cancelled: '#EF4444',
  Completed: '#6C63FF',
};

export default function DashboardScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, upcoming: 0, completed: 0 });
  const user = auth.currentUser;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!user) return;
    const unsubscribe = db
      .collection('appointments')
      .where('userId', '==', user.uid)
      .onSnapshot((snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);

        const todayStr = new Date().toDateString();
        const now = new Date();
        setStats({
          total: data.length,
          today: data.filter((a) => {
            try { return new Date(a.date).toDateString() === todayStr; } catch { return false; }
          }).length,
          upcoming: data.filter((a) => {
            try { return new Date(a.date) > now && a.status !== 'Cancelled'; } catch { return false; }
          }).length,
          completed: data.filter((a) => a.status === 'Completed').length,
        });
      });
    return unsubscribe;
  }, [user]);

  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getHour()} 👋</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AddAppointment')}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Stat Cards ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, icon: 'list-circle', color: '#6C63FF' },
            { label: 'Today', value: stats.today, icon: 'today', color: '#F59E0B' },
            { label: 'Upcoming', value: stats.upcoming, icon: 'time', color: '#10B981' },
            { label: 'Done', value: stats.completed, icon: 'checkmark-circle', color: '#8B5CF6' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.color }]}>
              <Ionicons name={s.icon} size={22} color="rgba(255,255,255,0.85)" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#6C63FF' }]}
            onPress={() => navigation.navigate('AddAppointment')}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.quickBtnText}>Book Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#10B981' }]}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Ionicons name="list-outline" size={20} color="#fff" />
            <Text style={styles.quickBtnText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Appointments ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={52} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No appointments yet</Text>
              <Text style={styles.emptySub}>Tap the + button to book one!</Text>
            </View>
          ) : (
            recent.map((item) => {
              const color = STATUS_COLORS[item.status] || '#94A3B8';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardAccent, { backgroundColor: color }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.customerName}</Text>
                      <View style={[styles.pill, { backgroundColor: color + '22' }]}>
                        <Text style={[styles.pillText, { color }]}>{item.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardService}>{item.serviceType}</Text>
                    <View style={styles.cardMeta}>
                      <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                      <Text style={styles.metaText}> {item.date}</Text>
                      <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginLeft: 8 }} />
                      <Text style={styles.metaText}> {item.time}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },

  header: {
    backgroundColor: '#6C63FF',
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  userName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 14, paddingVertical: 16, gap: 10,
  },
  statCard: {
    flex: 1, minWidth: '44%', borderRadius: 18,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  statValue: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 8 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', marginTop: 2 },

  quickRow: {
    flexDirection: 'row', paddingHorizontal: 14, gap: 10, marginBottom: 8,
  },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
  },
  quickBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  section: { paddingHorizontal: 14 },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  seeAll: { color: '#6C63FF', fontWeight: '600', fontSize: 13 },

  emptyBox: { alignItems: 'center', paddingVertical: 36 },
  emptyTitle: { color: '#94A3B8', fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySub: { color: '#CBD5E1', fontSize: 13, marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
    paddingRight: 12,
  },
  cardAccent: { width: 5, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 8 },
  cardService: { color: '#64748B', fontSize: 12, marginTop: 3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { color: '#94A3B8', fontSize: 11 },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '700' },
});
