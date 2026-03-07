import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {WORD_CARD_BG} from '../theme/colors';

interface Props {
  word: string;
  imageUrl?: string | null;
}

export function WordSummaryCard({word, imageUrl}: Props): React.JSX.Element {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset image state when the URL changes (new lookup)
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [imageUrl]);

  const showImage = !!imageUrl && !imageError;

  return (
    <View style={styles.card}>
      {showImage && (
        <View style={styles.imageContainer}>
          {imageLoading && (
            <ActivityIndicator
              style={styles.imageLoader}
              size="small"
              color="#9CA3AF"
            />
          )}
          <Image
            source={{uri: imageUrl}}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        </View>
      )}
      <Text style={styles.word}>{word.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WORD_CARD_BG,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  word: {
    fontSize: 40,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 2,
  },
});
