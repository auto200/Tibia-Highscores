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
});

const Index = () => {
  const [worlds, setWorlds] = useState([]);
  const [currentWorld, setCurrentWorld] = useState(ALL_WORLDS);
  const [currentSkillType, setCurrentSkillType] = useState(skillTypes[0]);
  const [currentVocation, setCurrentVocation] = useState(vocations[0]);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [cache, setCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [orderBy, setOrderBy] = useState("level");
  const [orderDirection, setOrderDirection] = useState("desc");

  const tableRef = useRef(null);

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
        highscores = data
          .map(({ data }, i) => {
            const highscores = data.highscores.data;

            if (!Array.isArray(highscores)) return [];

            return highscores.map((char) => {
              char.server = worlds[i].name;
              return char;
            });
          })
          .flat();
      } else {
        const url = `https://api.tibiadata.com/v2/highscores/${currentWorld}/${currentSkillType}/${currentVocation}.json`;
        const { data } = await axios.get(url);
        highscores = data.highscores.data.map((char) => {
          char.server = data.highscores.world;
          return char;
        });
      }
      setDataToDisplay(highscores);
      setCache((prev) => {
        prev[filterId] = highscores;
        return prev;
      });
      setIsLoading(false);
      tableRef.current.scrollTop = 0;
    };
    getHighscores();
  }, [worlds, currentWorld, currentSkillType, currentVocation]);

  useEffect(() => {
    let orderedData = [];
    if (orderDirection === "asc") {
      orderedData = dataToDisplay.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return -1;
        else if (a[orderBy] > b[orderBy]) return 1;
        return 0;
      });
    } else if (orderDirection === "desc") {
      orderedData = dataToDisplay.sort((a, b) => {
        if (a[orderBy] > b[orderBy]) return -1;
        else if (a[orderBy] < b[orderBy]) return 1;
        return 0;
      });
    }
    setDataToDisplay(orderedData);
  }, [dataToDisplay, orderBy, orderDirection]);

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
              {/* maby apply filters here??*/}
              {dataToDisplay.slice(0, 300).map((data, i) => (
                <TableRow key={`${data.name}_${data.level}_${i}`} hover>
                  <TableCell className={classes.bold}>{i + 1}</TableCell>
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

// .sort((a, b) => {
//   //propably change this to current filter (ascending/descending)
//   if (a.level > b.level) {
//     return -1;
//   }
//   if (a.level < b.level) {
//     return 1;
//   }
//   return 0;
// });
