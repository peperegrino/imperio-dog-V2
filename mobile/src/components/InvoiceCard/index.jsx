import { Pressable, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { styles } from './styles';

const statusStyles = {
  pendente: {
    badge: styles.pendingBadge,
    label: styles.pendingBadgeLabel,
    text: 'PENDENTE',
  },
  pago: {
    badge: styles.paidBadge,
    label: styles.paidBadgeLabel,
    text: 'PAGO',
  },
  vencido: {
    badge: styles.overdueBadge,
    label: styles.overdueBadgeLabel,
    text: 'VENCIDO',
  },
};

export default function InvoiceCard({ dueDate, dateLabel = 'Vencimento', title, status, amount, onPress }) {
  const statusStyle = statusStyles[status];
  const isPending = status === 'pendente';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.invoiceInfo}>
          <View style={styles.dueDateRow}>
            <View accessible={false} style={styles.calendarIconSlot} />
            <Text style={styles.dueDate}>{dateLabel}: {dueDate}</Text>
          </View>
          <Text style={styles.invoiceTitle}>{title}</Text>
        </View>
        <View style={[styles.badge, statusStyle.badge]}>
          <Text style={[styles.badgeLabel, statusStyle.label]}>
            {statusStyle.text}
          </Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.amountLabel}>Valor total</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={[
            styles.detailsButton,
            isPending ? styles.filledButton : styles.outlineButton,
          ]}
        >
          <Text
            style={[
              styles.detailsButtonLabel,
              isPending ? styles.filledButtonLabel : styles.outlineButtonLabel,
            ]}
          >
            Ver detalhes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
