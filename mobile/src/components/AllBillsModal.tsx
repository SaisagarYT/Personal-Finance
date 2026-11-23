import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import {
  X,
  Plus,
  Tv,
  Wifi,
  Zap,
  Music,
  Smartphone,
  Dumbbell,
  Cloud,
  CreditCard,
  Home,
  Receipt,
  Check,
  Calendar,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { useToast } from '../context/ToastContext';
import { StatusSymbol } from './StatusSymbol';
import { BillCategory, BillItem } from './UpcomingBillsSection';
import { SubscriptionService, formatShortDate, computeDueCountdown } from '../services/subscriptionService';

interface AllBillsModalProps {
  visible: boolean;
  onClose: () => void;
  bills: BillItem[];
  onBillsUpdated?: () => void;
  userId?: string;
}

const CATEGORY_OPTIONS: { id: BillCategory; label: string }[] = [
  { id: 'streaming', label: 'Streaming' },
  { id: 'internet', label: 'Internet' },
  { id: 'utility', label: 'Utility' },
  { id: 'music', label: 'Music' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'emi', label: 'EMI' },
  { id: 'housing', label: 'Rent/Housing' },
];

export const AllBillsModal: React.FC<AllBillsModalProps> = ({
  visible,
  onClose,
  bills,
  onBillsUpdated,
  userId,
}) => {
  const theme = useAppTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'autopay'>('all');
  const [selectedBill, setSelectedBill] = useState<BillItem | null>(null);
  const [isAddingBill, setIsAddingBill] = useState(false);

  // New bill form state
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillCategory, setNewBillCategory] = useState<BillCategory>('streaming');
  const [newBillDueDate, setNewBillDueDate] = useState('');
  const [newBillAutoPay, setNewBillAutoPay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryIcon = (category: BillCategory, size = 18, color = theme.textMain) => {
    switch (category) {
      case 'streaming':
        return <Tv size={size} color={color} strokeWidth={2.2} />;
      case 'internet':
        return <Wifi size={size} color={color} strokeWidth={2.2} />;
      case 'utility':
        return <Zap size={size} color={color} strokeWidth={2.2} />;
      case 'music':
        return <Music size={size} color={color} strokeWidth={2.2} />;
      case 'mobile':
        return <Smartphone size={size} color={color} strokeWidth={2.2} />;
      case 'fitness':
        return <Dumbbell size={size} color={color} strokeWidth={2.2} />;
      case 'cloud':
        return <Cloud size={size} color={color} strokeWidth={2.2} />;
      case 'emi':
        return <CreditCard size={size} color={color} strokeWidth={2.2} />;
      case 'housing':
        return <Home size={size} color={color} strokeWidth={2.2} />;
      default:
        return <Receipt size={size} color={color} strokeWidth={2.2} />;
    }
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    if (activeTab === 'autopay') return b.isAutoPay;
    if (activeTab === 'unpaid') return !b.isAutoPay;
    return true;
  });

  // Calculate total monthly obligation
  const totalMonthlyCommitment = bills.reduce((sum, b) => {
    const rawNum = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
    return sum + rawNum;
  }, 0);

  // Handle Mark as Paid
  const handleMarkAsPaid = async (bill: BillItem) => {
    try {
      const res = await SubscriptionService.markAsPaid(bill);
      if (res.error) throw new Error(res.error);

      showToast({
        title: `${bill.name} marked as paid!`,
        description: `Next due date scheduled for ${res.nextDueDate}`,
        type: 'success',
        actionLabel: 'Got It!',
      });
      setSelectedBill(null);
      onBillsUpdated?.();
    } catch {
      showToast({
        title: 'Could not update bill',
        description: 'Failed to record bill payment.',
        type: 'error',
        actionLabel: 'Fixing!',
      });
    }
  };

  // Handle Delete / Cancel Bill
  const handleDeleteBill = async (bill: BillItem) => {
    try {
      const res = await SubscriptionService.deleteSubscription(bill.id);
      if (!res.success && res.error) throw new Error(res.error);

      showToast({
        title: `${bill.name} removed`,
        description: 'Recurring bill cancelled from your list',
        type: 'info',
        actionLabel: 'Got It!',
      });
      setSelectedBill(null);
      onBillsUpdated?.();
    } catch {
      showToast({
        title: 'Failed to delete bill',
        description: 'Could not remove this bill right now.',
        type: 'error',
      });
    }
  };

  // Handle Toggle AutoPay
  const handleToggleAutoPay = async (bill: BillItem) => {
    try {
      const nextState = !bill.isAutoPay;
      const res = await SubscriptionService.toggleAutoPay(bill.id, nextState);
      if (!res.success && res.error) throw new Error(res.error);

      showToast({
        title: `${bill.name} updated`,
        description: nextState ? 'Auto-pay enabled' : 'Auto-pay disabled',
        type: 'success',
      });
      if (selectedBill && selectedBill.id === bill.id) {
        setSelectedBill({ ...selectedBill, isAutoPay: nextState });
      }
      onBillsUpdated?.();
    } catch {
      showToast({
        title: 'Could not toggle auto-pay',
        description: 'Failed to update auto-pay preference.',
        type: 'error',
      });
    }
  };

  // Handle Add New Bill
  const handleCreateBill = async () => {
    if (!newBillName.trim()) {
      showToast({
        title: 'Bill name required',
        description: 'Please enter a name for the subscription or bill.',
        type: 'error',
      });
      return;
    }

    const amountNum = parseFloat(newBillAmount);
    if (!amountNum || amountNum <= 0) {
      showToast({
        title: 'Valid amount required',
        description: 'Please enter a billing amount greater than 0.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      // default next due date: today + 7 days if not provided
      let dueIso = newBillDueDate.trim();
      if (!dueIso || !dueIso.includes('-')) {
        const nextWk = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        dueIso = nextWk.toISOString().split('T')[0];
      }

      const res = await SubscriptionService.createSubscription({
        user_id: userId || 'anonymous_user',
        name: newBillName.trim(),
        category: newBillCategory,
        amount: amountNum,
        currency: 'INR',
        billing_cycle: 'monthly',
        next_due_date: dueIso,
        is_auto_pay: newBillAutoPay,
      });

      if (res.error) throw res.error;

      showToast({
        title: 'New bill added!',
        description: `${newBillName} (₹${amountNum.toFixed(2)}) is tracked in your upcoming obligations.`,
        type: 'success',
        actionLabel: 'Got It!',
      });

      // Reset form
      setNewBillName('');
      setNewBillAmount('');
      setNewBillDueDate('');
      setNewBillAutoPay(false);
      setIsAddingBill(false);
      onBillsUpdated?.();
    } catch {
      showToast({
        title: 'Failed to add bill',
        description: 'An unexpected error occurred while saving the bill.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={[styles.sheetContainer, { backgroundColor: theme.canvas }]}>
          {/* Top Sheet Drag Pill */}
          <View style={styles.sheetHandleGutter}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.borderSubtle }]} />
          </View>

          {/* Modal Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.sheetTitle, { color: theme.textMain }]}>Upcoming Bills</Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle },
                ]}
              >
                <Text style={[styles.countBadgeText, { color: theme.textDim }]}>
                  {bills.length}
                </Text>
              </View>
            </View>

            <View style={styles.headerActionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsAddingBill(!isAddingBill)}
                style={[
                  styles.headerAddButton,
                  {
                    backgroundColor: isAddingBill
                      ? (theme.isDark ? theme.brand : theme.forestDark)
                      : theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Plus
                  size={18}
                  color={
                    isAddingBill
                      ? (theme.isDark ? theme.forestDark : '#FFFFFF')
                      : theme.textMain
                  }
                  strokeWidth={2.4}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={[
                  styles.headerCloseButton,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <X size={18} color={theme.textMain} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.sheetBody}
            contentContainerStyle={styles.sheetBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ================= 1. MONTHLY SPEND OBLIGATION BANNER ================= */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={styles.summaryLeft}>
                <Text style={[styles.summaryLabel, { color: theme.textDim }]}>
                  Total Monthly Recurring
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.textMain }]}>
                  ₹{totalMonthlyCommitment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryPill,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <StatusSymbol size={11} color={theme.isDark ? theme.brand : theme.forestDark} strokeWidth={2.4} />
                <Text
                  style={[
                    styles.summaryPillText,
                    { color: theme.isDark ? theme.brand : theme.forestDark },
                  ]}
                >
                  Tracked
                </Text>
              </View>
            </View>

            {/* ================= 2. ADD BILL FORM (EXPANDABLE) ================= */}
            {isAddingBill && (
              <View
                style={[
                  styles.addBillFormCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.formHeading, { color: theme.textMain }]}>Add New Bill</Text>

                {/* Bill Name */}
                <Text style={[styles.fieldLabel, { color: theme.textDim }]}>Bill / Subscription Name</Text>
                <TextInput
                  placeholder="e.g. Spotify Family, Gym Membership"
                  placeholderTextColor={theme.textDim}
                  value={newBillName}
                  onChangeText={setNewBillName}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                      color: theme.textMain,
                    },
                  ]}
                />

                {/* Amount */}
                <Text style={[styles.fieldLabel, { color: theme.textDim }]}>Amount (₹ INR)</Text>
                <TextInput
                  placeholder="e.g. 499.00"
                  placeholderTextColor={theme.textDim}
                  value={newBillAmount}
                  onChangeText={setNewBillAmount}
                  keyboardType="numeric"
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                      color: theme.textMain,
                    },
                  ]}
                />

                {/* Category Selector */}
                <Text style={[styles.fieldLabel, { color: theme.textDim }]}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                >
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = newBillCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.7}
                        onPress={() => setNewBillCategory(cat.id)}
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: isSelected
                              ? (theme.isDark ? theme.brand : theme.forestDark)
                              : theme.surfaceSubtle,
                            borderColor: theme.borderSubtle,
                          },
                        ]}
                      >
                        {getCategoryIcon(
                          cat.id,
                          14,
                          isSelected
                            ? (theme.isDark ? theme.forestDark : '#FFFFFF')
                            : theme.textDim
                        )}
                        <Text
                          style={[
                            styles.categoryPillText,
                            {
                              color: isSelected
                                ? (theme.isDark ? theme.forestDark : '#FFFFFF')
                                : theme.textMain,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Next Due Date */}
                <Text style={[styles.fieldLabel, { color: theme.textDim }]}>
                  Next Due Date (YYYY-MM-DD or leave blank for +7 days)
                </Text>
                <TextInput
                  placeholder="e.g. 2026-11-30"
                  placeholderTextColor={theme.textDim}
                  value={newBillDueDate}
                  onChangeText={setNewBillDueDate}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                      color: theme.textMain,
                    },
                  ]}
                />

                {/* Auto Pay Checkbox Row */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setNewBillAutoPay(!newBillAutoPay)}
                  style={styles.autoPayRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: newBillAutoPay
                          ? (theme.isDark ? theme.brand : theme.forestDark)
                          : theme.surfaceSubtle,
                        borderColor: theme.borderSubtle,
                      },
                    ]}
                  >
                    {newBillAutoPay && (
                      <Check
                        size={12}
                        color={theme.isDark ? theme.forestDark : '#FFFFFF'}
                        strokeWidth={3}
                      />
                    )}
                  </View>
                  <Text style={[styles.autoPayText, { color: theme.textMain }]}>
                    Auto-pay enabled with linked bank / card
                  </Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.formActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsAddingBill(false)}
                    style={[
                      styles.cancelButton,
                      {
                        backgroundColor: theme.surfaceSubtle,
                        borderColor: theme.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.textDim }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCreateBill}
                    disabled={isSubmitting}
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: theme.isDark ? theme.brand : theme.forestDark,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.saveButtonText,
                        { color: theme.isDark ? theme.forestDark : '#FFFFFF' },
                      ]}
                    >
                      {isSubmitting ? 'Saving...' : 'Add Bill'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= 3. SEGMENTED FILTER PILLS ================= */}
            <View
              style={[
                styles.segmentContainer,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('all')}
                style={[
                  styles.segmentTab,
                  activeTab === 'all' && [
                    styles.segmentTabActive,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: activeTab === 'all' ? theme.textMain : theme.textDim,
                      fontWeight: activeTab === 'all' ? '700' : '500',
                    },
                  ]}
                >
                  All ({bills.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('autopay')}
                style={[
                  styles.segmentTab,
                  activeTab === 'autopay' && [
                    styles.segmentTabActive,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: activeTab === 'autopay' ? theme.textMain : theme.textDim,
                      fontWeight: activeTab === 'autopay' ? '700' : '500',
                    },
                  ]}
                >
                  Auto-Pay
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('unpaid')}
                style={[
                  styles.segmentTab,
                  activeTab === 'unpaid' && [
                    styles.segmentTabActive,
                    { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: activeTab === 'unpaid' ? theme.textMain : theme.textDim,
                      fontWeight: activeTab === 'unpaid' ? '700' : '500',
                    },
                  ]}
                >
                  Manual Pay
                </Text>
              </TouchableOpacity>
            </View>

            {/* ================= 4. BILLS LIST ================= */}
            <View
              style={[
                styles.billsCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {filteredBills.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Receipt size={32} color={theme.textDim} strokeWidth={1.5} />
                  <Text style={[styles.emptyText, { color: theme.textDim }]}>
                    No bills found in this filter.
                  </Text>
                </View>
              ) : (
                filteredBills.map((bill, index) => {
                  const isLast = index === filteredBills.length - 1;
                  const isDueSoon =
                    bill.dueCountdown.includes('today') ||
                    bill.dueCountdown.includes('tomorrow') ||
                    bill.dueCountdown.includes('3 days');

                  return (
                    <React.Fragment key={bill.id}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedBill(bill)}
                        style={styles.billRow}
                      >
                        <View style={styles.billRowLeft}>
                          <View
                            style={[
                              styles.iconContainer,
                              { backgroundColor: theme.surfaceSubtle },
                            ]}
                          >
                            {getCategoryIcon(bill.category)}
                          </View>
                          <View style={styles.billInfo}>
                            <Text
                              style={[styles.billName, { color: theme.textMain }]}
                              numberOfLines={1}
                            >
                              {bill.name}
                            </Text>
                            <View style={styles.dueRow}>
                              <Text
                                style={[
                                  styles.countdownText,
                                  {
                                    color: isDueSoon
                                      ? (theme.isDark ? '#F59E0B' : '#D97706')
                                      : theme.textDim,
                                    fontWeight: isDueSoon ? '700' : '500',
                                  },
                                ]}
                              >
                                {bill.dueCountdown}
                              </Text>
                              <Text style={[styles.dotSeparator, { color: theme.textDim }]}>•</Text>
                              <Text style={[styles.dueDateText, { color: theme.textDim }]}>
                                {bill.dueDate}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.billRowRight}>
                          <Text style={[styles.billAmount, { color: theme.textMain }]}>
                            {bill.amount}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: theme.surfaceSubtle,
                                borderColor: theme.borderSubtle,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.statusDot,
                                {
                                  backgroundColor: bill.isAutoPay
                                    ? (theme.isDark ? theme.brand : '#059669')
                                    : theme.textDim,
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusBadgeText,
                                {
                                  color: theme.textMain,
                                },
                              ]}
                            >
                              {bill.isAutoPay ? 'Auto-pay' : 'Manual'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {!isLast && (
                        <View
                          style={[styles.rowDivider, { backgroundColor: theme.borderSubtle }]}
                        />
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* ================= 5. FOCUSED BILL ACTION SHEET ================= */}
          {selectedBill && (
            <View style={styles.detailOverlay}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setSelectedBill(null)}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  styles.detailCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <View style={styles.detailHeader}>
                  <View style={styles.detailHeaderLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: theme.surfaceSubtle },
                      ]}
                    >
                      {getCategoryIcon(selectedBill.category, 20)}
                    </View>
                    <View>
                      <Text style={[styles.detailTitle, { color: theme.textMain }]}>
                        {selectedBill.name}
                      </Text>
                      <Text style={[styles.detailSubtitle, { color: theme.textDim }]}>
                        {selectedBill.dueDate} • {selectedBill.dueCountdown}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.detailAmount, { color: theme.textMain }]}>
                    {selectedBill.amount}
                  </Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.detailActionGrid}>
                  {/* 1. Mark as Paid */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleMarkAsPaid(selectedBill)}
                    style={[
                      styles.actionGridButton,
                      {
                        backgroundColor: theme.isDark ? theme.brand : theme.forestDark,
                      },
                    ]}
                  >
                    <CheckCircle2
                      size={18}
                      color={theme.isDark ? theme.forestDark : '#FFFFFF'}
                      strokeWidth={2.4}
                    />
                    <Text
                      style={[
                        styles.actionGridButtonText,
                        { color: theme.isDark ? theme.forestDark : '#FFFFFF' },
                      ]}
                    >
                      Mark as Paid
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Toggle Auto-Pay */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleToggleAutoPay(selectedBill)}
                    style={[
                      styles.actionGridSecondary,
                      {
                        backgroundColor: theme.surfaceSubtle,
                        borderColor: theme.borderSubtle,
                      },
                    ]}
                  >
                    <CreditCard size={17} color={theme.textMain} strokeWidth={2} />
                    <Text style={[styles.actionGridSecondaryText, { color: theme.textMain }]}>
                      {selectedBill.isAutoPay ? 'Disable Auto-Pay' : 'Enable Auto-Pay'}
                    </Text>
                  </TouchableOpacity>

                  {/* 3. Delete Bill */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDeleteBill(selectedBill)}
                    style={[
                      styles.actionGridSecondary,
                      {
                        backgroundColor: theme.isDark ? '#2E1515' : '#FEE2E2',
                        borderColor: '#EF4444',
                      },
                    ]}
                  >
                    <Trash2 size={17} color="#EF4444" strokeWidth={2} />
                    <Text style={[styles.actionGridSecondaryText, { color: '#EF4444' }]}>
                      Cancel / Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '92%',
    height: '92%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  sheetHandleGutter: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    flex: 1,
  },
  sheetBodyContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryLeft: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  addBillFormCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  formHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  inputField: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
  },
  autoPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoPayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  formActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12.5,
  },
  billsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  billRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billInfo: {
    flex: 1,
    gap: 3,
  },
  billName: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  countdownText: {
    fontSize: 12,
  },
  dotSeparator: {
    fontSize: 12,
  },
  dueDateText: {
    fontSize: 12,
  },
  billRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  billAmount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  rowDivider: {
    height: 1,
    marginLeft: 68,
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  detailCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  detailAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  detailActionGrid: {
    gap: 10,
  },
  actionGridButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  actionGridButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionGridSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionGridSecondaryText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
