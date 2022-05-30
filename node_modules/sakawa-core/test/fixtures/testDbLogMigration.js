module.exports = {
    up: `
create table IF NOT EXISTS query_log
(
    id          int auto_increment,
    createtime  datetime     default CURRENT_TIMESTAMP not null,
    server_name varchar(255)                           null,
    server_time varchar(255)                           null,
    type        varchar(255)                           null,
    uid         varchar(255) default '__NA__'          not null,
    \`table\`     varchar(255)                           null,
    query       longtext                               null,
    datadump    longtext                               null,
    error       mediumtext                             null,
    seconds     varchar(255)                           null,
    view        varchar(255)                           null,
    ip          varchar(255)                           null,
    room_id     varchar(255)                           null,
    primary key (id, createtime, uid)
)
    charset = utf8;
create table IF NOT EXISTS server_ap_log
(
    id          int auto_increment
        primary key,
    createtime  datetime default CURRENT_TIMESTAMP null,
    server_name varchar(255)                       null,
    server_time varchar(255)                       null,
    type        varchar(255)                       null,
    uid         varchar(255)                       null,
    info        mediumtext                         null,
    args        mediumtext                         null,
    datadump    longtext                           null,
    ip          varchar(255)                       null,
    room_id     varchar(255)                       null
)
    charset = utf8;
`,
    down: `DROP TABLE IF EXISTS query_log;DROP TABLE IF EXISTS server_ap_log`
};

