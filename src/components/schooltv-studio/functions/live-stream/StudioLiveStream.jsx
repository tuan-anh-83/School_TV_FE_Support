import React from "react";
import "./StudioLiveStream.scss";
import LiveStreamProgram from "./LiveStreamProgram";
import LiveStreamSchedule from "./LiveStreamSchedule";

function StudioLiveStream() {
  const [isProgramCreated, setIsProgramCreated] = React.useState(false);

  return (
    <div style={{ marginTop: "50px" }}>
      {isProgramCreated ? (
        <LiveStreamSchedule />
      ) : (
        <LiveStreamProgram setIsProgramCreated={setIsProgramCreated} />
      )}
    </div>
  );
}

export default StudioLiveStream;
