import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '../../services/api';
import { colors } from '../../theme/colors';

const MAX_BASE64_LENGTH = 4 * Math.ceil((4 * 1024 * 1024) / 3);

export default function ProfilePhoto({ path, label, fallback, size, readOnly = false, allowRemove = false }) {
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const revision = useRef(0);
  const uploading = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    const currentRevision = revision.current;
    api.get(path).then((response) => {
      if (active && currentRevision === revision.current) setPhoto(response?.data || null);
    }).catch(() => {
      if (active && currentRevision === revision.current && !readOnly) {
        setError(true);
        setMessage('Não foi possível carregar a foto.');
      }
    });
    return () => { active = false; };
  }, [path, readOnly]));

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web',
        aspect: [1, 1],
        base64: true,
        quality: 0.7,
      });
      if (result.canceled || uploading.current) return;
      const base64 = result.assets[0]?.base64;
      if (!base64) throw new Error('Não foi possível ler a foto selecionada.');
      if (base64.length > MAX_BASE64_LENGTH) throw new Error('A foto deve ter até 4 MB.');

      uploading.current = true;
      setSaving(true);
      setMessage('');
      try {
        const response = await api.put(path, { base64 });
        revision.current += 1;
        setPhoto(response?.data || null);
        setError(false);
        setMessage('Foto atualizada.');
      } finally {
        uploading.current = false;
        setSaving(false);
      }
    } catch (failure) {
      setError(true);
      setMessage(failure.message || 'Não foi possível atualizar a foto.');
    }
  }

  async function removePhoto() {
    if (saving) return;
    setSaving(true);
    setMessage('');
    try {
      await api.delete(path);
      revision.current += 1;
      setPhoto(null);
      setError(false);
      setMessage('Foto removida.');
    } catch (failure) {
      setError(true);
      setMessage(failure.message || 'Não foi possível remover a foto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <Image
          accessibilityLabel={label}
          resizeMode="cover"
          source={{ uri: photo }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : fallback}
      {!readOnly && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${photo ? 'Trocar' : 'Adicionar'} ${label.toLowerCase()}`}
            disabled={saving}
            onPress={choosePhoto}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Salvando foto…' : photo ? 'Trocar foto' : 'Adicionar foto'}
            </Text>
          </Pressable>
          {allowRemove && photo && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remover ${label.toLowerCase()}`}
              disabled={saving}
              onPress={removePhoto}
              style={styles.button}
            >
              <Text style={[styles.buttonText, styles.removeText]}>Remover foto</Text>
            </Pressable>
          )}
          {!!message && (
            <Text accessibilityLiveRegion="polite" style={[styles.message, error && styles.error]}>
              {message}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  buttonText: { color: colors.primary, fontWeight: '600' },
  removeText: { color: colors.textMuted },
  message: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  error: { color: colors.primary },
});
