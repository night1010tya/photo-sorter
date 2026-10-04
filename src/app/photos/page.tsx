import { auth } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import Image from "next/image"
import Link from "next/link";

export default async function Photos() {

    const session = await auth();
    if(!session?.user?.id){
        return <AuthModal />
    }

    const photos = [
        {
          id: 1,
          url: "/cat.jpg",
          taken_at: "2026-09-18T12:00:00",
          location: "静岡県",
          latitude: 35.123,
          longitude: 138.123,
        },
        {
          id: 2,
          url: "/catpc.jpg",
          taken_at: "2026-09-17T15:30:00",
          location: "東京都",
          latitude: 35.681,
          longitude: 139.767,
        },

        {
            id: 3,
            url: "/dogpc.jpg",
            taken_at: "2026-04-04T05:30:00",
            location: "東京都",
            latitude: 35.681,
            longitude: 139.767,
        },

        {
            id: 4,
            url: "/dog.jpg",
            taken_at: "2026-06-23T17:30:00",
            location: "静岡県",
            latitude: 35.123,
            longitude: 138.123,
        },
      ];

    return(
        <div>
            <Header />
            <div className="grid grid-cols-3 gap-2 m-2">
                {photos.map((photo) => (
                    <Link key={photo.id} href={`/photos/${photo.id}`}>
                        <div className="relative aspect-square overflow-hidden rounded-lg">
                            <Image
                            src={photo.url}
                            alt="写真"
                            fill
                            className="object-cover"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}