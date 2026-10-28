"use client";

import JSZip from "jszip";
import { Check, Download, Ellipsis, Trash } from "lucide-react";
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

type DownloadPhoto = {
  fileName: string;
  imageUrl: string;
};

type DownloadResponse = {
  photos: DownloadPhoto[];
};

export default function AlbumActions({ albumId, albumName, photos }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [isSelectingPhotos, setIsSelectingPhotos] = useState(false); //写真選択モード
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);

  const [isRemoving, setIsRemoving] = useState(false); //紐付け解除中
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false); //アルバム削除中
  const [deleteAlbumError, setDeleteAlbumError] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState(false); // ZIPの取得中か
  const [downloadError, setDownloadError] = useState<string | null>(null);

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

  const handleRemoveAlbum = async () => {
    if (isDeletingAlbum) return;

    const confirmed = window.confirm(
      `「${albumName}」を削除しますか？\n写真自体は削除されません。`,
    );

    if (!confirmed) return;
    setIsDeletingAlbum(true);
    setDeleteAlbumError(null);

    try {
      const response = await fetch("/api/albums", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ albumId }),
      });

      if (!response.ok) {
        throw new Error("アルバムを削除できませんでした");
      }
      router.replace("/albums");
      router.refresh();
    } catch (error) {
      console.error("アルバムの削除に失敗しました", error);
      setDeleteAlbumError(
        "アルバムを削除できませんでした。もう一度お試しください。",
      );
    } finally {
      setIsDeletingAlbum(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading || isDeletingAlbum || photos.length === 0) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // APIから写真の取得用URLを受け取る
      const response = await fetch(`/api/albums/${albumId}/download`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("ダウンロードを準備できませんでした。");
      }

      const result: DownloadResponse = await response.json();

      const zip = new JSZip();

      const maxTotalBytes = 50 * 1024 * 1024; // 暫定の容量制限：元写真の合計50MB
      let totalBytes = 0;

      for (const photo of result.photos) {
        const photoResponse = await fetch(photo.imageUrl);

        if (!photoResponse.ok) {
          throw new Error(
            "写真を取得できませんでした。もう一度お試しください。",
          );
        }

        const blob = await photoResponse.blob();
        totalBytes += blob.size;

        if (totalBytes > maxTotalBytes) {
          throw new Error(
            "写真の合計容量が50MBを超えるため、ダウンロードできません。",
          );
        }

        zip.file(photo.fileName, await blob.arrayBuffer());
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "STORE",
      });

      const objectUrl = URL.createObjectURL(zipBlob);

      const safeAlbumName =
        albumName
          .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
          .replace(/[. ]+$/g, "")
          .trim() || `album-${albumId}`;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${safeAlbumName}.zip`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60_000);

      setIsOpen(false);
    } catch (error) {
      console.error("アルバムのダウンロードに失敗しました", error);

      setDownloadError(
        "ダウンロードできませんでした。通信環境や写真の合計容量（50MBまで）を確認して、もう一度お試しください。",
      );
    } finally {
      setIsDownloading(false);
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
              disabled={isDeletingAlbum}
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
                  onClick={handleDownload}
                  disabled={
                    photos.length === 0 || isDownloading || isDeletingAlbum
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm text-slate-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={18} />

                  {isDownloading
                    ? "ZIPを準備中..."
                    : "写真をまとめて保存（ZIP）"}
                </button>
                <p className="px-4 pb-2 text-xs text-gray-500">
                  写真の合計50MBまで
                </p>

                <button
                  type="button"
                  onClick={handleSelectPhoto}
                  disabled={isDeletingAlbum || isDownloading}
                  className="w-full text-left text-sm block w-full px-4 py-3 text-left hover:bg-gray-50"
                >
                  写真を選択
                </button>

                <div className="border-t border-gray-300 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={handleRemoveAlbum}
                    disabled={isDeletingAlbum || isDownloading}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash size={18} />
                    {isDeletingAlbum ? "削除中..." : "アルバムを削除"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteAlbumError && (
        <p role="alert" className="mx-4 mb-3 text-sm text-red-600">
          {deleteAlbumError}
        </p>
      )}
      {downloadError && (
        <p role="alert" className="mx-4 mb-3 text-sm text-red-600">
          {downloadError}
        </p>
      )}

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
