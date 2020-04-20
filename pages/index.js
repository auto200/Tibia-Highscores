import { useState, useEffect } from "react";
import axios from "axios";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

const ALL_WORLDS = "ALL_WORLDS";
const skillTypes = [
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
const vocations = ["all", "druid", "knight", "paladin", "sorcerer"];
const Index = () => {
  const [worlds, setWorlds] = useState([]);
  const [currentWorld, setCurrentWorld] = useState(ALL_WORLDS);
  const [currentSkillType, setCurrentSkillType] = useState(skillTypes[0]);
  const [currentVocation, setCurrentVocation] = useState(vocations[0]);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [cache, setCache] = useState({});
  useEffect(() => {
    const getWorlds = async () => {
      const { data } = await axios.get(
        "https://api.tibiadata.com/v2/worlds.json"
      );
      const worlds = data.worlds.allworlds;
      const sortedWorlds = worlds.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      setWorlds(sortedWorlds);
    };
    getWorlds();
  }, []);

  useEffect(() => {
    const getHighscores = async () => {
      if (!worlds.length) return;

      if (currentWorld === ALL_WORLDS) {
        console.log(worlds);
        const promises = worlds.map(({ name }) => {
          const url = `https://api.tibiadata.com/v2/highscores/${name}/${currentSkillType}/${currentVocation}.json`;
          return axios.get(url);
        });
        const data = await axios.all(promises);
        console.log("---------");
        console.log(data);
        console.log("---------");
        const allServerHighscores = data
          .map(({ data }, i) => {
            const highscores = data.highscores.data;

            if (!Array.isArray(highscores)) return [];

            return highscores.map((char) => {
              char.server = worlds[i].name;
              return char;
            });
          })
          .flat()
          .sort((a, b) => {
            //propably change this to current filter (ascending/descending)
            if (a.level > b.level) {
              return -1;
            }
            if (a.level < b.level) {
              return 1;
            }
            return 0;
          });
        setDataToDisplay(allServerHighscores);
      }
    };
    getHighscores();
  }, [worlds, currentWorld, currentSkillType, currentVocation]);
  return (
    <div>
      <div>
        <label>
          World
          <select
            value={currentWorld}
            onChange={(e) => setCurrentWorld(e.target.value)}
          >
            <option value={ALL_WORLDS}>all</option>
            {worlds.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Skill
          <select
            value={currentSkillType}
            onChange={(e) => setCurrentSkillType(e.target.value)}
          >
            {skillTypes.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Vocation
          <select
            value={currentVocation}
            onChange={(e) => setCurrentVocation(e.target.value)}
          >
            {vocations.map((vocation) => (
              <option key={vocation} value={vocation}>
                {vocation}
              </option>
            ))}
          </select>
        </label>
      </div>
      <TableContainer>
        <Table>
          <caption>display area</caption>
          <TableHead>
            <TableRow selected>
              <TableCell>Rank</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Vocation</TableCell>
              <TableCell>Server</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataToDisplay.slice(0, 300).map((data, i) => (
              <TableRow key={`${data.name}_${data.level}_${i}`} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <a
                    href={`https://www.tibia.com/community/?subtopic=characters&name=${encodeURIComponent(
                      data.name
                    )}`}
                    target="_blank"
                  >
                    {data.name}
                  </a>
                </TableCell>
                <TableCell>{data.level}</TableCell>
                <TableCell>{data.voc}</TableCell>
                <TableCell>{data.server}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
export default Index;
