import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-red-100 to-orange-200 px-4">
      
      <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-white/60 p-8 shadow-xl shadow-orange-900/10 backdrop-blur-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600">
            Welcome to IRIS
          </h1>
          <p className="text-sm text-orange-900/70">
            Access your dashboard securely
          </p>
        </div>

        <AuthForm mode="login" />
      </div>
    </main>
  );
}
