import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  loading: {
    position: "absolute",
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1000,
  },
});

const Loading = () => {
  const classes = useStyles();
  return (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  );
};

export default Loading;
