import { Pressable, Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  addXml,
  calendarEditXml,
  removeXml,
} from '../../screens/Charges/managementIcons';
import { styles } from './styles';

function Icon({ xml, size = 14, color = '#722F37' }) {
  const coloredXml = xml.replace(
    /fill="(?:#[A-Fa-f0-9]+|currentColor)"/g,
    `fill="${color}"`,
  );
  return <SvgXml height={size} width={size} xml={coloredXml} />;
}

function formatUnitPrice(cents) {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseUnitPrice(value) {
  const normalized = value.trim().replace(/[^\d,.-]/g, '');
  if (!normalized) return 0;

  const localized = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;
  const price = Number(localized);
  return Number.isFinite(price) ? Math.max(0, Math.round(price * 100)) : 0;
}

export default function ServiceItemCard({
  service,
  onChangePrice,
  onChangeQuantity,
  onRemove,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.serviceInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.name}</Text>
            <View style={styles.sizePill}>
              <Text style={styles.sizeText}>Porte grande</Text>
            </View>
          </View>
          <Text style={styles.description}>{service.description}</Text>
        </View>
        <Pressable
          accessibilityLabel={`Remover ${service.name}`}
          accessibilityRole="button"
          onPress={onRemove}
          style={styles.iconButton}
        >
          <Icon color="#A3A3A3" size={14} xml={removeXml} />
        </Pressable>
      </View>

      <View style={styles.details}>
        <View style={styles.fieldsRow}>
          <View style={styles.priceColumn}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>VALOR UNITÁRIO</Text>
              <Icon color="#A3A3A3" size={10} xml={calendarEditXml} />
            </View>
            <View style={styles.priceInput}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                accessibilityLabel={`Valor unitário de ${service.name}`}
                keyboardType="decimal-pad"
                onBlur={() =>
                  onChangePrice(service.unitCents, formatUnitPrice(service.unitCents))
                }
                onChangeText={(text) =>
                  onChangePrice(parseUnitPrice(text), text)
                }
                selectTextOnFocus
                style={styles.priceTextInput}
                value={service.unitPriceText ?? formatUnitPrice(service.unitCents)}
              />
            </View>
          </View>

          <View style={styles.quantityColumn}>
            <Text style={styles.fieldLabel}>QTD.</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityLabel={`Diminuir quantidade de ${service.name}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: service.quantity <= 1 }}
                disabled={service.quantity <= 1}
                onPress={() => onChangeQuantity(service.quantity - 1)}
                style={[
                  styles.stepperButton,
                  service.quantity <= 1 && styles.stepperButtonDisabled,
                ]}
              >
                <Text style={styles.stepperSymbol}>−</Text>
              </Pressable>
              <Text style={styles.quantity}>{service.quantity}</Text>
              <Pressable
                accessibilityLabel={`Aumentar quantidade de ${service.name}`}
                accessibilityRole="button"
                onPress={() => onChangeQuantity(service.quantity + 1)}
                style={styles.stepperButton}
              >
                <Icon size={9} xml={addXml} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal calculado</Text>
          <Text style={styles.subtotal}>
            {`R$ ${((service.unitCents * service.quantity) / 100).toLocaleString(
              'pt-BR',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )}`}
          </Text>
        </View>
      </View>
    </View>
  );
}
