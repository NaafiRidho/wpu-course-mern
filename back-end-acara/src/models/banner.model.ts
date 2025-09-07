import mongoose, { Schema } from 'mongoose';
import * as Yup from 'yup';

export const BANNER_NAME_MODEL = 'Banner';

export const bannerDAO = Yup.object({
    title: Yup.string().required(),
    image: Yup.string().required(),
    isShow: Yup.boolean().required(),
});

export type TypeBanner = Yup.InferType<typeof bannerDAO>;

interface Banner extends TypeBanner { };

const BannerSchema = new Schema<Banner>({
    title: {
        type: Schema.Types.String,
        required: true
    },
    image: {
        type: Schema.Types.String,
        required: true,
    },
    isShow: {
        type: Schema.Types.Boolean,
        required: true,
    }
}, {
    timestamps: true
}).index({ title: "text" });

const BannerModel = mongoose.model(BANNER_NAME_MODEL, BannerSchema);

export default BannerModel;