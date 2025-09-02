import mongoose, { ObjectId } from "mongoose";
import * as Yup from "yup";

export const EVENT_MODEL_NAME = 'Event';

const Schema = mongoose.Schema;

export const eventDAO = Yup.object({
    name: Yup.string().required(),
    startDate: Yup.string().required(),
    endDate: Yup.string().required(),
    description: Yup.string().required(),
    banner: Yup.string().required(),
    isFeatured: Yup.boolean().required(),
    isOnline: Yup.boolean().required(),
    isPublish: Yup.boolean(),
    category: Yup.string().required(),
    slug: Yup.string(),
    createdBy: Yup.string().required(),
    createdAt: Yup.string(),
    updatedAt: Yup.string(),
    location: Yup.object().shape({
        region: Yup.number(),
        coordinates: Yup.array(),
        address: Yup.string(),
    }).required(),
});

export type TEvent = Yup.InferType<typeof eventDAO>

export interface Event extends Omit<TEvent, "category" | "createdBy"> {
    category: ObjectId;
    createdBy: ObjectId;
}

const EventSchema = new Schema<Event>({
    name: {
        type: Schema.Types.String,
        required: true,
    },
    startDate: {
        type: Schema.Types.String,
        required: true,
    },
    endDate: {
        type: Schema.Types.String,
        required: true,
    },
    banner: {
        type: Schema.Types.String,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Category",
    },
    isFeatured: {
        type: Schema.Types.Boolean,
        required: true,
    },
    isOnline: {
        type: Schema.Types.Boolean,
        required: true,
    },
    isPublish: {
        type: Schema.Types.Boolean,
        default: false,
    },
    description: {
        type: Schema.Types.String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    slug: {
        type: Schema.Types.String,
        unique: true,
    },
    location: {
        type: {
            region: {
                type: Schema.Types.Number,
            },
            coordinates: {
                type: [Schema.Types.Number],
                default: [0, 0],
            },
            address: {
                type: Schema.Types.String,
            }
        }
    }
}, {
    timestamps: true,
}
);

EventSchema.index({
    name: 'text',
    description: 'text'
});

EventSchema.pre("save", function () {
    if (!this.slug) {
        const slug = this.name.split(" ").join("-").toLowerCase();
        this.slug = `${slug}`;
    }
});

const EventModel = mongoose.model(EVENT_MODEL_NAME, EventSchema);

export default EventModel;