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

import {
  getRegularWorlds,
  getWorldHighscores,
  getAllWorldsHighscores,
  sortArrayByObjectProperty,
} from "../helpers";
import { skillTypes, vocations, skillIcons, vocationIcons } from "../constants";

const ALL_WORLDS = "all";

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
});

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
  const pointsOrLevel =
    skill === "achievements" || skill === "loyalty" ? "points" : "level";

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
                <TableCell
                  title={
                    skill === skillTypes[0]
                      ? char?.points?.toLocaleString("en")
                      : undefined
                  }
                >
                  {char[pointsOrLevel]}
                </TableCell>
                <TableCell>{char.voc}</TableCell>
                <TableCell>{char.server}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
export default Index;

Index.getInitialProps = async ({ query, res }) => {
  const { world, skill, vocation } = query;
  //Worlds are fetched every time. Don't know how to cache it, cookie/localstorage?
  //Ideally it should be called once per page reload, stored on the app level.
  const worlds = await getRegularWorlds();
  const defaultPath = "/?world=all&skill=experience&vocation=all";

  if (
    (!worlds.some(({ name }) => name === world) && world !== ALL_WORLDS) ||
    !skillTypes.includes(skill) ||
    !vocations.includes(vocation)
  ) {
    if (res) {
      res.writeHead(302, { Location: defaultPath });
      res.end();
    } else {
      Router.push(defaultPath);
    }
    return {};
  }

  let characters = [];

  if (world === ALL_WORLDS) {
    characters = await getAllWorldsHighscores(worlds, skill, vocation);
  } else {
    characters = await getWorldHighscores(world, skill, vocation);
  }
  const property = !!characters[0].level ? "level" : "points";

  return {
    initialWorld: world,
    initialSkill: skill,
    initialVocation: vocation,
    worlds,
    characters: sortArrayByObjectProperty(characters, property),
  };
};
