import { createClient } from "@/supabase/client";

const CHANNEL_VERIFICATIONS_BUCKET = "channel-verifications";

export async function uploadChannelVerificationImage(file: File, ownerId = "drafts") {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(CHANNEL_VERIFICATIONS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) throw error;

  const { data } = supabase.storage.from(CHANNEL_VERIFICATIONS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
