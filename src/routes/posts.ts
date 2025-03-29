import { Router } from 'express';
import db from "../database/mongodb_db";
import { CollectionInfo, ObjectId } from "mongodb";

const router = Router();

router.get("/", (_, res) => {
  db().then(db => db.collection("posts").find({})
    .limit(50)
    .toArray().then(results => res.send(results).status(200)));
});

router.get("/latest", async (_, res) => {
  let collection = (await db()).collection("posts");
  let results = await collection.aggregate([
    { "$project": { "author": 1, "title": 1, "tags": 1, "date": 1 } },
    { "$sort": { "date": -1 } },
    { "$limit": 3 }
  ]).toArray();
  res.send(results).status(200);
});

type Item = { typeClient: { oid: string }, level3: Item[] };

router.get("/thematic", async (_, res) => {
  try {
    ;
    const results = await db()
      .then(db => db.collection("thematicCombo"))
      .then((collection) => collection.find({}).toArray());

    const typeClientCollection = (await db()).collection("typeClient");
    const typeClients = await typeClientCollection.find({}).toArray();
    const typeClientMap = typeClients.reduce((map, typeClient) => {
      map.set(typeClient._id.toString(), typeClient);
      return map;
    }, new Map());
    results.forEach((result) => {
      result.level2.forEach((item: Item) => {
        if (item.typeClient) item.typeClient = typeClientMap.get(item.typeClient.oid.toString());
        if (item.level3) {
          item.level3.filter((item: Item) => item.typeClient).forEach((item: Item) => {
            item.typeClient = typeClientMap.get(item.typeClient.oid.toString());
          });
        }
      });
    });
    res.send(results).status(200);
  } catch (error) {
    console.error("Error retrieving thematic data:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/thematic_", async (_, res) => {
  (await db()).collection("thematicCombo").find({}).toArray()
    .then(results => res.send(results).status(200));
});

router.get("/thematic_2", async (_, res) => {
  try {
    const collection = (await db()).collection("thematicCombo");
    const results = await collection.aggregate([
      {
        $lookup: {
          from: "typeClient",
          localField: "level2.typeClient.$id",
          foreignField: "_id",
          as: "typeClient"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          level2: {
            $map: {
              input: "$level2",
              as: "level2Item",
              in: {
                name: "$$level2Item.name",
                t: '$typeClient', a: 100,
                typeClient: {
                  _id: "$$level2Item.typeClient._id",
                  name: "$$level2Item.typeClient.name",
                  description: "$$level2Item.typeClient.description"
                },
                idThematic: "$$level2Item.idThematic",
                status: "$$level2Item.status",
                associatedServices: "$$level2Item.associatedServices"
              }
            }
          },
          type: 1,
          typeClient: { $arrayElemAt: ["$typeClient", 0] }
        }
      }
    ]).toArray();
    res.send(results).status(200);
  } catch (error) {
    console.error("Error retrieving thematic data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/collection", (_, res) => {
  db().then(db => db.listCollections())
    .then(collections => collections.map((collection: CollectionInfo) => collection.name).toArray())
    .then((collectionNames: string[]) => res.send(collectionNames).status(200));
});

router.get("/:id", async (req:any, res:any) => {
  let collection = (await db()).collection("posts");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

import { check, ExpressValidator } from 'express-validator';

const { param, body, validationResult } = new ExpressValidator(
  {
    isPostID: async (value: string) => {
      // Verify if the value matches the post ID format
      return value;
    },
  },
  {
    muteOffensiveWords: (value: string) => {
      // Replace offensive words with ***
      return value;
    },
  },
);

router.post("/",
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  param('post').isPostID(),
  body('comment').muteOffensiveWords(),
  (req:any, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    const document = { ...req.body, date: new Date() };
    db().then(db => db.collection("posts")).then(collection =>
      collection.insertOne(document)
    ).then(result => res.send(result).status(204));
  });

router.patch("/comment/:id", (req:any, res:any) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates = {
    $push: { comments: req.body }
  };
  db().then(db => db.collection("posts"))
    .then(collection => collection.updateOne(query, updates))
    .then(result => res.send(result).status(200));
});

router.delete("/:id", (req:any, res:any) => {
  const query = { _id: new ObjectId(req.params.id) };
  db().then(db => db.collection("posts"))
    .then(collection => collection.deleteOne(query))
    .then(result => res.send(result).status(200));
});

export default router;
