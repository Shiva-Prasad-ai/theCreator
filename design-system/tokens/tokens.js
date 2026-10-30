/**
 * CreatorOS AI Design Tokens
 * Consolidated JS export for easy integration with Next.js, Tailwind CSS, and Figma sync.
 */

const colors = require('./colors.json');
const typography = require('./typography.json');
const spacing = require('./spacing.json');
const radius = require('./radius.json');

module.exports = {
  colors: {
    background: colors.brand.background.hex,
    surface: {
      DEFAULT: colors.brand.surface.default.hex,
      subtle: colors.brand.surface.subtle.hex,
      elevated: colors.brand.surface.elevated.hex,
      border: colors.brand.surface.border.hex,
      'border-focus': colors.brand.surface['border-focus'].hex,
    },
    primary: {
      ...colors.brand.primary,
      DEFAULT: colors.brand.primary.default.hex,
      foreground: colors.brand.primary.foreground.hex,
    },
    accent: {
      ...colors.brand.accent,
      DEFAULT: colors.brand.accent.default.hex,
      foreground: colors.brand.accent.foreground.hex,
    },
    text: {
      primary: colors.brand.text.primary.hex,
      muted: colors.brand.text.muted.hex,
      subtle: colors.brand.text.subtle.hex,
    },
    status: {
      success: colors.brand.status.success.hex,
      warning: colors.brand.status.warning.hex,
      error: colors.brand.status.error.hex,
      info: colors.brand.status.info.hex,
    },
    gradients: colors.brand.gradients,
  },
  typography: {
    fonts: {
      heading: ['Space Grotesk', ...typography.fontFamilies.heading.fallbacks],
      body: ['Inter', ...typography.fontFamilies.body.fallbacks],
      mono: ['JetBrains Mono', ...typography.fontFamilies.mono.fallbacks],
    },
    scale: typography.scale,
  },
  spacing: spacing.scale,
  containers: spacing.containers,
  radii: radius.radii,
  shadows: radius.shadows,
};

