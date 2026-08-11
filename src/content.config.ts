import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: z.object({
    title: z.string(),
    company: z.string().optional(),
    period: z.string(),
    role: z.string(),
    techStack: z.array(z.string()),
    order: z.number(),
    type: z.enum(["project", "troubleshooting", "practice"]),
    summary: z.array(z.string()).optional(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    readDate: z.coerce.date(),
    rating: z.number().min(1).max(5).optional(),
    cover: z.string().optional(),
    featured: z.boolean().optional().default(false),
    blurb: z.string().optional(),
  }),
});

export const collections = { portfolio, books };
