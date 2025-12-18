"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm({ className, ...props }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const fullname = formData.get("full_name");
    const dob = formData.get("dob");
    const password = formData.get("password");

    const newUser = { email, full_name: fullname, dob, password, role: "patient" };

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Something went wrong during registration!");
        return;
      }
      else 
        {
          alert("User registered successfully!");
          router.push("/login");
        }
    } catch (err) {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <Link
        href="/login"
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="mr-3 h-5 w-5" />
        Back to Login
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign up</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to sign up for an account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="fullname"
            name="full_name"
            type="text"
            placeholder="John Smith"
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input id="dob" name="dob" type="date" required />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </div>
    </form>
  );
}
