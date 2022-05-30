module.exports = {
    up: `CREATE TABLE IF NOT EXISTS user
(
    id int auto_increment
primary key,
    last_name varchar(255) null,
    first_name varchar(255) null,
    nums int null 
);
CREATE TABLE IF NOT EXISTS user_address
(
    id int auto_increment
primary key,
    uid int NOT NULL ,
    addr varchar(255) null,
    INDEX (uid)
);`,
    down: `DROP TABLE IF EXISTS user;DROP TABLE IF EXISTS addr`
};

