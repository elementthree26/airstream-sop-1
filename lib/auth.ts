import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireCollaborator() {
  const session = await getSession();
  if (!session?.user?.isCollaborator) {
    throw new Error("Unauthorized");
  }
  return session;
}
