import { version } from "mongoose";
import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Dokumentasi API Acara",
        description: "Dokumentasi API Acara"
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local Server"
        }
        , {
            url: "https://wpu-course-mern-j4au.vercel.app/api",
            description: "Deploy Server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            }
        },
        schemas: {
            LoginRequest: {
                identifier: "Naafi",
                password: "123456"
            },
            ActivationRequest: {
                code: "abcdef"
            }

        },
    }
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];


swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);