import { PrismaClient, Movement, Inventory,  MovementDetail } from '@prisma/client'
import express, { Request, Response } from 'express';
import { validateToken } from '../auth';
import axios from 'axios';
import fs from 'fs';
import fsSync from 'fs/promises';
import FormData from 'form-data';
import moment from 'moment';
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient()
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).send("Inventory API");
});

function getMonth(date: any) {
    let res = moment(date).format("MM");
    let num = Number(res);
    switch (num) {
        case 1:
            res = "ENERO";
            break;
        case 2:
            res = "FEBRERO";
            break;
        case 3:
            res = "MARZO";
            break;
        case 4:
            res = "ABRIL";
            break;
        case 5:
            res = "MAYO";
            break;
        case 6:
            res = "JUNIO";
            break;
        case 7:
            res = "JULIO";
            break;
        case 8:
            res = "AGOSTO";
            break;
        case 9:
            res = "SETIEMBRE";
            break;
        case 10:
            res = "OCTUBRE";
            break;
        case 11:
            res = "NOVIEMBRE";
            break;
        case 12:
            res = "DICIEMBRE";
            break;
    }
    return res;
}

router.get('/test', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

router.get('/report', validateToken, async (req: Request, res: Response) => {
    try {
        let type = req.query.type;
        let id = req.query.id
        let data
        let aux: object[] = [];
        let newData: object[] = []
        let template = ""
        switch (type) {
            case "in":
                template = "ficha_entrada"
                data = await prisma.movement.findMany({
                    include: {
                        details: {
                            include: {
                                inventory: true
                            }
                        },
                    },
                    where: {
                        type: {
                            contains: "I"
                        },
                        id: {
                            equals: Number(id)
                        }
                    }
                })
                data.map(x => {
                    x.details.map((y:any) => {
                        aux.push({
                            canceled: y.inventory.is_delete,
                            codePatrimonial: y.inventory.patrimonial_code,
                            color: y.inventory.color,
                            condition: y.inventory.conservation_state,
                            denomination: y.inventory.denomination,
                            dimention: y.inventory.dimensions,
                            id: y.inventory.id,
                            marca: y.inventory.brand,
                            model: y.inventory.model,
                            moveId: y.movement_id,
                            num_lote: y.inventory.lot,
                            observation: y.inventory.observations,
                            others: y.inventory.others,
                            series: y.inventory.serie
                        })
                    })
                    newData.push({
                        adress: x.address,
                        adress_destino: x.address_destiny,
                        "canceled": x.is_delete,
                        "company": "company",
                        "createDate": moment(x.created_at).format('YYYY/MM/DD'),
                        "date": moment(x.created_at).format('YYYY/MM/DD'),
                        "deleteDate": x.updated_at,
                        "dependence": x.unit_organic,
                        "dependence_id": "id_dependence",
                        "details": aux,
                        "dni": x.responsible_user_document,
                        "dni_destino": x.destiny_user_document,
                        "document_authorization": x.auth_document,
                        "email": x.responsible_user_email,
                        "email_destino": x.destiny_user_email,
                        "fullName": x.responsible_user_name,
                        "fullName_destino": x.destiny_user_name,
                        "id": x.id,
                        "local_destino": x.local,
                        "proveedor_destino": x.local_destiny,
                        "reason": x.reason,
                        "reference": "reference",
                        "register_code": x.register_code,
                        "type": x.type,
                        "uid": x.user_id
                    })
                })
                break;
            case "out":
                template = "ficha_salida"
                data = await prisma.movement.findMany({
                    include: {
                        details: {
                            include: {
                                inventory: true
                            }
                        },
                    },
                    where: {
                        type: {
                            not: "I"
                        },
                        id: {
                            equals: Number(id)
                        }
                    }
                })
                data.map((x:any) => {
                    x.details.map((y:any) => {
                        aux.push({
                            canceled: y.inventory.is_delete,
                            codePatrimonial: y.inventory.patrimonial_code,
                            color: y.inventory.color,
                            condition: y.inventory.conservation_state,
                            denomination: y.inventory.denomination,
                            dimention: y.inventory.dimensions,
                            id: y.inventory.id,
                            marca: y.inventory.brand,
                            model: y.inventory.model,
                            moveId: y.movement_id,
                            num_lote: y.inventory.lot,
                            observation: y.inventory.observations,
                            others: y.inventory.others,
                            series: y.inventory.serie
                        })
                    })
                    newData.push({
                        adress: x.address,
                        adress_destino: x.address_destiny,
                        canceled: x.is_delete,
                        company: "company",
                        "createDate": moment(x.created_at).format('YYYY/MM/DD'),
                        "date": moment(x.date).format('YYYY/MM/DD'),
                        deleteDate: x.updated_at,
                        dependence: x.unit_organic,
                        "dependence_destino": x.unit_organic_destiny,
                        dependence_id: "id_dependence",
                        details: aux,
                        dni: x.responsible_user_document,
                        dni_destino: x.destiny_user_document,
                        document_authorization: x.auth_document,
                        email: x.responsible_user_email,
                        "email_destino": x.destiny_user_email,
                        "unid_ejec": "GOBIERNO REGIONAL DE ANCASH",
                        "mes": getMonth(x.date),
                        fullName: x.responsible_user_name,
                        user_entrega: x.responsible_user_name,
                        user_destino: x.destiny_user_name,
                        fullName_destino: x.destiny_user_name,
                        id: x.id,
                        local_destino: x.local,
                        proveedor_destino: x.local_destiny,
                        reason: x.reason === "M" ? "MANTENIMIENTO" : x.reason === "CO" ? "COMISIÓN DE SERVICIOS" : "CAPACITACIÓN Y/O EVENTO",
                        "reference": "reference",
                        "register_code": x.register_code,
                        "type": x.type === "S" ? "SALIDA" : x.type === "R" ? "REINGRESO" : "DESPLAZAMIENTO",
                        "uid": x.user_id
                    })
                })
                break;
            case "inventory":
                template = "ficha_bienes"
                const movementDetail = await prisma.movementDetail.findMany({
                    include: {
                        movement: true,
                        inventory:true
                    },
                    where:{
                        is_delete:false
                    }
                });
                movementDetail.forEach((md:MovementDetail & { movement: Movement; inventory?: Inventory })=>{
                    let inventory:Inventory|undefined=md.inventory;
                    newData.push({
                        ... md.movement,
                        ...
                            inventory?{
                                codePatrimonial: inventory.patrimonial_code,
                                denomination: inventory.denomination,
                                num_lote: inventory.lot,
                                marca: inventory.brand,
                                model: inventory.model,
                                color: inventory.color,
                                dimensions: inventory.dimensions,
                                series: inventory.serie,
                                others: inventory.others,
                                condition: inventory.conservation_state,
                                observations: inventory.observations,
                                moveId: inventory.id.toString(),
                            }:{}
                    });
                });
                break;
            default:
                break;
        }
        let uniqueId = uuidv4()
        try {
            fs.mkdirSync('./temp/json/', { recursive: true } );
        } catch (e) {
            console.log('Cannot create folder ', e);
        }
        fs.writeFileSync('./temp/json/' + uniqueId + '.json', JSON.stringify(newData), 'utf8');
        const file = await fsSync.readFile('./temp/json/' + uniqueId + '.json');
        const form = new FormData();
        form.append('template', template);
        form.append('filename', uniqueId + ".json")
        form.append('extension', 'pdf')
        form.append('file', file, uniqueId + ".json")
        let response
        console.log(newData);
        try {
            response = await axios.post('http://web.regionancash.gob.pe/api/jreport/', form, {
                headers: {
                    ...form.getHeaders(),
                },
                responseType: 'arraybuffer'
            })
            fs.writeFile('./temp/pdf/' + uniqueId + '.pdf', response.data, { encoding: null }, (err) => {
                if (err) {
                    console.log("Error to create a .pdf file")
                } else {
                    console.log("Success to create a .pdf file")
                    fs.unlinkSync('./temp/json/' + uniqueId + '.json')
                    let data = fs.readFileSync('./temp/pdf/' + uniqueId + ".pdf");
                    res.contentType("application/pdf");
                    fs.unlinkSync('./temp/pdf/' + uniqueId + '.pdf')
                    res.send(data);
                }
            });
        } catch (error) {
            console.log(error)
            response = null
            res.status(400).send("Error in the generation of report in the Java Endpoint")
        }
    } catch (error) {
        console.log(error)
        res.status(400).send("Error in the generation of report")
    }
    return;
});

router.get('/inventory/:id', validateToken, async (req: Request, res: Response) => {
    try {
        let patrimonial_code: string = req.params.id;
        let response = await prisma.inventory.findFirst({
            where: {
                patrimonial_code: patrimonial_code
            }
        })
        res.status(200).json(response);
    } catch (error) {
        res.status(502).send(error)
    }
    return;
});

router.get('/movement/:start/:end', validateToken, async (req: Request, res: Response) => {
    try {
        let q:any={...req.query};
        let start: number = Number(req.params.start);
        let end: number = Number(req.params.end);
        let type: string = q.type as string|| "";
        Object.keys(q).forEach((key)=>{
            q[key] = {contains:q[key]};
        });
        
        let where={...q,
            type: type === "" ? {
                not: "I"
            } : {
                contains: type
            }
        };console.log(q);
        let response = await prisma.movement.findMany({
            where: where,
            skip: start,
            take: end
        })
        let count = await prisma.movement.count({
            where: where
        });
        res.status(200).json({
            data: response,
            count: count
        });
    } catch (error) {
        console.log(error);
        res.status(502).send(error)
    }
    return;
});

router.get('/dashboard', validateToken, async (req: Request, res: Response) => {
    try {
        let ins = await prisma.movement.count({
            where: {
                type: {
                    contains: "I"
                }
            }
        })
        let outs = await prisma.movement.count({
            where: {
                type: {
                    not: "I"
                }
            }
        })
        let inventory = await prisma.inventory.count();
        res.status(200).json({
            ins: ins,
            outs: outs,
            inventory: inventory
        })
    } catch (error) {
        res.status(502).send(error)
    }
    return;
});

router.get('/inventory/:start/:end', validateToken, async (req: Request, res: Response) => {
    try {
        let start: number = Number(req.params.start);
        let end: number = Number(req.params.end);
        let where:any={};
        ['patrimonial_code','denomination','brand','model','color','serie','lot',
            'others','conservation_state','observations'].forEach((k)=>{
            if(req.query[k])where[k]={contains:req.query[k]};
        });

        let response = await prisma.inventory.findMany({
            skip: start,
            take: end,
            include: {
                
                details: {
                    orderBy: {
                        id: 'desc'
                    },
                    take: 1,
                    include: {
                        movement: true
                    }
                }
            },
            where:where
        })
        let count = await prisma.inventory.count({
            where:where
        })
        res.status(200).json({
            data: response.map((x:Inventory & { details?: MovementDetail[] }) => {
                let o:any={
                    id: x.id,
                    patrimonial_code: x.patrimonial_code,
                    denomination: x.denomination,
                    lot: x.lot,
                    brand: x.brand,
                    model: x.model,
                    color: x.color,
                    dimensions: x.dimensions,
                    serie: x.serie,
                    others: x.others,
                    conservation_state: x.conservation_state,
                    user_id: x.user_id,
                    observations: x.observations,
                    created_at: x.created_at,
                    updated_at: x.updated_at,
                    is_delete: x.is_delete
                };
                if(x.details&&x.details.length){
                    let d:Movement=(x.details[0] as any).movement;
                    o={...o,
                        unit_organic:d.unit_organic_destiny,
                        local:d.local_destiny,
                        responsible_document:d.destiny_user_document,
                        responsible_name:d.destiny_user_name
                    };
                }
                return o;
            }),
            count: count
        });
    } catch (error) {
        console.error(error);
        res.status(502).send(error)
    }
    return;
});

router.get('/movement/:id', async (req: Request, res: Response) => {
    try {
        let id: number = Number(req.params.id);
        let response = await prisma.movement.findUnique({
            include: {
                details: {
                    include: {
                        inventory: true
                    }
                }
            },
            where: {
                id: id
            }
        })
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(400).send("Error to get data--")
    }
    return;
});

router.post('/token', async (req: Request, res: Response) => {
    let code: string = req.body.code;
    let user: string = process.env.CLIENT_ID_OAUTH || '';
    let password: string = process.env.CLIENT_SECRET_OAUTH || '';
    let response
    try {
        response = await axios({
            url: process.env.OAUTH_URL + '/token',
            method: 'post',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
            },
            data: 'grant_type=authorization_code&scope=profile&code=' + code
        })
        res.status(200).send(response.data);
    } catch (error: any) {
        res.status(400).send(error.response.data)
    }
    return;
});

