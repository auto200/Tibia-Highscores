import axios from "axios";

export const getWorldHighscores = async (world, skill, vocation) => {
  const url = `https://api.tibiadata.com/v2/highscores/${world}/${skill}/${vocation}.json`;
  const { data } = await axios.get(url);
  const highscores = data.highscores.data;

  if (!Array.isArray(highscores)) return [];

  const parsedHighscores = highscores.map((char) => {
    return { ...char, server: data.highscores.world };
  });

  return parsedHighscores;
};
