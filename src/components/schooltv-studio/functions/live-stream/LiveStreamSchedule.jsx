import React, { useEffect, useState } from "react";
import "./LiveStreamSchedule.scss";
import { Form, Select, DatePicker, Button, Upload, message } from "antd";
import { FiPlus } from "react-icons/fi";
import { InboxOutlined } from "@ant-design/icons";
import apiFetch from "../../../../config/baseAPI";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Dragger } = Upload;

function LiveStreamSchedule() {
  const [form] = Form.useForm();
  const [isBtnLoading, setIsBtnLoading] = React.useState(false);
  const { channel } = useOutletContext();
  const [program, setProgram] = React.useState([]);
  const [programID, setProgramID] = React.useState(null);
  const [selectedRange, setSelectedRange] = React.useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  useEffect(() => {
    fetchProgramByChannel();
  }, []);

  //Handle time and validate time
  const handleChangeTime = (dates) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD HH:mm:ss');
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD HH:mm:ss');

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

  // Handle image upload
  const handleImageUpload = (info) => {
    const { status, originFileObj } = info.file;
    
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    
    if (status === 'done') {
      message.success(`${info.file.name} tải lên thành công.`);
      setImageFile(originFileObj);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(originFileObj);
    } else if (status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  // Custom request to prevent actual upload until form submission
  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const uploadProps = {
    name: 'thumbnail',
    multiple: false,
    maxCount: 1,
    accept: 'image/png, image/jpeg, image/jpg',
    onChange: handleImageUpload,
    customRequest,
    onRemove: () => {
      setImageFile(null);
      setImagePreview(null);
    },
  };

  const handleCreateSchedule = async () => {
    const errors = [];

    if (!programID) {
      errors.push({
        name: "program",
        errors: ["Vui lòng chọn chương trình."],
      });
    }

    if (!selectedRange || selectedRange.length === 0) {
      errors.push({
        name: "timeRange",
        errors: ["Vui lòng chọn khoảng thời gian."],
      });
    }

    if (!imageFile) {
      errors.push({
        name: "thumbnail",
        errors: ["Vui lòng tải lên hình ảnh thumbnail."],
      });
    }

    if (errors.length > 0) {
      form.setFields(errors);
      return;
    }

    const formData = new FormData();
    formData.append("programID", programID);
    formData.append("startTime", selectedRange[0]);
    formData.append("endTime", selectedRange[1]);
    formData.append("isReplay", false);
    
    // Append image file
    if (imageFile) {
      formData.append("thumbnailFile", imageFile);
    }

    try {
      setIsBtnLoading(true);
      const response = await apiFetch("Schedule", {
        method: "POST",
        body: formData,
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
        setImageFile(null);
        setImagePreview(null);
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
            name="program"
          >
            <Select
              placeholder="Chọn chương trình"
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

          <Form.Item
            label={<h2 className="studio-stream__title">Hình ảnh Thumbnail</h2>}
            name="thumbnail"
            rules={[
              {
                required: true,
                message: 'Vui lòng tải lên hình ảnh thumbnail!',
              },
            ]}
          >
            <Dragger {...uploadProps}>
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Thumbnail preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    padding: '10px' 
                  }} 
                />
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Nhấp hoặc kéo thả file vào khu vực này để tải lên</p>
                  <p className="ant-upload-hint">
                    Hỗ trợ tệp JPG, JPEG, PNG. Kích thước khuyến nghị: 1280x720px.
                  </p>
                </>
              )}
            </Dragger>
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