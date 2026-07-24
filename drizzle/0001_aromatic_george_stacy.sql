CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelId` int NOT NULL,
	`userId` int NOT NULL,
	`bestTime` int NOT NULL,
	`userName` varchar(128) NOT NULL,
	`rank` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelNumber` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`difficulty` enum('easy','medium','hard','extreme') NOT NULL,
	`description` text,
	`targetTime` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `levels_levelNumber_unique` UNIQUE(`levelNumber`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`levelId` int NOT NULL,
	`isUnlocked` int NOT NULL DEFAULT 0,
	`isCompleted` int NOT NULL DEFAULT 0,
	`bestTime` int,
	`stars` int DEFAULT 0,
	`attempts` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalScore` int NOT NULL DEFAULT 0,
	`totalStars` int NOT NULL DEFAULT 0,
	`completedLevels` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `userStats_userId_unique` UNIQUE(`userId`)
);
