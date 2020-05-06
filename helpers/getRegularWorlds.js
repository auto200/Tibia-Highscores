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
