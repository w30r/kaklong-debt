import { login, isAuthenticated } from "@/app/auth-actions";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1 bg-background font-sans items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Enter password to continue</CardDescription>
        </CardHeader>
        <form action={async (fd) => { await login(fd); }}>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoFocus />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Enter
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
