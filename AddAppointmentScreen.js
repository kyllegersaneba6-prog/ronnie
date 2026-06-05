import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from './firebase';

const SERVICES = [
  'General Consultation',
  'Follow-up Visit',
  'Dental Check-up',
  'Eye Examination',
  'Physical Therapy',
  'Laboratory Test',
  'Vaccination',
  'Other',
];

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function AddAppointmentScreen({ navigation }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!customerName.trim()) {
      Alert.alert('Required', 'Please enter the customer name.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Required', 'Please enter the appointment date.');
      return;
    }
    if (!time.trim()) {
      Alert.alert('Required', 'Please enter the appointment time.');
      return;
    }
    if (!serviceType) {
      Alert.alert('Required', 'Please select a service type.');
      return;
    }

    setLoading(true);
    try {
      await db.collection('appointments').add({
        customerName: customerName.trim(),
        phone: phone.trim(),
        date: date.trim(),
        time: time.trim(),
        serviceType,
        status,
        notes: notes.trim(),
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('✅ Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save the appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}>
        {/* ── Customer Info ── */}
        <Text style={styles.sectionLabel}>👤 Customer Information</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputBox}>
            <Ionicons
              name="person-outline"
              size={17}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter customer full name"
              placeholderTextColor="#CBD5E1"
              value={customerName}
              onChangeText={setCustomerName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputBox}>
            <Ionicons
              name="call-outline"
              size={17}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. 09XX-XXX-XXXX"
              placeholderTextColor="#CBD5E1"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ── Schedule ── */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>📅 Schedule</Text>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date * (MM/DD/YYYY)</Text>
            <View style={styles.inputBox}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="06/15/2025"
                placeholderTextColor="#CBD5E1"
                value={date}
                onChangeText={setDate}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ width: 10 }} />
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time *</Text>
            <View style={styles.inputBox}>
              <Ionicons
                name="time-outline"
                size={17}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="10:00 AM"
                placeholderTextColor="#CBD5E1"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>
        </View>

        {/* ── Service Type ── */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
          🩺 Service Type *
        </Text>
        <View style={styles.chipsWrap}>
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, serviceType === s && styles.chipActive]}
              onPress={() => setServiceType(s)}>
              <Text
                style={[
                  styles.chipText,
                  serviceType === s && styles.chipTextActive,
                ]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Status ── */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
          📌 Booking Status
        </Text>
        <View style={styles.chipsWrap}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, status === s && styles.chipActive]}
              onPress={() => setStatus(s)}>
              <Text
                style={[
                  styles.chipText,
                  status === s && styles.chipTextActive,
                ]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Notes ── */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
          📝 Notes (Optional)
        </Text>
        <View style={[styles.inputBox, styles.notesBox]}>
          <TextInput
            style={styles.notesInput}
            placeholder="Add special instructions or remarks…"
            placeholderTextColor="#CBD5E1"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.75 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>Book Appointment</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },

  header: {
    backgroundColor: '#6C63FF',
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },

  form: { padding: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },

  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#1E293B' },

  row: { flexDirection: 'row', marginBottom: 0 },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  notesBox: { height: 100, alignItems: 'flex-start', paddingTop: 12 },
  notesInput: { flex: 1, fontSize: 14, color: '#1E293B', width: '100%' },

  saveBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    height: 58,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
