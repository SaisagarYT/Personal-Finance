import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  ArrowLeft,
  DollarSign,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Plus,
  CreditCard,
  Building,
  Wallet,
  ShieldCheck,
  Cloud,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { Account, Transaction } from '../services/financeService';
import { AddAccountModal } from '../components/AddAccountModal';
import { QuickTransferModal } from '../components/QuickTransferModal';
import { StatusSymbol } from '../components/StatusSymbol';

interface SinancePocketScreenProps {
  onBack: () => void;
  balance?: string;
  availableBalance?: string;
  accounts?: Account[];
  transactions?: Transaction[];
  onAccountCreated?: (account: Account) => void;
  onTransactionAdded?: (transaction: Transaction) => void;
}

export const SinancePocketScreen: React.FC<SinancePocketScreenProps> = ({
  onBack,
  balance = '₹2,40,250.00',
  availableBalance = '₹0 Available',
  accounts = [],
  transactions = [],
  onAccountCreated,
  onTransactionAdded,
}) => {
  const theme = useAppTheme();
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'moreInfo'>('activity');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<'deposit' | 'withdrawal' | null>(null);

  // Fallback demo accounts if empty
  const displayAccounts: Account[] = accounts.length > 0 ? accounts : [
    {
      id: '1',
      user_id: 'demo',
      name: 'HDFC Salary Checking',
      type: 'Checking',
      balance: 85450,
      currency: 'INR',
      color: '#141414',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'demo',
      name: 'SBI Savings Account',
      type: 'Savings',
      balance: 150000,
      currency: 'INR',
      color: '#141414',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: 'demo',
      name: 'Daily Cash & UPI',
      type: 'Cash',
      balance: 4800,
      currency: 'INR',
      color: '#141414',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'Checking':
        return <Building size={16} color={theme.textMain} strokeWidth={2.2} />;
      case 'Savings':
        return <Wallet size={16} color={theme.textMain} strokeWidth={2.2} />;
      case 'Credit Card':
        return <CreditCard size={16} color={theme.textMain} strokeWidth={2.2} />;
      default:
        return <DollarSign size={16} color={theme.textMain} strokeWidth={2.2} />;
    }
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.canvas }]}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.canvas }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ================= TOP GREEN HERO CARD ================= */}
        <View style={[styles.heroCard, { backgroundColor: theme.heroCardBg }]}>
          {/* Top navigation row */}
          <View style={styles.topNavRow}>
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={[styles.backButton, { backgroundColor: theme.forestBadgeBg }]}
            >
              <ArrowLeft size={18} color={theme.forestDark} strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Centered Pocket Brand */}
            <View style={styles.pocketHeaderCenter}>
              <View style={[styles.pocketIconDisc, { backgroundColor: theme.forestDark }]}>
                <DollarSign size={13} color="#FFFFFF" strokeWidth={2.8} />
              </View>
              <Text style={[styles.pocketTitle, { color: theme.forestDark }]}>Pocket & Accounts</Text>
            </View>

            {/* Add Account Shortcut Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAddAccountOpen(true)}
              style={[styles.addAccTopBtn, { backgroundColor: theme.forestBadgeBg }]}
            >
              <Plus size={18} color={theme.forestDark} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceAmount, { color: theme.forestDark }]}>{balance}</Text>
            <Text style={[styles.availableText, { color: theme.forestMedium }]}>{availableBalance}</Text>
            <View style={[styles.instantBadge, { backgroundColor: theme.forestBadgeBg }]}>
              <Text style={[styles.instantBadgeText, { color: theme.forestMedium }]}>
                Instant Cloud Sync
              </Text>
            </View>
          </View>

          {/* Action Buttons: Deposit & Withdraw */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.depositButton, { backgroundColor: theme.forestDark }]}
              onPress={() => setTransferMode('deposit')}
            >
              <Text style={[styles.depositText, { color: '#FFFFFF' }]}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.withdrawButton, { backgroundColor: theme.forestBadgeBg }]}
              onPress={() => setTransferMode('withdrawal')}
            >
              <Text style={[styles.withdrawText, { color: theme.forestDark }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= ACCOUNTS CAROUSEL SECTION ================= */}
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Connected Accounts</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddAccountOpen(true)}
              style={styles.addAccountLink}
            >
              <Plus size={14} color={theme.textMain} strokeWidth={2.4} />
              <Text style={[styles.addAccountLinkText, { color: theme.textMain }]}>Add Account</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsScroll}
          >
            {displayAccounts.map((acc) => (
              <View
                key={acc.id}
                style={[
                  styles.accountCard,
                  {
                    backgroundColor: theme.cardContainer,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <View style={styles.accTopRow}>
                  <View style={[styles.accIconWrap, { backgroundColor: theme.forestBadgeBg }]}>
                    {getAccountIcon(acc.type)}
                  </View>
                  <View style={[styles.accTypePill, { backgroundColor: theme.surfaceSubtle }]}>
                    <Text style={[styles.accTypePillText, { color: theme.textMuted }]}>
                      {acc.type}
                    </Text>
                  </View>
                </View>

                <View style={styles.accBottom}>
                  <Text
                    style={[styles.accName, { color: theme.textMain }]}
                    numberOfLines={1}
                  >
                    {acc.name}
                  </Text>
                  <Text style={[styles.accBalance, { color: theme.textMain }]}>
                    ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            ))}

            {/* Quick Add Card Item */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddAccountOpen(true)}
              style={[
                styles.addAccountDashedCard,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <View style={[styles.addCardIconCircle, { backgroundColor: theme.surface }]}>
                <Plus size={20} color={theme.textMain} strokeWidth={2.4} />
              </View>
              <Text style={[styles.addCardLabel, { color: theme.textMain }]}>New Account</Text>
              <Text style={[styles.addCardSub, { color: theme.textMuted }]}>Checking / Card</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ================= LOWER CHARCOAL SECTION ================= */}
        <View style={styles.lowerContainer}>
          {/* Sub-Tabs: Activity & More Info */}
          <View style={styles.subTabsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveSubTab('activity')}
              style={styles.subTabButton}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: activeSubTab === 'activity' ? theme.textMain : theme.textDim },
                  activeSubTab === 'activity' && styles.subTabTextActive,
                ]}
              >
                Activity ({transactions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveSubTab('moreInfo')}
              style={styles.subTabButton}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: activeSubTab === 'moreInfo' ? theme.textMain : theme.textDim },
                  activeSubTab === 'moreInfo' && styles.subTabTextActive,
                ]}
              >
                Cloud Details
              </Text>
            </TouchableOpacity>
          </View>

          {activeSubTab === 'activity' ? (
            <>
              {/* Enable Quick Transfers Banner Card */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.quickTransfersCard, { backgroundColor: theme.brand }]}
                onPress={() => setTransferMode('deposit')}
              >
                <View style={styles.quickCardLeft}>
                  <View style={[styles.starDisc, { backgroundColor: theme.forestDark }]}>
                    <StatusSymbol size={15} color={theme.brand} strokeWidth={2.4} />
                  </View>
                  <View style={styles.quickTextWrapper}>
                    <Text style={[styles.quickCardTitle, { color: theme.forestDark }]}>
                      Quick Deposit or Withdraw
                    </Text>
                    <Text style={[styles.quickCardSubtitle, { color: theme.forestDark }]}>
                      PostgreSQL Cloud syncs directly to your Web Dashboard
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.forestDark} strokeWidth={2.4} />
              </TouchableOpacity>

              {/* Transactions List */}
              <Text style={[styles.ledgerMonthHeader, { color: theme.textMain }]}>
                Recent Transactions
              </Text>

              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <View
                      key={tx.id}
                      style={[
                        styles.txRow,
                        {
                          backgroundColor: theme.cardContainer,
                          borderColor: theme.borderSubtle,
                        },
                      ]}
                    >
                      <View style={styles.txLeft}>
                        <View
                          style={[
                            styles.txIconBadge,
                            {
                              backgroundColor: theme.surfaceSubtle,
                              borderColor: theme.borderSubtle,
                            },
                          ]}
                        >
                          {isIncome ? (
                            <ArrowDown size={16} color={theme.isDark ? '#23F07D' : '#059669'} strokeWidth={2.4} />
                          ) : (
                            <ArrowUp size={16} color={theme.textMuted} strokeWidth={2.4} />
                          )}
                        </View>
                        <View style={styles.txTextContainer}>
                          <Text
                            style={[styles.txTitle, { color: theme.textMain }]}
                            numberOfLines={1}
                          >
                            {tx.description || (isIncome ? 'Deposit' : 'Expense')}
                          </Text>
                          <Text style={[styles.txSubtitle, { color: theme.textMuted }]}>
                            {tx.accounts?.name || 'Account'} • {tx.transaction_date}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: isIncome ? (theme.isDark ? '#23F07D' : '#059669') : theme.textMain },
                        ]}
                      >
                        {isIncome ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={[styles.emptyTxBox, { backgroundColor: theme.cardContainer }]}>
                  <Text style={[styles.emptyTxTitle, { color: theme.textMain }]}>
                    No recent transactions yet
                  </Text>
                  <Text style={[styles.emptyTxSub, { color: theme.textMuted }]}>
                    Use the Deposit or Withdraw buttons above to record your first transaction.
                  </Text>
                </View>
              )}
            </>
          ) : (
            /* More Info View */
            <View style={styles.moreInfoContainer}>
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: theme.cardContainer,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Cloud size={20} color={theme.textMain} />
                  <View style={styles.infoRowText}>
                    <Text style={[styles.infoTitle, { color: theme.textMain }]}>
                      Supabase PostgreSQL
                    </Text>
                    <Text style={[styles.infoSub, { color: theme.textMuted }]}>
                      Status: Connected & Live
                    </Text>
                  </View>
                  <CheckCircle2 size={18} color={theme.isDark ? '#23F07D' : '#059669'} />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                <View style={styles.infoRow}>
                  <ShieldCheck size={20} color={theme.textMain} />
                  <View style={styles.infoRowText}>
                    <Text style={[styles.infoTitle, { color: theme.textMain }]}>
                      Row Level Security (RLS)
                    </Text>
                    <Text style={[styles.infoSub, { color: theme.textMuted }]}>
                      Policies strictly isolate each user's financial ledger
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                <View style={styles.infoRow}>
                  <Building size={20} color={theme.textMain} />
                  <View style={styles.infoRowText}>
                    <Text style={[styles.infoTitle, { color: theme.textMain }]}>
                      Web Dashboard Sync
                    </Text>
                    <Text style={[styles.infoSub, { color: theme.textMuted }]}>
                      Changes synchronize immediately with desktop browser
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Account Modal */}
      <AddAccountModal
        visible={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAccountCreated={(newAcc) => {
          onAccountCreated?.(newAcc);
        }}
      />

      {/* Quick Deposit / Withdrawal Modal */}
      {transferMode && (
        <QuickTransferModal
          visible={Boolean(transferMode)}
          mode={transferMode}
          accounts={displayAccounts}
          onClose={() => setTransferMode(null)}
          onSuccess={(newTx) => {
            onTransactionAdded?.(newTx);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroCard: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 22,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAccTopBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pocketIconDisc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 4,
  },
  availableText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  instantBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  instantBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  depositButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositText: {
    fontSize: 15,
    fontWeight: '800',
  },
  withdrawButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawText: {
    fontSize: 15,
    fontWeight: '800',
  },
  accountsSection: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  addAccountLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addAccountLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  accountsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  accountCard: {
    width: 170,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 124,
  },
  accTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  accTypePillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  accBottom: {
    marginTop: 16,
    gap: 2,
  },
  accName: {
    fontSize: 13,
    fontWeight: '700',
  },
  accBalance: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  addAccountDashedCard: {
    width: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 124,
    gap: 4,
  },
  addCardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addCardLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  addCardSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  lowerContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  subTabsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  subTabButton: {
    paddingVertical: 4,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subTabTextActive: {
    fontWeight: '800',
  },
  quickTransfersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  quickCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  starDisc: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrapper: {
    flex: 1,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  quickCardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  ledgerMonthHeader: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTextContainer: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  txSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  emptyTxBox: {
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTxTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTxSub: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  moreInfoContainer: {
    marginTop: 4,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoRowText: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
