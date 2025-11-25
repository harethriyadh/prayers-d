const { z } = require('zod');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const UpsertSchema = z.object({
  date: z.string().regex(dateRegex, { message: 'date must be YYYY-MM-DD' }),
  prayer: z.string().min(1),
  status: z.number().int().refine((n) => [1, 2, 3].includes(n), {
    message: 'status must be one of: 1,2,3',
  }),
});

const BatchSchema = z.object({
  dates: z.array(z.string().regex(dateRegex)).min(1),
});

module.exports = { UpsertSchema, BatchSchema };
