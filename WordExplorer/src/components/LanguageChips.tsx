import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  GRADIENT_COLORS,
  CHIP_INACTIVE_BG,
  CHIP_INACTIVE_TEXT,
  CHIP_ACTIVE_TEXT,
} from '../theme/colors';

const LANGUAGES = ['English', 'ไทย', '粵語'] as const;
export type Language = (typeof LANGUAGES)[number];

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export function LanguageChips({selected, onSelect}: Props): React.JSX.Element {
  return (
    // alignSelf:'center' + explicit chip margins replace justifyContent:'center'
    // + gap, which caused the selected LinearGradient to expand and fill the row.
    <View style={styles.row}>
      {LANGUAGES.map(lang => (
        <TouchableOpacity
          key={lang}
          onPress={() => onSelect(lang)}
          activeOpacity={0.8}
          style={styles.chipTouch}>
          {lang === selected ? (
            // Wrap gradient in View so it sizes to content, not to parent.
            <View style={[styles.chip, styles.chipSelected]}>
              <LinearGradient
                colors={[...GRADIENT_COLORS]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={[styles.chipText, {color: CHIP_ACTIVE_TEXT}]}>
                {lang}
              </Text>
            </View>
          ) : (
            <View style={[styles.chip, styles.chipInactive]}>
              <Text style={[styles.chipText, {color: CHIP_INACTIVE_TEXT}]}>
                {lang}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'center', // shrink-wraps the row so it can be centered
    alignItems: 'center',
    marginVertical: 20,
  },
  chipTouch: {
    marginHorizontal: 6, // 6+6 = 12px between adjacent chips
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    overflow: 'hidden', // clips gradient to the pill shape
  },
  chipInactive: {
    backgroundColor: CHIP_INACTIVE_BG,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
