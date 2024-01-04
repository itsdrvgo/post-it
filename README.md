# **POST IT**

A simple rip-off of social media apps like Twitter, Facebook, Instagram, etc. This is a project to learn the basics of `Next.JS`, `React`, `TailwindCSS` & `Drizzle ORM`.

## !! ⚠ Warning !!

```
PLEASE DO NOT ENTER YOUR REAL PASSWORDS IN THE APP. EVEN THOUGH THE PASSWORDS ARE HASHED, IT IS NOT SAFE TO ENTER YOUR REAL PASSWORDS. THIS IS JUST A PROJECT TO LEARN, WE ARE NOT RESPONSIBLE FOR ANY DATA LEAKS.
```

## Tech Stack

-   [Next.JS](https://nextjs.org/) - React Framework to build SSR React Apps with ease.
-   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
-   [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom designs.
-   [Drizzle ORM](https://orm.drizzle.team/) - A simple ORM for interacting with the SQL databases.
-   [Planetscale MySQL](https://www.planetscale.com/) - A MySQL database hosted on the cloud.
-   [Vercel](https://vercel.com/) - A cloud platform for static sites and Serverless Functions.
-   [NextUI](https://nextui.org/) - A React UI Library with 50+ Components for Next.js and Tailwind CSS.
-   [tRPC](https://trpc.io/) - A TypeScript RPC framework for building reliable HTTP APIs with ease, on top of [Next.JS](https://nextjs.org/).
-   [TanStack Query](https://tanstack.com/query/latest/) - A React Hooks for fetching, caching and updating asynchronous data in React.
-   [UploadThing](https://uploadthing.com/) - A simple file upload API for your projects.

## Features

-   **Post**

    -   Create a post, similar to Twitter.
    -   Add images to your post.
    -   Maximize 2 images per post.
    -   Auto-detects links in the post and converts them to clickable links.
    -   Auto-embeds YouTube videos in the post.
    -   Auto-embeds links to images in the post.

-   **View Post**

    -   View a post with all the details.
    -   View the images in the post.
    -   View the YouTube video in the post.
    -   View the links in the post.
    -   Infinite scrolling to view more posts.

-   **Authentication**
    -   Simple authentication with username only.
    -   Data is stored in the browser's local storage.
    -   No need to login again after closing the browser.
    -   Logout button to clear the data from the local storage.
    -   Unique username is required to login.

## Installation

The repo uses [pnpm](https://pnpm.io/) as the package manager. You can use `npm` or `yarn` or `bun` as well.

```bash
# Clone the repo
git clone https://github.com/itsdrvgo/post-it

# Install the dependencies
pnpm install

# Fill the environment variables
# You can find the list of environment variables in .env.example file
# Get your own API keys from https://uploadthing.com/ and https://www.planetscale.com/
cp .env.example .env

# Run the development server
pnpm dev
```

The app should be up and running on [http://localhost:3000](http://localhost:3000).

```bash
# Build the app for production
pnpm build

# Run the app in production mode
pnpm start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Feel free to add more features to the app. I could've added likes, comments, etc. but I wanted to keep it simple.

I didn't have much time to work on this project as we are already working on a similar project, and this was just a rip-off of that project. Thank you!

Read more about contributing [here](https://github.com/itsdrvgo/post-it/blob/master/CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](https://github.com/itsdrvgo/post-it/blob/master/LICENSE).

## Feedback

Feel free to send me feedback on [X](https://x.com/itsdrvgo) or [file an issue](https://github.com/itsdrvgo/post-it/issues/new). Feature requests are always welcome. If you wish to contribute, please take a quick look at the [guidelines](https://github.com/itsdrvgo/post-it/blob/master/CONTRIBUTING.md)!

## Connect with me

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/itsdrvgo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/itsdrvgo)
[![Twitch](https://img.shields.io/badge/Twitch-%239146FF.svg?logo=Twitch&logoColor=white)](https://twitch.tv/itsdrvgo)
[![X](https://img.shields.io/badge/X-%23000000.svg?logo=X&logoColor=white)](https://x.com/itsdrvgo)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@itsdrvgodev)
