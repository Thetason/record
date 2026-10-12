CREATE TABLE "profile_daily_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "ctaClicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_daily_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profile_daily_stats_userId_day_key" ON "profile_daily_stats"("userId", "day");

ALTER TABLE "profile_daily_stats" ADD CONSTRAINT "profile_daily_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
