import {
  GiUpgrade,
  GiPointyHat,
  GiCheckedShield,
  GiArcher,
  GiBroadsword,
  GiMaceHead,
  GiBattleAxe,
  GiMailedFist,
  GiFishingPole,
  GiAchievement,
  GiRoyalLove,
  GiWizardFace,
  GiRobe,
  GiBrutalHelm,
  GiSpartan,
  GiHighShot,
} from "react-icons/gi";
export const skillTypes = [
  "experience",
  "magic",
  "shielding",
  "distance",
  "sword",
  "club",
  "axe",
  "fist",
  "fishing",
  "achievements",
  "loyalty",
];
export const vocations = ["all", "druid", "knight", "paladin", "sorcerer"];
export const tournamentWorlds = [
  "Endebra",
  "Endera",
  "Endura",
  "Velocera",
  "Velocibra",
  "Velocita",
];

export const skillIcons = {
  experience: <GiUpgrade />,
  magic: <GiPointyHat />,
  shielding: <GiCheckedShield />,
  distance: <GiHighShot />,
  sword: <GiBroadsword />,
  club: <GiMaceHead />,
  axe: <GiBattleAxe />,
  fist: <GiMailedFist />,
  fishing: <GiFishingPole />,
  achievements: <GiAchievement />,
  loyalty: <GiRoyalLove />,
};
export const vocationIcons = {
  all: <GiSpartan />,
  druid: <GiRobe />,
  knight: <GiBrutalHelm />,
  paladin: <GiArcher />,
  sorcerer: <GiWizardFace />,
};
