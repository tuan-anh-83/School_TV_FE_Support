import React from "react";
import { Button, Form, Input } from "antd";
import { useOutletContext } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import apiFetch from "../../../../config/baseAPI";
import { toast } from "react-toastify";
import "./LiveStreamProgram.scss";

function LiveStreamProgram(props) {
  const { channel } = useOutletContext();
  const [form] = Form.useForm();
  const [isBtnLoading, setIsBtnLoading] = React.useState(false);
  const { setIsProgramCreated } = props;

  const handleSubmitInitProgram = async (values) => {
    const requestBody = {
      schoolChannelID: channel.$values[0].schoolChannelID,
      programName: values.programName,
      title: values.title,
      link: "",
    };

    try {
      setIsBtnLoading(true);
      const response = await apiFetch("Program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to create program!");
      }

      const data = await response.json();
      if (data) {
        form.resetFields();
        toast.success("Khởi tạo chương trình thành công!");
        setIsProgramCreated(true);
      }

      console.log("Response data:", data);
    } catch (error) {
      console.log("Lỗi khi khởi tạo chương trình: ", error);
    } finally {
      setIsBtnLoading(false);
    }
  };
  return (
    <>
      {/* Class applied from main title of SChoolChannelStudio.scss */}
      <h1 className="studio-function-title">Khởi tạo chương trình stream</h1>

      <div className="studio-stream-container">
        <Form layout="vertical" form={form} onFinish={handleSubmitInitProgram}>
          <Form.Item
            label={<h2 className="studio-stream__title">Tên chương trình</h2>}
            name="programName"
            rules={[
              { required: true, message: "Vui lòng nhập tên của chương trình" },
              { max: 50, message: "Tiêu đề không được vượt quá 50 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên cho chương trình" />
          </Form.Item>

          <Form.Item
            label={<h2 className="studio-stream__title">Mô tả</h2>}
            name="title"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả chương trình" },
              { max: 250, message: "Mô tả không được vượt quá 250 ký tự" },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả cho chương trình"
              rows={4}
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

        <p className="stream-schedule-nav">
          Đã có chương trình?{" "}
          <span onClick={() => setIsProgramCreated(true)}>
            Tạo lịch trình stream
          </span>
        </p>
      </div>
    </>
  );
}

export default LiveStreamProgram;
