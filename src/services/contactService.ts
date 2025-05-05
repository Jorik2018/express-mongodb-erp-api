import { Types } from "mongoose";
import Campaign from "../database/models/campaign";
import { moveTmp } from "../controllers/upload";
import Contact from "../database/models/contact";

const list = ({ userId }: any) => {
    return Contact.find({ userId }).lean()
        .then(data => ({ data: data.map(({ _id, ...item }) => ({ id: _id, ...item })) }))
}

const find = (_id: string, userId: string) => {
    const _user = Types.ObjectId.createFromHexString(userId);
    return Contact.findOne(_id ? {
        _id
    } : { user: _user }).populate('user').lean()
        .then(({ user, _id, ...contact }: any) => {
            if (!user._id.equals(_user)) {
                throw { code: 401, message: "Unauthorized" };
            }
            return {
                rating: 0, ...contact
            }
        })
}

const create = ({ brandId, userId, coverImage, gallery, ...body }: any) => {
    const user = Types.ObjectId.createFromHexString(userId);
    const brand = Types.ObjectId.createFromHexString(brandId);
    return new Campaign({ ...body, user, brand, gallery: [], coverImage: '?' })
        .save()
        .then(({ _doc: { _id, ...campaign } }: any) => {
            const id = _id.toHexString();
            return moveTmp([coverImage], 'campaign', id).then(([coverImage]: any) =>
                moveTmp(gallery, 'campaign', id).then((gallery) =>
                    Campaign.findOneAndUpdate({ _id },
                        { $set: { coverImage, gallery } }).then(() => ({ id, ...campaign }))
                )
            )
        });
};

const update = (_id: string, { brandId, userId, coverImage, gallery, ...body }: any) => {
    return Campaign.find({ _id }).lean().then(({ _id, ...campaign }: any) => {
        const id = _id.toHexString();
        return moveTmp([coverImage], 'campaign', id).then(([coverImage]: any) =>
            moveTmp(gallery, 'campaign', id).then((gallery) =>
                Campaign.updateOne({ _id },
                    { $set: { coverImage, gallery, ...campaign } }).then(() => ({ id, coverImage, gallery, ...campaign }))
            )
        )
    });
};

const activate = (_id: string) => {
    return Campaign.findByIdAndUpdate({ _id }, { $set: { status: 'active' } }, { new: true },).lean().then(({ status }: any

    ) => ({ status }))

};

const remove = (_id: string) => {
    return Campaign.findOneAndDelete({
        _id
    })
};

export default { list, find, create, update, remove, activate }