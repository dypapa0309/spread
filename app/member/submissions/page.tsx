import { redirect } from "next/navigation";

export default async function MemberSubmissionsPage() {
  redirect("/member/profile#submissions");
}
