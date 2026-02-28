import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MIC_GRADIENT_COLORS, SHADOW_COLOR} from '../theme/colors';

export type MicState = 'idle' | 'recording' | 'transcribing';

// Mic silhouette drawn with Views so it renders white on the gradient bg.
function MicIcon(): React.JSX.Element {
  return (
    <View style={micIcon.wrapper}>
      <View style={micIcon.capsule} />
      <View style={micIcon.stand} />
      <View style={micIcon.stem} />
      <View style={micIcon.base} />
    </View>
  );
}

const micIcon = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  capsule: {
    width: 22,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  stand: {
    width: 32,
    height: 16,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 2,
  },
  stem: {
    width: 3,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  base: {
    width: 22,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

interface Props {
  micState: MicState;
  onPressIn: () => void;
  onPressOut: () => void;
}

const LABELS: Record<MicState, string> = {
  idle: 'Hold to speak a word',
  recording: 'Listening…',
  transcribing: 'Transcribing…',
};

export function MicButton({
  micState,
  onPressIn,
  onPressOut,
}: Props): React.JSX.Element {
  const isDisabled = micState === 'transcribing';
  const circleOpacity = micState === 'recording' ? 0.8 : 1;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.halo,
          micState === 'recording' && styles.haloRecording,
        ]}>
        <TouchableOpacity
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          activeOpacity={0.85}>
          <LinearGradient
            colors={[...MIC_GRADIENT_COLORS]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.circle, {opacity: circleOpacity}]}>
            {micState === 'transcribing' ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <MicIcon />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <Text
        style={[
          styles.label,
          micState === 'recording' && styles.labelRecording,
        ]}>
        {LABELS[micState]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  halo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(124, 92, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SHADOW_COLOR,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  haloRecording: {
    backgroundColor: 'rgba(124, 92, 212, 0.22)',
    shadowOpacity: 0.45,
  },
  circle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  labelRecording: {
    color: '#7B5FD4',
    fontWeight: '600',
  },
});
