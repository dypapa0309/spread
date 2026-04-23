import { createClient } from "@/supabase/client";

const CAMPAIGN_COVERS_BUCKET = "campaign-covers";

export async function uploadCampaignCoverImage(file: File, campaignId = "drafts") {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${campaignId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(CAMPAIGN_COVERS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) throw error;

  const { data } = supabase.storage.from(CAMPAIGN_COVERS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
