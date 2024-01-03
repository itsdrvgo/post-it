import { User } from "@/src/lib/drizzle/schema";
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";

type UserContextProps = {
    user: User | null;
    isSignedIn: boolean;
    isLoaded: boolean;
    setUser: Dispatch<SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextProps>({
    user: null,
    isSignedIn: false,
    isLoaded: false,
    setUser: () => {},
});

export const useUser = () => {
    const context = useContext(UserContext);
    return context;
};

const LOCAL_STORAGE_KEY = "post_it__user";

function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== "undefined") {
            const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (user)
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, [user]);

    const isSignedIn = !!user;
    const isLoaded = typeof window !== "undefined";

    return (
        <UserContext.Provider value={{ user, isSignedIn, isLoaded, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;
