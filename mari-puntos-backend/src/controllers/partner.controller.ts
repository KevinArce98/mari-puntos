import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PartnerService } from '../services/partner.service';
import { joinPartnerLinkSchema } from '../validators/schemas';
import { sendSuccess, sendCreated } from '../utils/response';
import { toPartnerInfoDTO } from '../utils/mappers';
import { getNowUTC6 } from '../utils/helpers';
import { PartnerLinkStatus } from '../shared/constants';

export class PartnerController {
  private partnerService = new PartnerService();

  /**
   * POST /partner/create
   * Create a partner link code
   */
  createLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const partnerLink = await this.partnerService.createPartnerLink(userId);

      // Response matches frontend CreatePartnerLinkResponse
      sendCreated(
        res,
        {
          linkCode: partnerLink.linkCode,
          status: PartnerLinkStatus.PENDING,
        },
        'Partner link created successfully'
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /partner/join
   * Join a partner using their link code
   */
  joinLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { linkCode } = joinPartnerLinkSchema.parse(req.body);

      const partnerLink = await this.partnerService.joinPartnerLink(userId, linkCode);

      // Response matches frontend JoinPartnerResponse
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
      throw error;
    }
  };

  /**
   * GET /partner/create
   * Get a partner link code
   */
  getLinkCode = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const partnerLink = await this.partnerService.getPartnerLinkCode(userId);

      if (!partnerLink) {
        throw new Error('No partner link found for user');
      }

      sendSuccess(
        res,
        {
          linkCode: partnerLink.linkCode,
          status: partnerLink.status,
        },
        'Partner link retrieved successfully'
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /partner
   * Get partner information
   */
  getPartner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const result = await this.partnerService.getPartnerLinkWithDetails(userId);

      if (!result) {
        sendSuccess(res, null, 'No active partner link found');
        return;
      }

      const { partnerLink, partner } = result;
      // Response matches frontend PartnerInfo
      sendSuccess(res, toPartnerInfoDTO(partnerLink, partner, userId));
    } catch (error) {
      throw error;
    }
  };

  /**
   * DELETE /partner
   * Unlink from partner
   */
  unlinkPartner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      await this.partnerService.unlinkPartner(userId);

      sendSuccess(res, null, 'Partner unlinked successfully');
    } catch (error) {
      throw error;
    }
  };
}
