import { auth, signOut } from "@/auth";
import AuthModal from "@/components/AuthModal";
import { Header } from "@/components/Header";
import { prisma } from "@/libs/prisma";
import { CircleUserRound, Clock, Mail } from "lucide-react";

export default async function Account() {

    const session = await auth();
    if(!session?.user?.id){
        return <AuthModal />
    }
    
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
    
      if (!user) {
        return <p>ユーザーが見つかりません</p>;
      }
    

    return(
        <>
            <Header />
            <div>
                <div className="flex items-center justify-center my-7">
                    <CircleUserRound size={100} 
                        className=""/>
                </div>
                <p className="font-bold text-2xl text-center text-gray-500 bg-[#fadadd]/50 rounded-full mx-9 p-2">
                    {user.name}
                </p>
                <div className="flex items-center justify-center my-2 gap-3">
                    <Mail />
                    <p>{user.email}</p>
                </div>
                <div className="flex items-center justify-center my-2 gap-3">
                    <Clock />
                    <p>{`${user.created_at.toLocaleDateString("ja-JP")}アカウント作成`}</p>
                </div>
            </div>
            <form action={async () => {
                "use server";
                await signOut({
                redirectTo: "/",
                });
            }}
            >
                <button type="submit" className="w-full text-center font-bold text-red-500 hover:text-blue-500">ログアウト</button>
            </form>
        </>
    )
}