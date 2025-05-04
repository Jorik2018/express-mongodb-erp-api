import { Response, Router } from 'express';
import { RequestWithUserId } from '../auth/is-auth';
import Campaign from '../database/models/campaign';
import Application from '../database/models/application';
import { sendError } from '../utils/responses';

const list = async ({ userId }: RequestWithUserId, res: Response) => {

  const currentUserId = userId;

  const today = new Date();

  try {

    const draftCampaignsCount = await Campaign.countDocuments({
      user: currentUserId,
      status: 'draft'
    });

    const upcomingActiveCampaignsCount = await Campaign.countDocuments({
      user: currentUserId,
      status: 'active',
      startDate: { $gt: today }
    });

    const ongoingActiveCampaignsCount = await Campaign.countDocuments({
      user: currentUserId,
      status: 'active',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const pastActiveCampaignsCount = await Campaign.countDocuments({
      user: currentUserId,
      status: 'active',
      endDate: { $lt: today }
    });

    // Queries para Application
    const pendingApplicationsCount = await Application.countDocuments({
      status: 'pending',
      campaignId: {
        $in: await Campaign.find({
          user: currentUserId,
          status: 'active',
          endDate: { $gte: today }
        }).distinct('_id')
      }
    });

    const acceptedApplicationsCount = await Application.countDocuments({
      status: 'accepted',
      campaignId: {
        $in: await Campaign.find({
          user: currentUserId,
          status: 'active',
          to: { $gte: today }
        }).distinct('_id')
      }
    });

    // Lista de campañas por categorías
    const campaignsByCategories = await Campaign.aggregate([
      { $match: { user: currentUserId } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          campaigns: { $push: { _id: '$_id', status: '$status' } }
        }
      }
    ]);

    res.json({
      drafts: draftCampaignsCount,
      upcomingCampaigns: upcomingActiveCampaignsCount,
      activeCampaigns: ongoingActiveCampaignsCount,
      completedCampaigns: pastActiveCampaignsCount,
      pendingApplications: pendingApplicationsCount,
      acceptedApplications: acceptedApplicationsCount,
      campaignsByCategories
    });
  } catch (error) {
    sendError(res)(error)
  }
};

const router = Router();

router.get('/', list as any);

export default router;
