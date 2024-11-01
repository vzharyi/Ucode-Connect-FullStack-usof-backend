CREATE DATABASE IF NOT EXISTS usof_vzharyi;

GRANT ALL ON usof_vzharyi.* TO 'vzharyi'@'localhost';

USE usof_vzharyi;

create TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT NOT NULL,
    login           VARCHAR(30)                 NOT NULL,
    password        VARCHAR(255)                NOT NULL,
    full_name       VARCHAR(255)           DEFAULT NULL,
    email           VARCHAR(255)                NOT NULL,
    email_verified  BOOLEAN                DEFAULT FALSE,
    profile_picture VARCHAR(255),
    rating          INT UNSIGNED           DEFAULT 0,
    role            ENUM ('user', 'admin') DEFAULT 'user',
    createdAt       DATETIME               DEFAULT NULL,
    updatedAt       DATETIME               DEFAULT NULL,
    CONSTRAINT users_id_pk PRIMARY KEY (id),
    CONSTRAINT users_login_uq UNIQUE (login),
    CONSTRAINT users_email_uq UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS posts (
    id         INT UNSIGNED AUTO_INCREMENT NOT NULL,
    author_id  INT UNSIGNED                NOT NULL,
    title      VARCHAR(255)                NOT NULL,
    createdAt  DATETIME                    DEFAULT NULL,
    updatedAt  DATETIME                    DEFAULT NULL,
    rating     INT UNSIGNED                DEFAULT 0,
    likesCount INT UNSIGNED                DEFAULT 0,
    locked     BOOLEAN                     DEFAULT FALSE,
    status     ENUM ('active', 'inactive') DEFAULT 'active',
    content    TEXT                        NOT NULL,
    CONSTRAINT posts_id_pk PRIMARY KEY (id),
    CONSTRAINT posts_author_fk FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id          INT UNSIGNED AUTO_INCREMENT NOT NULL,
    title       VARCHAR(255)                NOT NULL,
    createdAt   DATETIME                    DEFAULT NULL,
    updatedAt   DATETIME                    DEFAULT NULL,
    description TEXT,
    CONSTRAINT categories_id_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS post_categories (
    post_id     INT UNSIGNED                NOT NULL,
    category_id INT UNSIGNED                NOT NULL,
    CONSTRAINT post_categories_pk PRIMARY KEY (post_id, category_id),
    CONSTRAINT post_categories_post_fk FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT post_categories_category_fk FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite_post (
    user_id INT UNSIGNED                    NOT NULL,
    post_id INT UNSIGNED                    NOT NULL,
    CONSTRAINT user_post_pk PRIMARY KEY (user_id, post_id),
    CONSTRAINT user_post_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT user_post_post_fk FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id        INT UNSIGNED AUTO_INCREMENT NOT NULL,
    author_id INT UNSIGNED                NOT NULL,
    createdAt DATETIME                    DEFAULT NULL,
    updatedAt DATETIME                    DEFAULT NULL,
    post_id   INT UNSIGNED                NOT NULL,
    content   TEXT                        NOT NULL,
    rating    INT UNSIGNED DEFAULT 0,
    CONSTRAINT comments_id_pk PRIMARY KEY (id),
    CONSTRAINT comments_author_fk FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT comments_post_fk FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    id         INT UNSIGNED AUTO_INCREMENT NOT NULL,
    author_id  INT UNSIGNED                NOT NULL,
    createdAt  DATETIME                    DEFAULT NULL,
    updatedAt  DATETIME                    DEFAULT NULL,
    post_id    INT UNSIGNED                DEFAULT NULL,
    comment_id INT UNSIGNED                DEFAULT NULL,
    type       ENUM ('like', 'dislike')    NOT NULL,
    CONSTRAINT likes_id_pk PRIMARY KEY (id),
    CONSTRAINT likes_author_fk FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT likes_post_fk FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT likes_comment_fk FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
);


INSERT INTO users (login, password, full_name, email, email_verified, profile_picture, rating, role, createdAt, updatedAt)
VALUES ('tech_guru', '$2b$10$QB2vKGQv3eWqtosc0/4Rm.uCuVR7SOpVmUDn7t4C2hQUOrZxGiUWG', 'Alex Johnson',
        'alex.johnson@example.com', TRUE, '../uploads/avatars/male.png', 2, 'user', NOW(), NOW()),
       ('health_lover', '$2b$10$WhgVAK12oSTe9BoJcB/rOe0OGxIdVRDWMs.BBT7tp25kjM2zgOvPC', 'Maria Garcia',
        'maria.garcia@example.com', TRUE, '../uploads/avatars/female.png', 0, 'user', NOW(), NOW()),
       ('admin_master', '$2b$10$YErIOjtgKcYQ/gHC./VYiOgAjOs2YwTQ12fmTKYaChKE9UhoSEp0S', 'John Smith',
        'john.smith@example.com', TRUE, '../uploads/avatars/male.png', 0, 'admin', NOW(), NOW()),
       ('travel_enthusiast', '$2b$10$AZC3ciLWQ1sXhYTmyP.8/eUApVg56NWmvq/o4i6mLnvo6kCWlR8AC', 'Emily Brown',
        'emily.brown@example.com', FALSE, '../uploads/avatars/female.png', 0, 'user', NOW(), NOW()),
       ('foodie_fan', '$2b$10$GxGsqXoUp1Rvc9tbgPbIfeCdV.2fYzbu5x.D5MagNICHJ83WkqAta', 'David Wilson',
        'david.wilson@example.com', TRUE, '../uploads/avatars/male.png', 0, 'user', NOW(), NOW());

INSERT INTO posts (author_id, title, createdAt, updatedAt, rating, likesCount, locked, status, content)
VALUES (1, 'The Future of Technology: Innovations That Will Shape Our Lives', NOW(), NOW(), 0, 45, FALSE, 'active',
        'In this article, we explore the latest technological advancements that are set to revolutionize our daily lives. From AI to quantum computing, discover what the future holds.'),
       (1, 'Healthy Eating: Tips for a Balanced Diet', NOW(), NOW(), 1, 30, FALSE, 'active',
        'Eating healthy is more important than ever. Here are some practical tips for maintaining a balanced diet and improving your overall well-being.'),
       (2, 'Travel Tips for Budget Travelers', NOW(), NOW(), 0, 25, FALSE, 'inactive',
        'Traveling on a budget can be challenging. Here are some essential tips to help you save money while exploring the world.'),
       (3, 'Understanding Mental Health: A Comprehensive Guide', NOW(), NOW(), 0, 50, TRUE, 'active',
        'Mental health is a critical component of overall well-being. This guide covers important aspects of mental health and offers resources for those in need.'),
       (4, 'Delicious Recipes for Every Occasion', NOW(), NOW(), 0, 35, FALSE, 'inactive',
        'Looking for new recipes to try? Here are some delicious options for every occasion, from quick dinners to elaborate feasts.');

INSERT INTO categories (title, createdAt, updatedAt, description)
VALUES ('Technology', NOW(), NOW(), 'All about the latest technology trends and innovations.'),
       ('Health & Wellness', NOW(), NOW(), 'Guides and tips on maintaining a healthy lifestyle.'),
       ('Travel', NOW(), NOW(), 'Insights and tips for travelers around the globe.'),
       ('Mental Health', NOW(), NOW(), 'Resources and information on mental health awareness.'),
       ('Food & Recipes', NOW(), NOW(), 'Explore recipes, cooking tips, and food-related articles.');

INSERT INTO post_categories (post_id, category_id)
VALUES (1, 1),
       (1, 2),
       (2, 2),
       (3, 1),
       (3, 4),
       (4, 5),
       (5, 5),
       (2, 3);

INSERT INTO favorite_post (user_id, post_id)
VALUES (1, 1),
       (2, 2),
       (1, 3),
       (3, 1),
       (4, 5);

INSERT INTO comments (author_id, createdAt, updatedAt, post_id, content, rating)
VALUES (1, NOW(), NOW(), 1, 'An enlightening read! Really opens your eyes to future technologies.', 1),
       (2, NOW(), NOW(), 1, 'Great article, I learned a lot about AI.', 0),
       (3, NOW(), NOW(), 2, 'This is exactly what I needed! Thank you for the tips.', 0),
       (1, NOW(), NOW(), 3, 'Traveling on a budget is tricky, but your tips are super helpful.', 0),
       (4, NOW(), NOW(), 4, 'A must-read for anyone concerned about mental health.', 0);

INSERT INTO likes (author_id, createdAt, updatedAt, post_id, comment_id, type)
VALUES (1, NOW(), NOW(), 1, NULL, 'like'),
       (2, NOW(), NOW(), 1, NULL, 'dislike'),
       (3, NOW(), NOW(), 2, NULL, 'like'),
       (4, NOW(), NOW(), NULL, 1, 'like'),
       (1, NOW(), NOW(), NULL, 2, 'dislike');