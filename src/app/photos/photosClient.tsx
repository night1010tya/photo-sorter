"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Photo = {
  id: number;
  imageUrl: string | null;
};

type Props = {
  photos: Photo[];
};

export default function PhotosClient({ photos }: Props) {
  const router = useRouter();

  const [isSelecting, setIsSelecting] = useState(false); //写真選択モード

  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]); // 削除対象

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleStartSelection = () => {
    setSelectedPhotoIds([]);
    setDeleteError(null);
    setIsSelecting(true);
  };

  const handleCancelSelection = () => {
    setSelectedPhotoIds([]);
    setDeleteError(null);
    setIsSelecting(false);
  };

  const handleTogglePhoto = (photoId: number) => {
    if (isDeleting) return;

    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId],
    );
  };

  const handleDeletePhotos = async () => {
    if (selectedPhotoIds.length === 0 || isDeleting) return;

    const confirmed = window.confirm(
      `選択した${selectedPhotoIds.length}枚を削除しますか？\nすべてのアルバムからも外れます。この操作は取り消せません。`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/photos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoIds: selectedPhotoIds,
        }),
      });

      if (!response.ok) {
        throw new Error("写真の削除に失敗しました");
      }

      setSelectedPhotoIds([]);
      setIsSelecting(false);
      router.refresh();
    } catch (error) {
      console.error("写真の削除に失敗しました", error);

      setDeleteError(
        "写真を削除できませんでした。通信環境を確認して、もう一度お試しください。",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-3 px-4">
        {isSelecting ? (
          <>
            <p className="text-sm text-slate-600" aria-live="polite">
              {selectedPhotoIds.length}枚選択中
            </p>

            <button
              type="button"
              onClick={handleCancelSelection}
              disabled={isDeleting}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              キャンセル
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleStartSelection}
            disabled={photos.length === 0}
            className="rounded-lg bg-pink-100 px-4 py-2 text-sm text-pink-700 hover:bg-pink-200 disabled:opacity-50"
          >
            写真を選択
          </button>
        )}
      </div>

      <div className="m-2 grid grid-cols-3 gap-2">
        {!isSelecting && (
          <Link
            href="/photos/new"
            aria-label="写真を追加"
            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            <span aria-hidden="true" className="text-4xl">
              ＋
            </span>
            <span className="mt-2 text-sm">写真を追加</span>
          </Link>
        )}

        {photos.map((photo) => {
          const isSelected = selectedPhotoIds.includes(photo.id);

          const photoContent = photo.imageUrl ? (
            <Image
              src={photo.imageUrl}
              alt="写真"
              fill
              sizes="33vw"
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-gray-100 p-2 text-center text-sm text-gray-500">
              写真を読み込めませんでした
            </span>
          );

          if (isSelecting) {
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleTogglePhoto(photo.id)}
                disabled={isDeleting}
                aria-label={`写真 ${photo.id} を選択`}
                aria-pressed={isSelected}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                  isSelected ? "border-pink-500" : "border-transparent"
                }`}
              >
                {photoContent}

                <span
                  aria-hidden="true"
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? "border-pink-500 bg-pink-500 text-white"
                      : "border-white bg-black/20"
                  }`}
                >
                  {isSelected && <Check size={16} />}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={photo.id}
              href={`/photos/${photo.id}`}
              className="relative block aspect-square overflow-hidden rounded-lg"
            >
              {photoContent}
            </Link>
          );
        })}
      </div>

      {isSelecting && (
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white p-4 text-center">
          <p className="mb-3 text-xs text-gray-500">
            このアプリ内の写真を削除します。
            <br />
            端末の元写真は削除されません。
          </p>

          {deleteError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {deleteError}
            </p>
          )}

          <button
            type="button"
            disabled={selectedPhotoIds.length === 0 || isDeleting}
            onClick={handleDeletePhotos}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isDeleting
              ? "削除中..."
              : `選択した${selectedPhotoIds.length}枚を削除`}
          </button>
        </div>
      )}
    </div>
  );
}
