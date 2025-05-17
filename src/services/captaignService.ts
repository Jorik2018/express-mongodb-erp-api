import { Types } from "mongoose";
import Campaign from "../database/models/campaign";
import User, { IUser } from "../database/models/user";
import { moveTmp } from "../controllers/upload";
import Contact from "../database/models/contact";
import Application from "../database/models/application";
import axios from "axios";

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

const calculate = (campaign: string, userId: string) => {
    return Application.find({
        campaign
    }).populate('contact').lean().then((applications) =>
        applications.map(({ _id, contact, content }: any) => {
            if (contact) {
                const socials = contact.socials;
                return Promise.all(content.map((content: any) => {
                    const social = socials[content.provider];
                    if (!social) throw 'No provider for media ' + content._id;
                    if (content.provider == 'instagram') {
                        return axios.get('https://graph.instagram.com/v22.0/' + content.id + '/insights', {
                            params: {
                                access_token: social.access_token,
                                metric: 'shares, views, likes, reach'
                            }
                        }).then(({ data: { data } }: any) => data.reduce((colector: any, { name, values }: any) => {
                            colector[name] = values[0].value;
                            return colector;
                        }, { _id: content._id }))
                    } else {
                        return Promise.resolve({ _id: content._id });
                    }
                }))
                    .then((contents: any) => Promise.all(contents.map(({ _id: content_id, likes, shares, views, reach }: any) =>
                        Application.updateOne(
                            { _id, "content._id": content_id },
                            {
                                $set: {
                                    "content.$.likes": likes,
                                    "content.$.shares": shares,
                                    "content.$.views": views,
                                    "content.$.reach": reach
                                }
                            }
                        ).then(({ modifiedCount }) => ({ modifiedCount, likes, shares, views, reach })
                        ))))
            }
        })
    ).then((r) => {
        Promise.all(r).then((r)=>{
           
        })
    });
};

const find = (_id: string, userId: string) => {
    userId='6827bc7e152604e6928c1e6a'
    const user = Types.ObjectId.createFromHexString(userId);
    //Se debe procurar q cada usuario tenga solo un perfil
    return Contact.findOne({ user }).lean().then(({ _id: contact }: any) =>
        Application.findOne({ contact, campaign: _id }).lean().then((application: any) => {
            return Campaign.findOne({
                _id
            }).populate('sponsor').populate('brand').lean()
                .then(({ _id, categories, category, gallery, image, brand, ...campaign }: any) => {
                    const { _id: brandId, __v, ...brandOther } = brand || {};


                    return Application.aggregate([
                        { $match: { campaign: _id } },
                        {
                            $lookup: {
                                from: 'contacts',
                                localField: 'contact',
                                foreignField: '_id',
                                pipeline: [{ $project: { _id: 1, name: 1, profileImage: 1 } }],
                                as: 'contact'
                            }
                        },
                        { $unwind: '$contact' },
                        { $unwind: '$content' },
                        {
                            $replaceWith: {
                                $mergeObjects: [
                                    '$content',
                                    { contact: '$contact' }
                                ]
                            }
                        }
                    ]).then((content: any) => {

                        //return Application.findOne({ campaign: _id }).lean().then((application: any) => {
                        return {
                            id: _id,
                            content,
                            taken: !!application,
                            categories: categories && Array.isArray(categories) ? categories : [category],
                            gallery: gallery && gallery.length ? gallery : [image, image, image, image], brand: brandId ? { id: brandId, ...brandOther } : null, ...campaign
                        }
                    })
                })
        }))
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

export default { list, find, create, update, remove, activate, calculate }