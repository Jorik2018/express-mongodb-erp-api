import { Types } from "mongoose";
import Campaign from "../database/models/campaign";

const list = ({ userId }: any) => {

    const user = Types.ObjectId.createFromHexString(userId);

    return Campaign.find({ user }).populate('sponsor').populate('brand').then(campaigns => campaigns.map(({ _doc: { _id, ...others } }: any) => ({
        ...others,
        id: _id
    })))

}

const find = (_id: string) => {

    return Campaign.findOne({
        _id
    }).populate('sponsor').populate('brand')
        .then(({ _doc: { _id, categories, category, gallery, image, ...campaign } }: any) => ({
            id: _id,
            categories: categories && categories.length ? categories : [category],
            gallery: gallery && gallery.length ? gallery : [image, image, image, image], ...campaign
        }))

}

const create = ({ brandId, userId, ...body }: any) => {
    const user = Types.ObjectId.createFromHexString(userId);
    const brand = Types.ObjectId.createFromHexString(brandId);
    return new Campaign({ ...body, user, brand })
        .save()
        .then(({ _doc: { _id, ...campaign } }: any) => ({ id: _id, ...campaign }));
};

const update = (_id: string, body: any) => {
    return Campaign.findOneAndUpdate(
        {
            _id
        },
        { $set: body }
    )
};

const remove = (_id: string) => {
    return Campaign.findOneAndDelete({
        _id
    })
};

export default { list, find, create, update, remove }