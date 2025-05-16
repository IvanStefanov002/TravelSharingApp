export const updateVehicleImageUrl = (setVehicleInfo, imageUrl) => {
  setVehicleInfo((prevState) => ({
    ...prevState,
    imageUrl: imageUrl,
  }));
};
