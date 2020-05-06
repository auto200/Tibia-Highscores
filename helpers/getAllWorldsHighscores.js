import { getWorldHighscores } from "./getWorldHighscores";

export const getAllWorldsHighscores = async (worlds, skill, vocation) => {
  const promises = worlds.map(({ name }) =>
    getWorldHighscores(name, skill, vocation)
  );
  const allHighscores = await Promise.all(promises);
  return allHighscores.flat();
};
