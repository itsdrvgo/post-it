import { JSDOM } from "jsdom";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const linkRouter = createTRPCRouter({
    getMetadata: publicProcedure
        .input(
            z.object({
                link: z.string(),
            })
        )
        .query(async ({ input }) => {
            const { link } = input;

            if (!link) return null;
            if (link.match(/https?:\/\/[^\s]+/g) === null) return null;

            const res = await fetch(link);
            const html = await res.text();

            const dom = new JSDOM(html);
            const { document } = dom.window;

            const title =
                document.querySelector("title")?.textContent ??
                document
                    .querySelector("meta[property='og:title']")
                    ?.getAttribute("content") ??
                document
                    .querySelector("meta[property='twitter:title']")
                    ?.getAttribute("content") ??
                document
                    .querySelector("meta[property='og:site_name']")
                    ?.getAttribute("content");
            const description =
                document
                    .querySelector("meta[name='description']")
                    ?.getAttribute("content") ??
                document
                    .querySelector("meta[property='og:description']")
                    ?.getAttribute("content") ??
                document
                    .querySelector("meta[property='twitter:description']")
                    ?.getAttribute("content");
            const image =
                document
                    .querySelector("meta[property='og:image']")
                    ?.getAttribute("content") ??
                document
                    .querySelector("meta[property='twitter:image']")
                    ?.getAttribute("content") ??
                document
                    .querySelector("meta[property='og:image:secure_url']")
                    ?.getAttribute("content");

            return {
                title,
                description,
                image,
                url: link,
            };
        }),
});
