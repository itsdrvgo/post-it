# **POST IT**

A simple rip-off of social media apps like Twitter, Facebook, Instagram, etc. This is a project to learn the basics of `Next.JS`, `React`, `tRPC`, `JWT`, & `Drizzle ORM`.

![og](public/og.webp)

## !! ⚠ Warning !!

-   **PLEASE DO NOT ENTER YOUR REAL PASSWORDS IN THE APP.** Even though the passwords are hashed, it is not safe to enter your real passwords. This project is just for learning purposes and should not be used in production.

-   **WE DO NOT REGULARLY REGULATE THE CONTENT POSTED BY THE USERS REGULARLY.** We are not responsible for any content posted by the users. If you find any inappropriate content, please report it to us. The content is auto-filtered by our Profanity Filter, but it is not 100% accurate.

-   **WE DO NOT STORE ANY PERSONAL DATA.** We only store the username and your password as a hashed string. We do not store any other personal data.

-   **WE DO NOT SELL YOUR DATA TO ANY THIRD-PARTY.** We do not sell your data to any third-party. We only use your data to provide you with the services.

## !! ⚠ KNOWN ISSUES & TO-DOs !!

-   **RESPONSIVE USERS TABLE** - The users table in the Admin Panel is not responsive. It is recommended to view the Admin Panel on a desktop or a laptop.

## Tech Stack

-   [Next.JS](https://nextjs.org/) - React Framework to build SSR React Apps with ease.
-   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
-   [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom designs.
-   [Drizzle ORM](https://orm.drizzle.team/) - A simple ORM for interacting with the SQL databases.
-   [Supabase PostgreSQL](https://supabase.com/) - A simple PostgreSQL database with a REST API.
-   [Vercel](https://vercel.com/) - A cloud platform for static sites and Serverless Functions.
-   [ShadCN UI](https://ui.shadcn.com/) - A collection of UI components for React.
-   [jose](https://github.com/panva/jose) - A JavaScript implementation of the JSON Object Signing and Encryption (JOSE) for JWTs.
-   [tRPC](https://trpc.io/) - A TypeScript RPC framework for building reliable HTTP APIs with ease, on top of [Next.JS](https://nextjs.org/).
-   [TanStack Query](https://tanstack.com/query/latest/) - A React Hooks for fetching, caching and updating asynchronous data in React.
-   [React Hook Form](https://react-hook-form.com/) - Performant, flexible and extensible forms with easy-to-use validation.
-   [UploadThing](https://uploadthing.com/) - A simple file upload API for your projects.
-   [Profanity API](https://profanity.dev/) - A simple `FREE` API to detect profanity in the text.

## Features

-   **Post**

    -   Create a post, similar to Twitter.
    -   Add images to your post.
    -   Maximize 2 images per post.
    -   Auto-detects links in the post and converts them to clickable links.
    -   Auto-embeds YouTube videos in the post.
    -   Auto-embeds links to images in the post.
    -   Profanity Filter.
        -   Auto-detects profanity in the post.
        -   Marks the post as `pending` if profanity is detected.
        -   Admin can approve or reject the post.

-   **View Post**

    -   View a post with all the details.
    -   View the images in the post.
    -   View the YouTube video in the post.
    -   View the links in the post.
    -   Infinite scrolling to view more posts.

-   **Role-based Authentication**

    -   Authentication with username and password.
    -   JWT & Role based authentication.
    -   Auto-login with the JWT token.
    -   Logout from the app.
    -   Register a new account.
    -   Single session login.
        -   If you login from another device, the session on the previous device will be invalidated.
    -   Refresh token.
        -   If the access token expires, the refresh token will be used to generate a new access token.
        -   The refresh token will be invalidated if the user logs out.

-   **Dedicated User Profile**

    -   View your own profile.
    -   View your own posts.
    -   Change your password & username.
    -   Delete your account.

-   **Admin Panel**
    -   Users Page
        -   Display all the users in the app.
        -   Promote or demote a user, (USER, MOD, ADMIN).
        -   Restrict or unrestrict a user.
        -   Delete a user.
    -   Posts Page
        -   Show posts marked as `pending` by Auto-Profanity Filter.
        -   Approve or reject a post.
        -   Mass approve or reject posts.
    -   Site Preferences
        -   Manage whether new users can register or not.
        -   Manage whether users can post or not.

## Installation

The repo uses [bun](https://bun.sh/) as the package manager. You can use `npm` or `yarn` if you want. But I recommend using `bun` as it is faster and more secure.

```bash
# Clone the repo
git clone https://github.com/itsdrvgo/post-it

# Install the dependencies
bun i

# Fill the environment variables
# You can find the list of environment variables in .env.example file
# Get your own API keys from https://uploadthing.com/ and https://supabase.com/
cp .env.example .env

# To know more about generating the access token and refresh token, visit https://github.com/itsdrvgo/nextjs-jwt-auth-example

# Run the development server
bun run dev
```

The app should be up and running on [localhost](http://localhost:3000).

```bash
# Build the app for production
bun run build

# Run the app in production mode
bun run start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Feel free to add more features to the app. I could've added likes, comments, etc. but I wanted to keep it simple.

I didn't have much time to work on this project as we are already working on a similar project, and this was just a rip-off of that project. Thank you!

Read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## License

This project is licensed under the [MIT License](LICENSE).

## Feedback

Feel free to send me feedback on [X](https://x.com/itsdrvgo) or file an issue. Feature requests are always welcome. If you wish to contribute, please take a quick look at the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Connect with me

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/itsdrvgo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/itsdrvgo)
[![Twitch](https://img.shields.io/badge/Twitch-%239146FF.svg?logo=Twitch&logoColor=white)](https://twitch.tv/itsdrvgo)
[![X](https://img.shields.io/badge/X-%23000000.svg?logo=X&logoColor=white)](https://x.com/itsdrvgo)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@itsdrvgodev)
