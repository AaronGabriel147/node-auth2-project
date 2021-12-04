const db = require('../../data/db-config.js');

module.exports = {
  add,
  find,
  findBy,
  findById,
};

/*
  select
    user_id,
    username,
    role_name
  from users
    join roles on
  users.role_id = roles.role_id
*/
/**
 You will need to join two tables.
 Resolves to an ARRAY with all users.
 
 [
   {
     "user_id": 1,
     "username": "bob",
     "role_name": "admin"
    },
    {
      "user_id": 2,
        "username": "sue",
        "role_name": "instructor"
      }
    ]
    */
function find() {              // grabbing 2 tables and putting them together to return
  return db('users')
    .join('roles', "users.role_id", 'roles.role_id')
    .select('user_id', 'username', 'role_name', 'password')

}

/*
  select
    user_id,
    username,
    role_name
  from users
  join roles on
    users.role_id = roles.role_id
  where users.username = 1 AKA filter arg as seen below****
*/
/**
 You will need to join two tables.
 Resolves to an ARRAY with all users that match the filter condition.
 
 [
   {
     "user_id": 1,
     "username": "bob",
     "password": "$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq",
     "role_name": "admin",
    }
  ]
  */
// This simply finds by an ID
function findBy(filter) { // nobody is using this, yet...
  return db('users')
    .join('roles', "users.role_id", 'roles.role_id')
    .select('user_id', 'username', 'password', 'role_name')
    .where(filter)
}



/**
 You will need to join two tables.
 Resolves to the user with the given user_id.
 
 {
   "user_id": 2,
   "username": "sue",
   "role_name": "instructor"
  }
  */
function findById(user_id) {
  return db('users')
    .join('roles', "users.role_id", 'roles.role_id')
    .select('user_id', 'username', 'password', 'role_name')
    .where('users.user_id', user_id).first()
}




/**
  Creating a user requires a single insert (into users) if the role record with the given
  role_name already exists in the db, or two inserts (into roles and then into users)        ???????????
  if the given role_name does not exist yet.                                                 ???????????

  When an operation like creating a user involves inserts to several tables,
  we want the operation to succeed or fail as a whole. It would not do to
  insert a new role record and then have the insertion of the user fail.

  In situations like these we use transactions: if anything inside the transaction      ****** Transactions *****
  fails, all the database changes in it are rolled back.

  {
    "user_id": 7,
    "username": "anna",
    "role_name": "team lead"
  }
 */
// do not get the pre-written code. ?
async function add({ username, password, role_name }) {             // async function to add a user
  let created_user_id                                               // Same as: let created_user_id = undefined;

  await db.transaction(async trx => {                               // start a transaction
    let role_id_to_use                                              // Same as: let role_id_to_use = undefined;
    const [role] = await trx('roles').where('role_name', role_name) // find the role_id for the given role_name
    if (role) {                                                     // if the role exists
      role_id_to_use = role.role_id                                 // use the role_id
    } else {                                                        // if the role does not exist
      const [role_id] = await trx('roles').insert({ role_name: role_name }) // create a new role with the given role_name
      role_id_to_use = role_id                                      // use the role_id
    }
    const [user_id] = await trx('users').insert({ username, password, role_id: role_id_to_use }) // create a new user with the given username, password, and role_id
    created_user_id = user_id                                       // save the user_id
  })
  return findById(created_user_id)                                  // return the user with the given user_id
}




// ################################################


// TODOLIST for module 2



// [x] connect DB after npm i and branch
// [x] paste this into Keep into users/models
// [x] paste old models in users/models
// use Thunder Client
// just get all data to show up in json



// How to get all*
// in SQL:
// SELECT * FROM employees 
// WHERE notes 

// OR 

// SELECT * FROM users;

// in VS:
// // Router
// router.get("/", (req, res) => {
//   Users.getAll()
//     .then(users => {
//       res.status(200).json(users)
//     })
// })

// // Model
// function getAll() {
//   console.log('getAll')
//   return db('users')
// }


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ // 
// @@@@@@@@@@@@@@@@@@       @@@@@@@@@@@@@@@@@@@@@ // 
// @@@@@@@@@@@@@@@@@@ NOTES @@@@@@@@@@@@@@@@@@@@@ // 
// @@@@@@@@@@@@@@@@@@       @@@@@@@@@@@@@@@@@@@@@ // 
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ // 




// const db = require('../../data/db-config') // Database connection // SQLite3 // Knex

// module.exports = {
//   get,
//   getById,
//   create,
//   update,
//   remove,
// }

// // __________ SQL / KNEX FLOW __________

// // STEP 1 - In SQLite Studio, use the desired code for the desired output, check data to confirm it works.
// // STEP 2 - Knex documentation.


// // Get all posts.
// // SELECT * FROM posts;
// function get() {
//   return db('posts')
// }


// // knex.select('id').from<User>('users'); // Resolves to Pick<User, "id">[]
// //  This helper function grabs all ID's and the router will match params and grab the clients ID. (added id as argument)
// // SELECT * FROM posts WHERE id = id; //  SQL version*
// // return db('posts').where({ id: id, foo: 'bar' }).first() //  Knex version*
// // .first() gets rid of nesting, (array in this case). Without first() we get an empty arr with bad code, first() gives us undefined. 
// function getById(id) {
//   return db('posts').where('id', id).first() // Returns the post with the id.
// }



// // From notes:
// // SQL version* Note that single quotes are needed in SQL Light Studio because you cannot set it up in a function with args.
// // -- Create Title & Content
// // SQL version = INSERT INTO posts (title, contents) VALUES ('title', 'contents');
// // My failed version: = db('posts').insert({ title, contents })

