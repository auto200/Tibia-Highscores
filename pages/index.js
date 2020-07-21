import { useState, useEffect, useRef } from "react";
import Router from "next/router";
import { makeStyles } from "@material-ui/styles";
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
import { GiWireframeGlobe } from "react-icons/gi";
import { fetchRegularWorlds, fetchHighscores } from "../helpers";
import {
  skillTypes,
  vocations,
  skillIcons,
  vocationIcons,
  ALL_WORLDS,
  DEFAULT_PATH,
} from "../constants";

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  contianer: {
    maxHeight: "100vh",
    paddingBottom: "20px",
  },
  capitalize: {
    textTransform: "capitalize",
  },
  header: {
    display: "flex",
    alignItems: "center",
    "& label": {
      display: "flex",
      alignItems: "center",
      "& svg": {
        marginRight: "3px",
        marginLeft: "5px",
        fontSize: "24px",
      },
    },
  },
  errorMessage: {
    fontSize: "2.5rem",
    marginTop: "2rem",
    "& a": {
      color: "cyan",
    },
  },
});
const getPropertyName = (skill) => {
  switch (skill) {
    case "level":
      return "level";
    case "loyalty":
    case "achievements":
      return "points";
    default:
      return "value";
  }
};
const getSecondarySkillColumnName = (skill) => {
  switch (skill) {
    case "achievements":
    case "loyalty":
    case "level":
      return "Points";
    default:
      return "Skill Level";
  }
};

const Index = ({
  initialWorld = ALL_WORLDS,
  initialSkill = skillTypes[0],
  initialVocation = vocations[0],
  worlds = [],
  characters = [],
}) => {
  const [world, setWorld] = useState(initialWorld);
  const [skill, setSkill] = useState(initialSkill);
  const [vocation, setVocation] = useState(initialVocation);
  const tableRef = useRef(null);

  const classes = useStyles();

  useEffect(() => {
    const search = `/?world=${world}&skill=${skill}&vocation=${vocation}`;
    if ("/" + window.location.search !== search) Router.push(search);
  }, [world, skill, vocation]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <label>
          <GiWireframeGlobe />
          <Select
            labelId="World"
            value={world}
            native={true}
            onChange={(e) => setWorld(e.target.value)}
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
          {skillIcons[skill]}
          <Select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
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
          {vocationIcons[vocation]}
          <Select
            value={vocation}
            onChange={(e) => setVocation(e.target.value)}
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
      {!worlds.length || !characters.length ? (
        <div className={classes.errorMessage}>
          <a href="https://tibiadata.com/" target="_blank">
            Tibiadata
          </a>{" "}
          API propably has some problems, please try again later...
        </div>
      ) : (
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
                <TableCell>Level</TableCell>
                <TableCell>{getSecondarySkillColumnName(skill)}</TableCell>
                <TableCell>Vocation</TableCell>
                <TableCell>Server</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/*TO BE IMPLEMENTED: The idea is to start from 100 and load rows progressively */}
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
                  <TableCell>{char.level}</TableCell>
                  <TableCell>
                    {skill === "level"
                      ? char?.value?.toLocaleString("en")
                      : char[getPropertyName(skill)]}
                  </TableCell>
                  <TableCell>{char.vocation}</TableCell>
                  <TableCell>{char.world}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
export default Index;

Index.getInitialProps = async ({ query, res }) => {
  const { world, skill, vocation } = query;
  //Worlds are fetched every time. Don't know how to cache it, cookie/localstorage?
  //Ideally it should be called once per page reload, stored on the app level.
  let worlds = [];
  try {
    worlds = await fetchRegularWorlds();
  } catch (err) {
    worlds = [{ name: "Cannot fetch worlds" }];
  }

  if (
    (!worlds.some(({ name }) => name === world) && world !== ALL_WORLDS) ||
    !skillTypes.includes(skill) ||
    !vocations.includes(vocation)
  ) {
    if (res) {
      res.writeHead(302, { Location: DEFAULT_PATH });
      res.end();
    } else {
      Router.push(DEFAULT_PATH);
    }
    return {};
  }

  let characters = [];
  try {
    characters = await fetchHighscores(world, skill, vocation);
  } catch (err) {}

  return {
    initialWorld: world,
    initialSkill: skill,
    initialVocation: vocation,
    worlds,
    characters,
  };
};
