import { checkUser } from "@/lib/checkUser";
import { Playground } from "@/components/playground";
import { redirect } from "next/navigation";

export default async function PlaygroundPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/");
  }

  return <Playground userId={user.clerkUserId} />;
}