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
    /* 1. Upload image and get URL */
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
      uploadedUrl = uploadRes.data.imageUrl;

      /* 2. Delete old image if exists (optional) */
      if (imageFileName) {
        await axios.post(`${baseAPIUrl}/upload/deleteImage`, {
          image: imageFileName,
        });
      }

      /* 3. Update user with new image URL */
      const updateRes = await axios.post(
        `${baseAPIUrl}/upload/updateUserImage`,
        {
          email,
          imageUrl: uploadedUrl,
        }
      );

      if (updateRes.data.statusText === "SUCCESS") {
        /* Update local state with new image url */

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

export const uploadCarImageToServer = async (
  plate,
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

  formData.append("plate", plate);
  formData.append("email", email);
  formData.append("oldImage", imageFileName);
  formData.append("image", {
    uri: imageUrl,
    name: `vehicle_image.${fileType}`,
    type: `image/${fileType}`,
  });

  try {
    /* 1. Upload image and get URL */
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
      uploadedUrl = uploadRes.data.imageUrl;

      /* 2. Delete old image if exists (optional) */
      if (imageFileName) {
        await axios.post(`${baseAPIUrl}/upload/deleteImage`, {
          image: imageFileName,
        });
      }

      /* 3. Update user with new image URL */
      const updateRes = await axios.post(
        `${baseAPIUrl}/upload/updateUserCarImage`,
        {
          plate,
          email,
          imageUrl: uploadedUrl,
        }
      );

      if (updateRes.data.statusText === "SUCCESS") {
        /* Update local state with new image url */
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
  setMessage,
  setMessageType
) => {
  let uploadedUrl = "";

  /* If it's already uploaded (e.g., from DB), just return the path */
  if (!imageUrl.includes("file://")) {
    console.log("Image is already uploaded, skipping upload.");
    return imageUrl;
  }

  const formData = new FormData();

  const uriParts = imageUrl.split(".");
  const fileType = uriParts[uriParts.length - 1];

  /* For safety, check if fileType is valid */
  if (!["jpg", "jpeg", "png"].includes(fileType.toLowerCase())) {
    handleMessage(
      setMessage,
      setMessageType,
      "Unsupported file type",
      "FAILED"
    );
    return "";
  }

  formData.append("oldImage", imageFileName);

  formData.append("image", {
    uri: imageUrl,
    name: `vehicle_image.${fileType}`,
    type: `image/${fileType}`,
  });

  console.log("Uploading image...");

  try {
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
      uploadedUrl = uploadRes.data.imageUrl;

      /* Optionally delete the old image */
      if (imageFileName && imageFileName !== "logo.png") {
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
    console.error("Image upload error:", error);
    handleMessage(setMessage, setMessageType, "Image upload error", "FAILED");
  }

  return uploadedUrl;
};
