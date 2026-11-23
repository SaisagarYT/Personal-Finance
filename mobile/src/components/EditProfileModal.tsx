import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
  User,
  Mail,
  AlertTriangle,
  ZoomIn,
  RotateCcw,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { UserProfile, ProfileService } from '../services/profileService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  userId?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onProfileUpdated,
  userId,
}) => {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadProfileData();
    }
  }, [visible]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const prof = await ProfileService.getProfile(userId);
      setName(prof.name);
      setEmail(prof.email);
      setAvatarUri(prof.avatarUri);
      setZoomLevel(1);
      setShowDeleteConfirm(false);
      setStatusMessage(null);
    } catch (err) {
      console.warn('Failed to load profile for edit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Launch Image Library with 1:1 Aspect Ratio Cropping
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll permissions are needed to select a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // Enables native 1:1 crop UI on mobile
        aspect: [1, 1], // Square 1:1 aspect ratio for circular avatar
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        setZoomLevel(1);
        setStatusMessage('Photo selected & cropped to 1:1');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Error picking image:', err);
      Alert.alert('Error', 'Could not open image gallery');
    }
  };

  // Launch Camera with 1:1 Aspect Ratio Cropping
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permissions are needed to take a profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, // Enables native 1:1 crop UI on mobile
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        setZoomLevel(1);
        setStatusMessage('Photo captured & cropped');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Error taking photo:', err);
      Alert.alert('Error', 'Could not open camera');
    }
  };

  // Delete / Remove current profile picture
  const handleDeleteAvatar = () => {
    setAvatarUri(null);
    setZoomLevel(1);
    setStatusMessage('Profile photo removed (default avatar restored)');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Save profile changes
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const updated = await ProfileService.saveProfile(
        {
          name: name.trim(),
          email: email.trim(),
          avatarUri: avatarUri,
        },
        userId
      );
      onProfileUpdated(updated);
      onClose();
    } catch (err) {
      console.warn('Failed to save profile:', err);
      Alert.alert('Save Failed', 'Could not save profile changes.');
    } finally {
      setLoading(false);
    }
  };

  // Delete full profile & reset
  const handleConfirmDeleteProfile = async () => {
    try {
      setLoading(true);
      const reset = await ProfileService.deleteProfile(userId);
      onProfileUpdated(reset);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.warn('Failed to delete profile:', err);
      Alert.alert('Delete Failed', 'Could not reset profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            {/* Header */}
            <View style={[styles.headerRow, { borderBottomColor: theme.borderSubtle }]}>
              <View>
                <Text style={[styles.headerTitle, { color: theme.textMain }]}>Manage Profile</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textDim }]}>Edit avatar, info & preferences</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Status Notice */}
              {statusMessage && (
                <View style={[styles.toastNotice, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <Check size={14} color={theme.isDark ? theme.brand : '#059669'} />
                  <Text style={[styles.toastText, { color: theme.textMain }]}>{statusMessage}</Text>
                </View>
              )}

              {/* Avatar & 1:1 Cropping Preview Section */}
              <View style={styles.avatarSection}>
                <View
                  style={[
                    styles.avatarFrame,
                    {
                      borderColor: theme.borderSubtle,
                      backgroundColor: theme.surfaceSubtle,
                    },
                  ]}
                >
                  <Image
                    source={avatarUri ? { uri: avatarUri } : require('../../assets/esther_avatar.png')}
                    style={[
                      styles.avatarPreviewImage,
                      {
                        transform: [{ scale: zoomLevel }],
                      },
                    ]}
                    resizeMode="cover"
                  />
                  {/* Subtle Crop Grid / Ring Overlay */}
                  <View style={[styles.cropRingOverlay, { borderColor: theme.brand + '88' }]} pointerEvents="none" />
                </View>

                {/* In-App Crop Zoom Fine-Tuning */}
                <View style={styles.zoomControlRow}>
                  <ZoomIn size={14} color={theme.textDim} />
                  <Text style={[styles.zoomLabel, { color: theme.textDim }]}>Crop Framing:</Text>
                  <TouchableOpacity
                    style={[styles.zoomPill, { backgroundColor: zoomLevel === 1 ? theme.brand : theme.surfaceSubtle }]}
                    onPress={() => setZoomLevel(1)}
                  >
                    <Text style={[styles.zoomPillText, { color: zoomLevel === 1 ? theme.forestDark : theme.textMain }]}>1x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.zoomPill, { backgroundColor: zoomLevel === 1.15 ? theme.brand : theme.surfaceSubtle }]}
                    onPress={() => setZoomLevel(1.15)}
                  >
                    <Text style={[styles.zoomPillText, { color: zoomLevel === 1.15 ? theme.forestDark : theme.textMain }]}>1.15x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.zoomPill, { backgroundColor: zoomLevel === 1.3 ? theme.brand : theme.surfaceSubtle }]}
                    onPress={() => setZoomLevel(1.3)}
                  >
                    <Text style={[styles.zoomPillText, { color: zoomLevel === 1.3 ? theme.forestDark : theme.textMain }]}>1.3x</Text>
                  </TouchableOpacity>
                </View>

                {/* Avatar Action Buttons */}
                <View style={styles.avatarActionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePickImage}
                    style={[styles.photoActionBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}
                  >
                    <ImageIcon size={15} color={theme.textMain} />
                    <Text style={[styles.photoActionText, { color: theme.textMain }]}>Choose Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleTakePhoto}
                    style={[styles.photoActionBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}
                  >
                    <Camera size={15} color={theme.textMain} />
                    <Text style={[styles.photoActionText, { color: theme.textMain }]}>Take Photo</Text>
                  </TouchableOpacity>

                  {avatarUri && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDeleteAvatar}
                      style={[styles.photoDeleteBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
                    >
                      <Trash2 size={15} color="#DC2626" />
                      <Text style={styles.photoDeleteText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Form Input: Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textDim }]}>Full Name</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <User size={16} color={theme.textDim} style={styles.inputIcon} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Sagar"
                    placeholderTextColor={theme.textDim}
                    style={[styles.textInput, { color: theme.textMain }]}
                    autoCapitalize="words"
                  />
                  {name.length > 0 && (
                    <TouchableOpacity onPress={() => setName('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <X size={14} color={theme.textDim} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Form Input: Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textDim }]}>Email Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <Mail size={16} color={theme.textDim} style={styles.inputIcon} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="e.g. sagar@sinance.app"
                    placeholderTextColor={theme.textDim}
                    style={[styles.textInput, { color: theme.textMain }]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Danger Zone: Delete Profile */}
              <View style={[styles.dangerSection, { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' }]}>
                <View style={styles.dangerHeaderRow}>
                  <AlertTriangle size={16} color="#DC2626" />
                  <Text style={styles.dangerTitle}>Delete Profile Data</Text>
                </View>
                <Text style={styles.dangerDescription}>
                  Permanently delete custom profile avatar, reset name to defaults, and clear synced profile cache.
                </Text>

                {showDeleteConfirm ? (
                  <View style={styles.confirmDeleteRow}>
                    <TouchableOpacity
                      onPress={handleConfirmDeleteProfile}
                      style={styles.confirmDeleteBtn}
                    >
                      <Trash2 size={14} color="#FFFFFF" />
                      <Text style={styles.confirmDeleteBtnText}>Yes, Delete Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteConfirm(false)}
                      style={[styles.cancelDeleteBtn, { borderColor: theme.borderSubtle }]}
                    >
                      <Text style={[styles.cancelDeleteText, { color: theme.textMain }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowDeleteConfirm(true)}
                    style={styles.triggerDeleteBtn}
                  >
                    <Trash2 size={14} color="#DC2626" />
                    <Text style={styles.triggerDeleteText}>Delete Profile</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Bottom Save Action */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[styles.cancelBtn, { borderColor: theme.borderSubtle }]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textMain }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={loading}
                  style={[styles.saveBtn, { backgroundColor: theme.brand }]}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.forestDark} size="small" />
                  ) : (
                    <>
                      <Check size={16} color={theme.forestDark} strokeWidth={2.4} />
                      <Text style={[styles.saveBtnText, { color: theme.forestDark }]}>Save Profile</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
    maxHeight: '90%',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  toastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
  },
  cropRingOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  zoomControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  zoomLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  zoomPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoomPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarActionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  photoDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  photoDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  dangerSection: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  dangerDescription: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    marginBottom: 10,
  },
  triggerDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
  },
  triggerDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  confirmDeleteRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  confirmDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#DC2626',
  },
  confirmDeleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelDeleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  cancelDeleteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
