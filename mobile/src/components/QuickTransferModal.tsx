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
import { X, ArrowDown, ArrowUp, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { FinanceService, Account, Transaction } from '../services/financeService';
import { useAuth } from '../context/AuthContext';

interface QuickTransferModalProps {
  visible: boolean;
  mode: 'deposit' | 'withdrawal';
  accounts: Account[];
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

export const QuickTransferModal: React.FC<QuickTransferModalProps> = ({
  visible,
  mode,
  accounts,
  onClose,
  onSuccess,
}) => {
  const theme = useAppTheme();
  const { user } = useAuth();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync default account if empty
  React.useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!selectedAccountId) {
      setErrorMsg('Please select an account.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const userId = user?.id || 'cd46d24f-b343-4a04-a4c0-b6ae53da9373';
      const txType = mode === 'deposit' ? 'income' : 'expense';

      const { data, error } = await FinanceService.recordTransaction({
        user_id: userId,
        account_id: selectedAccountId,
        amount: numAmount,
        type: txType,
        description: description.trim() || (mode === 'deposit' ? 'Direct Deposit' : 'Manual Withdrawal'),
      });

      if (error) throw error;
      if (data) {
        onSuccess(data);
        setAmount('');
        setDescription('');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDeposit = mode === 'deposit';

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
              <View
                style={[
                  styles.headerIconDisc,
                  { backgroundColor: isDeposit ? theme.brand : theme.forestBadgeBg },
                ]}
              >
                {isDeposit ? (
                  <ArrowDown size={18} color={theme.forestDark} strokeWidth={2.6} />
                ) : (
                  <ArrowUp size={18} color={theme.brand} strokeWidth={2.6} />
                )}
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textMain }]}>
                  {isDeposit ? 'Record Deposit' : 'Record Withdrawal'}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Instantly updates account balance in Cloud
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
              <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={[styles.errorText, { color: '#EF4444' }]}>{errorMsg}</Text>
              </View>
            )}

            {/* Target Account Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Select Account</Text>
              <View style={styles.accountList}>
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setSelectedAccountId(acc.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.accountCardItem,
                        {
                          backgroundColor: isSelected ? theme.surfaceSubtle : theme.surface,
                          borderColor: isSelected ? (theme.isDark ? '#23F07D' : '#10B981') : theme.borderSubtle,
                        },
                      ]}
                    >
                      <View style={styles.accItemLeft}>
                        <View
                          style={[
                            styles.accColorDot,
                            { backgroundColor: acc.color || (theme.isDark ? '#23F07D' : '#10B981') },
                          ]}
                        />
                        <View>
                          <Text style={[styles.accItemName, { color: theme.textMain }]}>
                            {acc.name}
                          </Text>
                          <Text style={[styles.accItemType, { color: theme.textMuted }]}>
                            {acc.type}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.accItemBalance, { color: theme.textMain }]}>
                        ₹{Number(acc.balance).toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Amount (₹ INR)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                    color: theme.textMain,
                  },
                ]}
                placeholder="e.g. 5000"
                placeholderTextColor={theme.textDim}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Description / Note</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                    color: theme.textMain,
                  },
                ]}
                placeholder={isDeposit ? 'e.g. Freelance bonus, Salary' : 'e.g. Dinner, Shopping'}
                placeholderTextColor={theme.textDim}
                value={description}
                onChangeText={setDescription}
              />
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
                  {isDeposit ? 'Confirm Cloud Deposit' : 'Confirm Cloud Withdrawal'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityRow}>
              <ShieldCheck size={13} color={theme.textDim} />
              <Text style={[styles.securityText, { color: theme.textDim }]}>
                Synchronized with Supabase & Web Dashboard
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
  accountList: {
    gap: 8,
  },
  accountCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  accItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  accItemType: {
    fontSize: 12,
    fontWeight: '500',
  },
  accItemBalance: {
    fontSize: 14,
    fontWeight: '800',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
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
