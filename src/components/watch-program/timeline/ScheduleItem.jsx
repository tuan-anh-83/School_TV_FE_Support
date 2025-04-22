import React, { useEffect } from "react";
import "./ScheduleItem.scss";
import { Flex } from "antd";

function ScheduleItem(props) {
  const {
    startTime,
    endTime,
    programName,
    status,
    iframeUrl,
    setDisplayIframeUrl,
    isReplay,
  } = props;

  return (
    <div
      className="schedule-item-container"
      title={status ? "Xem lại chương trình" : "Đang phát trực tiếp"}
      onClick={() => setDisplayIframeUrl(iframeUrl)}
    >
      {status !== "Ended" && status !== "EndedEarly" && (
        <>
          {" "}
          <div className="live-tag">LIVE</div>
          <Flex vertical>
            <div className="shedule-item-info">
              <p className="program-name">{programName}</p>
            </div>

            <Flex>
              <p style={{ color: "gray", fontSize: 12 }}>
                Từ {startTime} đến {endTime}
              </p>
            </Flex>
          </Flex>
        </>
      )}

      {(status === "Ended" || status === "EndedEarly") && (
        <Flex>
          <p className="start-time">{startTime}</p>

          <p className="program-name">{programName}</p>
        </Flex>
      )}
    </div>
  );
}

export default ScheduleItem;
