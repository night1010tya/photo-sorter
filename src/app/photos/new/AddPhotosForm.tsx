"use client";

import Button from "@/components/Button";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type SelectedPhoto = {
    file: File;
    previewUrl: string;
  };

export default function AddPhotosForm() {

    const [photos, setPhotos] = useState<SelectedPhoto[]>([]);

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files) return;

        const files = Array.from(e.target.files);

        const newphotos=files.map((file)=>({
            file:file,
            previewUrl:URL.createObjectURL(file),
    }));
        setPhotos((prev)=>[...prev, ...newphotos])
    };

    const handleUpload = async () => {
        const formData =new FormData();

        photos.forEach((photo)=> {
            formData.append("photos", photo.file);
        });

        const response = await fetch("/api/photos", {
            method: "POST",
            body: formData,
          });

    };

    const handleRemove = (previewUrl:string) => {
        setPhotos((prev)=>
        prev.filter((photo)=> photo.previewUrl !== previewUrl));
        URL.revokeObjectURL(previewUrl)
    };

    return(
        <div>
            <div className="py-4 flex justify-center">
                <label htmlFor="photo-input"
                       className="flex gap-3 cursor-pointer w-2/3 bg-blue-400 text-[#fff] rounded-lg border border-blue-500 justify-center hover:bg-blue-600">
                        <ImageIcon />
                        写真を選択してください
                </label>
                <input id="photo-input" className="hidden" type="file" accept="image/*" multiple onChange={handleChange}/>
            </div>

            <p>選択した写真</p>

            <div  className="grid grid-cols-3 gap-2">
                {photos.map((photo)=>(
                    <div key={photo.previewUrl}
                         className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src={photo.previewUrl} fill unoptimized alt="選択した写真" className="object-cover"/>
                        <button type="button"
                        onClick={() => handleRemove(photo.previewUrl)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 hover:bg-red-500">
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <p>{photos.length}枚選択されています</p>
            <Button type="submit" onClick={handleUpload}>アップロード</Button>

        </div>
    );
}