import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_COLORS} from '../theme/colors';

export function Header(): React.JSX.Element {
  return (
    // Use a View wrapper + absoluteFill gradient so the title Text always
    // renders on top — avoids a New Architecture quirk where children of a
    // full-width LinearGradient can be invisible.
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[...GRADIENT_COLORS]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.title}>Multilingual Word Explorer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
