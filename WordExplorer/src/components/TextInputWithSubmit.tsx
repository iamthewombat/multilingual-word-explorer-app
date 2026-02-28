import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_COLORS} from '../theme/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export function TextInputWithSubmit({
  value,
  onChangeText,
  onSubmit,
}: Props): React.JSX.Element {
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Or type a word..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={onSubmit} activeOpacity={0.85}>
        <LinearGradient
          colors={[...GRADIENT_COLORS]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.submitBtn}>
          {/* Up arrow using Unicode text character */}
          <Text style={styles.arrow}>{'↑'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginVertical: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
});
