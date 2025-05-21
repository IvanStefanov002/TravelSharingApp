import axios from "axios";
import { baseAPIUrl } from "./../components/shared";
import { handleMessage } from "./messages";

/**
 * Uploads an image to the server.
 * @param {string} imageUrl - Local image URI.
 * @param {string} imageFileName - Old image name (if replacing).
 * @param {string} email - User's email (for associating image).
 * @param {function} setMessage - State setter for messages.
 * @param {function} setMessageType - State setter for message types.
 * @param {function} setVehicleInfo - Setter to update vehicle image URL.
 */
export const uploadImageToServer = async (
  imageUrl,
  imageFileName,
  email,
  setMessage,
  setMessageType,
  setVehicleInfo
) => {
  let uploadedUrl = "";
  const formData = new FormData();
  const uriParts = imageUrl.split(".");
  const fileType = uriParts[uriParts.length - 1];

  const response = await fetch(imageUrl);
  const blob = await response.blob();

  formData.append("email", email);
  formData.append("oldImage", imageFileName);
  formData.append("image", {
    uri: imageUrl,
    name: `vehicle_image.${fileType}`,
    type: `image/${fileType}`,
  });

  try {
    // 1. Upload image and get URL
    const uploadRes = await axios.post(
      `${baseAPIUrl}/upload/uploadImage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (uploadRes.data.statusText === "SUCCESS") {
      uploadedUrl = uploadRes.data.imageUrl.replace(
        "http://localhost:3000",
        baseAPIUrl
      );

      // 2. Delete old image if exists (optional)
      if (imageFileName) {
        await axios.post(`${baseAPIUrl}/upload/deleteImage`, {
          image: imageFileName,
        });
      }

      // 3. Update user with new image URL
      const updateRes = await axios.post(
        `${baseAPIUrl}/upload/updateUserImage`,
        {
          email,
          imageUrl: uploadedUrl,
        }
      );

      if (updateRes.data.statusText === "SUCCESS") {
        // Update local state with new image url

        setVehicleInfo((prevState) => ({
          ...prevState,
          imageUrl: uploadedUrl,
        }));

        handleMessage(
          setMessage,
          setMessageType,
          "Image uploaded successfully",
          "SUCCESS"
        );
      } else {
        handleMessage(
          setMessage,
          setMessageType,
          "Failed to update user image",
          "FAILED"
        );
      }
    } else {
      handleMessage(
        setMessage,
        setMessageType,
        "Image upload failed",
        "FAILED"
      );
    }
  } catch (error) {
    console.error(error);
    handleMessage(setMessage, setMessageType, "Image upload error", "FAILED");
  }

  return uploadedUrl;
};

export const uploadTripImageToServer = async (
  imageUrl,
  imageFileName,
  //email,
  setMessage,
  setMessageType
) => {
  let uploadedUrl = "";
  const formData = new FormData();
  const uriParts = imageUrl.split(".");
  const fileType = uriParts[uriParts.length - 1];

  const response = await fetch(imageUrl);
  const blob = await response.blob();

  //formData.append("email", email);
  formData.append("oldImage", imageFileName);
  formData.append("image", {
    uri: imageUrl,
    name: `vehicle_image.${fileType}`,
    type: `image/${fileType}`,
  });

  try {
    // 1. Upload image and get URL
    const uploadRes = await axios.post(
      `${baseAPIUrl}/upload/uploadImage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (uploadRes.data.statusText === "SUCCESS") {
      uploadedUrl = uploadRes.data.imageUrl.replace(
        "http://localhost:3000",
        baseAPIUrl
      );

      // 2. Delete old image if exists (optional)
      if (imageFileName) {
        await axios.post(`${baseAPIUrl}/upload/deleteImage`, {
          image: imageFileName,
        });
      }
    } else {
      handleMessage(
        setMessage,
        setMessageType,
        "Image upload failed",
        "FAILED"
      );
    }
  } catch (error) {
    console.error(error);
    handleMessage(setMessage, setMessageType, "Image upload error", "FAILED");
  }

  return uploadedUrl;
};
