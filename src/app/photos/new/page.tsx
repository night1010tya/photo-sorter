import { Header } from "@/components/Header";
import AddPhotosForm from "./AddPhotosForm";
import AuthModal from "@/components/AuthModal";
import { auth } from "@/auth";

export default async function AddPhotos() {
    
    const session = await auth();
    if(!session?.user?.id){
        return <AuthModal />
    }

return(
    <>
        <Header />
        <AddPhotosForm />
    </>
)
}