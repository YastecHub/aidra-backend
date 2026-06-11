import Campaign from '../models/Campaign';
import { createCampaign } from '../services/campaignService';

jest.mock('../models/Campaign', () => ({
  __esModule: true,
  default: {
    create: jest.fn()
  }
}));

describe('Campaign service', () => {
  it('submits new campaigns for review and ignores a client-supplied status', async () => {
    const createMock = Campaign.create as jest.MockedFunction<typeof Campaign.create>;
    createMock.mockImplementationOnce(async (payload: any) => payload);

    const campaign = await createCampaign('507f1f77bcf86cd799439011', {
      title: 'Water project',
      description: 'Clean water for the community',
      goalAmount: 500,
      image: 'https://example.com/campaign.jpg',
      status: 'active'
    });

    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      owner: '507f1f77bcf86cd799439011',
      status: 'underReview'
    }));
    expect(campaign).toMatchObject({ status: 'underReview' });
  });
});
