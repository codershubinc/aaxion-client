"use client";

import React from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LoginFormInputs {
  username: string;
  password: string;
  apiUrl: string;
}

interface AuthScreenProps {
  apiUrl: string;
  authLoading: boolean;
  authError: string | null;
  onLogin: (data: LoginFormInputs) => Promise<void>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  apiUrl,
  authLoading,
  authError,
  onLogin,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      username: "",
      password: "",
      apiUrl: apiUrl || "http://localhost:8080",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      if (!data.apiUrl.startsWith("http://") && !data.apiUrl.startsWith("https://")) {
        throw new Error("API URL must start with http:// or https://");
      }
      await onLogin(data);
    } catch (e) {
      console.error("Login submission error", e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-sans p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
      
      {/* Logo and branding */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="p-3.5 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/20 mb-3 border border-indigo-400/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Aaxion Cloud
        </h1>
        <p className="text-zinc-500 text-sm mt-1.5 font-medium">Single-Admin High Performance File Manager</p>
      </div>

      {/* shadcn Card Container */}
      <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl relative z-10 animate-scale-in">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-white mb-1.5">Sign In to Console</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Enter your administrator credentials below</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-6">
          {/* Global Submit Error */}
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5 animate-shake">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Standard HTML Form utilizing react-hook-form */}
          <form 
            method="POST" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleSubmit(onSubmit)(e); 
            }} 
            className="space-y-5"
          >
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Admin Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter admin name"
                className={`bg-zinc-950 border text-zinc-200 placeholder-zinc-600 focus-visible:ring-indigo-500/50 text-sm transition-all h-10 px-3 ${
                  errors.username ? "border-red-500/80" : "border-zinc-800"
                }`}
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`bg-zinc-950 border text-zinc-200 placeholder-zinc-600 focus-visible:ring-indigo-500/50 text-sm transition-all h-10 px-3 ${
                  errors.password ? "border-red-500/80" : "border-zinc-800"
                }`}
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* API Server Host Input */}
            <div className="space-y-2">
              <Label htmlFor="apiUrl" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase flex justify-between items-center">
                <span>API Base Server URL</span>
                <span className="text-[10px] text-indigo-400 normal-case">Must support CORS</span>
              </Label>
              <Input
                id="apiUrl"
                type="url"
                placeholder="http://localhost:8080"
                className={`bg-zinc-950 border text-zinc-200 placeholder-zinc-600 focus-visible:ring-indigo-500/50 text-sm transition-all h-10 px-3 ${
                  errors.apiUrl ? "border-red-500/80" : "border-zinc-800"
                }`}
                {...register("apiUrl", { 
                  required: "Server host URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Must be a valid HTTP/HTTPS URL"
                  }
                })}
              />
              {errors.apiUrl && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.apiUrl.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full mt-6 h-10 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-lg shadow-indigo-600/25 disabled:opacity-50 border-0 cursor-pointer"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In to Console"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
