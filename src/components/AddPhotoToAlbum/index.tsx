"use client";

import AlbumSelectModal from "../AlbumSelectModal";

type Album = {
  id: number;
  name: string;
};

type Props = {
  albums: Album[];
  photoId: number;
};

export default function AddPhotoToAlbum({ albums, photoId }: Props) {
  const handleSelect = async (albumId: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/album-photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoId,
          albumId,
        }),
      });

      if (!response.ok) {
        throw new Error("写真の追加に失敗しました");
      }
      alert("アルバムに写真を追加しました！");
      return true;
    } catch (error) {
      console.error(error);
      alert("写真の追加に失敗しました");
      return false;
    }
  };

  return <AlbumSelectModal albums={albums} onSelect={handleSelect} />;
}
