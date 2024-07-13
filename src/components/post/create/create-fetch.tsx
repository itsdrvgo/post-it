import { PAGES, TOKENS } from "@/config/const";
import { db } from "@/lib/drizzle";
import { users } from "@/lib/drizzle/schema";
import { decodeAuthToken } from "@/lib/jwt";
import { userClientSchema } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreatePostPage } from "./create-post-page";

export async function CreateFetch(props: GenericProps) {
    const cookieStore = cookies();
    const authToken = cookieStore.get(TOKENS.AUTH_COOKIE_NAME)?.value;
    if (!authToken) redirect(PAGES.AUTH_PAGE);

    const { sub: userId } = decodeAuthToken(authToken);
    if (!userId) redirect(PAGES.AUTH_PAGE);

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    if (!user) redirect(PAGES.AUTH_PAGE);

    const parsedUser = userClientSchema.parse(user);

    return <CreatePostPage user={parsedUser} {...props} />;
}
