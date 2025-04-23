import React, { useEffect, useState } from "react";
import "./ViewChannelProgram.scss";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { Flex, Timeline } from "antd";
import ScheduleItem from "../../components/watch-program/timeline/ScheduleItem";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../config/baseAPI";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import VideoComment from "./VideoComment";

dayjs.extend(utc);
dayjs.extend(timezone);

function ViewChannelProgram() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [displayIframeUrl, setDisplayIframeUrl] = useState("");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [logicDate, setLogicDate] = useState(
    currentDate.format("YYYY-MM-DD") || ""
  );
  const [displaySchedule, setDisplaySchedule] = useState([]);
  const navigate = useNavigate();
  const { channelId } = useParams();
  const isToday = currentDate.isSame(dayjs(), "day");
  const displayDate = currentDate.format("DD/MM/YYYY");
  const handlePrevDay = () => {
    setCurrentDate((prev) => prev.subtract(1, "day"));
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => prev.add(1, "day"));
  };
  const programList = displaySchedule.map((schedule) => ({
    color: schedule.status ? "#4169E1" : "#FF6347",
    children: (
      <ScheduleItem
        startTime={dayjs(schedule.startTime).format("HH:mm")}
        endTime={dayjs(schedule.endTime).format("HH:mm")}
        programName={schedule.programName}
        status={schedule.status}
        iframeUrl={schedule.iframeUrl}
        setDisplayIframeUrl={setDisplayIframeUrl}
        isReplay={schedule.isReplay}
      />
    ),
  }));

  useEffect(() => {
    const newLogicDate = currentDate.format("YYYY-MM-DD");
    setLogicDate(newLogicDate);
    fetchScheduleProgram(newLogicDate);
  }, [currentDate]);

  const fetchScheduleProgram = async (date) => {
    try {
      const response = await apiFetch(
        `Schedule/by-channel-and-date?channelId=${channelId}&date=${encodeURIComponent(
          date
        )}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy lịch phát sóng!");
      }

      const data = await response.json();

      if (data) {
        const time = data.data.$values
          .map((schedule) => {
            const start = dayjs(schedule.startTime);
            const end = dayjs(schedule.endTime);

            return {
              startTime: start,
              endTime: end,
              programName: schedule.program.programName,
              status: schedule.status,
              iframeUrl: schedule.iframeUrl,
              isReplay: schedule.isReplay,
            };
          })
          .sort((a, b) => {
            const timeA = dayjs(a.startTime);
            const timeB = dayjs(b.startTime);
            return timeA.valueOf() - timeB.valueOf();
          });

        setDisplaySchedule(time);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lấy lịch phát sóng!");
      console.error("Error fetching schedule program:", error);
    }
  };

  const handleExistChannel = async () => {
    try {
      const response = await apiFetch(`schoolchannels/${channelId}`, {
        method: "GET",
      });

      if (!response.ok) {
        toast.error("Kênh không tồn tại!");
        navigate("/channelList");
        return;
      }

      const data = await response.json();
      if (data) {
        fetchScheduleProgram(logicDate);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kiểm tra kênh!");
      navigate("/channelList");
    }
  };

  useEffect(() => {
    handleExistChannel();
  }, [channelId]);

  return (
    <div className="channel-program-container">
      <div className="channel-program-display">
        <iframe
          src={displayIframeUrl}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>

        <div className="overlay"></div>

        <span className="schedule-btn" onClick={() => setShowSchedule(true)}>
          Lịch phát sóng <FaRegCalendarAlt />
        </span>

        <div className={`schedule-panel ${showSchedule ? "visible" : ""}`}>
          <Flex justify="space-between" align="center">
            <div className="date-navigator">
              <button className="nav-btn" onClick={handlePrevDay}>
                <FaChevronLeft />
              </button>
              <span className="date-text">
                {isToday && "Hôm nay - "}
                {displayDate}
              </span>
              <button className="nav-btn" onClick={handleNextDay}>
                <FaChevronRight />
              </button>
            </div>

            <span className="close-btn" onClick={() => setShowSchedule(false)}>
              X
            </span>
          </Flex>

          <div className="schedule-panel-list">
            {displaySchedule.length > 0 ? (
              <Timeline items={programList} />
            ) : (
              <div className="no-schedule">Không có lịch phát sóng</div>
            )}
          </div>
        </div>
      </div>

      <VideoComment />
    </div>
  );
}

export default ViewChannelProgram;
