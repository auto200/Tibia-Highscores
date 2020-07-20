import axios from "axios";
import { tournamentWorlds } from "../constants";

export const fetchRegularWorlds = async () => {
  const { data } = await axios.get("https://api.tibiadata.com/v2/worlds.json");
  const worlds = data.worlds.allworlds;
  const filtredWorlds = worlds.filter(
    (world) => !tournamentWorlds.includes(world.name)
  );
  return filtredWorlds;
};

export const fetchHighscores = async (world, skill, vocation) => {
  const url = `https://api.tibiadata.com/v2/highscores/${world}/${skill}/${vocation}.json`;
  const { data } = await axios.get(url);
  const highscores = data.highscores.data;

  if (!Array.isArray(highscores)) return [];

  return highscores;
};
