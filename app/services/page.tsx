// Redirect legacy /services route to /workshop
import { redirect } from "next/navigation";

export default function ServicesRedirect() {
  redirect("/workshop");
}
