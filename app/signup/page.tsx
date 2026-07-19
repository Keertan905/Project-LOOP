"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const signupSchema = z
  .object({
    workspace: z.string().min(2, "Company name is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignupFormData = z.infer<typeof signupSchema>;

const fields = [
  { name: "workspace", label: "Company Name", type: "text" },
  { name: "name", label: "Full Name", type: "text" },
  { name: "email", label: "Email Address", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      router.push("/login");
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 transition-colors duration-200">
      <div className="w-full max-w-md rounded-xl bg-card-custom border border-card-border p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-center text-text-primary tracking-tight mb-2">
          Create Account
        </h1>

        <p className="text-center text-sm text-text-secondary mb-6">
          Welcome to Project LOOP
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ name, label, type }) => (
            <div key={name}>
              <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">
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
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}