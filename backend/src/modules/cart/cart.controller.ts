import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { cartService } from './cart.service';
import { addCartItemSchema, updateCartItemSchema } from './cart.dto';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.getCart(req.user!.userId);
    res.json(cart);
  })
);

router.post(
  '/items',
  authenticate,
  validate(addCartItemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.addItem(req.user!.userId, req.body);
    res.json(result);
  })
);

router.put(
  '/items/:itemId',
  authenticate,
  validate(updateCartItemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.updateItem(
      req.user!.userId,
      req.params.itemId as string,
      req.body.quantity
    );
    res.json(result);
  })
);

router.delete(
  '/items/:itemId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.removeItem(req.params.itemId as string);
    res.json(result);
  })
);

router.delete(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.clearCart(req.user!.userId);
    res.json(result);
  })
);

export default router;
