export function unwrapSupabaseData<T>(input: { data: T | null; error: { message: string } | null }) {
  if (input.error) {
    throw new Error(input.error.message);
  }

  return input.data;
}
