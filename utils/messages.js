export const handleMessage = (
  setMessage,
  setMessageType,
  message,
  type = "FAILED"
) => {
  setMessage(message);
  setMessageType(type);
};
