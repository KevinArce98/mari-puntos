import { FindOptionsWhere } from 'typeorm';

import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';

export function activePartnerLinkWhere(userId: string): FindOptionsWhere<PartnerLink>[] {
  return [
    { user1Id: userId, status: PartnerLinkStatus.ACTIVE },
    { user2Id: userId, status: PartnerLinkStatus.ACTIVE },
  ];
}
