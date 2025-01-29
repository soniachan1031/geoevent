import { IUser } from "@/types/user.types";
import { createContext } from "react";

export interface TAuthContext {
  user: IUser | null;
  authLoading: boolean;
  authError: string | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<TAuthContext>({
  user: null,
  authLoading: false,
  authError: null,
  setUser: () => {},
  setAuthLoading: () => {},
  setAuthError: () => {},
});

export default AuthContext;
