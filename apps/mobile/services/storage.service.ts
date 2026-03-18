import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';

export const saveToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const deleteToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};
