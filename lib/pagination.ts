import { z } from 'zod';

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(500),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Parse `?limit=&offset=`; throws a ZodError (→ 400) for invalid values. */
export function parsePagination(params: URLSearchParams) {
  return paginationSchema.parse({
    limit: params.get('limit') ?? undefined,
    offset: params.get('offset') ?? undefined,
  });
}
