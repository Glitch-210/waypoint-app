export const colors = {
  canvas: '#FFFFFF',
  surfaceSoft: '#F7F7F7',
  surfaceStrong: '#F2F2F2',
  ink: '#222222',
  body: '#3F3F3F',
  muted: '#6A6A6A',
  primary: '#BA0036',
  rausch: '#FF385C',
  rauschActive: '#E00B41',
  rauschDisabled: '#FFD1DA',
  hairline: '#DDDDDD',
} as const;

export type ColorToken = keyof typeof colors;
