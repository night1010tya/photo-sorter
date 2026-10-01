import { auth } from "@/auth";
import { Header } from "@/components/Header"
import { prisma } from "@/libs/prisma";
import { Images } from "lucide-react";
import CreateAlbumForm from "./CreateAlbumForm";

export default async function Albums() {

      const session = await auth();
      if(!session?.user?.id){
        return<p>ログインが必要です</p>
      }

  const albums = await prisma.albums.findMany({
    where: {
      user_id: session.user.id,
    },

    include: {
      album_photos: {
        include: {
          photo: true,
        },
      },
    },

    orderBy: {
      created_at: "desc",
    },
  });

  console.log(albums);

    return(
        <>
        <Header />

        <div className="grid grid-cols-3 gap-2 m-2">
        <CreateAlbumForm />
        {albums.map((album)=>(
                <div key={album.id} className="space-y-1">

                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-200 hover:bg-gray-300">
                        <Images size={40} 
                             className="text-gray-400"/>
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white">
                            <Images size={18}/>
                            <span className="text-sm">{album.album_photos.length}</span>
                        </div>
                    </div>

                    <p  className="text-center break-words bg-[#fadadd]/50 text-gray-500 rounded-full px-2 py-1">{album.name}</p>
                </div>
            ))
        }
        </div>
        </>
    );
}