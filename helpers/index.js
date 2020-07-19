import axios from "axios";
import { tournamentWorlds } from "../constants";

export const getRegularWorlds = async () => {
  const { data } = await axios.get("https://api.tibiadata.com/v2/worlds.json");
  const worlds = data.worlds.allworlds;
  const filtredWorlds = worlds.filter(
    (world) => !tournamentWorlds.includes(world.name)
  );
  return filtredWorlds;
};

export const getWorldHighscores = async (world, skill, vocation) => {
  const url = `https://api.tibiadata.com/v2/highscores/${world}/${skill}/${vocation}.json`;
  const { data } = await axios.get(url);
  const highscores = data.highscores.data;

  if (!Array.isArray(highscores)) return [];

  return highscores;
};

export const getAllWorldsHighscores = async (worlds, skill, vocation) => {
  const promises = worlds.map(({ name }) =>
    getWorldHighscores(name, skill, vocation)
  );
  const allHighscores = await Promise.all(promises);
  return allHighscores.flat();
};

export const sortArrayByObjectProperty = (
  array,
  property,
  direction = "desc"
) => {
  if (direction === "asc") {
    return array.sort((a, b) => {
      if (a[property] < b[property]) {
        return -1;
      }
      if (a[property] > b[property]) {
        return 1;
      }
      return 0;
    });
  } else if (direction === "desc") {
    return array.sort((a, b) => {
      if (a[property] > b[property]) {
        return -1;
      }
      if (a[property] < b[property]) {
        return 1;
      }
      return 0;
    });
  }
};
