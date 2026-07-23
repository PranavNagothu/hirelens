import { redirect } from "next/navigation";

// The root simply routes into the app; Proxy sends signed-out visitors on to /login.
export default function Home() {
  redirect("/dashboard");
}
