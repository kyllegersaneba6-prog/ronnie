import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from './firebase';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_COLORS = {
  Confirmed: '#10B981',
  Pending:   '#F59E0B',
  Cancelled: '#EF4444',
  Completed: '#6C63FF',
};

export default function AppointmentListScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // ⚠️ No orderBy here — avoids needing a composite Firestore index.
    // We sort client-side instead so real-time updates always work.
    const unsubscribe = db
      .collection('appointments')
      .where('userId', '==', user.uid)
      .onSnapshot(
        (snap) => {
          const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          // Client-side sort: newest first
          data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setAppointments(data);
          setLoading(false);
        },
        (error) => {
          Alert.alert('Error', 'Failed to load appointments: ' + error.message);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const visible = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (a.customerName || '').toLowerCase().includes(q) ||
      (a.serviceType || '').toLowerCase().includes(q) ||
      (a.phone || '').includes(q);
    const matchFilter = filter === 'All' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Appointment',
      `Remove appointment for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.collection('appointments').doc(id).delete();
              // onSnapshot will auto-refresh the list
            } catch (e) {
              Alert.alert('Delete Failed', e.message || 'Could not delete. Try again.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const color = STATUS_COLORS[item.status] || '#94A3B8';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
        activeOpacity={0.8}
      >
        <View style={[styles.cardAccent, { backgroundColor: color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName} numberOfLines={1}>{item.customerName}</Text>
            <View style={[styles.pill, { backgroundColor: color + '22' }]}>
              <Text style={[styles.pillText, { color }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.service} numberOfLines={1}>{item.serviceType}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
            <Text style={styles.metaText}> {item.date || '—'}</Text>
            <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginLeft: 10 }} />
            <Text style={styles.metaText}> {item.time || '—'}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditAppointment', { appointment: item })}
            >
              <Ionicons name="create-outline" size={15} color="#6C63FF" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id, item.customerName)}
            >
              <Ionicons name="trash-outline" size={15} color="#EF4444" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={() => navigation.navigate('AddAppointment')}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, service or phone…"
            placeholderTextColor="#CBD5E1"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f}
        style={styles.filterList}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.resultCount}>
        {visible.length} {visible.length === 1 ? 'appointment' : 'appointments'}
      </Text>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No appointments found</Text>
              <Text style={styles.emptySub}>
                {filter !== 'All' ? `No "${filter}" appointments` : 'Tap + to book your first one'}
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => navigation.navigate('AddAppointment')}
              >
                <Text style={styles.emptyAddText}>+ Book Appointment</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    backgroundColor: '#6C63FF',
    paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  addIconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchWrap: { paddingHorizontal: 14, paddingTop: 14 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, height: 50,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  filterList: { maxHeight: 52 },
  filterContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  resultCount: { paddingHorizontal: 16, fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  listContent: { padding: 14, paddingTop: 6, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 8 },
  service: { color: '#64748B', fontSize: 13, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { color: '#94A3B8', fontSize: 12 },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 4 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: '#EEF2FF', borderRadius: 8,
  },
  editText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: '#FEF2F2', borderRadius: 8,
  },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#94A3B8', marginTop: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: { color: '#64748B', fontSize: 17, fontWeight: '700', marginTop: 14 },
  emptySub: { color: '#CBD5E1', fontSize: 13, marginTop: 6, textAlign: 'center' },
  emptyAddBtn: {
    marginTop: 20, backgroundColor: '#6C63FF',
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12,
  },
  emptyAddText: { color: '#fff', fontWeight: '700' },
});
