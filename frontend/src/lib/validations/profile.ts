import * as z from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(3, { message: "Display name must be at least 3 characters." })
    .max(30, { message: "Display name must not be longer than 30 characters." }),
  bio: z
    .string()
    .max(200, { message: "Bio must not be longer than 200 characters." })
    .optional(),
  country: z.string().min(1, { message: "Please select a country." }),
  genderPref: z.string().min(1, { message: "Please select a gender preference." }),
  languages: z
    .array(z.string())
    .min(1, { message: "Please select at least one language." }),
  interests: z
    .array(z.string())
    .min(3, { message: "Please select at least 3 interests." }),
  keywords: z
    .array(z.string())
    .max(10, { message: "You can only select up to 10 keywords." }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
