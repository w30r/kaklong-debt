import { isAuthenticated } from "@/app/auth-actions";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1 bg-background font-sans items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
