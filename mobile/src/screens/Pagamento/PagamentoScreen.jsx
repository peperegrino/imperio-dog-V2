/**
 * Tela "Pagamento" — Império Dog Resort
 * Figma: node-id 86:1490 (frame de 390px de largura)
 *
 * Dependências:
 *   npx expo install react-native-svg expo-blur expo-clipboard react-native-safe-area-context expo-font
 *   npm i @expo-google-fonts/plus-jakarta-sans
 *
 * Regra de ouro: TODOS os números abaixo (px, gap, padding, cores) vêm do Figma.
 * Não "arredonde" nada.
 */
import React, { useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { BlurTargetView, BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { colors, fonts, shadows } from './theme';
import {
  avatarUserXml,
  backArrowXml,
  barcodeXml,
  copySmallXml,
  copyWhiteXml,
  eyeXml,
  lockXml,
  receiptXml,
  warningXml,
} from './svgIcons';

/* ------------------------------------------------------------------ */
/* Dados da tela (troque por dados reais da API)                       */
/* ------------------------------------------------------------------ */
const HEADER_HEIGHT = 64;

const DATA = {
  status: 'PENDENTE',
  dueLabel: 'Vence em 30/09/2026',
  amount: 'R$ 289,90',
  details: [
    ['Serviço:', 'Hospedagem mensal'],
    ['Tutor:', 'Mariana Oliveira'],
    ['Pet:', 'Thor'],
    ['Período:', 'Setembro de 2026'],
    ['Data de emissão:', '01/09/2026'],
    ['Vencimento:', '30/09/2026'],
  ],
  // linha digitável exibida no card "Linha digitável" (quebra igual ao Figma)
  digitableLine1: '34191.79001 01043.510047 91020.150008 8 94',
  digitableLine2: '570000028990',
  // texto exibido sob o código de barras (quebra igual ao Figma)
  barcodeLine1: '34191.79001 01043.510047 91020.150008 1 9823',
  barcodeLine2: '0000028990',
};

/* ------------------------------------------------------------------ */
/* Ícone: moldura com o tamanho do Figma + SVG no tamanho nativo       */
/* (o path do SVG começa em 0,0, então fica idêntico ao design)         */
/* ------------------------------------------------------------------ */
const Icon = ({ xml, frameW, frameH, svgW, svgH }) => (
  <View style={{ width: frameW, height: frameH }}>
    <View style={{ position: 'absolute', left: 0, top: 0 }}>
      <SvgXml xml={xml} width={svgW} height={svgH} />
    </View>
  </View>
);

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */
export default function PagamentoScreen({
  onBack,
  onProfilePress,
  onViewFullBoleto,
  onBackToDetails,
}) {
  const insets = useSafeAreaInsets();
  const blurTarget = useRef(null);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) return null;

  const copy = (value) => Clipboard.setStringAsync(value.replace(/\D/g, ''));

  return (
    <View style={styles.root}>
      {/* ============ CONTEÚDO ============ */}
      <BlurTargetView ref={blurTarget} style={styles.scroll}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top, minHeight: 780 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Texto introdutório */}
            <View style={styles.introWrap}>
              <Text style={styles.intro}>
                Confira os dados e detalhes da cobrança antes de realizar o pagamento.
              </Text>
            </View>

            {/* ---------- Card principal da cobrança ---------- */}
            <View style={[styles.chargeCard, shadows.card]}>
              {/* Badge + vencimento */}
              <View style={styles.statusRow}>
                <View style={[styles.badge, shadows.small]}>
                  <Text style={styles.badgeText}>{DATA.status}</Text>
                </View>
                <Text style={styles.dueText}>{DATA.dueLabel}</Text>
              </View>

              {/* Valor */}
              <View style={styles.valueBlock}>
                <View style={styles.valueLabelWrap}>
                  <Text style={styles.valueLabel}>VALOR DA COBRANÇA</Text>
                </View>
                <View style={styles.valueWrap}>
                  <Text style={styles.valueText}>{DATA.amount}</Text>
                </View>
              </View>

              {/* Detalhes */}
              <View style={styles.detailsMargin}>
                <View style={styles.detailsBorder}>
                  {DATA.details.map(([label, value]) => (
                    <View key={label} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ---------- Pagamento via boleto (altura fixa 483 como no Figma) ---------- */}
            <View style={styles.boletoSection}>
              <View style={styles.boletoHeading}>
                <Icon xml={receiptXml} frameW={16.5} frameH={18.333} svgW={17} svgH={19} />
                <Text style={styles.boletoHeadingText}>Pagamento via boleto</Text>
              </View>

              {/* Linha digitável */}
              <View style={styles.digitableCard}>
                <View style={styles.digitableLabelWrap}>
                  <Text style={styles.digitableLabel}>Linha digitável</Text>
                </View>

                <View style={[styles.codeBox, shadows.card]}>
                  <Text style={styles.codeText}>
                    {`${DATA.digitableLine1}\n${DATA.digitableLine2}`}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copiar código"
                  onPress={() => copy(DATA.digitableLine1 + DATA.digitableLine2)}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    shadows.button,
                    pressed && styles.pressed,
                  ]}
                >
                  <Icon xml={copyWhiteXml} frameW={12.75} frameH={15} svgW={13} svgH={15} />
                  <Text style={styles.primaryButtonText}>Copiar código</Text>
                </Pressable>
              </View>

              {/* Visualizar boleto completo */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Visualizar boleto completo"
                onPress={onViewFullBoleto}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  shadows.small,
                  pressed && styles.pressed,
                ]}
              >
                <Icon xml={eyeXml} frameW={18.333} frameH={12.5} svgW={19} svgH={13} />
                <Text style={styles.secondaryButtonText}>Visualizar boleto completo</Text>
              </Pressable>

              {/* Código de barras */}
              <View style={[styles.barcodeCard, shadows.small]}>
                <Text style={styles.barcodeTitle}>CÓDIGO DE BARRAS</Text>

                <SvgXml xml={barcodeXml} width={260} height={32} />

                <View style={styles.barcodeCodeMargin}>
                  <View style={styles.barcodeCodeBox}>
                    <Text style={styles.barcodeCodeText}>
                      {`${DATA.barcodeLine1}\n${DATA.barcodeLine2}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.smallCopyMargin}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Copiar código de barras"
                    onPress={() => copy(DATA.barcodeLine1 + DATA.barcodeLine2)}
                    style={({ pressed }) => [styles.smallCopyButton, pressed && styles.pressed]}
                  >
                    <Icon xml={copySmallXml} frameW={10.625} frameH={12.5} svgW={11} svgH={13} />
                    <Text style={styles.smallCopyText}>Copiar código</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* ---------- Como pagar ---------- */}
            <View style={styles.howCard}>
              <Text style={styles.howTitle}>Como pagar</Text>

              {/*
                A lista do Figma tem recuos "estranhos" (espaços no início das linhas).
                Reproduzidos exatamente: cada linha posicionada por top/left e sem quebra automática.
              */}
              <View style={styles.howList}>
                <Text numberOfLines={1} style={[styles.howLine, { top: 0, left: 0 }]}>
                  Copie a linha digitável ou abra o boleto completo.
                </Text>
                <Text numberOfLines={1} style={[styles.howLine, { top: 21.5, left: 12.69 }]}>
                  Acesse o aplicativo do seu banco ou internet banking.
                </Text>
                <Text numberOfLines={1} style={[styles.howLine, { top: 43, left: 12.69 }]}>
                  Selecione a opção de pagamento com código de
                </Text>
                <Text numberOfLines={1} style={[styles.howLine, { top: 61, left: 0 }]}>
                  barras ou linha digitável.
                </Text>
                <Text numberOfLines={1} style={[styles.howLine, { top: 82.5, left: 12.69 }]}>
                  Cole o código e confirme o pagamento.
                </Text>
              </View>
            </View>

            {/* ---------- Aviso de vencimento ---------- */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeading}>
                <Icon xml={warningXml} frameW={18.333} frameH={15.833} svgW={19} svgH={16} />
                <Text style={styles.warningTitle}>Fique atento ao vencimento</Text>
              </View>
              <Text style={styles.warningText}>
                {'O boleto pode sofrer alterações após a data de\nvencimento.'}
              </Text>
            </View>

            {/* ---------- Pagamento seguro ---------- */}
            <View style={styles.secureRow}>
              <Icon xml={lockXml} frameW={10.667} frameH={14} svgW={11} svgH={14} />
              <View style={styles.secureTextWrap}>
                <Text style={styles.secureText}>Pagamento seguro — Banco C6 Bank</Text>
              </View>
            </View>

            {/* ---------- Link voltar ---------- */}
            <View style={styles.backLinkRow}>
              <Pressable
                accessibilityRole="link"
                onPress={onBackToDetails}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.backLinkText}>← Voltar para detalhes da cobrança</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </BlurTargetView>

      {/* ============ HEADER (absoluto, translúcido, blur 12) ============ */}
      <View
        style={[
          styles.header,
          shadows.header,
          { height: HEADER_HEIGHT + insets.top, paddingTop: insets.top },
        ]}
      >
        <BlurView
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={40}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.headerBg }]} />

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Icon xml={backArrowXml} frameW={16} frameH={16} svgW={16} svgH={16} />
            </Pressable>
            <Text style={styles.headerTitle}>Pagamento</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            onPress={onProfilePress}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <SvgXml xml={avatarUserXml} width={32} height={32} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos — valores 1:1 com o Figma                                   */
/* ------------------------------------------------------------------ */
const text = (family, size, lineHeight, color, extra = {}) => ({
  fontFamily: family,
  fontSize: size,
  lineHeight,
  color,
  includeFontPadding: false,
  ...extra,
});

const hairline = { borderWidth: 1, borderColor: colors.border };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.85 },

  /* Container principal: pt24 pb96 px20 gap25 */
  container: {
    paddingTop: 24,
    paddingBottom: 96,
    paddingHorizontal: 20,
    gap: 25,
    alignItems: 'stretch',
  },

  /* Intro */
  introWrap: { paddingLeft: 10 },
  intro: text(fonts.regular, 14, 22, colors.muted),

  /* Card da cobrança: p25 gap16 radius12 */
  chargeCard: {
    ...hairline,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 25,
    gap: 16,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    backgroundColor: colors.beige,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  badgeText: text(fonts.semibold, 12, 16, colors.brown, { letterSpacing: 0.6 }),
  dueText: text(fonts.regular, 14, 22, colors.muted),

  valueBlock: { gap: 7 },
  valueLabelWrap: { paddingBottom: 3 },
  valueLabel: text(fonts.regular, 14, 22, colors.wine, { letterSpacing: 0.7 }),
  valueWrap: { paddingBottom: 8.5, height: 30.5 },
  // O Figma usa line-height 22 com fonte 36 (texto centralizado e "vazando").
  // Para reproduzir sem cortar na Android: line-height natural + margem negativa.
  valueText: text(fonts.bold, 36, 44, colors.wine, {
    letterSpacing: -0.9,
    marginTop: -11,
  }),

  detailsMargin: { paddingTop: 8 },
  detailsBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 4,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailLabel: text(fonts.regular, 12, 18, colors.muted),
  detailValue: text(fonts.semibold, 12, 18, colors.text),

  /* Seção boleto: altura FIXA 483 (como no Figma), gap16 */
  boletoSection: { height: 483, gap: 16, alignItems: 'stretch' },
  boletoHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8 },
  boletoHeadingText: text(fonts.regular, 14, 22, colors.text),

  digitableCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  digitableLabelWrap: { paddingLeft: 6 },
  digitableLabel: text(fonts.regular, 14, 22, colors.muted),
  codeBox: {
    ...hairline,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: text(fonts.regular, 12, 16, colors.text, { textAlign: 'center' }),

  primaryButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.wine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: text(fonts.bold, 14, 22, colors.white, { textAlign: 'center' }),

  secondaryButton: {
    ...hairline,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: text(fonts.regular, 14, 22, colors.text, { textAlign: 'center' }),

  /* Código de barras: h181 gap3 pt15 pb13 px8 radius12 */
  barcodeCard: {
    height: 181,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingTop: 15,
    paddingBottom: 13,
    paddingHorizontal: 8,
    gap: 3,
    alignItems: 'center',
  },
  barcodeTitle: text(fonts.semibold, 12, 16, colors.muted, {
    letterSpacing: 1.2,
    textAlign: 'center',
  }),
  barcodeCodeMargin: { alignSelf: 'stretch', paddingTop: 10 },
  barcodeCodeBox: {
    borderWidth: 1,
    borderColor: colors.barcodeBorder,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 17,
    paddingVertical: 9,
    alignItems: 'center',
  },
  barcodeCodeText: text(fonts.regular, 12, 18, colors.text, {
    letterSpacing: 0.3,
    textAlign: 'center',
  }),
  smallCopyMargin: { paddingTop: 10 },
  smallCopyButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 },
  smallCopyText: text(fonts.semibold, 12, 16, colors.wine, {
    letterSpacing: 0.48,
    textAlign: 'center',
  }),

  /* Como pagar: p17 gap8 radius12 */
  howCard: {
    ...hairline,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 17,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howTitle: text(fonts.regular, 14, 22, colors.text, { alignSelf: 'stretch' }),
  // 5 linhas de 18px + 3 gaps de 3.5px = 100.5 (item 3 tem 2 linhas = 36px)
  howList: { width: 318, height: 100.5, overflow: 'visible' },
  howLine: {
    ...text(fonts.regular, 12, 18, colors.muted),
    position: 'absolute',
    width: 400, // largura folgada p/ nunca quebrar linha (Figma = nowrap)
  },

  /* Aviso: p17 gap4 radius12 */
  warningCard: {
    backgroundColor: colors.beige,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 12,
    padding: 17,
    gap: 4,
  },
  warningHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warningTitle: text(fonts.regular, 14, 22, colors.brown),
  warningText: text(fonts.regular, 12, 18, colors.muted),

  /* Pagamento seguro: gap4 */
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  secureTextWrap: { paddingLeft: 4 },
  secureText: text(fonts.regular, 13, 22, colors.muted),

  /* Link voltar: h22 */
  backLinkRow: { height: 22, alignItems: 'center', justifyContent: 'flex-start' },
  backLinkText: text(fonts.semibold, 14, 22, colors.wine),

  /* Header: 64px + safe area, translúcido */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  headerRow: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: text(fonts.semibold, 18, 26, colors.text),
});