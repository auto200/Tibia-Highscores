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
import Loading from "../components/Loading";

import {
  getRegularWorlds,
  getWorldHighscores,
  getAllWorldsHighscores,
  sortArrayByObjectProperty,
} from "../helpers";
import { skillTypes, vocations } from "../constants";

const ALL_WORLDS = "all";

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

const Index = ({ worlds = [], characters = [] }) => {
  const [world, setWorld] = useState(ALL_WORLDS);
  const [skill, setSkill] = useState(skillTypes[0]);
  const [vocation, setVocation] = useState(vocations[0]);
  // const [isLoading, setIsLoading] = useState(false);
  const tableRef = useRef(null);

  const classes = useStyles();
  const pointsOrLevel =
    skill === "achievements" || skill === "loyalty" ? "points" : "level";

  useEffect(() => {
    const search = `/?world=${world}&skill=${skill}&vocation=${vocation}`;
    if ("/" + window.location.search !== search) Router.push(search);
  }, [world, skill, vocation]);

  return (
    // <>
    //   {isLoading && <Loading />}
    <div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <label>
          World:{" "}
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
          Skill:{" "}
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
          Vocation:{" "}
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
    // </>
  );
};
export default Index;

Index.getInitialProps = async ({ query, res }) => {
  const { world, skill, vocation } = query;
  const worlds = await getRegularWorlds();
  const defaultPath = "/?world=all&skill=experience&vocation=all";

  if (
    (!worlds.some(({ name }) => name === world) && world !== "all") ||
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

  if (world === "all") {
    characters = await getAllWorldsHighscores(worlds, skill, vocation);
  } else {
    characters = await getWorldHighscores(world, skill, vocation);
  }
  const pointsOrLevel = characters[0].level ? "level" : "points";

  return {
    worlds,
    characters: sortArrayByObjectProperty(characters, pointsOrLevel),
  };
};
