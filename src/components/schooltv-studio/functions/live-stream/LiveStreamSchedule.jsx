import React, { useEffect } from "react";
import "./LiveStreamSchedule.scss";
import { Form, Select, DatePicker, message, Button } from "antd";
import apiFetch from "../../../../config/baseAPI";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { FiPlus } from "react-icons/fi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

function LiveStreamSchedule() {
  const [form] = Form.useForm();
  const [isBtnLoading, setIsBtnLoading] = React.useState(false);
  const { channel } = useOutletContext();
  const [program, setProgram] = React.useState([]);
  const [programID, setProgramID] = React.useState(null);
  // const [existingSchedule, setExistingSchedule] = React.useState([]);
  const [selectedRange, setSelectedRange] = React.useState(null);

  const handleChangeProgram = (value) => {
    setProgramID(value);
  };

  const fetchProgramByChannel = async () => {
    try {
      const response = await apiFetch(
        `Program/by-channel/${channel.$values[0].schoolChannelID}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Không tìm thấy phiên live nào phù hợp!");
      }

      const data = await response.json();
      if (data) {
        let getProgram = data.$values.map((program) => {
          return {
            value: program.programID,
            label: program.programName,
          };
        });

        setProgram(getProgram);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách chương trình!");
    }
  };

  // const fetchExistingSchedule = async () => {
  //   try {
  //     const response = await apiFetch(`Schedule/by-program/${programID}`, {
  //       method: "GET",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Không kiểm tra được thời gian nào phù hợp!");
  //     }

  //     const data = await response.json();

  //     if (data) {
  //       const mapScheduleTime = data.data.$values.map((schedule) => {
  //         return {
  //           startTime: dayjs.utc(schedule.startTime).format(),
  //           endTime: dayjs.utc(schedule.endTime).format(),
  //         };
  //       });
  //     }
  //   } catch (error) {
  //     toast.error("Lỗi khi kiểm tra thời gian đã có!");
  //   }
  // };

  useEffect(() => {
    fetchProgramByChannel();
  }, []);

  // useEffect(() => {
  //   if (programID) {
  //     fetchExistingSchedule();
  //   }
  // }, [programID]);

  //Handle time and validate time
  const handleChangeTime = (dates) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).utc().toISOString();
      const endDate = dayjs(dates[1]).utc().toISOString();

      setSelectedRange([startDate, endDate]);
    }
  };

  const disabledDate = (current) => {
    // Không cho phép chọn ngày trước ngày hiện tại
    return current && current < dayjs().startOf("day");
  };

  const disabledTime = (current) => {
    if (!current) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }

    const now = dayjs();
    const currentDateTime = dayjs(current);

    // Nếu là ngày hôm nay
    //đợi 10p
    // if (currentDateTime.isSame(now, "day")) {
    //   const currentHour = now.hour();
    //   const currentMinute = now.minute();

    //   return {
    //     disabledHours: () => {
    //       const hours = [];
    //       for (let i = 0; i < currentHour; i++) {
    //         hours.push(i);
    //       }
    //       return hours;
    //     },
    //     disabledMinutes: (selectedHour) => {
    //       if (selectedHour === currentHour) {
    //         const minutes = [];
    //         for (let i = 0; i <= currentMinute + 10; i++) {
    //           minutes.push(i);
    //         }
    //         return minutes;
    //       }
    //       return [];
    //     },
    //     disabledSeconds: () => [],
    //   };
    // }

    //không cần đợi
    if (currentDateTime.isSame(now, "day")) {
      const currentHour = now.hour();
      const currentMinute = now.minute();

      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === currentHour) {
            const minutes = [];
            for (let i = 0; i <= currentMinute; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
        disabledSeconds: () => [],
      };
    }

    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  console.log("selectedRange", selectedRange);

  const handleCreateSchedule = async () => {
    const errors = [];

    if (!programID) {
      errors.push({
        name: "program",
        errors: ["Vui lòng chọn chương trình."],
      });
    }

    if (selectedRange.length === 0) {
      errors.push({
        name: "range",
        errors: ["Vui lòng chọn khoảng thời gian."],
      });
    }

    if (errors.length > 0) {
      form.setFields(errors);
      return;
    }

    const requestBody = {
      programID: programID,
      startTime: selectedRange[0],
      endTime: selectedRange[1],
      isReplay: false,
    };

    try {
      setIsBtnLoading(true);
      const response = await apiFetch("Schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (response.status === 409) {
        toast.error("Lịch trình đã tồn tại trong khoảng thời gian này!");
        return;
      }

      if (!response.ok) {
        throw new Error("Không thể tạo lịch trình mới!");
      }

      const data = await response.json();

      if (data) {
        form.resetFields();
        setSelectedRange([]);
        setProgramID(null);
        toast.success("Tạo lịch trình thành công!");
      }
    } catch (error) {
      console.error("Error during schedule creation:", error);
      toast.error("Lỗi khi tạo lịch trình!");
    } finally {
      setIsBtnLoading(false);
    }
  };

  return (
    <>
      <h1 className="studio-function-title">Thiết lập thời gian stream</h1>
      <div className="studio-stream-container">
        <Form layout="vertical" form={form} onFinish={handleCreateSchedule}>
          <Form.Item
            label={<h2 className="studio-stream__title">Chương trình</h2>}
            name={"program"}
          >
            <Select
              defaultValue={{ value: "none", label: "Chọn chương trình" }}
              onChange={handleChangeProgram}
              options={program}
            />
          </Form.Item>

          <Form.Item
            label={<h2 className="studio-stream__title">Thời gian</h2>}
            name="timeRange"
          >
            <RangePicker
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              value={selectedRange ?? null}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={handleChangeTime}
              showTime={{
                format: "HH:mm:ss",
              }}
              disabled={!programID}
              disabledDate={disabledDate}
              disabledTime={disabledTime}
            />
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="submit"
              className="studio-stream__btn"
              loading={isBtnLoading}
            >
              <FiPlus />
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}

export default LiveStreamSchedule;
