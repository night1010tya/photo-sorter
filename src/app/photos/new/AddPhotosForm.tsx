"use client";

import Button from "@/components/Button";
import { supabase } from "@/libs/supabase";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
  path?: string;
  token?: string;
  storageSaved?: boolean;
  error?: string;
};

export default function AddPhotosForm() {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [completedCount, setCompletedCount] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);

  const router = useRouter();

  const totalBytes = photos.reduce(
    (total, photo) => total + photo.file.size,
    0,
  );
  const totalMB = totalBytes / 1000000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const newphotos = files.map((file) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newphotos]);
  };

  const handleUpload = async () => {
    if (photos.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    setHasAttempted(true);

    const total = photos.length;
    const failedPhotos: SelectedPhoto[] = [];
    const completedPhotos: SelectedPhoto[] = [];

    setUploadTotal(total);
    setCompletedCount(0);

    try {
      for (const selectedPhoto of photos) {
        const photo: SelectedPhoto = {
          ...selectedPhoto,
          error: undefined,
        };

        try {
          if (!photo.path || !photo.token) {
            const response = await fetch("/api/photos/upload-url", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fileName: photo.file.name,
                contentType: photo.file.type,
              }),
            });

            if (!response.ok) {
              throw new Error(
                `アップロードの準備に失敗しました（${response.status}）。`,
              );
            }

            const data = await response.json();

            if (
              typeof data.path !== "string" ||
              typeof data.token !== "string"
            ) {
              throw new Error("アップロード許可を取得できませんでした。");
            }

            photo.path = data.path;
            photo.token = data.token;
          }

          if (
            typeof photo.path !== "string" ||
            typeof photo.token !== "string"
          ) {
            throw new Error("保存先またはアップロード許可がありません。");
          }

          if (!photo.storageSaved) {
            const { error } = await supabase.storage
              .from("photos")
              .uploadToSignedUrl(photo.path, photo.token, photo.file, {
                contentType: photo.file.type,
              });

            if (error) {
              console.error("Storageへの送信に失敗", error);
            } else {
              photo.storageSaved = true;
            }
          }

          const response = await fetch("/api/photos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ path: photo.path }),
          });

          if (!response.ok) {
            const result = await response.json().catch(() => null);

            const message =
              typeof result?.message === "string"
                ? result.message
                : `写真情報の登録に失敗しました（${response.status}）。`;

            throw new Error(message);
          }

          completedPhotos.push(photo);
          setCompletedCount(completedPhotos.length);
        } catch (error) {
          photo.error =
            error instanceof Error
              ? error.message
              : "写真を追加できませんでした。";

          failedPhotos.push(photo);
        }
      }

      setPhotos(failedPhotos);

      completedPhotos.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });

      if (failedPhotos.length > 0) {
        setUploadError(
          `${total}枚中${completedPhotos.length}枚を追加しました。` +
            `次の${failedPhotos.length}枚を追加できませんでした。`,
        );
        return;
      }

      window.alert(`${total}枚の写真を追加しました。`);
      router.push("/");
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (previewUrl: string) => {
    setPhotos((prev) =>
      prev.filter((photo) => photo.previewUrl !== previewUrl),
    );
    URL.revokeObjectURL(previewUrl);
  };

  return (
    <div>
      <div className="py-4 flex justify-center">
        <label
          htmlFor="photo-input"
          className="flex gap-3 cursor-pointer w-2/3 bg-blue-400 text-[#fff] rounded-lg border border-blue-500 justify-center hover:bg-blue-600"
        >
          <ImageIcon />
          写真を選択してください
        </label>
        <input
          id="photo-input"
          className="hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={isUploading || hasAttempted}
        />
      </div>

      <p>選択した写真</p>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.previewUrl}>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={photo.previewUrl}
                fill
                unoptimized
                alt={photo.file.name}
                className="object-cover"
              />

              {!hasAttempted && (
                <button
                  type="button"
                  onClick={() => handleRemove(photo.previewUrl)}
                  disabled={isUploading}
                  aria-label={`${photo.file.name}を選択から外す`}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 hover:bg-red-500"
                >
                  ×
                </button>
              )}
            </div>

            {photo.error && (
              <p className="mt-1 text-sm text-red-600">{photo.error}</p>
            )}
          </div>
        ))}
      </div>

      <p>{photos.length}枚選択されています</p>

      <p className="text-gray-700">選択した容量：{totalMB.toFixed(2)} MB</p>

      {isUploading && (
        <p role="status" className="my-3 text-gray-700">
          {uploadTotal}枚中{completedCount}枚完了
        </p>
      )}

      {uploadError && (
        <p role="alert" className="my-3 text-sm text-red-600">
          {uploadError}
        </p>
      )}

      <Button
        type="button"
        onClick={handleUpload}
        isLoading={isUploading}
        loadingText="アップロード中..."
        disabled={photos.length === 0 || isUploading}
      >
        {hasAttempted ? `${photos.length}枚を再試行` : "アップロード"}
      </Button>
    </div>
  );
}
