import { z } from "zod";

const USERNAME_REGEX = /^[A-Za-z0-9._-]+$/;
const NAME_REGEX = /^[\p{L}\p{N}\s'.-]+$/u;
const PHONE_REGEX = /^[0-9+\-\s()]+$/;

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const normalizeFreeText = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

export const usernameFieldSchema = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter")
  .max(100, "Username maksimal 100 karakter")
  .regex(
    USERNAME_REGEX,
    "Username hanya boleh berisi huruf, angka, titik, underscore, atau tanda minus"
  );

export const passwordFieldSchema = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(255, "Password maksimal 255 karakter");

export const personNameFieldSchema = z
  .string()
  .trim()
  .min(1, "Nama wajib diisi")
  .max(150, "Nama maksimal 150 karakter")
  .regex(NAME_REGEX, "Nama hanya boleh berisi huruf, angka, spasi, apostrof, titik, dan tanda minus");

export const productNameFieldSchema = z
  .string()
  .trim()
  .min(1, "Nama produk wajib diisi")
  .max(200, "Nama produk maksimal 200 karakter")
  .regex(NAME_REGEX, "Nama produk hanya boleh berisi huruf, angka, spasi, apostrof, titik, dan tanda minus");

export const optionalPhoneFieldSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(8, "Nomor telepon minimal 8 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(PHONE_REGEX, "Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung")
    .optional()
);

export const optionalFreeTextFieldSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .max(2000, "Teks maksimal 2000 karakter")
    .transform((value) => normalizeFreeText(value))
    .optional()
);

export const customerInputSchema = z.object({
  name: personNameFieldSchema,
  phone: optionalPhoneFieldSchema,
  address: optionalFreeTextFieldSchema,
});

export const supplierInputSchema = z.object({
  name: personNameFieldSchema,
  phone: optionalPhoneFieldSchema,
  address: optionalFreeTextFieldSchema,
});

export const userCreateInputSchema = z.object({
  username: usernameFieldSchema,
  password: passwordFieldSchema,
  level: z.enum(["admin", "kasir"]),
});

export const userUpdateInputSchema = z.object({
  username: usernameFieldSchema,
  password: z.preprocess(emptyToUndefined, passwordFieldSchema.optional()),
  level: z.enum(["admin", "kasir"]),
});

export const productCreateInputSchema = z.object({
  name: productNameFieldSchema,
  price: z.number().min(0),
  buy_price: z.number().min(0),
  stock: z.number().min(0),
  min_stock: z.number().min(0),
  category_id: z.number().min(1),
  unit_id: z.number().min(1),
  description: optionalFreeTextFieldSchema,
});

export const productUpdateInputSchema = z.object({
  name: productNameFieldSchema.optional(),
  price: z.number().min(0).optional(),
  buy_price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  min_stock: z.number().min(0).optional(),
  category_id: z.number().min(1).optional(),
  unit_id: z.number().min(1).optional(),
  description: optionalFreeTextFieldSchema,
});

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeTextForHtml(value?: string | null): string {
  if (!value) return "";
  return escapeHtml(value);
}
