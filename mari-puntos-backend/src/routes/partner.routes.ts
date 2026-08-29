import { Router } from 'express';

import { PartnerController } from '../controllers/partner.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const partnerController = new PartnerController();

router.post('/create', authMiddleware, asyncHandler(partnerController.createLink));

router.get('/link-code', authMiddleware, asyncHandler(partnerController.getLinkCode));

router.post('/join', authMiddleware, asyncHandler(partnerController.joinLink));

router.get('/', authMiddleware, asyncHandler(partnerController.getPartner));

router.post('/unlink', authMiddleware, asyncHandler(partnerController.unlinkPartner));

export default router;