// // Gabriels's debugging notes:
// // const stuff = await db('posts').insert({ title, contents }) // Inserts into table, returns id.
// // console.log(stuff) // [ 15 ] // Here we learned that this returns an array of the id. 

// async function create({ title, contents }) {
//   const [id] = await db('posts').insert({ title, contents }) // Inserts into table, returns id.
//   console.log(id) // 15
//   const newPost = await getById(id)                          // Gets the new post.
//   console.log(newPost) // { id: 15, title: 'title', contents: 'contents' } AKA title: 'xxxx', contents: 'xxxx'
//   return newPost                                             // Returns the new post.
// }



// // UPDATE posts
// // SET title = 'yeet', contents = 'jajajaja'
// // WHERE id = 1;

// // Knex Documentation:
// // knex('books')
// //   .where('published_date', '<', 2000)
// //   .update({
// //     status: 'archived',
// //     thisKeyIsSkipped: undefined
// //   })

// // Update/PUT needs an ID in the param inside of the HTTP client.
// // After the put req, you must do a get req to see data.

// async function update(id, { title, contents }) {
//   // return await db('posts').where({ id }).update({ title, contents })
//   const updatedPost = await db('posts').where('id', id).update({ title, contents }) // Inserts into table, returns id.
//   // console.log(updatedPost) // was named stuff. It returns: 1. If return 'foo'
//   return updatedPost
// }



// // DELETE FROM shippers WHERE shipperid = 5;

// function remove(id) {
//   return db('posts').where('id', id).del()
// }




// // ____________________ SQL NOTE's _________________________ //


// // How to comment in SQL:
// // -- 2 dashes!
// // The WHERE keyword is for a 'filter or a query'.
// // /* Use single quotes for strings */
// // /* String queries are case sensitive */
// // /* chaining 1 AND and a conditional */
// // /* OR also works, sorta like AND */

// // /* LIKE with the % operator grabs all any string that ends in land */
// // /* LIKE allows for case insensitivity */

// // /* NOT is a keyword, does what it says. Sorta like "!" in JavaScript. */

// // SELECT * FROM customers WHERE country LIKE 'ireland'; 


// // @@@@@@@@@@@ SELECT @@@@@@@@@@@@@@


// // -- How to grab all that do not contain a specific word in a paragraph.
// // -- LIKE allows for case insensitivity, % allows to search for the string regardless of what is in front or behind it. 

// // SELECT * FROM employees 
// // WHERE notes 
// // NOT LIKE '%university%';   


// // ______________________________________________


// // -- Grab all CategoryId's that have an integer of one. 
// // SELECT * FROM products WHERE categoryid = 1;


// // _______________________________________________


// // -- Find all of the orders made after Jan 1 1997
// // SELECT * FROM orders WHERE orderDate > '1997-01-01';

// // -- I was stuck on this because I forgot "FROM" and the zeros in the date.


// // ****

// // -- ORDER BY oderdate ASC; makes the dates appear in order.

// // SELECT * FROM orders WHERE orderdate > '1997-01-01' ORDER BY oderdate ASC;


// // _______________________________________________


// // -- Get all products sorting them by category ascending, and then by price descending.

// // SELECT * FROM products 
// // ORDER BY categoryid ASC, price DESC;

// // -- Interesting to note that WHERE was not needed, ORDER BY sufficed.
// // -- Also, "ASC" is not necessary since it is the default, but it adds clarity.


// // _______________________________________________


// // @@@@@@@@@@@@ INSERT aka create @@@@@@@@@@@@@


// // --INSERT INTO shippers (shippername, phone) VALUES ('acme 44', '(916) 500 9483');

// // insert into shippers (shippername, phone) values ('acme 44', '(909) 123 1234');

// // --SELECT * FROM shippers;


// // ***

// // -- Likely a W3Schools bug, buuut, would not work until I used case sensitivity with schema names. Like this:

// // -- insert into shippers (ShipperName, Phone) values ('acme 44', '(909) 123 1234');

// // select * from shippers; -- To check result.


// // -- And if you wanted to add just 1 property, it works unless it is a required field. It looks like this:

// // -- insert into shippers (ShipperName) values ('acme 44');



// // // // // // // Knex INSERT // // // // // // // // // // 

// db('users').insert({ name: 'John' })

//  Also given as an example, but not sure why there is an array:
// .insert([
//   { name: 'Starsky' },
//   { name: 'Hutch' }
// ])

// knex('tableName')
  // .insert({
  //   email: "ignore@example.com",
  //   name: "John Doe"
  // })


// // ____________________________________________



// // @@@@@@@@@@@@@ UPDATE @@@@@@@@@@@@@


// // -- How to edit a table:

// // UPDATE shippers 
// // SET shippername = 'webpt 31 is lit' 
// // WHERE shipperid = 4;  

// // --SELECT * FROM shippers;


// // ***  

// // -- How to update multiple fields. Note, no trailing commas.

// // UPDATE posts
// // SET title = 'yeet', contents = 'jajajajaja'
// // WHERE id = 1;


// // @@@@@@@@@@@@ DELETE @@@@@@@@@@@@@


// // -- ID is the primary key. Any ID number that has been deleted cannot be used by any future ID numbers. 
// // -- So we DELETE ID 2 then create a new one, the ID's are 1, 3, and so on. 

// // -- How to delete:

// // DELETE FROM shippers WHERE shipperid = 5;