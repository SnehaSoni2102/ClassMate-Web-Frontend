import apiClient from "@/lib/api-client";

interface UploadUrlResponse {
  url: string;
  key: string;
}

export const getUploadUrl = async (contentType: string): Promise<UploadUrlResponse> => {
  const response = await apiClient.get<UploadUrlResponse>(
    `/question/upload-url`,
    { contentType }
  );
  return response.data;
};

export const uploadFileToS3 = async (url: string, file: File): Promise<void> => {
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
};
