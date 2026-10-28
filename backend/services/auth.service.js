const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.signup = async (data) => {
    const email = data.email.trim().toLowerCase();
    const existingUser = await User.findOne({
        where: { email }
    });
    if (existingUser) {
        return { error: "USER_EXISTS" };
    }
    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );
    try {
        const newUser = await User.create({
            name: data.name,
            email,
            password: hashedPassword,
            role: "employee",
            photo: null
        });
        return { user: newUser };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return { error: "USER_EXISTS" };
        }
        throw error;
    }
};

exports.login = async (email, password) => {
    const user = await User.findOne({
        where: {
            email: email.trim().toLowerCase()
        }
    });
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
    return { token, user };
};
