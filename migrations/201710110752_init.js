module.exports.up = async (db) => {

  await db.raw(`
    create table "user" (
      id integer not null constraint user_pkey primary key,
      first_name varchar,
      last_name varchar,
      username varchar,
      language_code varchar(5),
      session jsonb,
      phone_number varchar,
      role varchar)`);

  await db.raw(`
    create table translation (
      id varchar(255) not null constraint strings_pkey primary key,
      text text)`);

  await db.raw(`
    create table "order" (
      id serial not null constraint order_pkey primary key,
      user_id integer constraint order_user_id_fk references "user" on update cascade on delete cascade,
      create_time timestamp not null,
      update_time timestamp not null,
      location jsonb,
      date date,
      start_time varchar,
      finish_time varchar,
      note text,
      car_id integer,
      category_id integer,
      payment varchar,
      status varchar not null)`);

  await db.raw(`
    create table car (
      id serial not null constraint car_pkey primary key,
      name varchar not null,
      category_id integer not null,
      photo varchar,
      link varchar)`);

  await db.raw(`
    create table category (
      id serial not null constraint category_pkey primary key,
      name varchar )`);

  await db.raw(`
    alter table "order"
      add constraint order_car_id_fk foreign key (car_id) references car`);

  await db.raw(`
    alter table "order"
      add constraint order_category_id_fk foreign key (category_id) references category`);

};

module.exports.down = async (db) => {
  await db.dropTable('car');
  await db.dropTable('category');
  await db.dropTable('order');
  await db.dropTable('translation');
  await db.dropTable('user');
};

module.exports.configuration = {transaction: true};
