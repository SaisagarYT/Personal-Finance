import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, CreditCard, Check, ShieldCheck } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { FinanceService, Account } from '../services/financeService';
import { useAuth } from '../context/AuthContext';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountCreated: (account: Account) => void;
}

const ACCOUNT_TYPES: Account['type'][] = ['Checking', 'Savings', 'Credit Card', 'Cash', 'Investment'];
const COLOR_PRESETS = [
  '#141414', // Obsidian
  '#23F07D', // EcoFin Mint
  '#3B82F6', // Royal Blue
  '#EAB308', // Warm Gold
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onAccountCreated,
}) => {
  const theme = useAppTheme();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Checking');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter an account name.');
      return;
    }

    const numBalance = parseFloat(balance) || 0;
    setLoading(true);
    setErrorMsg(null);

    try {
      const userId = user?.id || 'cd46d24f-b343-4a04-a4c0-b6ae53da9373'; // fallback demo user ID
      const { data, error } = await FinanceService.createAccount({
        user_id: userId,
        name: name.trim(),
        type,
        balance: numBalance,
        currency: 'INR',
        color: selectedColor,
      });

      if (error) throw error;
      if (data) {
        onAccountCreated(data);
        setName('');
        setBalance('');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconDisc, { backgroundColor: theme.brand }]}>
                <CreditCard size={18} color={theme.forestDark} strokeWidth={2.4} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textMain }]}>Add New Account</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Syncs directly to your Supabase cloud
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle },
              ]}
            >
              <X size={18} color={theme.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: theme.forestBadgeBg }]}>
                <Text style={[styles.errorText, { color: theme.brand }]}>{errorMsg}</Text>
              </View>
            )}

            {/* Account Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Account Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                    color: theme.textMain,
                  },
                ]}
                placeholder="e.g. ICICI Salary Account, HDFC Cash"
                placeholderTextColor={theme.textDim}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Account Type Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Account Type</Text>
              <View style={styles.typePillsWrap}>
                {ACCOUNT_TYPES.map((t) => {
                  const isSelected = type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      activeOpacity={0.8}
                      style={[
                        styles.typePill,
                        {
                          backgroundColor: isSelected ? theme.brand : theme.surfaceSubtle,
                          borderColor: isSelected ? theme.brand : theme.borderSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          { color: isSelected ? theme.forestDark : theme.textMuted },
                          isSelected && styles.typePillTextSelected,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Initial Balance */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Initial Balance (₹ INR)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                    color: theme.textMain,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.textDim}
                value={balance}
                onChangeText={setBalance}
                keyboardType="numeric"
              />
            </View>

            {/* Color Accent Presets */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Card Accent Color</Text>
              <View style={styles.colorRow}>
                {COLOR_PRESETS.map((c) => {
                  const isChosen = selectedColor === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setSelectedColor(c)}
                      activeOpacity={0.8}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        isChosen && styles.colorCircleChosen,
                      ]}
                    >
                      {isChosen && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitBtn,
                { backgroundColor: theme.brand },
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.forestDark} size="small" />
              ) : (
                <Text style={[styles.submitBtnText, { color: theme.forestDark }]}>
                  Save Account to Cloud
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityRow}>
              <ShieldCheck size={13} color={theme.brand} />
              <Text style={[styles.securityText, { color: theme.textDim }]}>
                Saved directly to Supabase with PostgreSQL RLS
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconDisc: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    gap: 16,
    paddingBottom: 20,
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  typePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typePillTextSelected: {
    fontWeight: '800',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleChosen: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  submitBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
