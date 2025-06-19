ALTER TABLE `users` MODIFY COLUMN `id` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('pelapor','petugas','admin') NOT NULL DEFAULT 'pelapor';--> statement-breakpoint
ALTER TABLE `users` ADD `nama` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('aktif','nonaktif','menunggu_verifikasi') DEFAULT 'aktif';--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updatedAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpires` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(255);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `username`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;