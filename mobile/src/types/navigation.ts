import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<TabStackParamList>;
};

export type TabStackParamList = {
  Dashboard: undefined;
  Wallet: undefined;
  Rewards: undefined;
  Achievements: undefined;
  Profile: undefined;
};