import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_COLORS, LABEL_SUBDUED, CARD_BG} from '../theme/colors';


interface Props {
  language: string;
  word: string;
  isPlaying?: boolean;
  onPlay: () => void;
  index?: number;
}

export function TranslationBlock({
  language,
  word,
  isPlaying = false,
  onPlay,
  index = 0,
}: Props): React.JSX.Element {
  const slideAnim = useRef(new Animated.Value(16)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 80;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.card,
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
      ]}>
      <View style={styles.content}>
        <Text style={styles.languageLabel}>{language}</Text>
        <Text style={styles.word}>{word}</Text>
      </View>
      <TouchableOpacity onPress={onPlay} activeOpacity={0.8}>
        <LinearGradient
          colors={[...GRADIENT_COLORS]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}>
          {/* \uFE0E forces text presentation so color:'white' applies */}
          <Text style={styles.playIcon}>
            {isPlaying ? '\u25A0\uFE0E' : '\u25B6\uFE0E'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Card shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  languageLabel: {
    fontSize: 12,
    color: LABEL_SUBDUED,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  word: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    opacity: 0.75,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
});
