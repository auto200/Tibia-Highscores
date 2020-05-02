import { useState, useEffect, useRef } from "react";
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
import Loading from "../components/Loading";

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

const useStyles = makeStyles({
  bold: {
    fontWeight: "bold",
  },
  contianer: {
    maxHeight: "100vh",
  },
  capitalize: {
    textTransform: "capitalize",
  },
});

const parseWorldHighscores = (data) => {
  const highscores = data.highscores.data;

  if (!Array.isArray(highscores)) return [];

  return highscores.map((char) => {
    char.server = data.highscores.world;
    return char;
  });
};

const Index = () => {
  const [worlds, setWorlds] = useState([]);
  const [currentWorld, setCurrentWorld] = useState(ALL_WORLDS);
  const [currentSkillType, setCurrentSkillType] = useState(skillTypes[0]);
  const [currentVocation, setCurrentVocation] = useState(vocations[0]);
  const [characters, setCharacters] = useState([]);
  const [cache, setCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const classes = useStyles();
  const pointsOrLevel =
    currentSkillType === "achievements" || currentSkillType === "loyalty"
      ? "points"
      : "level";

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
      const cachedCharacters = cache[filterId];
      if (cachedCharacters) {
        console.log("data cached!!");
        setCharacters(cachedCharacters);
        return;
      }

      let highscores = [];
      setIsLoading(true);
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
        highscores = data.map(({ data }) => parseWorldHighscores(data)).flat();
      } else {
        const url = `https://api.tibiadata.com/v2/highscores/${currentWorld}/${currentSkillType}/${currentVocation}.json`;
        const { data } = await axios.get(url);
        highscores = parseWorldHighscores(data);
      }
      const orderedHighscores = highscores.sort((a, b) => {
        if (a[pointsOrLevel] > b[pointsOrLevel]) {
          return -1;
        } else if (a[pointsOrLevel] < b[pointsOrLevel]) {
          return 1;
        }
        return 0;
      });
      setCharacters(orderedHighscores);
      setCache((prev) => {
        prev[filterId] = highscores;
        return prev;
      });
      setIsLoading(false);
      if (tableRef.current) {
        tableRef.current.scrollTop = 0;
      }
    };
    getHighscores();
  }, [worlds, currentWorld, currentSkillType, currentVocation]);

  return (
    <MaterialUiTheme>
      <CssBaseline />
      {isLoading && <Loading />}
      <div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <label>
            World:{" "}
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
          </label>
          <label>
            Skill:{" "}
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
          </label>
          <label>
            Vocation:{" "}
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
          </label>
        </div>
        <TableContainer
          component={Paper}
          className={classes.contianer}
          ref={tableRef}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow selected>
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell className={classes.capitalize}>
                  {pointsOrLevel}
                </TableCell>
                <TableCell>Vocation</TableCell>
                <TableCell>Server</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {characters.slice(0, 300).map((char, i) => (
                <TableRow key={`${char.name}_${char.level}_${i}`} hover>
                  <TableCell className={classes.bold}>{i + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://www.tibia.com/community/?subtopic=characters&name=${encodeURIComponent(
                        char.name
                      )}`}
                      target="_blank"
                      color="secondary"
                    >
                      {char.name}
                    </Link>
                  </TableCell>
                  <TableCell>{char[pointsOrLevel]}</TableCell>
                  <TableCell>{char.voc}</TableCell>
                  <TableCell>{char.server}</TableCell>
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
