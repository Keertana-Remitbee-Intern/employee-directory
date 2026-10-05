const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Employee Directory API",
            version: "1.0.0",
            description:
                "REST API for employee management with JWT authentication and role-based authorization"
        },

        servers: [
            {
                url: "http://localhost:3000"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },

            schemas: {
                Employee: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 2
                        },
                        name: {
                            type: "string",
                            example: "Anu"
                        },
                        email: {
                            type: "string",
                            example: "anu@gmail.com"
                        },
                        department: {
                            type: "string",
                            example: "IT"
                        },
                        role: {
                            type: "string",
                            example: "employee"
                        },
                        photo: {
                            type: "string",
                            nullable: true,
                            example: "backend/uploads/1728123456-photo.jpg"
                        }
                    }
                },

                LoginRequest: {
                    type: "object",
                    required: [
                        "email",
                        "password"
                    ],
                    properties: {
                        email: {
                            type: "string",
                            example: "admin@gmail.com"
                        },
                        password: {
                            type: "string",
                            example: "admin123"
                        }
                    }
                },

                SignupRequest: {
                    type: "object",
                    required: [
                        "name",
                        "email",
                        "password",
                        "department"
                    ],
                    properties: {
                        name: {
                            type: "string",
                            example: "Kamal"
                        },
                        email: {
                            type: "string",
                            example: "kamal@gmail.com"
                        },
                        password: {
                            type: "string",
                            example: "kamal123"
                        },
                        department: {
                            type: "string",
                            example: "IT"
                        }
                    }
                },

                EmployeeRequest: {
                    type: "object",
                    required: [
                        "name",
                        "email",
                        "password",
                        "department"
                    ],
                    properties: {
                        name: {
                            type: "string",
                            example: "Kamal"
                        },
                        email: {
                            type: "string",
                            example: "kamal@gmail.com"
                        },
                        password: {
                            type: "string",
                            example: "kamal123"
                        },
                        department: {
                            type: "string",
                            example: "IT"
                        }
                    }
                },

                EmployeeUpdateRequest: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            example: "Kamal"
                        },
                        email: {
                            type: "string",
                            example: "kamal@gmail.com"
                        },
                        department: {
                            type: "string",
                            example: "Production"
                        }
                    }
                }
            }
        }
    },

    apis: [
        "./routes/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {swaggerUi,swaggerSpec};