router.post('/movement', async (req: Request, res: Response) => {
    try {
        let data: Movement = req.body;
        data.unit_organic_destiny = data.unit_organic_destiny === undefined ? data.unit_organic : data.unit_organic_destiny
        data.local_destiny = data.local_destiny === undefined ? data.local : data.local_destiny
        console.log(data);
        let response = await prisma.movement.create({
            data: {
                address: data.address,
                address_destiny: data.address_destiny || data.address,
                auth_document: data.auth_document,
                date: data.date,
                destiny_user_email: data.destiny_user_email,
                destiny_user_name: data.destiny_user_name,
                destiny_user_document: data.destiny_user_document,
                local: data.local,
                local_destiny: data.local_destiny,
                reason: data.reason,
                responsible_user_email: data.responsible_user_email,
                responsible_user_name: data.responsible_user_name,
                responsible_user_document: data.responsible_user_document,
                register_code: data.register_code,
                type: data.type,
                unit_organic: data.unit_organic,
                unit_organic_destiny: data.unit_organic_destiny,
                user_id: data.user_id,
            }
        });
        res.status(200).send(response)
    } catch (error) {
        console.error(error)
        res.status(502).send(error)
    }
    return;
});

router.delete('/detail/:id', validateToken, async (req: Request, res: Response) => {
    try {
        let id: number = Number(req.params.id);
        const deleted = await prisma.movementDetail.update({
            where: {
                id: id
            },
            data:{
                is_delete:true
            }
          });
        res.status(200).json(deleted);
    } catch (error) {
        console.error(error);
        res.status(400).send("Error to get data--")
    }
    return;
});

router.post('/details/in', validateToken, async (req: Request, res: Response) => {
    try {
        let data: Inventory = req.body.data;
        data.user_id = req.body.user_id
        data.patrimonial_code = data.patrimonial_code === "" ? "S/C" : data.patrimonial_code;
        let id: number = Number(req.body.id)
        //No existe opcion editar
        //ddebe ingresar {id:?,inventory:{}}
        let response = await prisma.inventory.create({
            data: data,
        });
        let response2 = await prisma.movementDetail.create({
            data: {
                movement_id: id,
                inventory_id: response.id,
                user_id: req.body.user_id
            }
        })
        res.status(200).json(response2)
    } catch (error) {
        console.error(error);
        console.log(error);
        res.status(502).send(error)
    }
    return;
});

router.post('/details/traslate', validateToken, async (req: Request, res: Response) => {
    try {
        let data: MovementDetail = req.body;
        let response = await prisma.movementDetail.create({
            data: {
                movement_id: data.movement_id,
                inventory_id: data.inventory_id,
                user_id: req.body.user_id
            }
        });
        res.status(200).json(response)
    } catch (error) {
        console.log(error);
        res.status(502).send(error)
    }
    return;
});

export {
    router
}