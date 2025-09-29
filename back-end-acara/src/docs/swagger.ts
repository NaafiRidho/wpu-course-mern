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
            },
            CreateCategoryRequest: {
                name: "Kategori Baru",
                description: "Deskripsi Kategori Baru",
                icon: "",
            },
            CreateEventRequest: {
                name: "",
                banner: "fileUrl",
                category: "Category ObjectID",
                description: "",
                startDate: "yyyy-mm-dd hh:mm:ss",
                endDate: "yyyy-mm-dd hh:mm:ss",
                location: {
                    region: "region id",
                    coordinates: [0, 0],
                    address: "",
                },
                isOnline: false,
                isFeatured: false,
                isPublish: false,
            },
            RemoveMediaRequest: {
                fileUrl: "",
            },
            CreateBannerRequest: {
                title: "Banner-1-Title",
                image: "https://res.cloudinary.com/dvauq4wwt/image/upload/v1757072953/alwbvw43gnsbtbnfbnnx.png",
                isShow: true
            },
            CreateTicketRequest: {
                price: 2000,
                name: "Ticket VIP",
                events: "68af0e5c954c82ae827595ab",
                description: "Ticket VIP-Description",
                quantity: 100,
            },
            CreateOrderRequest: {
                events: "event object id",
                ticket: "ticket object id",
                quantity: 1
            }
        },

    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];


swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);