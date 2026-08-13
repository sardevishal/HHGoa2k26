export type GeneratorMode = 'PFP_FRAME' | 'BUILDER_CARD';

export interface CropSettings {
  zoom: number;          // 1.0 – 3.0
  horizontal: number;    // 0 – 100 (percent)
  vertical: number;      // 0 – 100 (percent)
}

export interface ProfileData {
  name: string;
  age: string;
  role: string;
  currentlyShipping: string;
  builderTitle: string;
  githubUsername: string;
}

export const DEFAULT_CROP: CropSettings = {
  zoom: 1.0,
  horizontal: 50,
  vertical: 35,
};

export const DEFAULT_PROFILE: ProfileData = {
  name: '',
  age: '',
  role: '',
  currentlyShipping: '',
  builderTitle: '',
  githubUsername: '',
};

export const BUILDER_TITLES = [
  'Jungle Refactoring Pioneer',
  'Protocol Architect',
  'AI Systems Builder',
  'Onchain Product Hacker',
  'Agent Infrastructure Builder',
  'Crypto Product Explorer',
  'Full Stack Shipmaster',
  'AI Native Builder',
  'Smart Contract Tinkerer',
  'Protocol Experimenter',
  'Zero-to-One Builder',
  'Solana Ecosystem Hacker',
  'Distributed Systems Tinkerer',
  'Chain Abstraction Explorer',
  'DePIN Infrastructure Pioneer',
  'Open Source Contributor',
  'Autonomous Agent Builder',
  'Web3 Product Hacker',
  'Recursive Debugger',
  'Ship-First Engineer',
];
