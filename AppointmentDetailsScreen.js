import React from 'react';
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
import { db } from './firebase';
// FIXED: Import modular Firestore handlers needed for the delete function
import { doc, deleteDoc } from 'firebase/firestore';

const STATUS_COLORS = {
  Confirmed: '#10B981',
  Pending: '#F59E0B',
  Cancelled: '#EF4444',
  Completed: '#6C63FF',
};

const STATUS_ICONS = {
  Confirmed: 'checkmark-circle',
  Pending: 'hourglass-outline',
  Cancelled: 'close-circle',
  Completed: 'ribbon',
};

export default function AppointmentDetailsScreen({ navigation, route }) {
  const { appointment } = route.params;
  const statusColor = STATUS_COLORS[appointment.status] || '#94A3B8';
  const statusIcon = STATUS_ICONS[appointment.status] || 'help-circle-outline';

  const handleDelete = () => {
    Alert.alert(
      'Delete Appointment',
      `Are you sure you want to remove the appointment for "${appointment.customerName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // FIXED: Uses modular delete reference matching your initialized db
              const docRef = doc(db, 'appointments', appointment.id);
              await deleteDoc(docRef);
              navigation.goBack();
            } catch (error) {
              console.error("Delete failed: ", error);
              Alert.alert('Error', 'Failed to delete the appointment.');
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={statusColor} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  const formattedCreated = appointment.createdAt
    ? new Date(appointment.createdAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const formattedUpdated = appointment.updatedAt
    ? new Date(appointment.updatedAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={statusColor} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: statusColor }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('EditAppointment', { appointment })}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero Section ── */}
        <View style={[styles.hero, { backgroundColor: statusColor }]}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroInitial}>
              {(appointment.customerName || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroName}>{appointment.customerName}</Text>
          <Text style={styles.heroService}>{appointment.serviceType}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name={statusIcon} size={15} color={statusColor} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {appointment.status}
            </Text>
          </View>
        </View>

        {/* ── Appointment Details ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Info</Text>
          <InfoRow icon="calendar-outline" label="Date" value={appointment.date} />
          <InfoRow icon="time-outline" label="Time" value={appointment.time} />
          <InfoRow icon="medical-outline" label="Service" value={appointment.serviceType} />
          <InfoRow icon="call-outline" label="Phone" value={appointment.phone} />
        </View>

        {/* ── Notes ── */}
        {appointment.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <View style={styles.notesBox}>
              <Ionicons name="document-text-outline" size={16} color="#94A3B8" style={{ marginTop: 2 }} />
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* ── History ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>History</Text>
          <InfoRow icon="add-circle-outline" label="Created On" value={formattedCreated} />
          <InfoRow icon="refresh-circle-outline" label="Last Updated" value={formattedUpdated} />
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#6C63FF' }]}
            onPress={() => navigation.navigate('EditAppointment', { appointment })}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  hero: { alignItems: 'center', paddingBottom: 30, paddingTop: 4 },
  heroAvatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  heroInitial: { color: '#fff', fontSize: 32, fontWeight: '800' },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  heroService: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginTop: 14,
  },
  statusBadgeText: { fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#fff', margin: 14, marginBottom: 0,
    borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
  },
  cardTitle: {
    fontSize: 14, fontWeight: '800', color: '#475569',
    marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  infoText: { flex: 1, justifyContent: 'center' },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  notesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  notesText: { flex: 1, color: '#475569', fontSize: 14, lineHeight: 22 },
  btnRow: { flexDirection: 'row', padding: 14, gap: 10, marginTop: 6 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, height: 54,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 5, elevation: 3,
  },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});