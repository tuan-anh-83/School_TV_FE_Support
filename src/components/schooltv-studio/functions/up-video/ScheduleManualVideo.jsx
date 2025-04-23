import React, { useEffect } from "react";
import "./ScheduleManualVideo.scss";
import { Form, Select, DatePicker, Button } from "antd";
import apiFetch from "../../../../config/baseAPI";
import { FiPlus } from "react-icons/fi";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "react-toastify";
dayjs.extend(utc);
dayjs.extend(timezone);

function ScheduleManualVideo(props) {
  const { programList } = props;
  const [form] = Form.useForm();
  const [programID, setProgramID] = React.useState(null);
  const [videoID, setVideoID] = React.useState(null);
  const [videoList, setVideoList] = React.useState([]);
  const [isBtnLoading, setIsBtnLoading] = React.useState(false);

  const handleChangeProgram = (value) => {
    setProgramID(value);
  };

  const handleChangeVideo = (value) => {
    setVideoID(value);
    console.log(value);
  };

  const fetchVideoByProgram = async () => {
    try {
      const response = await apiFetch(
        `VideoHistory/program/${programID}/videos`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Không tìm thấy video nào phù hợp!");
      }

      const data = await response.json();
      if (data) {
        const getVideo = data.$values.map((video) => {
          return {
            value: video.videoHistoryID,
            label: video.description,
          };
        });

        setVideoList(getVideo);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (programID) {
      fetchVideoByProgram();
    }
  }, [programID]);

  const handleCreateScheduleVideo = async (values) => {
    const timeRange = values.timeRange;

    if (timeRange && timeRange.length === 2) {
      const startTime = dayjs(timeRange[0]).format("YYYY-MM-DDTHH:mm:ss");
      const endTime = dayjs(timeRange[1]).format("YYYY-MM-DDTHH:mm:ss");
      values.timeRange = [startTime, endTime];
    }

    const requestBody = {
      videoHistoryID: values.videoHistoryId,
      startTime: values.timeRange[0],
      endTime: values.timeRange[1],
    };

    try {
      setIsBtnLoading(true);
      const response = await apiFetch("Schedule/replay-from-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo lịch trình video!");
      }

      const data = await response.json();
      if (data) {
        toast.success("Tạo lịch trình video thành công!");
        form.resetFields();
      }
    } catch (error) {
      toast.error("Lỗi khi tạo lịch trình video!");
    } finally {
      setIsBtnLoading(false);
    }
  };
  return (
    <div>
      {/* Class applied from main title of SChoolChannelStudio.scss */}
      <h1 className="studio-function-title">
        Thiết lập thời gian trình chiếu video
      </h1>

      <div className="schedule-video-content">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreateScheduleVideo}
        >
          <Form.Item
            label={<h2 className="schedule-video-des">Chương trình</h2>}
            name="ProgramID"
            rules={[{ required: true, message: "Vui lòng chọn chương trình!" }]}
          >
            <Select
              defaultValue={{ value: null, label: "Chọn chương trình" }}
              options={programList}
              onChange={handleChangeProgram}
            />
          </Form.Item>

          <Form.Item
            label={
              <h2 className="schedule-video-des">
                Video có trong chương trình
              </h2>
            }
            name="videoHistoryId"
            rules={[{ required: true, message: "Vui lòng chọn video!" }]}
          >
            <Select
              defaultValue={{ value: null, label: "Chọn video" }}
              onChange={handleChangeVideo}
              disabled={!programID}
              options={videoList}
            />
          </Form.Item>

          <Form.Item
            label={
              <h2 className="schedule-video-des">Thời gian trình chiếu</h2>
            }
            name="timeRange"
            rules={[
              { required: true, message: "Vui lòng chọn khoảng thời gian!" },
            ]}
          >
            {/* chỉ cho set lịch trước 10p */}
            {/* <RangePicker
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              disabled={!videoID}
              showTime={{
                format: "HH:mm:ss",
              }}
              disabledDate={(current) => {
                return (
                  current && current < dayjs().add(10, "minute").startOf("day")
                );
              }}
              disabledTime={(date) => {
                if (date && date.isSame(dayjs(), "day")) {
                  return {
                    disabledHours: () => {
                      const currentHour = dayjs().hour();
                      const hours = [];
                      for (let i = 0; i < currentHour; i++) {
                        hours.push(i);
                      }
                      return hours;
                    },
                    disabledMinutes: (selectedHour) => {
                      if (selectedHour === dayjs().hour()) {
                        const currentMinute = dayjs().minute();
                        const minutes = [];
                        for (let i = 0; i < currentMinute + 10; i++) {
                          minutes.push(i);
                        }
                        return minutes;
                      }
                      return [];
                    },
                  };
                }
                return {};
              }}
            /> */}

            {/* cho set lịch không cần chờ 10p */}
            <RangePicker
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              disabled={!videoID}
              showTime={{
                format: "HH:mm:ss",
              }}
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
              disabledTime={(date) => {
                if (date && date.isSame(dayjs(), "day")) {
                  return {
                    disabledHours: () => {
                      const currentHour = dayjs().hour();
                      const hours = [];
                      for (let i = 0; i < currentHour; i++) {
                        hours.push(i);
                      }
                      return hours;
                    },
                    disabledMinutes: (selectedHour) => {
                      if (selectedHour === dayjs().hour()) {
                        const currentMinute = dayjs().minute();
                        const minutes = [];
                        for (let i = 0; i < currentMinute; i++) {
                          minutes.push(i);
                        }
                        return minutes;
                      }
                      return [];
                    },
                  };
                }
                return {};
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              className="schedule-video__btn"
              loading={isBtnLoading}
            >
              <FiPlus />
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ScheduleManualVideo;
