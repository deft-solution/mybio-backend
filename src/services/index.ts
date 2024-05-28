import { REST } from '../../packages';
import { BabyService, BabyServiceImpl } from './BabyService';
import { SocialLinkService, SocialLinkServiceImpl } from './SocialLinkService';
import { UserService, UserServiceImpl } from './UserService';

REST.register("BabyService", BabyServiceImpl);
REST.register("UserService", UserServiceImpl);
REST.register("SocialLinkService", SocialLinkServiceImpl);

export {
  BabyServiceImpl,
  BabyService,
  UserService,
  UserServiceImpl,
  SocialLinkService,
  SocialLinkServiceImpl,
};