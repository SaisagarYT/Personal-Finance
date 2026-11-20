import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Globe, ShoppingCart, Receipt } from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';

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
  const theme = useAppTheme();

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
    const iconColor = theme.expenseIconColor;
    switch (type) {
      case 'rent':
        return <Home size={18} color={iconColor} strokeWidth={2.2} />;
      case 'internet':
        return <Globe size={18} color={iconColor} strokeWidth={2.2} />;
      case 'groceries':
        return <ShoppingCart size={18} color={iconColor} strokeWidth={2.2} />;
      case 'taxes':
        return <Receipt size={18} color={iconColor} strokeWidth={2.2} />;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardContainer,
          borderColor: theme.cardContainerBorder,
        },
      ]}
    >
      {/* Header Row: Title & View All */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.textMain }]}>Manage Expenses</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onPressViewAll}>
          <Text style={[styles.viewAllText, { color: theme.textDim }]}>View All</Text>
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
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.expenseIconCircleBg },
                ]}
              >
                {renderIcon(item.icon)}
              </View>

              <View style={styles.infoCol}>
                <Text style={[styles.itemTitle, { color: theme.textMain }]}>
                  {item.title}
                </Text>
                <Text style={[styles.itemDate, { color: theme.textMuted }]}>
                  {item.date}
                </Text>
              </View>

              <Text style={[styles.itemAmount, { color: theme.textMain }]}>
                {item.amount}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
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
    letterSpacing: -0.2,
  },
  itemDate: {
    fontSize: 11.5,
    fontWeight: '400',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
