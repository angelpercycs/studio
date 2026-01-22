"use client";

import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/firebase/hooks";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Gem, Star } from "lucide-react";

function getInitials(name?: string | null) {
  if (!name) return "";
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name[0];
}

export function UserProfile() {
  const { user, userProfile, isLoading, isDonor, donationExpiry } = useUserProfile();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-24" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Acceder</Link>
      </Button>
    );
  }
  
  const expiryDate = donationExpiry ? format(donationExpiry, "d MMM yyyy", { locale: es }) : null;
  const displayName = user.displayName || userProfile?.name;
  const photoURL = user.photoURL || userProfile?.photo_url;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={photoURL ?? ""} alt={displayName ?? ""} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isDonor && expiryDate && (
           <DropdownMenuItem disabled className="text-yellow-500 focus:text-yellow-500">
              <Star className="mr-2 h-4 w-4" />
              <span>Premium hasta {expiryDate}</span>
           </DropdownMenuItem>
        )}
        <Link href="/mis-pronosticos">
            <DropdownMenuItem>
                Mis Pronósticos
            </DropdownMenuItem>
        </Link>
        <Link href="/reclamar-recompensa">
            <DropdownMenuItem>
                <Gem className="mr-2 h-4 w-4" />
                Reclamar Recompensa
            </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
