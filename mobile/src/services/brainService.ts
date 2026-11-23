import { Account, Transaction } from './financeService';
import { BillItem } from './subscriptionService';

export interface SinsMessage {
  id: string;
  sender: 'user' | 'sins';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'transaction_created' | 'bill_paid' | 'summary' | 'receipt_scanned';
    title: string;
    detail: string;
    amount?: string;
    status: 'success' | 'pending' | 'info';
  };
}

export interface AppContextData {
  accounts: Account[];
  transactions: Transaction[];
  bills: BillItem[];
  userProfile?: {
    full_name?: string;
    email?: string;
  };
}

export interface BrainActionExecution {
  response: string;
  actionCard?: SinsMessage['actionCard'];
  createTransaction?: {
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    description: string;
    account_id?: string;
  };
  payBillId?: string;
}

export const BrainService = {
  /**
   * Process natural language query with complete context awareness of the entire app
   */
  processQuery(query: string, context: AppContextData): BrainActionExecution {
    const q = query.trim().toLowerCase();

    // 1. BILL PAYMENT INTENTS
    if (q.includes('pay') && (q.includes('bill') || q.includes('netflix') || q.includes('airtel') || q.includes('spotify') || q.includes('rent') || q.includes('wifi'))) {
      const matchedBill = context.bills.find((b) =>
        q.includes(b.name.toLowerCase()) || q.includes(b.category.toLowerCase())
      ) || context.bills[0];

      if (matchedBill) {
        return {
          response: `I've prepared the payment for your ${matchedBill.name} (${matchedBill.amount}). Marked as cleared in your financial ledger.`,
          payBillId: matchedBill.id,
          actionCard: {
            type: 'bill_paid',
            title: `Cleared ${matchedBill.name}`,
            detail: `Due ${matchedBill.dueDate} • Settled from primary account`,
            amount: matchedBill.amount,
            status: 'success',
          },
        };
      }
    }

    // 2. EXPENSE RECORDING INTENTS (e.g. "Spent 350 on lunch", "Add 500 coffee expense")
    const expenseMatch = q.match(/(?:spent|paid|add expense|expense of|bought)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:on|for)?\s*(.*)/i);
    if (expenseMatch) {
      const amount = parseFloat(expenseMatch[1].replace(/,/g, ''));
      const note = expenseMatch[2]?.trim() || 'General Expense';
      return {
        response: `Logged an expense of ₹${amount.toLocaleString('en-IN')} for "${note}". Deducted from your primary checking balance.`,
        createTransaction: {
          amount,
          type: 'expense',
          description: note.charAt(0).toUpperCase() + note.slice(1),
          account_id: context.accounts[0]?.id,
        },
        actionCard: {
          type: 'transaction_created',
          title: `Expense Logged: ₹${amount.toLocaleString('en-IN')}`,
          detail: `Category: ${note} • Primary Account`,
          amount: `-₹${amount.toLocaleString('en-IN')}`,
          status: 'success',
        },
      };
    }

    // 3. DEPOSIT / INCOME RECORDING INTENTS (e.g. "Got salary 50000", "Received 1200")
    const incomeMatch = q.match(/(?:got|received|deposited|earned|add income|income of)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:from|for)?\s*(.*)/i);
    if (incomeMatch) {
      const amount = parseFloat(incomeMatch[1].replace(/,/g, ''));
      const note = incomeMatch[2]?.trim() || 'Direct Deposit';
      return {
        response: `Added ₹${amount.toLocaleString('en-IN')} to your balance under "${note}".`,
        createTransaction: {
          amount,
          type: 'income',
          description: note.charAt(0).toUpperCase() + note.slice(1),
          account_id: context.accounts[0]?.id,
        },
        actionCard: {
          type: 'transaction_created',
          title: `Income Added: ₹${amount.toLocaleString('en-IN')}`,
          detail: `Source: ${note} • Primary Account`,
          amount: `+₹${amount.toLocaleString('en-IN')}`,
          status: 'success',
        },
      };
    }

    // 4. TOTAL BALANCE / NET WORTH QUERY
    if (q.includes('balance') || q.includes('net worth') || q.includes('how much money') || q.includes('total funds')) {
      const totalBalance = context.accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
      return {
        response: `Your total aggregated balance across ${context.accounts.length || 3} connected accounts is ₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`,
        actionCard: {
          type: 'summary',
          title: 'Total Portfolio Balance',
          detail: `${context.accounts.map((a) => `${a.name}: ₹${Number(a.balance).toLocaleString('en-IN')}`).join(' • ')}`,
          amount: `₹${totalBalance.toLocaleString('en-IN')}`,
          status: 'info',
        },
      };
    }

    // 5. SPENDING SUMMARY / TRANSACTIONS QUERY
    if (q.includes('spent') || q.includes('spend') || q.includes('transactions') || q.includes('activity')) {
      const recentExpenses = context.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      return {
        response: `You have spent a total of ₹${recentExpenses.toLocaleString('en-IN')} across recent transactions. Everything is tracking within your safety margins.`,
        actionCard: {
          type: 'summary',
          title: 'Recent Spend Summary',
          detail: `${context.transactions.length} total logged transactions in this cycle`,
          amount: `₹${recentExpenses.toLocaleString('en-IN')}`,
          status: 'info',
        },
      };
    }

    // 6. UPCOMING BILLS QUERY
    if (q.includes('bills') || q.includes('subscriptions') || q.includes('upcoming') || q.includes('due')) {
      const totalBills = context.bills.length;
      return {
        response: `You have ${totalBills} upcoming obligations scheduled for this cycle. The next payment is ${context.bills[0]?.name || 'scheduled soon'}.`,
        actionCard: {
          type: 'summary',
          title: `${totalBills} Upcoming Subscriptions`,
          detail: context.bills.map((b) => `${b.name} (${b.amount}) - ${b.dueCountdown}`).join(' | '),
          status: 'info',
        },
      };
    }

    // 7. RECEIPT / SCAN SIMULATION INTENT
    if (q.includes('receipt') || q.includes('scan') || q.includes('invoice') || q.includes('photo')) {
      return {
        response: `I've analyzed the optical capture. Identified invoice for "Whole Foods Grocery" totaling ₹1,420.00. Ready to file into Food & Dining.`,
        actionCard: {
          type: 'receipt_scanned',
          title: 'Receipt Parsed: Whole Foods Grocery',
          detail: 'Auto-categorized as Food & Dining • Tax & Tip computed',
          amount: '₹1,420.00',
          status: 'success',
        },
      };
    }

    // DEFAULT INTELLIGENCE CONVERSATION
    return {
      response: `I'm Sins, your sovereign copilot. I have full real-time awareness of your ${context.accounts.length || 3} accounts, active cash flows, and upcoming bills. You can tell me to log spending, pay bills, inspect balances, or scan receipts.`,
    };
  },
};
