import express, { Request, Response } from 'express';
import Item from '../models/item';

const router = express.Router();

interface IError {
    message: string
}
// GET all items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: (error as IError).message });
  }
});

// GET single item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) throw Error('Item not found');
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: (error as IError).message });
  }
});

// POST new item
router.post('/', async (req: Request, res: Response) => {
  const item = new Item({
    name: req.body.name,
    description: req.body.description
  });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: (error as IError).message });
  }
});

// PUT update item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw Error('Item not found');
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: (error as IError).message });
  }
});

// DELETE item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) throw Error('Item not found');
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
});

export default router;
