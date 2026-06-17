import { redirect } from "next/navigation";

export default function Home() {
  // The deck is the heart of the app; bounce everyone there. /swipe itself
  // redirects to /login when there's no session.
  redirect("/swipe");
}
