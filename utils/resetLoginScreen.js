export const resetLoginScreen = (navigation) => {
  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
};
