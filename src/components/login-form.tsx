"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { initiateSocialSignIn } from "@/firebase/non-blocking-login";

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.05 1.67-3.57 0-6.47-3.05-6.47-6.8s2.9-6.8 6.47-6.8c1.93 0 3.36.79 4.3 1.7l2.16-2.16C17.03 2.35 14.95 1.5 12.48 1.5c-4.97 0-9 4.03-9 9s4.03 9 9 9c4.8 0 8.7-3.23 8.7-8.83 0-.56-.05-1.11-.14-1.64h-8.56Z" />
  </svg>
);

const FacebookIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Facebook</title>
    <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h5.698c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z" />
  </svg>
);

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setLoading(provider);
    setError(null);
    try {
      const userCredential = await initiateSocialSignIn(auth, provider);
      if (userCredential && userCredential.user) {
        router.push("/");
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
         setError(`Error al iniciar sesión con ${provider}.`);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("email");
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No existe un usuario con ese correo electrónico.");
          break;
        case "auth/wrong-password":
          setError("La contraseña es incorrecta.");
          break;
        case "auth/email-already-in-use":
          setError("El correo electrónico ya está en uso por otra cuenta.");
          break;
        case "auth/weak-password":
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        default:
          setError("Ocurrió un error. Por favor, inténtelo de nuevo.");
          break;
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6">
      {isSignUp ? (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!loading}
              />
            </div>
            <Button type="submit" disabled={!!loading} className="w-full">
              {loading === "email" ? "Cargando..." : "Registrarse"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!loading}
              />
            </div>
            <Button type="submit" disabled={!!loading} className="w-full">
              {loading === "email" ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Autenticación</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          disabled={!!loading}
        >
          {loading === "google" ? (
            "Cargando..."
          ) : (
            <>
              <GoogleIcon className="mr-2 h-4 w-4" /> Google
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("facebook")}
          disabled={!!loading}
          className="bg-[#1877F2] text-white hover:bg-[#166fe5]"
        >
          {loading === "facebook" ? (
            "Cargando..."
          ) : (
            <>
              <FacebookIcon className="mr-2 h-4 w-4 fill-white" /> Facebook
            </>
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={!!loading}
          className="text-muted-foreground"
        >
          {isSignUp
            ? "¿Ya tienes una cuenta? Inicia sesión"
            : "¿No tienes una cuenta? Regístrate"}
        </Button>
      </div>
    </div>
  );
}
