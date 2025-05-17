import React, { useEffect, useState } from "react";
import "./StudioVideo.scss";
import { Button, Flex, Form, Input, Select, Space, DatePicker, TimePicker } from "antd";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { message, Upload } from "antd";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../../../../config/baseAPI";
import ScheduleManualVideo from "./ScheduleManualVideo";
import dayjs from "dayjs";

const { Dragger } = Upload;
const { TextArea } = Input;

function StudioVideo() {
  const { channel } = useOutletContext();
  const [program, setProgram] = useState([]);
  const [programID, setProgramID] = useState(null);
  const [form] = Form.useForm();
  const [videFileObject, setVideoFileObject] = useState(null);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isDisplayVideoSetting, setIsDisplayVideoSetting] = useState(true);
  const [streamDateTime, setStreamDateTime] = useState(null);

  const fetchProgramByChannel = async () => {
    try {
      const response = await apiFetch(
        `Program/by-channel/${channel?.$values[0].schoolChannelID}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Không tìm thấy phiên live nào phù hợp!");
      }

      const data = await response.json();
      if (data && data.$values && data.$values.length > 0) {
        let getProgram = data.$values.map((program) => {
          return {
            value: program.programID,
            label: program.programName,
          };
        });

        setProgram(getProgram); // Cập nhật danh sách chương trình
      } else {
        // Nếu không có chương trình nào, báo lỗi
        throw new Error("Không có chương trình nào phù hợp.");
      }
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách chương trình!");
      console.log(error);
    }
  };

  const handleChangeProgram = (value) => {
    setProgramID(value);
  };

  useEffect(() => {
    if (channel) {
      fetchProgramByChannel();
    }
  }, [channel]);

  const handleBeforeUpload = (file) => {
    const isValidType =
      file.type === "video/mp4" ||
      file.type === "video/avi" ||
      file.type === "video/mkv";

    if (!isValidType) {
      message.error("Chỉ cho phép upload video định dạng MP4, AVI, MKV!");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const handleChangeVideoFile = (info) => {
    setVideoFileObject(info.fileList[0].originFileObj);
  };

  // Helper function to format date for API
  const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    
    // Combine date and time
    const year = date.year();
    const month = (date.month() + 1).toString().padStart(2, '0'); // month is 0-indexed in dayjs
    const day = date.date().toString().padStart(2, '0');
    const hour = time.hour().toString().padStart(2, '0');
    const minute = time.minute().toString().padStart(2, '0');
    
    // Format as string in yyyy-MM-dd HH:mm:ss format
    return `${year}-${month}-${day} ${hour}:${minute}:00`;
  };

  const handleCreateVideo = async (values) => {
    // Get the date and time values from form
    const date = values.streamDate;
    const time = values.streamTime;
    
    // Format the stream date and time or use default
    const streamAt = date && time 
      ? formatDateTime(date, time) 
      : "2100-09-09"; // Default fallback
    
    const formData = new FormData();
    formData.append("VideoFile", videFileObject);
    formData.append("ProgramID", values.ProgramID);
    formData.append("Description", values.Description);
    formData.append("StreamAt", streamAt);
    formData.append("Type", "Recorded");

    try {
      setIsBtnLoading(true);
      const response = await apiFetch("VideoHistory/UploadCloudflare", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không thể upload video!");
      }

      const data = await response.json();
      if (data) {
        toast.success("Upload video thành công!");
        form.resetFields();
      }
    } catch (error) {
      toast.error("Lỗi khi upload video!");
    } finally {
      setIsBtnLoading(false);
    }
  };
  
  return (
    <div className="studio-video-container">
      {isDisplayVideoSetting ? (
        <>
          {/* Class applied from main title of SChoolChannelStudio.scss */}
          <h1 className="studio-function-title">Tuỳ chỉnh video của bạn</h1>

          <div className="studio-video-content">
            <Form layout="vertical" form={form} onFinish={handleCreateVideo}>
              <Form.Item
                label={<h2 className="studio-video-des">Video</h2>}
                name="VideoFile"
                rules={[{ required: true, message: "Vui lòng chọn video!" }]}
              >
                <Dragger
                  className="studio-video-dragger"
                  beforeUpload={handleBeforeUpload}
                  onChange={handleChangeVideoFile}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <MdOutlineOndemandVideo style={{ fontSize: 50 }} />
                  </p>
                  <p className="ant-upload-text">Kéo thả video vào đây</p>
                  <p>hoặc</p>
                  <Flex justify="center" style={{ marginTop: "10px" }}>
                    <p
                      style={{
                        width: 100,
                        backgroundColor: "#4a90e2",
                        color: "#fff",
                        padding: "10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Chọn file
                    </p>
                  </Flex>
                </Dragger>
              </Form.Item>

              <Form.Item
                label={<h2 className="studio-video-des">Chương trình</h2>}
                name="ProgramID"
                rules={[
                  { required: true, message: "Vui lòng chọn chương trình!" },
                ]}
              >
                <Select
                  defaultValue={{ value: null, label: "Chọn chương trình" }}
                  onChange={handleChangeProgram}
                  options={program}
                />
              </Form.Item>

              <Form.Item
                label={<h2 className="studio-video-des">Mô tả</h2>}
                name="Description"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mô tả cho video!",
                  },
                ]}
              >
                <TextArea
                  className="studio-video-input"
                  placeholder="Nhập mô tả cho bài viết"
                  rows={4}
                />
              </Form.Item>
              
              {/* New Date and Time picker fields */}
              <Form.Item
                label={<h2 className="studio-video-des">Thời gian phát</h2>}
              >
                <Space>
                  <Form.Item
                    name="streamDate"
                    noStyle
                  >
                    <DatePicker 
                      placeholder="Chọn ngày"
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="streamTime"
                    noStyle
                  >
                    <TimePicker 
                      placeholder="Chọn giờ"
                      format="HH:mm"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Space>
                <div style={{ marginTop: 8, color: '#888' }}>
                  Nếu không chọn, video sẽ được lưu trữ mà không phát sóng
                </div>
              </Form.Item>

              <Button
                className="studio-video-button"
                htmlType="submit"
                loading={isBtnLoading}
              >
                Đăng
              </Button>
            </Form>

            <p className="video-manual-ask">
              Đã dựng video trước đó?{" "}
              <span
                className="video-manual-nav"
                onClick={() => setIsDisplayVideoSetting(false)}
              >
                Tạo lịch trình chiếu video
              </span>
            </p>
          </div>
        </>
      ) : (
        <ScheduleManualVideo programList={program} />
      )}
    </div>
  );
}

export default StudioVideo;