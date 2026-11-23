import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Trash2,
  Pencil,
  User,
  Info,
  Mail,
  Check,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { useToast } from '../context/ToastContext';
import { UserProfile, ProfileService } from '../services/profileService';

interface EditProfileScreenProps {
  onBack: () => void;
  userProfile?: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  userId?: string;
}

type EditFieldType = 'name' | 'bio' | null;

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBack,
  userProfile: initialProfile,
  onProfileUpdated,
  userId,
}) => {
  const theme = useAppTheme();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(
    initialProfile || {
      name: 'Sagar',
      email: 'sagar@sinance.app',
      avatarUri: null,
      bio: 'Personal finance enthusiast & investor',
      updatedAt: new Date().toISOString(),
    }
  );

  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [activeEditField, setActiveEditField] = useState<EditFieldType>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    } else {
      ProfileService.getProfile(userId).then((loaded) => setProfile(loaded));
    }
  }, [initialProfile, userId]);

  // 1. Pick from Gallery with 1:1 Aspect Ratio Cropping
  const handlePickFromGallery = async () => {
    try {
      setIsPhotoSheetOpen(false);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast({
          title: 'Permission needed',
          description: 'Please allow gallery access in device settings to set your photo.',
          type: 'info',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // Native 1:1 circular/square crop UI
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const newUri = result.assets[0].uri;
        const updated = await ProfileService.saveProfile({ avatarUri: newUri }, userId);
        setProfile(updated);
        onProfileUpdated(updated);
        showToast('Profile photo updated');
      }
    } catch (err) {
      console.warn('Failed to pick image:', err);
      showToast({
        title: 'Could not open gallery',
        description: 'An unexpected error occurred while reading your photo library.',
        type: 'error',
      });
    }
  };

  // 2. Capture from Camera with 1:1 Aspect Ratio Cropping
  const handleCaptureFromCamera = async () => {
    try {
      setIsPhotoSheetOpen(false);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast({
          title: 'Permission needed',
          description: 'Please allow camera access in device settings to take a photo.',
          type: 'info',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, // Native 1:1 circular/square crop UI
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const newUri = result.assets[0].uri;
        const updated = await ProfileService.saveProfile({ avatarUri: newUri }, userId);
        setProfile(updated);
        onProfileUpdated(updated);
        showToast('Profile photo captured & updated');
      }
    } catch (err) {
      console.warn('Failed to capture photo:', err);
      showToast({
        title: 'Could not open camera',
        description: 'Camera device could not be initialized.',
        type: 'error',
      });
    }
  };

  // 3. Remove / Delete Photo
  const handleRemovePhoto = async () => {
    try {
      setIsPhotoSheetOpen(false);
      const updated = await ProfileService.deleteAvatar(userId);
      setProfile(updated);
      onProfileUpdated(updated);
      showToast('Profile photo removed');
    } catch (err) {
      console.warn('Failed to remove avatar:', err);
    }
  };

  // 4. Open Field Editor Sheet
  const handleOpenFieldEditor = (field: 'name' | 'bio') => {
    setActiveEditField(field);
    setFieldValue(field === 'name' ? profile.name : profile.bio || '');
  };

  // 5. Save Field Value (Name or Bio)
  const handleSaveField = async () => {
    if (!activeEditField) return;

    if (activeEditField === 'name' && !fieldValue.trim()) {
      showToast({
        title: 'Name required',
        description: 'Your display name cannot be blank.',
        type: 'error',
      });
      return;
    }

    try {
      setSavingField(true);
      const updates =
        activeEditField === 'name'
          ? { name: fieldValue.trim() }
          : { bio: fieldValue.trim() };

      const updated = await ProfileService.saveProfile(updates, userId);
      setProfile(updated);
      onProfileUpdated(updated);
      setActiveEditField(null);
      showToast(`${activeEditField === 'name' ? 'Name' : 'About'} updated`);
    } catch (err) {
      console.warn('Failed to update field:', err);
      showToast({
        title: 'Save failed',
        description: 'Could not sync your profile updates right now.',
        type: 'error',
      });
    } finally {
      setSavingField(false);
    }
  };

  // 6. Reset Profile Data
  const handleResetProfile = async () => {
    try {
      const reset = await ProfileService.deleteProfile(userId);
      setProfile(reset);
      onProfileUpdated(reset);
      setShowResetConfirm(false);
      showToast('Profile reset to default settings');
    } catch (err) {
      console.warn('Failed to reset profile:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.canvas }]}>
      {/* ================= 1. WHATSAPP-STYLE APP BAR ================= */}
      <View style={[styles.appBar, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.textMain} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: theme.textMain }]}>Profile</Text>
        <View style={styles.appBarSpacer} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 2. HERO CENTERED AVATAR WITH CAMERA BADGE ================= */}
        <View style={styles.heroAvatarContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsPhotoSheetOpen(true)}
            style={styles.avatarTouchWrapper}
          >
            {/* 120px Circular Avatar */}
            <View
              style={[
                styles.largeAvatarCircle,
                {
                  borderColor: theme.borderSubtle,
                  backgroundColor: theme.surfaceSubtle,
                },
              ]}
            >
              <Image
                source={
                  profile.avatarUri
                    ? { uri: profile.avatarUri }
                    : require('../../assets/esther_avatar.png')
                }
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            {/* WhatsApp Floating Camera Badge */}
            <View
              style={[
                styles.cameraBadge,
                {
                  backgroundColor: theme.brand,
                  borderColor: theme.canvas,
                },
              ]}
            >
              <Camera size={19} color={theme.forestDark} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 3. WHATSAPP IDENTITY LIST ROWS ================= */}
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Row 1: Name */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenFieldEditor('name')}
            style={styles.infoRow}
          >
            <View style={styles.infoRowLeft}>
              <View style={[styles.rowIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
                <User size={19} color={theme.textDim} strokeWidth={2} />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: theme.textDim }]}>Name</Text>
                <Text style={[styles.rowValue, { color: theme.textMain }]}>{profile.name}</Text>
              </View>
            </View>
            <Pencil size={17} color={theme.isDark ? theme.brand : theme.textDim} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={[styles.captionNote, { color: theme.textMuted }]}>
            This is not your username or pin. This name will be visible to your Sinance contacts.
          </Text>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 2: About / Bio */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenFieldEditor('bio')}
            style={styles.infoRow}
          >
            <View style={styles.infoRowLeft}>
              <View style={[styles.rowIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
                <Info size={19} color={theme.textDim} strokeWidth={2} />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: theme.textDim }]}>About</Text>
                <Text style={[styles.rowValue, { color: theme.textMain }]} numberOfLines={2}>
                  {profile.bio || 'Personal finance enthusiast & investor'}
                </Text>
              </View>
            </View>
            <Pencil size={17} color={theme.isDark ? theme.brand : theme.textDim} strokeWidth={2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Row 3: Email / Account Sync */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <View style={[styles.rowIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
                <Mail size={19} color={theme.textDim} strokeWidth={2} />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: theme.textDim }]}>Email</Text>
                <Text style={[styles.rowValue, { color: theme.textMain }]}>{profile.email}</Text>
              </View>
            </View>
            <View style={[styles.verifiedPill, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
              <Sparkles size={11} color={theme.isDark ? theme.brand : '#10B981'} />
              <Text style={[styles.verifiedPillText, { color: theme.textDim }]}>Verified</Text>
            </View>
          </View>
        </View>

        {/* ================= 4. RESET / DELETE PROFILE DATA ================= */}
        <View
          style={[
            styles.resetSection,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {showResetConfirm ? (
            <View style={styles.resetConfirmContainer}>
              <View style={styles.resetHeaderRow}>
                <AlertTriangle size={16} color="#DC2626" />
                <Text style={[styles.resetConfirmTitle, { color: theme.textMain }]}>Reset Profile?</Text>
              </View>
              <Text style={[styles.resetConfirmDesc, { color: theme.textDim }]}>
                This will clear your customized profile picture, name, and local preferences.
              </Text>
              <View style={styles.resetButtonsRow}>
                <TouchableOpacity
                  onPress={handleResetProfile}
                  style={[styles.resetActionBtn, { backgroundColor: '#DC2626' }]}
                >
                  <Trash2 size={14} color="#FFFFFF" />
                  <Text style={styles.resetActionBtnText}>Yes, Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowResetConfirm(false)}
                  style={[styles.resetCancelBtn, { borderColor: theme.borderSubtle }]}
                >
                  <Text style={[styles.resetCancelBtnText, { color: theme.textMain }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowResetConfirm(true)}
              style={styles.resetTriggerRow}
            >
              <Trash2 size={17} color={theme.textDim} strokeWidth={2} />
              <Text style={[styles.resetTriggerText, { color: theme.textDim }]}>Reset Profile Data</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ================= 5. WHATSAPP PHOTO ACTION SHEET ================= */}
      <Modal visible={isPhotoSheetOpen} animationType="slide" transparent onRequestClose={() => setIsPhotoSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsPhotoSheetOpen(false)}
          />
          <View style={[styles.actionSheetContent, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: theme.textMain }]}>Profile photo</Text>

            <View style={styles.photoOptionsGrid}>
              {/* Option A: Camera */}
              <TouchableOpacity
                style={styles.photoOptionItem}
                onPress={handleCaptureFromCamera}
                activeOpacity={0.8}
              >
                <View style={[styles.photoOptionIconCircle, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <Camera size={24} color={theme.isDark ? theme.brand : theme.forestDark} strokeWidth={2} />
                </View>
                <Text style={[styles.photoOptionLabel, { color: theme.textMain }]}>Camera</Text>
              </TouchableOpacity>

              {/* Option B: Gallery */}
              <TouchableOpacity
                style={styles.photoOptionItem}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
              >
                <View style={[styles.photoOptionIconCircle, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <ImageIcon size={24} color={theme.isDark ? theme.brand : theme.forestDark} strokeWidth={2} />
                </View>
                <Text style={[styles.photoOptionLabel, { color: theme.textMain }]}>Gallery</Text>
              </TouchableOpacity>

              {/* Option C: Remove Photo (if present) */}
              {profile.avatarUri && (
                <TouchableOpacity
                  style={styles.photoOptionItem}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.8}
                >
                  <View style={[styles.photoOptionIconCircle, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                    <Trash2 size={24} color="#DC2626" strokeWidth={2} />
                  </View>
                  <Text style={[styles.photoOptionLabel, { color: '#DC2626' }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setIsPhotoSheetOpen(false)}
              style={[styles.sheetCancelButton, { borderColor: theme.borderSubtle, backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.sheetCancelText, { color: theme.textMain }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= 6. WHATSAPP FOCUSED TEXT INPUT SHEET ================= */}
      <Modal visible={activeEditField !== null} animationType="slide" transparent onRequestClose={() => setActiveEditField(null)}>
        <View style={styles.sheetOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidWrapper}
          >
            <View style={[styles.fieldEditSheet, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
              {/* Header */}
              <View style={[styles.fieldEditHeader, { borderBottomColor: theme.borderSubtle }]}>
                <Text style={[styles.fieldEditTitle, { color: theme.textMain }]}>
                  {activeEditField === 'name' ? 'Enter your name' : 'Enter about status'}
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveEditField(null)}
                  style={[styles.fieldEditCloseBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={theme.textMain} />
                </TouchableOpacity>
              </View>

              {/* Input container */}
              <View style={styles.fieldEditBody}>
                <View style={[styles.fieldInputWrapper, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <TextInput
                    value={fieldValue}
                    onChangeText={setFieldValue}
                    maxLength={activeEditField === 'name' ? 25 : 80}
                    placeholder={activeEditField === 'name' ? 'Your name' : 'What is on your mind?'}
                    placeholderTextColor={theme.textDim}
                    style={[styles.fieldTextInput, { color: theme.textMain }]}
                    autoFocus
                  />
                  {fieldValue.length > 0 && (
                    <TouchableOpacity onPress={() => setFieldValue('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <X size={15} color={theme.textDim} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Character Counter & Helper */}
                <View style={styles.counterRow}>
                  <Text style={[styles.counterCaption, { color: theme.textMuted }]}>
                    {activeEditField === 'name'
                      ? 'Visible to your account & connected members.'
                      : 'Share a brief financial note or status.'}
                  </Text>
                  <Text style={[styles.counterText, { color: theme.textDim }]}>
                    {fieldValue.length} / {activeEditField === 'name' ? 25 : 80}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.fieldActionRow}>
                  <TouchableOpacity
                    onPress={() => setActiveEditField(null)}
                    style={[styles.fieldCancelBtn, { borderColor: theme.borderSubtle }]}
                  >
                    <Text style={[styles.fieldCancelText, { color: theme.textMain }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveField}
                    disabled={savingField}
                    style={[styles.fieldSaveBtn, { backgroundColor: theme.brand }]}
                  >
                    {savingField ? (
                      <ActivityIndicator color={theme.forestDark} size="small" />
                    ) : (
                      <>
                        <Check size={16} color={theme.forestDark} strokeWidth={2.4} />
                        <Text style={[styles.fieldSaveText, { color: theme.forestDark }]}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  appBarSpacer: {
    width: 38,
  },
  scrollArea: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'stretch',
  },
  toastBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
    alignSelf: 'stretch',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroAvatarContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  avatarTouchWrapper: {
    position: 'relative',
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupedCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  captionNote: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    paddingLeft: 50,
    paddingRight: 8,
    paddingBottom: 12,
    marginTop: -4,
  },
  rowDivider: {
    height: 1,
    width: '100%',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resetSection: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  resetTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  resetTriggerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resetConfirmContainer: {
    padding: 16,
  },
  resetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  resetConfirmTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  resetConfirmDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  resetButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resetActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resetActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetCancelBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Sheet styles
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
  },
  actionSheetContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#88888844',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  photoOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  photoOptionItem: {
    alignItems: 'center',
    gap: 8,
  },
  photoOptionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetCancelButton: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Field Edit Sheet
  keyboardAvoidWrapper: {
    width: '100%',
  },
  fieldEditSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  fieldEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  fieldEditTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  fieldEditCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldEditBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  fieldInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  fieldTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  counterCaption: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    paddingRight: 10,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldSaveBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fieldSaveText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
