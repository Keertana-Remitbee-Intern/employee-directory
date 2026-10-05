const bcrypt = require("bcrypt");
const users = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("admin123",10),
        department: "Management",
        role: "admin",
        photo:null
    },
    {
        id: 2,
        name: "Anu",
        email: "anu@gmail.com",
        password: bcrypt.hashSync("anu123", 10),
        department: "IT",
        role: "employee",
        photo: null           
    },
    {
        id: 3,
        name: "Banu",
        email: "banu@gmail.com",
        password: bcrypt.hashSync("banu123", 10),
        department: "IT",
        role: "employee",
        photo: null
    }
];

module.exports = users;