CREATE TABLE `users` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `display_name` varchar(255),
  `email` varchar(255) UNIQUE,
  `phone` varchar(255),
  `avatar_url` varchar(255),
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `user_auth_providers` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint,
  `provider` varchar(255),
  `provider_user_id` varchar(255),
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `restaurants` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `address` text,
  `phone` varchar(255),
  `description` text,
  `tags` varchar(255),
  `search_name` varchar(255),
  `search_address` varchar(255),
  `search_tags` varchar(255),
  `require_deposit` boolean DEFAULT false,
  `default_deposit_amount` int DEFAULT 0,
  `is_active` boolean DEFAULT true,
  `average_rating` float DEFAULT 0,
  `review_count` int DEFAULT 0,
  `invite_code` varchar(255) UNIQUE,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `restaurant_accounts` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `restaurant_id` bigint,
  `full_name` varchar(255),
  `email` varchar(255) UNIQUE,
  `password_hash` varchar(255),
  `role` varchar(255),
  `status` varchar(255),
  `avatar_url` varchar(255),
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `restaurant_tables` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `restaurant_id` bigint,
  `name` varchar(255),
  `capacity` int,
  `location` varchar(255),
  `status` varchar(255),
  `view_image_url` varchar(255),
  `view_note` varchar(255),
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `bookings` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `restaurant_id` bigint,
  `table_id` bigint,
  `user_id` bigint,
  `people_count` int,
  `booking_time` datetime,
  `status` varchar(255),
  `deposit_amount` int DEFAULT 0,
  `payment_status` varchar(255) DEFAULT 'NONE',
  `note` text,
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `payments` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `booking_id` bigint,
  `amount` int,
  `provider` varchar(255),
  `status` varchar(255),
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `reviews` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `booking_id` bigint,
  `restaurant_id` bigint,
  `user_id` bigint,
  `rating` int,
  `comment` text,
  `status` varchar(255) DEFAULT 'VISIBLE',
  `created_at` datetime,
  `updated_at` datetime
);

CREATE TABLE `favorite_restaurants` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint,
  `restaurant_id` bigint,
  `created_at` datetime
);

CREATE TABLE `notifications` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint,
  `restaurant_id` bigint,
  `type` varchar(255),
  `title` varchar(255),
  `message` text,
  `channel` varchar(255) DEFAULT 'IN_APP',
  `is_read` boolean DEFAULT false,
  `read_at` datetime,
  `created_at` datetime,
  `sent_at` datetime
);

CREATE TABLE `restaurant_images` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `restaurant_id` bigint,
  `file_path` varchar(255),
  `type` varchar(255),
  `caption` varchar(255),
  `is_primary` boolean DEFAULT false,
  `created_at` datetime
);

CREATE UNIQUE INDEX `user_auth_providers_index_0` ON `user_auth_providers` (`provider`, `provider_user_id`);

CREATE INDEX `bookings_index_1` ON `bookings` (`restaurant_id`, `booking_time`);

CREATE INDEX `bookings_index_2` ON `bookings` (`user_id`, `booking_time`);

CREATE UNIQUE INDEX `reviews_index_3` ON `reviews` (`booking_id`);

CREATE UNIQUE INDEX `favorite_restaurants_index_4` ON `favorite_restaurants` (`user_id`, `restaurant_id`);

ALTER TABLE `user_auth_providers` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `restaurant_accounts` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

ALTER TABLE `restaurant_tables` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `payments` ADD FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `favorite_restaurants` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `favorite_restaurants` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

ALTER TABLE `restaurant_images` ADD FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);
