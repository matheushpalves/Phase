export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type OnboardingStackParamList = {
  OnboardingName: undefined;
  OnboardingCycle: undefined;
  OnboardingData: { cycleLength: number; periodLength: number };
};

export type MainStackParamList = {
  Calendar: undefined;
  DayDetail: { date: string };
  Profile: undefined;
};

export type RootStackParamList = AuthStackParamList & OnboardingStackParamList & MainStackParamList;
