import { useRef } from "react";
import { upload } from "@imagekit/react";
import { authedFetch } from "../../lib/api";

const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;

const Upload = ({ setImg, getToken }) => {
  const authenticator = async () => {
    const response = await authedFetch("/api/upload", {}, getToken);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }
    const { signature, expire, token } = await response.json();
    return { signature, expire, token, publicKey };
  };
  const fileInputRef = useRef(null);

  const handleFileChange = async (evt) => {
    const file = evt.target.files?.[0];
    if (!file) return;

    // Same as your old onUploadStart — preview for AI
    const reader = new FileReader();
    reader.onloadend = () => {
      setImg((prev) => ({
        ...prev,
        isLoading: true,
        aiData: {
          inlineData: {
            data: reader.result.split(",")[1],
            mimeType: file.type,
          },
        },
      }));
    };
    reader.readAsDataURL(file);

    try {
      const { signature, expire, token, publicKey } = await authenticator();

      const res = await upload({
        file,
        fileName: file.name,
        token,
        expire,
        signature,
        publicKey,
        useUniqueFileName: true,
        onProgress: (event) => {
          console.log("Progress", event);
        },
      });
      
      console.log("Success", res);
      setImg((prev) => ({ ...prev, isLoading: false, dbData: res }));
      
    } catch (err) {
      console.log("Error", err);
      setImg((prev) => ({ ...prev, isLoading: false }));
    }

    evt.target.value = ""; // allow picking the same file again
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      <label onClick={() => fileInputRef.current?.click()}>
        <img src="/attachment.png" alt="" />
      </label>
    </>
  );
};

export default Upload;
