"use client";

import { useState } from "react";
import { initiateEmailSignIn, initiateEmailSignUp, initiateSocialSignIn } from "@/firebase";
import { useAuth } from "@/firebase/hooks";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UserCredential } from "firebase/auth";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const createUserDocument = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photo_url: user.photoURL,
      }, { onConflict: 'id' });

    if (error) {
      console.error("Error creating user document in Supabase:", error);
      // We don't toast this error as it's a background task for the user
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      let userCredential: UserCredential;
      if (isSignUp) {
        userCredential = await initiateEmailSignUp(auth, email, password);
      } else {
        userCredential = await initiateEmailSignIn(auth, email, password);
      }
      await createUserDocument(userCredential);
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
      
      // With Supabase upsert, we can just call it every time.
      // It will create if new, or do nothing if exists and data is the same.
      await createUserDocument(result);

      router.push('/');

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
            ? "Regístrate para crear y guardar tus pronósticos personales. Solo tú puedes verlos."
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
