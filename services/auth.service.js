const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../data/users");
let nextUserId = 4;

exports.signup = async (data) => {
    const existingUser = users.find(
        user => user.email === data.email
    );
    if (existingUser) {
        return {
            error: "USER_EXISTS"
        };
    }
    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );

    const newUser = {
        id: nextUserId++,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        department: data.department,
        role: "employee",
        photo: null
    };
    users.push(newUser);
    return {
        user: newUser
    };
};

exports.login = async (email, password) => {
    const user = users.find(
        user => user.email === email
    );
    if (!user) {
        return null;
    }
    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );
    if (!passwordMatch) {
        return null;
    }
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
    return {token,use};
};