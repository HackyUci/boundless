"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Please enter a valid password" }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setFirebaseError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const token = await getIdToken(userCredential.user);
      
      login(token);
      
      router.push("/discover");
    } catch (err: unknown) {
      console.error(err);
      setFirebaseError("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 relative">

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Boundless!
            </h1>
            <p className="text-gray-600">
              Take the first leap and start your journey abroad
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your mail address"
                        className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg pr-12"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Message */}
              {firebaseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{firebaseError}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Log In"}
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-gray-600">Don&apos;t have an account ? </span>
                <button
                  type="button"
                  className="text-orange-600 hover:text-orange-700 hover:underline font-medium"
                  onClick={() => router.push("/register")}
                >
                  Register here
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Side - Decorative Pattern */}
      <div className="flex-1 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="grid grid-cols-4 grid-rows-4 h-full gap-4 p-8">
            {/* Various geometric shapes */}
            <div className="bg-orange-300/30 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            </div>
            <div className="bg-orange-600/40 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-yellow-300 rounded transform rotate-45"></div>
              <div className="w-8 h-8 bg-red-400 rounded transform rotate-45 -ml-2"></div>
            </div>
            <div className="bg-orange-300/30 rounded-2xl flex items-center justify-center">
              <div className="w-full h-2 bg-cyan-300 rounded"></div>
            </div>
            <div className="bg-orange-700/40 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full"></div>
            </div>

            <div className="bg-orange-400/50 rounded-lg flex flex-col items-center justify-center">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-cyan-300 mb-1"></div>
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-cyan-400"></div>
            </div>
            <div className="bg-orange-600/60 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-white/80" fill="currentColor" />
            </div>
            <div className="bg-orange-300/40 rounded-lg flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              </div>
            </div>
            <div className="bg-orange-500/50 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-white/40 rounded-full"
                  ></div>
                ))}
              </div>
            </div>

            <div className="bg-orange-400/40 rounded-2xl flex items-center justify-center">
              <div className="w-16 h-8 bg-cyan-300 rounded-lg relative">
                <div className="absolute top-1 left-1 w-6 h-6 bg-yellow-400 rounded transform rotate-12">
                  <Star
                    className="w-4 h-4 text-white absolute top-1 left-1"
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>
            <div className="bg-orange-700/50 rounded-lg flex items-center justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-white/60 rounded ${
                      i % 2 === 0 ? "h-4" : "h-6"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="bg-orange-300/50 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/40 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white/60 rounded-full"></div>
              </div>
            </div>
            <div className="bg-orange-600/40 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1">
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
              </div>
            </div>

            <div className="bg-orange-500/60 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-orange-600/30 to-orange-700/50 rounded-lg"></div>
              <div className="absolute bottom-2 left-2 w-8 h-1 bg-cyan-300 rounded"></div>
              <div className="absolute bottom-4 left-2 w-6 h-1 bg-cyan-400 rounded"></div>
            </div>
            <div className="bg-orange-400/30 rounded-2xl flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 rounded-full"></div>
            </div>
            <div className="bg-orange-700/40 rounded-lg flex items-center justify-center">
              <div className="w-12 h-6 bg-cyan-300 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="bg-orange-300/60 rounded-2xl"></div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-8 h-8 bg-yellow-300/80 rounded transform rotate-45 animate-bounce"></div>
        <div className="absolute top-1/2 right-8 w-12 h-12 bg-cyan-300/60 rounded-lg transform -rotate-12"></div>
      </div>
    </div>
  );
}