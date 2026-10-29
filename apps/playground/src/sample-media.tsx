/// <reference types="vite/client" />
import { Link, Text } from '@gregui/react';

// Bundled demo content; see public/images/CREDITS.md for source and licence.
export const samplePhoto = {
  src: `${import.meta.env.BASE_URL}images/alpine-lake.jpg`,
  alt: 'Clear lake reflecting forested mountains beneath a blue sky',
  widthPx: 1200,
  heightPx: 801,
  source:
    'https://unsplash.com/photos/landscape-photography-of-lake-surrounded-by-mountains-8aSs7QejvSw',
};

export function PhotoCredit() {
  return (
    <Text size="caption" tone="muted">
      Photo by <Link href={samplePhoto.source}>Ales Krivec on Unsplash</Link>.
    </Text>
  );
}
