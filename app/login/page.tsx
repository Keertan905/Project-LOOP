"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const fields = [
  { name: "email", label: "Email Address", type: "email" },
  { name: "password", label: "Password", type: "password" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      alert("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 transition-colors duration-200">
      <div className="w-full max-w-md rounded-xl bg-card-custom border border-card-border p-8 shadow-sm">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-text-primary tracking-tight">
          Welcome Back
        </h1>

        <p className="mb-6 text-center text-sm text-text-secondary">
          Login to your Project LOOP account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ name, label, type }) => (
            <div key={name}>
              <label className="mb-1 block text-xs text-text-secondary font-bold uppercase tracking-wider">
                {label}
              </label>

              <input
                type={type}
                {...register(name)}
                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {errors[name]?.message && (
                <p className="text-xs text-status-neg mt-1 font-semibold">
                  {errors[name]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary hover:bg-primary-hover py-2.5 text-white font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}