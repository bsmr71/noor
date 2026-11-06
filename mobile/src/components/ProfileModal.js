import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { QORI_LIST, MUADZIN_LIST, AVATAR_OPTIONS } from '../data/recitersData';
import { playAudioUrl, stopCurrentAudio } from '../utils/audioPlayerService';
import {
  isMuadzinOffline,
  getMuadzinAudioSource,
  downloadMuadzinAudio,
  deleteMuadzinAudio,
} from '../services/offlineStorageService';
import { ADMIN_CONSOLE_URL } from '../services/apiClient';
import KeyboardSafeModalWrapper from './KeyboardSafeModalWrapper';
import KeyboardAwareScrollView from './KeyboardAwareScrollView';

export default function ProfileModal({
  visible,
  onClose,
  onOpenAuth,
  onOpenDonationHistory,
  onOpenPremium,
  onLogout,
  userProfile,
  onUpdateProfile,
  selectedQori,
  onSelectQori,
  selectedMuadzin,
  onSelectMuadzin,
  adzanReminder: adzanReminderProp = true,
  onToggleAdzanReminder,
  statusBarCountdown: statusBarCountdownProp = true,
  onToggleStatusBarCountdown,
  isDarkMode = false,
  onToggleDarkMode,
  initialTab = 'profil',
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profil'); // 'profil', 'qori', 'muadzin', 'setelan'

  useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);
  const [name, setName] = useState(userProfile?.name || 'Hamba Allah');
  const [email, setEmail] = useState(userProfile?.email || 'bismillah@noor.app');
  const [bio, setBio] = useState(userProfile?.bio || 'Senantiasa berikhtiar istiqomah dalam tilawah & doa.');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || AVATAR_OPTIONS[0].url);
  const [isEditing, setIsEditing] = useState(false);

  // Audio Preview Player
  const [previewingId, setPreviewingId] = useState(null);

  // Settings State
  const [showLatin, setShowLatin] = useState(true);
  const [showTrans, setShowTrans] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [adzanReminder, setAdzanReminder] = useState(adzanReminderProp);
  const [statusBarCountdown, setStatusBarCountdown] = useState(statusBarCountdownProp);

  const handleToggleAdzan = (val) => {
    setAdzanReminder(val);
    if (onToggleAdzanReminder) onToggleAdzanReminder(val);
  };

  const handleToggleStatusBarCountdown = (val) => {
    setStatusBarCountdown(val);
    if (onToggleStatusBarCountdown) onToggleStatusBarCountdown(val);
  };

  const stopPreviewAudio = () => {
    stopCurrentAudio();
    setPreviewingId(null);
  };

  // Offline Muadzin state
  const [downloadedMuadzins, setDownloadedMuadzins] = useState({});
  const [downloadingMuadzinId, setDownloadingMuadzinId] = useState(null);

  useEffect(() => {
    let active = true;
    const checkOfflineMuadzins = async () => {
      const map = {};
      for (const m of MUADZIN_LIST) {
        map[m.id] = await isMuadzinOffline(m.id);
      }
      if (active) setDownloadedMuadzins(map);
    };
    if (visible && activeTab === 'muadzin') {
      checkOfflineMuadzins();
    }
    return () => {
      active = false;
    };
  }, [visible, activeTab]);

  const handleDownloadMuadzin = async (m) => {
    try {
      setDownloadingMuadzinId(m.id);
      await downloadMuadzinAudio(m);
      setDownloadedMuadzins((prev) => ({ ...prev, [m.id]: true }));
      Alert.alert('Berhasil Diunduh', `Audio adzan ${m.name} kini tersimpan offline di HP Anda.`);
    } catch (e) {
      Alert.alert('Gagal Mengunduh', 'Pastikan koneksi internet aktif untuk mengunduh audio.');
    } finally {
      setDownloadingMuadzinId(null);
    }
  };

  const handleDeleteMuadzin = (m) => {
    Alert.alert('Hapus Audio Offline', `Hapus audio tersimpan untuk ${m.name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteMuadzinAudio(m.id);
          setDownloadedMuadzins((prev) => ({ ...prev, [m.id]: false }));
        },
      },
    ]);
  };

  const handlePlayPreview = async (id, url, muadzinObj = null) => {
    if (previewingId === id) {
      stopPreviewAudio();
      return;
    }

    stopPreviewAudio();
    setPreviewingId(id);
    const src = muadzinObj ? await getMuadzinAudioSource(muadzinObj) : url;
    playAudioUrl(src);
  };

  const handleClose = async () => {
    await stopPreviewAudio();
    onClose();
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      name,
      email,
      bio,
      avatar: selectedAvatar,
    });
    setIsEditing(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <KeyboardSafeModalWrapper backdropColor="#00000060">
        <View style={styles.modalSheet}>
          {/* Top Sheet Bar */}
          <View style={styles.sheetTopBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="account-cog" size={22} color={Colors.primary} />
              <Text style={styles.sheetTitle}>Pengaturan & Akun</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {userProfile?.isLoggedIn && (
                <TouchableOpacity onPress={onLogout} style={styles.topLogoutBtn} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="logout" size={15} color="#d32f2f" />
                  <Text style={styles.topLogoutText}>Keluar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#191c1b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4 Tabs Grid */}
          <View style={styles.tabsGrid}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'profil' && styles.tabBtnActive]}
              onPress={() => setActiveTab('profil')}
            >
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={18}
                color={activeTab === 'profil' ? Colors.primary : '#6f7975'}
              />
              <Text style={[styles.tabBtnText, activeTab === 'profil' && styles.tabBtnTextActive]}>
                Profil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'qori' && styles.tabBtnActive]}
              onPress={() => setActiveTab('qori')}
            >
              <MaterialCommunityIcons
                name="record-circle-outline"
                size={18}
                color={activeTab === 'qori' ? Colors.primary : '#6f7975'}
              />
              <Text style={[styles.tabBtnText, activeTab === 'qori' && styles.tabBtnTextActive]}>
                Qori ({QORI_LIST.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'muadzin' && styles.tabBtnActive]}
              onPress={() => setActiveTab('muadzin')}
            >
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={18}
                color={activeTab === 'muadzin' ? Colors.primary : '#6f7975'}
              />
              <Text style={[styles.tabBtnText, activeTab === 'muadzin' && styles.tabBtnTextActive]}>
                Muadzin ({MUADZIN_LIST.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'setelan' && styles.tabBtnActive]}
              onPress={() => setActiveTab('setelan')}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={18}
                color={activeTab === 'setelan' ? Colors.primary : '#6f7975'}
              />
              <Text style={[styles.tabBtnText, activeTab === 'setelan' && styles.tabBtnTextActive]}>
                Setelan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <KeyboardAwareScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* TAB 1: PROFIL */}
            {activeTab === 'profil' && (
              <View style={{ gap: 14 }}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                  <Image source={{ uri: selectedAvatar }} style={styles.profileBigAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.profileName}>{name}</Text>
                      {userProfile?.role === 'admin' ? (
                        <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#f59e0b' }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400e' }}>👑 Super Admin</Text>
                        </View>
                      ) : userProfile?.role === 'ustadz' ? (
                        <View style={{ backgroundColor: '#ccfbf1', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#2dd4bf' }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#115e59' }}>🎓 Ustadz / Qori</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#86efac' }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#166534' }}>🕌 Jamaah Aktif</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.profileEmail}>{email}</Text>
                    <Text style={styles.profileBio} numberOfLines={2}>"{bio}"</Text>
                  </View>
                </View>

                {/* 3 Stat Cards */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>7 Hari</Text>
                    <Text style={styles.statLabel}>Istiqomah</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: Colors.secondary }]}>1 Juz</Text>
                    <Text style={styles.statLabel}>Target Harian</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>Kemenag</Text>
                    <Text style={styles.statLabel}>Standar Hisab</Text>
                  </View>
                </View>

                {/* Admin Noor Console Direct Shortcut (Only for Admin Role) */}
                {userProfile?.role === 'admin' && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#fffbeb',
                      borderColor: '#fe932c',
                      borderWidth: 1.5,
                      borderRadius: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                      marginBottom: 10,
                      shadowColor: '#fe932c',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={() => Linking.openURL(ADMIN_CONSOLE_URL)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="shield-crown" size={18} color="#b45309" />
                    <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: '#92400e' }}>
                      Buka Noor Console Administrator
                    </Text>
                    <MaterialCommunityIcons name="open-in-new" size={16} color="#b45309" />
                  </TouchableOpacity>
                )}

                {/* Noor+ Bebas Iklan Card */}
                {onOpenPremium && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: userProfile?.is_premium ? '#002721' : '#fffbeb',
                      borderColor: userProfile?.is_premium ? '#fe932c' : '#fde68a',
                      borderWidth: 1.5,
                      borderRadius: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                    onPress={onOpenPremium}
                    activeOpacity={0.85}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <MaterialCommunityIcons
                        name="crown"
                        size={20}
                        color={userProfile?.is_premium ? '#fe932c' : '#b45309'}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12.5,
                            fontWeight: 'bold',
                            color: userProfile?.is_premium ? '#ffffff' : '#92400e',
                          }}
                        >
                          {userProfile?.is_premium
                            ? `${userProfile.premium_label || 'Member Noor+'} • Bebas Iklan Aktif`
                            : 'Noor+ Bebas Iklan (Hapus Banner Sponsor)'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10.5,
                            color: userProfile?.is_premium ? '#bbeddd' : '#b45309',
                            marginTop: 1,
                          }}
                        >
                          {userProfile?.is_premium
                            ? 'Tap untuk melihat masa berlaku & riwayat invoice'
                            : 'Mulai Rp 15.000 • Ibadah lebih tenang tanpa iklan'}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={userProfile?.is_premium ? '#fe932c' : '#b45309'}
                    />
                  </TouchableOpacity>
                )}

                {/* Riwayat Donasi Saya Shortcut */}
                {userProfile?.isLoggedIn && onOpenDonationHistory && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#ecfdf5',
                      borderColor: '#a7f3d0',
                      borderWidth: 1,
                      borderRadius: 14,
                      paddingVertical: 11,
                      paddingHorizontal: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                    }}
                    onPress={onOpenDonationHistory}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="receipt-text-check-outline" size={18} color="#047857" />
                    <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: '#065f46' }}>
                      Riwayat Donasi & Kwitansi Saya
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Login / Register / Logout Actions */}
                {userProfile?.isLoggedIn ? (
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: '#f2f4f3',
                        borderRadius: 14,
                        paddingVertical: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                        borderWidth: 1,
                        borderColor: '#eceeed',
                      }}
                      onPress={() => onOpenAuth('login')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="account-switch-outline" size={16} color={Colors.primary} />
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.primary }}>
                        Ganti Akun
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: '#ffebee',
                        borderRadius: 14,
                        paddingVertical: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                        borderWidth: 1,
                        borderColor: '#ffcdd2',
                      }}
                      onPress={onLogout}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="logout" size={16} color="#d32f2f" />
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d32f2f' }}>
                        Keluar Akun
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 8, marginBottom: 4 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.primary,
                        borderRadius: 14,
                        paddingVertical: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        elevation: 2,
                      }}
                      onPress={() => onOpenAuth('login')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="login" size={18} color="#ffffff" />
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>
                        Masuk ke Akun Noor
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#ffe9d6',
                        borderRadius: 14,
                        paddingVertical: 11,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                      }}
                      onPress={() => onOpenAuth('register')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="account-plus-outline" size={18} color={Colors.secondary} />
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.secondary }}>
                        Daftar Akun Baru (Register)
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Edit Profile Action */}
                {!isEditing ? (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                    <Text style={styles.editBtnText}>Ubah Data Akun & Foto Profil</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editFormBox}>
                    <Text style={styles.formTitle}>Pilih Foto Profil</Text>
                    <View style={styles.avatarList}>
                      {AVATAR_OPTIONS.map((av) => (
                        <TouchableOpacity
                          key={av.id}
                          onPress={() => setSelectedAvatar(av.url)}
                          style={[
                            styles.avatarSelectRing,
                            selectedAvatar === av.url && styles.avatarSelectRingActive,
                          ]}
                        >
                          <Image source={{ uri: av.url }} style={styles.avatarMini} />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>Nama Lengkap</Text>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Nama Anda"
                    />

                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      keyboardType="email-address"
                    />

                    <Text style={styles.inputLabel}>Bio Niat Harian</Text>
                    <TextInput
                      style={styles.textInput}
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Niat ibadah..."
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                      <TouchableOpacity
                        style={[styles.saveBtn, { flex: 1 }]}
                        onPress={handleSaveProfile}
                      >
                        <Text style={styles.saveBtnText}>Simpan</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cancelBtn, { flex: 1 }]}
                        onPress={() => setIsEditing(false)}
                      >
                        <Text style={styles.cancelBtnText}>Batal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Selected Qori & Muadzin Badges */}
                <View style={styles.activeSummaryBox}>
                  <Text style={styles.summaryTitle}>SUARA & QORI AKTIF</Text>

                  <TouchableOpacity
                    style={styles.summaryItem}
                    onPress={() => setActiveTab('qori')}
                  >
                    <MaterialCommunityIcons name="microphone" size={20} color={Colors.secondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryItemName}>{selectedQori?.name}</Text>
                      <Text style={styles.summaryItemSub}>{selectedQori?.style}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#6f7975" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.summaryItem}
                    onPress={() => setActiveTab('muadzin')}
                  >
                    <MaterialCommunityIcons name="bullhorn" size={20} color={Colors.secondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryItemName}>{selectedMuadzin?.name}</Text>
                      <Text style={styles.summaryItemSub}>{selectedMuadzin?.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#6f7975" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* TAB 2: PILIHAN QORI */}
            {activeTab === 'qori' && (
              <View style={{ gap: 10 }}>
                <Text style={styles.tabHeading}>Pilih Qori Murottal Al-Qur'an</Text>
                <Text style={styles.tabSubheading}>
                  Audio jernih 320kbps dari Makkah, Madinah, Mesir & Kuwait
                </Text>

                {QORI_LIST.map((q) => {
                  const isSelected = selectedQori?.id === q.id;
                  const isPlaying = previewingId === q.id;

                  return (
                    <View
                      key={q.id}
                      style={[styles.reciterCard, isSelected && styles.reciterCardSelected]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Image source={{ uri: q.avatar }} style={styles.reciterAvatar} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.reciterName}>{q.name}</Text>
                            <View style={styles.reciterBadge}>
                              <Text style={styles.reciterBadgeText}>{q.badge}</Text>
                            </View>
                          </View>
                          <Text style={styles.reciterArabic}>{q.arabicName}</Text>
                          <Text style={styles.reciterStyle}>{q.style}</Text>
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.reciterActionsRow}>
                        <TouchableOpacity
                          style={[styles.sampleBtn, isPlaying && styles.sampleBtnPlaying]}
                          onPress={() => handlePlayPreview(q.id, q.previewUrl)}
                        >
                          <MaterialCommunityIcons
                            name={isPlaying ? 'pause' : 'play'}
                            size={16}
                            color={isPlaying ? '#ffffff' : Colors.primary}
                          />
                          <Text style={[styles.sampleBtnText, isPlaying && { color: '#ffffff' }]}>
                            {isPlaying ? 'Jeda' : 'Dengar Sampel'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                          onPress={() => onSelectQori(q)}
                        >
                          <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                            {isSelected ? '✓ Qori Aktif' : 'Pilih Qori'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* TAB 3: PILIHAN MUADZIN (SUARA PEMBERITAHUAN) */}
            {activeTab === 'muadzin' && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.tabHeading}>Suara Pemberitahuan</Text>
                    <Text style={styles.tabSubheading}>
                      Pilih dan unduh lantunan adzan favorit untuk waktu sholat Anda
                    </Text>
                  </View>
                  <View style={styles.offlineAllBadge}>
                    <Ionicons name="cloud-offline-outline" size={13} color="#059669" />
                    <Text style={styles.offlineAllText}>Bisa Offline</Text>
                  </View>
                </View>

                {MUADZIN_LIST.map((m) => {
                  const isSelected = selectedMuadzin?.id === m.id;
                  const isPlaying = previewingId === m.id;
                  const isBundled = m.id === 'mulla';
                  const isOffline = isBundled || !!downloadedMuadzins[m.id];
                  const isDownloading = downloadingMuadzinId === m.id;

                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.adhanRowCard,
                        isSelected && styles.adhanRowCardSelected,
                        isPlaying && styles.adhanRowCardPlaying,
                      ]}
                      onPress={() => {
                        onSelectMuadzin(m);
                        if (!isOffline && !isDownloading) {
                          Alert.alert(
                            'Unduh Suara Adzan?',
                            `Unduh suara adzan ${m.name} agar tersimpan offline dan berbunyi tepat waktu saat waktu sholat tiba?`,
                            [
                              { text: 'Nanti', style: 'cancel' },
                              { text: 'Unduh Sekarang', onPress: () => handleDownloadMuadzin(m) },
                            ]
                          );
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      {/* Flag circle */}
                      <View style={[styles.adhanFlagCircle, isSelected && styles.adhanFlagCircleSelected]}>
                        <Text style={styles.adhanFlagEmoji}>{m.flag || '🕌'}</Text>
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1, paddingVertical: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={[styles.adhanNameText, isSelected && styles.adhanNameTextSelected]}>
                            {m.name}
                          </Text>
                          {m.badge === 'Khusus Subuh' && (
                            <View style={styles.fajrBadge}>
                              <Text style={styles.fajrBadgeText}>Subuh</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Text style={[styles.adhanCountryText, isSelected && styles.adhanCountryTextSelected]}>
                            {m.country || m.origin}
                          </Text>
                          {isOffline ? (
                            <View style={styles.adhanOfflineBadge}>
                              <Ionicons name="checkmark-circle" size={11} color="#16a34a" />
                              <Text style={styles.adhanOfflineText}>{isBundled ? 'Bawaan' : 'Offline'}</Text>
                            </View>
                          ) : (
                            <Text style={{ fontSize: 10, color: '#9ca3af' }}>• Belum diunduh</Text>
                          )}
                        </View>
                      </View>

                      {/* Action & selection */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {isDownloading ? (
                          <View style={[styles.adhanDownloadPill, styles.adhanDownloadPillLoading]}>
                            <ActivityIndicator size="small" color="#059669" />
                          </View>
                        ) : !isOffline ? (
                          <TouchableOpacity
                            style={styles.adhanDownloadPill}
                            onPress={() => handleDownloadMuadzin(m)}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <Ionicons name="cloud-download-outline" size={13} color="#059669" />
                            <Text style={styles.adhanDownloadPillText}>Unduh</Text>
                          </TouchableOpacity>
                        ) : !isBundled ? (
                          <TouchableOpacity
                            style={styles.adhanTrashBtn}
                            onPress={() => handleDeleteMuadzin(m)}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                          </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                          style={[styles.adhanPlayPill, isPlaying && styles.adhanPlayPillActive]}
                          onPress={() => handlePlayPreview(m.id, m.audioUrl, m)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                        >
                          <MaterialCommunityIcons
                            name={isPlaying ? 'pause' : 'volume-high'}
                            size={18}
                            color={isPlaying ? '#ffffff' : (isSelected ? '#059669' : '#002721')}
                          />
                        </TouchableOpacity>

                        {isSelected ? (
                          <View style={styles.adhanSelectedRadio}>
                            <Ionicons name="checkmark" size={13} color="#ffffff" />
                          </View>
                        ) : (
                          <View style={styles.adhanUnselectedRadio} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* TAB 4: SETELAN APLIKASI */}
            {activeTab === 'setelan' && (
              <View style={{ gap: 14 }}>
                <Text style={styles.tabHeading}>Mushaf & Bacaan Al-Qur'an</Text>
                
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Tampilkan Teks Latin</Text>
                    <Text style={styles.settingDesc}>Transliterasi pengucapan huruf Arab</Text>
                  </View>
                  <Switch
                    value={showLatin}
                    onValueChange={setShowLatin}
                    trackColor={{ false: '#e2e8e5', true: Colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Terjemahan Bahasa Indonesia</Text>
                    <Text style={styles.settingDesc}>Terjemahan resmi Kementerian Agama RI</Text>
                  </View>
                  <Switch
                    value={showTrans}
                    onValueChange={setShowTrans}
                    trackColor={{ false: '#e2e8e5', true: Colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Putar Otomatis Ayat Selanjutnya</Text>
                    <Text style={styles.settingDesc}>Melanjutkan tilawah tanpa jeda</Text>
                  </View>
                  <Switch
                    value={autoPlay}
                    onValueChange={setAutoPlay}
                    trackColor={{ false: '#e2e8e5', true: Colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <Text style={[styles.tabHeading, { marginTop: 10 }]}>Tampilan & Tema Aplikasi</Text>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Mode Gelap (Dark Mode)</Text>
                    <Text style={styles.settingDesc}>Tampilan kontras malam yang nyaman dan sejuk di mata</Text>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={onToggleDarkMode}
                    trackColor={{ false: '#e2e8e5', true: '#059669' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <Text style={[styles.tabHeading, { marginTop: 10 }]}>Sholat & Notifikasi Adzan</Text>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Lantunan Suara Adzan Otomatis</Text>
                    <Text style={styles.settingDesc}>Memperdengarkan adzan saat waktu sholat tiba</Text>
                  </View>
                  <Switch
                    value={adzanReminder}
                    onValueChange={handleToggleAdzan}
                    trackColor={{ false: '#e2e8e5', true: Colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Hitung Mundur di Status Bar</Text>
                    <Text style={styles.settingDesc}>Menampilkan berapa menit lagi menuju adzan di status bar HP</Text>
                  </View>
                  <Switch
                    value={statusBarCountdown}
                    onValueChange={handleToggleStatusBarCountdown}
                    trackColor={{ false: '#e2e8e5', true: Colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Metode Hisab Waktu Sholat</Text>
                    <Text style={styles.settingDesc}>Resmi Kemenag RI (Bimas Islam)</Text>
                  </View>
                  <MaterialCommunityIcons name="check-decagram" size={20} color={Colors.secondary} />
                </View>

                {/* Sesi & Logout Section */}
                <Text style={[styles.tabHeading, { marginTop: 14 }]}>Akun & Keamanan</Text>

                {userProfile?.isLoggedIn ? (
                  <View style={{ backgroundColor: '#f8faf9', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#eceeed', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Image source={{ uri: userProfile?.avatar || selectedAvatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.primary }}>{userProfile?.name}</Text>
                        <Text style={{ fontSize: 11, color: '#6f7975' }}>{userProfile?.email}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#ffebee',
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        borderWidth: 1,
                        borderColor: '#ffcdd2',
                      }}
                      onPress={onLogout}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="logout" size={18} color="#d32f2f" />
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#d32f2f' }}>
                        Keluar dari Akun (Logout)
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ backgroundColor: '#f8faf9', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#eceeed', gap: 10 }}>
                    <Text style={{ fontSize: 12, color: '#6f7975' }}>Anda saat ini menggunakan aplikasi sebagai Tamu.</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.primary,
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                      }}
                      onPress={() => onOpenAuth('login')}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="login" size={18} color="#ffffff" />
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>
                        Masuk ke Akun Noor
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </KeyboardAwareScrollView>
        </View>
      </KeyboardSafeModalWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    flexShrink: 1,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  sheetTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  topLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  topLogoutText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  closeBtn: {
    padding: 4,
  },
  tabsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f3',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8e5',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Colors.primary,
    backgroundColor: '#ffffff',
  },
  tabBtnText: {
    fontSize: 11,
    color: '#6f7975',
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  sheetScroll: {
    paddingHorizontal: 16,
  },
  sheetContent: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002721',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  profileBigAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fe932c',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'serif',
  },
  activePill: {
    backgroundColor: '#fe932c',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#002721',
  },
  profileEmail: {
    fontSize: 11,
    color: '#ffffffaa',
    marginTop: 2,
  },
  profileBio: {
    fontSize: 10,
    color: '#ffffff88',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002721',
  },
  statLabel: {
    fontSize: 10,
    color: '#6f7975',
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f3',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002721',
  },
  editFormBox: {
    backgroundColor: '#f8faf9',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    gap: 8,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002721',
  },
  avatarList: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 6,
  },
  avatarSelectRing: {
    borderRadius: 22,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelectRingActive: {
    borderColor: Colors.secondary,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6f7975',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#191c1b',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelBtn: {
    backgroundColor: '#e2e8e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6f7975',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeSummaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    gap: 10,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6f7975',
    letterSpacing: 0.8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002721',
  },
  summaryItemSub: {
    fontSize: 10,
    color: '#6f7975',
  },
  tabHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  tabSubheading: {
    fontSize: 11,
    color: '#6f7975',
    marginBottom: 6,
  },
  reciterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    gap: 10,
  },
  reciterCardSelected: {
    borderColor: Colors.secondary,
    borderWidth: 1.5,
    backgroundColor: '#fffdf9',
  },
  reciterAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  reciterName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002721',
  },
  reciterBadge: {
    backgroundColor: '#fe932c20',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  reciterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#c27803',
  },
  reciterArabic: {
    fontSize: 11,
    color: '#6f7975',
    fontFamily: 'serif',
  },
  reciterStyle: {
    fontSize: 10,
    color: '#6f7975',
    marginTop: 2,
  },
  reciterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f3',
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  sampleBtnPlaying: {
    backgroundColor: Colors.secondary,
  },
  sampleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002721',
  },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f3',
  },
  selectBtnActive: {
    backgroundColor: Colors.primary,
  },
  selectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002721',
  },
  selectBtnTextActive: {
    color: '#ffffff',
  },
  offlineBundledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
  },
  offlineBundledText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },
  offlineDownloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
  },
  offlineDownloadedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },
  downloadOfflineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  downloadOfflineText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  deleteOfflineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002721',
  },
  settingDesc: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
  },
  // Suara Pemberitahuan (Adhan Notification Style)
  offlineAllBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  offlineAllText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  adhanRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  adhanRowCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
  },
  adhanRowCardPlaying: {
    borderColor: '#fe932c',
    backgroundColor: '#fffbeb',
  },
  adhanFlagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8faf9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  adhanFlagCircleSelected: {
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5',
  },
  adhanFlagEmoji: {
    fontSize: 22,
  },
  adhanNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#191c1b',
  },
  adhanNameTextSelected: {
    color: '#065f46',
  },
  adhanCountryText: {
    fontSize: 11.5,
    color: '#6f7975',
    marginTop: 2,
  },
  adhanCountryTextSelected: {
    color: '#047857',
  },
  fajrBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#fde68a',
  },
  fajrBadgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#d97706',
  },
  adhanPlayPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adhanPlayPillActive: {
    backgroundColor: '#fe932c',
  },
  adhanSelectedRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adhanUnselectedRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  adhanDownloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  adhanDownloadPillLoading: {
    backgroundColor: '#f1f5f3',
    borderColor: '#e2e8e5',
    paddingHorizontal: 12,
  },
  adhanDownloadPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  adhanOfflineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#86efac',
  },
  adhanOfflineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  adhanTrashBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

