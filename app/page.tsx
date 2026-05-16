import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">

        {/* Logo */}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="CodeArena Logo"
          width={90}
          height={20}
          priority
        />

        {/* Text Section */}
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-8">

          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            🔥 CodeArena Gaming Platform
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Welcome to your gamified coding world. Solve problems, earn XP, level up like a game.
          </p>

          {/* XP / Feature hint */}
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            ⚡ Daily challenges • 🏆 Leaderboards • 🎮 Gaming UI for coding
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-10">

          <a
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-full bg-black text-white px-6 transition hover:opacity-80 dark:bg-white dark:text-black md:w-[160px]"
          >
            Enter Arena 🚀
          </a>

          <a
            href="/dashboard"
            className="flex h-12 w-full items-center justify-center rounded-full border border-black/10 px-6 transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 md:w-[160px]"
          >
            View Dashboard
          </a>

        </div>
      </main>
    </div>
  );
}
