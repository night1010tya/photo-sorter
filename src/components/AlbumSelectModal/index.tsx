"use client";

import { useRef, useState } from "react";
import Button from "../Button";
import { Check, Folder, Plus, X } from "lucide-react";
import CreateAlbumForm from "../CreateAlbumForm";

type Album = {
  id: number;
  name: string;
};

type Props = {
  albums: Album[];
  onSelect: (albumId: number) => Promise<boolean>;
};

export default function AlbumSelectModal({ albums, onSelect }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbums, setNewAlbums] = useState<Album[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const allAlbums = [...newAlbums, ...albums];

  const handleSelect = async () => {
    if (selectedAlbumId === null || isSaving) return;

    setIsSaving(true);

    try {
      const success = await onSelect(selectedAlbumId);

      if (success) {
        dialogRef.current?.close();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    dialogRef.current?.close();
  };

  const handleCreated = (album: Album) => {
    setNewAlbums((prev) => [album, ...prev]);
    setSelectedAlbumId(album.id);
    setIsCreatingAlbum(false);
  };

  const handleDialogClose = () => {
    setSelectedAlbumId(null);
    setIsCreatingAlbum(false);
  };

  return (
    <>
      <Button onClick={() => dialogRef.current?.showModal()}>
        アルバムに追加
      </Button>

      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-6 text-gray-800 shadow-xl backdrop:bg-black/40"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold m-auto">
            {isCreatingAlbum ? "新規アルバムを作成" : "アルバムを選択"}
          </h2>

          <button type="button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {isCreatingAlbum ? (
          <CreateAlbumForm
            onCancel={() => setIsCreatingAlbum(false)}
            onCreated={handleCreated}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              写真を追加するアルバムを選んでください
            </p>

            <div className="max-h-72 overflow-y-auto">
              {allAlbums.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  アルバムがありません
                </p>
              ) : (
                allAlbums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => setSelectedAlbumId(album.id)}
                    className={`flex w-full items-center gap-3 border-b border-gray-200 px-3 py-4 text-left transition-colors hover:bg-gray-50 ${
                      selectedAlbumId === album.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <Folder
                      size={24}
                      className="shrink-0 fill-blue-300 text-blue-400"
                    />

                    <span className="flex-1 truncate">{album.name}</span>

                    {selectedAlbumId === album.id && (
                      <Check size={20} className="text-blue-500" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingAlbum(true)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500"
              >
                <Plus size={16} />
                新規アルバム
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
                >
                  キャンセル
                </button>

                <button
                  type="button"
                  onClick={handleSelect}
                  disabled={selectedAlbumId === null || isSaving}
                  className="rounded-lg bg-blue-500 px-5 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isSaving ? "追加中..." : "追加"}
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
