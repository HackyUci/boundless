"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getIdToken,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Star, Users, Mail, Lock, User } from "lucide-react";

import { auth, db } from "@/lib/firebase";
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

const formSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setFirebaseError(null);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: data.name,
        email: data.email,
        favoriteUniversity: "",
      });

      // Get the ID token for the newly created user
      const token = await getIdToken(userCredential.user);
      
      // Use the context login function to automatically log in the user
      login(token);
      
      // Redirect to dashboard/discover page
      router.push("/discover");
      
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "code" in err) {
        const errorCode = (err as { code: string }).code;

        if (errorCode === "auth/email-already-in-use") {
          setFirebaseError("Email already in use");
        } else if (errorCode === "auth/weak-password") {
          setFirebaseError("Password is too weak");
        } else if (errorCode === "auth/invalid-email") {
          setFirebaseError("Invalid email address");
        } else {
          setFirebaseError("Registration failed. Please try again.");
        }
      } else {
        setFirebaseError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative Pattern */}
      <div className="flex-1 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="grid grid-cols-4 grid-rows-4 h-full gap-4 p-8">
            {/* Various geometric shapes with different patterns than login */}
            <div className="bg-orange-300/30 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white/80" />
            </div>
            <div className="bg-orange-600/40 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-cyan-300 rounded-full"></div>
            </div>
            <div className="bg-orange-300/30 rounded-2xl flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded"></div>
              </div>
            </div>
            <div className="bg-orange-700/40 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <Mail className="w-6 h-6 text-white/70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <div className="bg-orange-400/50 rounded-lg flex items-center justify-center">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-1 bg-cyan-300 rounded ${i === 2 ? 'h-8' : 'h-4'}`}></div>
                ))}
              </div>
            </div>
            <div className="bg-orange-600/60 rounded-2xl flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-white/60 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-white/80" />
              </div>
            </div>
            <div className="bg-orange-300/40 rounded-lg flex items-center justify-center">
              <div className="w-12 h-2 bg-gradient-to-r from-cyan-300 to-yellow-300 rounded-full"></div>
            </div>
            <div className="bg-orange-500/50 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                ))}
              </div>
            </div>

            <div className="bg-orange-400/40 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-red-400 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="bg-orange-700/50 rounded-lg flex items-center justify-center">
              <div className="flex flex-col space-y-1">
                <div className="w-8 h-1 bg-cyan-300 rounded"></div>
                <div className="w-6 h-1 bg-cyan-400 rounded"></div>
                <div className="w-10 h-1 bg-cyan-200 rounded"></div>
              </div>
            </div>
            <div className="bg-orange-300/50 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-yellow-300" fill="currentColor" />
            </div>
            <div className="bg-orange-600/40 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-white/20 rounded transform rotate-45"></div>
            </div>

            <div className="bg-orange-500/60 rounded-lg flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-6 bg-cyan-300 rounded"></div>
                <div className="w-2 h-4 bg-cyan-400 rounded"></div>
                <div className="w-2 h-8 bg-cyan-300 rounded"></div>
                <div className="w-2 h-3 bg-cyan-500 rounded"></div>
              </div>
            </div>
            <div className="bg-orange-400/30 rounded-2xl flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-dashed border-white/40 rounded-full"></div>
            </div>
            <div className="bg-orange-700/40 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-full relative">
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="bg-orange-300/60 rounded-2xl flex items-center justify-center">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-300/80 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-300/80 rounded-full"></div>
                <div className="w-3 h-3 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-16 left-20 w-12 h-12 bg-white/10 rounded-lg animate-pulse"></div>
        <div className="absolute bottom-24 right-16 w-6 h-6 bg-cyan-300/80 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 left-8 w-10 h-10 bg-yellow-300/60 rounded transform rotate-12"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 relative">

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign Up to Boundless</h1>
            <p className="text-gray-600">Join today to unlock your future</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Theodore Kevin Ganteng" 
                        className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        type="email"
                        placeholder="you@example.com" 
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
                          placeholder="Password" 
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

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Confirm Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password" 
                          className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg pr-12"
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
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
                {form.formState.isSubmitting ? 'Creating Account...' : 'Register'}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <button 
                  type="button"
                  className="text-orange-600 hover:text-orange-700 hover:underline font-medium"
                  onClick={() => router.push("/login")}
                >
                  Log in here
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}