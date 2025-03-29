import { Router } from 'express';
const { getOffices, getOfficeById, deleteOffice, addOffice, updateOffice } = require("../controllers/office");
const router = Router();
import { check, validationResult, body, param } from 'express-validator';

router.get('/', getOffices);
router.get('/:id',
    param('id').customSanitizer((value: string) => /*ObjectId*/(value)),
    getOfficeById);
router.post('/',
    body('password').isLength({ min: 5 }),
    body('passwordConfirmation').custom((value, { req }) => {
        return value === req.body.password;
    }),
    body('email').custom(async value => {
        // const user = await UserCollection.findUserByEmail(value);
        // if (user) {
        //     throw new Error('E-mail already in use');
        // }
    }),
    body('json_string', 'Invalid json_string')
        // No message specified for isJSON, so use the default "Invalid json_string"
        .isJSON()
        .isLength({ max: 100 })
        // Overrides the default message when `isLength` fails
        .withMessage('Max length is 100 bytes'),
    body('email').isEmail().withMessage('Not a valid e-mail address'),
    body('**.name').notEmpty(),
    body('addresses.*.number').isInt(),
    body('siblings.*.name').notEmpty(),
    body('email').optional().trim().isEmail(),
    body().isEmail(),
    body('').isEmail(),
    addOffice);
router.patch('/update', updateOffice);
router.delete('/delete', deleteOffice)

export default router;
