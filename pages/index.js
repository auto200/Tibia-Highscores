import { useState, useEffect } from "react";
import axios from "axios";
import MaterialUiTheme from "../contexts/MaterialUiTheme";
import { makeStyles } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Link,
  Paper,
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

const useStyles = makeStyles({});

const Index = () => {
  const [worlds, setWorlds] = useState([]);
  const [currentWorld, setCurrentWorld] = useState(ALL_WORLDS);
  const [currentSkillType, setCurrentSkillType] = useState(skillTypes[0]);
  const [currentVocation, setCurrentVocation] = useState(vocations[0]);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [cache, setCache] = useState({});
  const classes = useStyles();
  const pointsNotLevel =
    currentSkillType === "achievements" || currentSkillType === "loyalty";

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
      const filterId = `${currentWorld}-${currentSkillType}-${currentVocation}`;
      const cachedData = cache[filterId];
      if (cachedData) {
        console.log("data cached!!");
        setDataToDisplay(cachedData);
        return;
      }
      console.log("downloading new data....");
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
        setCache((prev) => {
          prev[filterId] = allServerHighscores;
          return prev;
        });
      } else {
        const url = `https://api.tibiadata.com/v2/highscores/${currentWorld}/${currentSkillType}/${currentVocation}.json`;
        const { data } = await axios.get(url);
        const highscores = data.highscores.data.map((char) => {
          char.server = data.highscores.world;
          return char;
        });
        setDataToDisplay(highscores);
        setCache((prev) => {
          prev[filterId] = highscores;
          return prev;
        });
      }
    };
    getHighscores();
  }, [worlds, currentWorld, currentSkillType, currentVocation]);
  return (
    <MaterialUiTheme>
      <CssBaseline />
      <div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Select
            labelId="World"
            value={currentWorld}
            native={true}
            onChange={(e) => setCurrentWorld(e.target.value)}
            key={worlds.length}
          >
            <option value={ALL_WORLDS}>all</option>
            {worlds.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
          <Select
            value={currentSkillType}
            onChange={(e) => setCurrentSkillType(e.target.value)}
            labelId="Skill"
            native={true}
          >
            {skillTypes.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </Select>
          <Select
            value={currentVocation}
            onChange={(e) => setCurrentVocation(e.target.value)}
            labelId="Vocation"
            native={true}
          >
            {vocations.map((vocation) => (
              <option key={vocation} value={vocation}>
                {vocation}
              </option>
            ))}
          </Select>
        </div>
        <TableContainer component={Paper}>
          <Table stickyHeader={true}>
            <caption>display area</caption>
            <TableHead>
              <TableRow selected>
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>{pointsNotLevel ? "Points" : "Level"}</TableCell>
                <TableCell>Vocation</TableCell>
                <TableCell>Server</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataToDisplay.slice(0, 300).map((data, i) => (
                <TableRow key={`${data.name}_${data.level}_${i}`} hover>
                  <TableCell>
                    <b>{i + 1}</b>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`https://www.tibia.com/community/?subtopic=characters&name=${encodeURIComponent(
                        data.name
                      )}`}
                      target="_blank"
                      color="secondary"
                    >
                      {data.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {pointsNotLevel ? data.points : data.level}
                  </TableCell>
                  <TableCell>{data.voc}</TableCell>
                  <TableCell>{data.server}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </MaterialUiTheme>
  );
};
export default Index;
