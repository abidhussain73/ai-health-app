export const baseApi = {
  reducerPath: 'api',
  reducer: () => ({}),
  middleware: () => (next: unknown) => (action: unknown) => action
};
