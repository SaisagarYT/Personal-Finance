import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Globe, ShoppingCart, Receipt } from 'lucide-react-native';
import { SINANCE_COLORS } from '../theme/colors';

export interface ExpenseItem {
  id: string;
  title: string;
  date: string;
  amount: string;
  icon: 'rent' | 'internet' | 'groceries' | 'taxes';
}

interface ExpenseLedgerProps {
  items?: ExpenseItem[];
  onPressViewAll?: () => void;
  onPressItem?: (item: ExpenseItem) => void;
}

export const ExpenseLedger: React.FC<ExpenseLedgerProps> = ({
  items,
  onPressViewAll,
  onPressItem,
}) => {
  const defaultItems: ExpenseItem[] = [
    {
      id: '1',
      title: 'House Rent',
      date: '09:00 am • 12 September, 2025',
      amount: '$400.00',
      icon: 'rent',
    },
    {
      id: '2',
      title: 'Internet Bill',
      date: '14:21 pm • 11 September, 2025',
      amount: '$55.00',
      icon: 'internet',
    },
    {
      id: '3',
      title: 'Groceries',
      date: '18:00 pm • 10 September, 2025',
      amount: '$78.00',
      icon: 'groceries',
    },
    {
      id: '4',
      title: 'Taxes',
      date: '11:15 am • 08 September, 2025',
      amount: '$230.00',
      icon: 'taxes',
    },
  ];

  const displayList = items && items.length > 0 ? items : defaultItems;

  const renderIcon = (type: ExpenseItem['icon']) => {
    switch (type) {
      case 'rent':
        return <Home size={18} color={SINANCE_COLORS.textMain} strokeWidth={2.2} />;
      case 'internet':
        return <Globe size={18} color={SINANCE_COLORS.textMain} strokeWidth={2.2} />;
      case 'groceries':
        return <ShoppingCart size={18} color={SINANCE_COLORS.textMain} strokeWidth={2.2} />;
      case 'taxes':
        return <Receipt size={18} color={SINANCE_COLORS.textMain} strokeWidth={2.2} />;
    }
  };

  return (
    <View style={styles.card}>
      {/* Header Row: Title & View All */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manage Expenses</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onPressViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Items */}
      <View style={styles.listContainer}>
        {displayList.map((item, index) => {
          const isLast = index === displayList.length - 1;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => onPressItem?.(item)}
              style={[styles.itemRow, isLast && styles.lastRow]}
            >
              <View style={styles.iconCircle}>
                {renderIcon(item.icon)}
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>

              <Text style={styles.itemAmount}>{item.amount}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: SINANCE_COLORS.textMain,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: SINANCE_COLORS.textDim,
  },
  listContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  lastRow: {
    paddingBottom: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SINANCE_COLORS.textMain,
    letterSpacing: -0.2,
  },
  itemDate: {
    fontSize: 11.5,
    fontWeight: '400',
    color: SINANCE_COLORS.textMuted,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: SINANCE_COLORS.textMain,
    letterSpacing: -0.2,
  },
});
