import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login to IRIS</h1>
          <p className="text-sm text-muted-foreground">Access your dashboard securely</p>
        </div>

        <AuthForm mode="login" />
      </div>
    </main>
  );
}
