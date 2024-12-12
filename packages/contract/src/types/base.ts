import { z } from "zod";

// Basic language code (ISO 639-1)
export const LanguageCode = z.string().regex(/^[a-z]{2,3}$/);
export type LanguageCode = z.infer<typeof LanguageCode>;

// Region/country code (ISO 3166-1)
export const RegionCode = z.string().regex(/^[A-Z]{2}$/);
export type RegionCode = z.infer<typeof RegionCode>;

// Complete language tag schema
export const LanguageTag = z.union([
  // Simple language code: 'en'
  LanguageCode,

  // Language + region: 'en-US'
  z.string().regex(/^[a-z]{2,3}-[A-Z]{2}$/),

  // Region only: 'US'
  RegionCode,

  // Language + script + region: 'zh-Hant-TW'
  z.string().regex(/^[a-z]{2,3}-[A-Z][a-z]{3}-[A-Z]{2}$/),

  // With variants and extensions
  z.string().regex(/^[a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2})?(-[a-zA-Z0-9]+)*$/),
]);
export type LanguageTag = z.infer<typeof LanguageTag>;

export const VariantTypeEnum = [
  "lang", // Different languages
  "abTest", // A/B testing variants
  "format", // Format Variants: Long-form vs. Summary versions, Newsletter adaptations, Social media versions, Print-ready versions, Audio transcript versions
  "audience", // Audience Variants: Technical vs. Non-technical versions, Beginner vs. Advanced content, Age-specific adaptations, Industry-specific versions, Role-based versions (e.g., manager vs. individual contributor)
  "region", // Region Variants: Different regulatory requirements (GDPR vs. CCPA), Cultural adaptations, Local market specifics, Region-specific examples and references,
] as const;

export const VariantType = z.enum(VariantTypeEnum);
export type VariantType = z.infer<typeof VariantType>;
