import { redirect } from "next/navigation";

/** Legacy URL — builder lives under Mr.Software AI now. */
export default function BuilderRedirectPage() {
  redirect("/app/ai/blueprint");
}
