export const resetLoginScreen = (navigation) => {
  // Perform logout logic (e.g., clearing user data, tokens, etc.)
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
};
