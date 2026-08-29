import { Response } from 'express';

import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';
import { PartnerService } from '../services/partner.service';
import { PartnerLinkStatus } from '../shared/constants';
import { getNowUTC6 } from '../utils/helpers';
import { logger } from '../utils/logger';
import { toPartnerInfoDTO } from '../utils/mappers';
import { sendCreated, sendSuccess } from '../utils/response';
import { joinPartnerLinkSchema } from '../validators/schemas';

export class PartnerController {
  private partnerService = new PartnerService();

  createLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      logger.info({ message: 'Creating partner link', userId });

      const partnerLink = await this.partnerService.createPartnerLink(userId);

      logger.info({
        message: 'Partner link created successfully',
        userId,
        linkCode: partnerLink.linkCode,
      });

      sendCreated(
        res,
        {
          linkCode: partnerLink.linkCode,
          status: PartnerLinkStatus.PENDING,
        },
        'Partner link created successfully'
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error creating partner link');
      throw error;
    }
  };

  joinLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { linkCode } = joinPartnerLinkSchema.parse(req.body);

      logger.info({ message: 'Joining partner link', userId, linkCode });

      const partnerLink = await this.partnerService.joinPartnerLink(userId, linkCode);

      logger.info({ message: 'Successfully joined partner link', userId, linkCode });

      sendSuccess(
        res,
        {
          linkCode: partnerLink.linkCode,
          status: 'active' as const,
          linkedAt: partnerLink.linkedAt?.toISOString() || getNowUTC6().toISOString(),
        },
        'Successfully linked with partner'
      );
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId, linkCode: req.body?.linkCode },
        'Error joining partner link'
      );
      throw error;
    }
  };

  getLinkCode = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      logger.debug({ message: 'Getting partner link code', userId });

      const partnerLink = await this.partnerService.getPartnerLinkCode(userId);

      if (!partnerLink) {
        logger.warn({ message: 'No partner link found for user', userId });
        throw new AppError(
          404,
          'No partner link found for user',
          'errors.partner.linkNotFoundForUser'
        );
      }

      logger.debug({
        message: 'Partner link code retrieved',
        userId,
        linkCode: partnerLink.linkCode,
      });

      sendSuccess(
        res,
        {
          linkCode: partnerLink.linkCode,
          status: partnerLink.status,
        },
        'Partner link retrieved successfully'
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting partner link code');
      throw error;
    }
  };

  getPartner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      logger.debug({ message: 'Getting partner information', userId });

      const result = await this.partnerService.getPartnerLinkWithDetails(userId);

      if (!result) {
        logger.debug({ message: 'No active partner link found', userId });
        sendSuccess(res, null, 'No active partner link found');
        return;
      }

      const { partnerLink, partner } = result;
      logger.debug({
        message: 'Partner information retrieved',
        userId,
        partnerId: partner.id,
      });

      sendSuccess(res, toPartnerInfoDTO(partnerLink, partner, userId));
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId },
        'Error getting partner information'
      );
      throw error;
    }
  };

  unlinkPartner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      logger.info({ message: 'Unlinking partner', userId });

      await this.partnerService.unlinkPartner(userId);

      logger.info({ message: 'Partner unlinked successfully', userId });

      sendSuccess(res, null, 'Partner unlinked successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error unlinking partner');
      throw error;
    }
  };
}
