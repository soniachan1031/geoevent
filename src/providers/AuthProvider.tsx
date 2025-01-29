import AuthContext, { TAuthContext } from "@/context/AuthContext";
import { IUser } from "@/types/user.types";
import { useState, useMemo } from "react";

function AuthProvider({
  user: authUser,
  children,
}: Readonly<{ user: IUser | null; children: React.ReactNode }>) {
  const [user, setUser] = useState<IUser | null>(authUser);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const state = useMemo(
    () =>
      ({
        user,
        authLoading,
        authError,
        setUser,
        setAuthLoading,
        setAuthError,
      } as TAuthContext),
    [user, authLoading, authError]
  );
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
