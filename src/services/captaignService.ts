import { Types } from "mongoose";
import Campaign from "../database/models/campaign";
import User, { IUser } from "../database/models/user";
import { moveTmp } from "../controllers/upload";

const list = ({ userId }: any) => {

    const user = Types.ObjectId.createFromHexString(userId);
    return User.findOne({ _id: user }).then(({ roles }: any) => {
        if (roles.length) {
            //sponsor ve solo los propios cualquier estado, puede ver cuantos aplican a las campañas
            return Campaign.find({ user }).populate('sponsor').populate('brand').then(campaigns => campaigns.map(({ _doc: { _id, ...others } }: any) => ({
                ...others,
                id: _id
            })))
        } else {
            //si usuario ve todos los disponibles q estan no estan como borrador y si estan aplicando se ve el estado 
            //puede ver cuantos likes aporta
            return Campaign.find({ status: { $ne: 'draft' } }).populate('sponsor').populate('brand').then(campaigns => campaigns.map(({ _doc: { _id, ...others } }: any) => ({
                ...others,
                id: _id
            })))
        }
    });
}

const find = (_id: string) => {

    return Campaign.findOne({
        _id
    }).populate('sponsor').populate('brand').lean()
        .then(({ _id, categories, category, gallery, image, brand, ...campaign }: any) => {
            const { _id: brandId, __v, ...brandOther } = brand || {};
            return {
                id: _id,
                categories: categories && Array.isArray(categories) ? categories : [category],
                gallery: gallery && gallery.length ? gallery : [image, image, image, image], brand: brandId ? { id: brandId, ...brandOther } : null, ...campaign
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
    return Campaign.findByIdAndUpdate({ _id },{ $set: { status:'active'}}, {new: true},).lean().then(({status}:any

    ) => ({ status }))

};

const remove = (_id: string) => {
    return Campaign.findOneAndDelete({
        _id
    })
};

export default { list, find, create, update, remove, activate }