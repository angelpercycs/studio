"use client";

import { useState } from "react";
import { initiateEmailSignIn, initiateEmailSignUp, initiateSocialSignIn } from "@/firebase";
import { useAuth } from "@/firebase/hooks";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      if (isSignUp) {
        await initiateEmailSignUp(auth, email, password);
      } else {
        await initiateEmailSignIn(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.message,
      });
    }
  };

  const handleSocialLogin = async (provider: "google.com") => {
    if (!auth) return;
    try {
      const result = await initiateSocialSignIn(auth, provider);
      if (result.user) {
        router.push('/');
      }
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            toast({
              variant: "destructive",
              title: "Error de inicio de sesión",
              description: "No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.",
            });
        }
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">
          {isSignUp ? "Crear una cuenta" : "Iniciar Sesión"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSignUp
            ? "Crea una cuenta para guardar tus pronósticos."
            : "Inicia sesión para ver tus pronósticos."}
        </p>
      </div>
      <form onSubmit={handleAuthAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          {isSignUp ? "Registrarse" : "Iniciar Sesión"}
        </Button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O</span>
        </div>
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("google.com")}
        >
          Continuar con Google
        </Button>
      </div>
      <div className="mt-6 text-center text-sm">
        {isSignUp ? (
          <>
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => setIsSignUp(false)}
              className="font-semibold text-primary underline"
            >
              Inicia sesión
            </button>
          </>
        ) : (
          <>
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => setIsSignUp(true)}
              className="font-semibold text-primary underline"
            >
              Regístrate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
