"use client";

import { Check, Ellipsis, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Photo = {
  id: number;
  imageUrl: string | null;
};

type Props = {
  albumId: number;
  albumName: string;
  photos: Photo[];
};

export default function AlbumActions({ albumId, albumName, photos }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [isSelectingPhotos, setIsSelectingPhotos] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);

  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const handleSelectPhoto = () => {
    setIsOpen(false);
    setSelectedPhotoIds([]);
    setIsSelectingPhotos(true);
    setRemoveError(null);
  };

  const handleTogglePhoto = (photoId: number) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId],
    );
  };

  const handleCancelSelection = () => {
    setSelectedPhotoIds([]);
    setIsSelectingPhotos(false);
    setRemoveError(null);
  };

  const router = useRouter();
  const handleRemovePhotos = async () => {
    if (selectedPhotoIds.length === 0 || isRemoving) return;
    setIsRemoving(true);
    setRemoveError(null);

    try {
      const response = await fetch("/api/album-photos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId,
          photoIds: selectedPhotoIds,
        }),
      });

      if (!response.ok) {
        throw new Error("アルバムから外せませんでした");
      }

      setSelectedPhotoIds([]);
      setIsSelectingPhotos(false);

      router.refresh();
    } catch (error) {
      console.error("写真の紐付け削除に失敗しました", error);
      setRemoveError(
        "写真をアルバムから外せませんでした。もう一度お試しください。",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex justify-end px-2">
        {isSelectingPhotos ? (
          <>
            <p className="text-sm text-slate-600" aria-live="polite">
              {selectedPhotoIds.length}枚選択中
            </p>

            <button
              type="button"
              onClick={handleCancelSelection}
              disabled={isRemoving}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
            >
              キャンセル
            </button>
          </>
        ) : (
          <div className="relative">
            <button
              type="button"
              aria-label={`${albumName}の操作`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-gray-200"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
            >
              <Ellipsis size={22} />
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full z-10 mt-2 w-max rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <button
                  type="button"
                  onClick={handleSelectPhoto}
                  className="w-full text-left text-sm block w-full px-4 py-3 text-left hover:bg-gray-50"
                >
                  写真を選択
                </button>
                <div className="border-t border-gray-300 bg-gray-50/50">
                  <button
                    type="button"
                    className="w-full text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash />
                    アルバムを削除
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="m-2 grid grid-cols-3 gap-2">
        {photos.map((photo) => {
          const imageUrl = photo.imageUrl;
          const isSelected = selectedPhotoIds.includes(photo.id);

          if (!imageUrl) {
            return (
              <div
                key={photo.id}
                className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 p-2 text-center text-sm text-gray-500"
              >
                写真を読み込めませんでした
              </div>
            );
          }

          if (isSelectingPhotos) {
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleTogglePhoto(photo.id)}
                aria-label={`写真 ${photo.id} を選択`}
                aria-pressed={isSelected}
                disabled={isRemoving}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                  isSelected ? "border-pink-500" : "border-transparent"
                }`}
              >
                <Image
                  src={imageUrl}
                  alt="アルバム内の写真"
                  fill
                  unoptimized
                  sizes="33vw"
                  className="object-cover"
                />

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
              href={`/photos/${photo.id}?albumId=${albumId}`}
              className="block"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt="写真"
                  fill
                  unoptimized
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            </Link>
          );
        })}
      </div>
      {isSelectingPhotos && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 text-center">
          <p className="mb-3 text-xs text-gray-500">写真自体は削除されません</p>

          {removeError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {removeError}
            </p>
          )}

          <button
            type="button"
            onClick={handleRemovePhotos}
            disabled={selectedPhotoIds.length === 0 || isRemoving}
            className="rounded-lg bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isRemoving
              ? "外しています..."
              : `選択した${selectedPhotoIds.length}枚をアルバムから外す`}
          </button>
        </div>
      )}
    </div>
  );
}
