-- CREATE TABLE reports (
-- 	`id` int AUTO_INCREMENT NOT NULL,
-- 	`code` text NOT NULL,
-- 	`disaster_type` text NOT NULL,
-- 	`location` text NOT NULL,
-- 	`detailed_address` text,
-- 	`description` text NOT NULL,
-- 	`reporter_name` text,
-- 	`reporter_phone` text,
-- 	`reporter_email` text,
-- 	`photos` json,
-- 	`status` text NOT NULL DEFAULT ('pending'),
-- 	`latitude` text,
-- 	`longitude` text,
-- 	`assigned_to` text,
-- 	`created_at` timestamp DEFAULT (now()),
-- 	`updated_at` timestamp DEFAULT (now()),
-- 	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
-- );
-- --> statement-breakpoint
-- CREATE TABLE users (
-- 	`id` int AUTO_INCREMENT NOT NULL,
-- 	`username` text NOT NULL,
-- 	`password` text NOT NULL,
-- 	`role` text NOT NULL DEFAULT ('user'),
-- 	`name` text,
-- 	CONSTRAINT `users_id` PRIMARY KEY(`id`)
-- );
