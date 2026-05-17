import { z } from 'zod';

// Today's date at midnight, used to prevent future-dated articles
const today = new Date();
today.setHours(23, 59, 59, 999); // End of today, so today's date is allowed

/**
 * Zod schema for validating article form input.
 * This runs in the browser via React Hook Form's zodResolver.
 * The backend also validates independently as defense-in-depth.
 */
export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer'),

  summary: z
    .string()
    .trim()
    .min(1, 'Summary is required')
    .min(10, 'Summary must be at least 10 characters')
    .max(2000, 'Summary must be 2000 characters or fewer'),

  date: z
    .string()
    .min(1, 'Date is required')
    .refine(
      (val) => {
        const inputDate = new Date(val);
        return !isNaN(inputDate.getTime()) && inputDate <= today;
      },
      { message: 'Date must be a valid date and cannot be in the future' }
    ),

  publisher: z
    .string()
    .trim()
    .min(1, 'Publisher is required')
    .max(100, 'Publisher must be 100 characters or fewer'),
});

// Infer the TypeScript type from the schema for use in form components
export type ArticleFormData = z.infer<typeof articleSchema>;