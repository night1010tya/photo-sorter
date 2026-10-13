import "server-only";
import { supabaseAdmin } from "@/libs/supabaseAdmin";

export async function getPhotoSignedUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const signedUrls = new Map<string, string>();

  if (paths.length === 0) {
    return signedUrls;
  }

  const { data, error } = await supabaseAdmin.storage
    .from("photos")
    .createSignedUrls([...new Set(paths)], 3600);

  if (error) {
    console.error("写真URLの生成に失敗しました", error);
    throw new Error("写真を読み込めませんでした");
  }

  for (const item of data ?? []) {
    if (item.path && item.signedUrl && !item.error) {
      signedUrls.set(item.path, item.signedUrl);
    }
  }

  return signedUrls;
}