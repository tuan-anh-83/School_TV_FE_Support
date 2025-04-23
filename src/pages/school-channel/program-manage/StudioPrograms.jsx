import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTv,
  faCalendarAlt,
  faPlus,
  faSpinner,
  faXmark,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import apiFetch from "../../../config/baseAPI";
import styles from "./studio-programs.module.scss";

const StudioPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const MAX_PROGRAM_NAME = 100;
  const MAX_TITLE = 200;
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    programName: "",
    title: "",
    programNameError: false, // Add error states
    titleError: false,
  });
  const [scheduleForm, setScheduleForm] = useState({
    programID: "",
    startTime: "",
    endTime: "",
    isReplay: false,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    programID: "",
    programName: "",
    title: "",
    programNameError: false, // Add error states
    titleError: false,
  });

  const filteredPrograms = programs.filter((program) =>
    showInactive ? program.status === "Inactive" : program.status === "Active"
  );

  const validateInputs = (name, value, isEditModal = false) => {
    let isValid = true;

    if (name === "programName" && value.length > MAX_PROGRAM_NAME) {
      toast.error(
        `Tên chương trình không thể vượt quá ${MAX_PROGRAM_NAME} ký tự`
      );
      isValid = false;
    }

    if (name === "title" && value.length > MAX_TITLE) {
      toast.error(`Mô tả chương trình không thể vượt quá ${MAX_TITLE} ký tự`);
      isValid = false;
    }

    // Update the appropriate state
    if (isEditModal) {
      setEditFormData((prev) => ({
        ...prev,
        [`${name}Error`]: !isValid,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [`${name}Error`]: !isValid,
      }));
    }

    return isValid;
  };

  const handleUpdateProgram = async () => {
    // Find the program being edited
    const programToEdit = programs.find(
      (p) => p.programID === editFormData.programID
    );

    // Prevent editing if program is inactive
    if (programToEdit?.status === "Inactive") {
      toast.error("Không thể chỉnh sửa chương trình đã xóa");
      return;
    }

    try {
      const isNameValid = validateInputs(
        "programName",
        editFormData.programName,
        true
      );
      const isTitleValid = validateInputs("title", editFormData.title, true);

      if (!isNameValid || !isTitleValid) return;

      const response = await apiFetch(`Program/${editFormData.programID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programName: editFormData.programName,
          title: editFormData.title,
        }),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");

      toast.success("Cập nhật thành công");
      setIsEditModalOpen(false);
      await fetchPrograms();
    } catch (error) {
      toast.error(error.message || "Lỗi khi cập nhật");
    }
  };

  const fetchPrograms = async () => {
    try {
      const savedData = JSON.parse(localStorage.getItem("schoolChannelData"));
      const schoolChannelId = savedData?.$values?.[0]?.schoolChannelID;

      if (!schoolChannelId) {
        toast.error("Không tìm thấy thông tin kênh");
        return;
      }

      const response = await apiFetch(`Program/by-channel/${schoolChannelId}`);
      if (!response.ok) throw new Error("Lỗi khi tải chương trình");

      const data = await response.json();
      // Update this line to properly access the $values array
      setPrograms(data.$values || []);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải chương trình");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleCreateProgram = async () => {
    setIsCreating(true);
    try {
      const savedData = JSON.parse(localStorage.getItem("schoolChannelData"));
      const schoolChannelId = savedData?.$values?.[0]?.schoolChannelID;
      const isNameValid = validateInputs("programName", formData.programName);
      const isTitleValid = validateInputs("title", formData.title);

      if (!isNameValid || !isTitleValid) return;
      setIsCreating(true);

      if (!schoolChannelId) {
        toast.error("Không tìm thấy thông tin kênh");
        return;
      }

      const response = await apiFetch("Program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolChannelID: schoolChannelId,
          programName: formData.programName,
          title: formData.title,
        }),
      });

      if (!response.ok) throw new Error("Lỗi khi tạo chương trình");

      toast.success("Tạo chương trình mới thành công");
      setIsModalOpen(false);
      setFormData({ programName: "", title: "" });
      await fetchPrograms();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo chương trình");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa đi chương trình này không? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(`Program/${editFormData.programID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Xóa chương trình thất bại");

      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Xóa chương trình thành công");
        setIsEditModalOpen(false);
        setShowInactive(false); // Reset to show only active programs
        await fetchPrograms();
      } else {
        throw new Error(result.message || "Lỗi khi xóa chương trình");
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa chương trình");
    }
  };

  const handleCreateSchedule = async () => {
    try {
      if (
        !scheduleForm.programID ||
        !scheduleForm.startTime ||
        !scheduleForm.endTime
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      // Parse the input strings directly (they're in GMT+7)
      const startGMT7 = new Date(scheduleForm.startTime + "+07:00");
      const endGMT7 = new Date(scheduleForm.endTime + "+07:00");

      // Convert to UTC by using toISOString()
      const startUTC = startGMT7.toISOString();
      const endUTC = endGMT7.toISOString();

      if (new Date(startUTC) >= new Date(endUTC)) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }

      const response = await apiFetch("Schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programID: parseInt(scheduleForm.programID),
          startTime: startUTC,
          endTime: endUTC,
          isReplay: scheduleForm.isReplay,
        }),
      });

      if (!response.ok) throw new Error("Tạo lịch phát thất bại");

      toast.success("Tạo lịch phát thành công!");
      setIsScheduleModalOpen(false);
      setScheduleForm({
        programID: "",
        startTime: "",
        endTime: "",
        isReplay: false,
      });
      await fetchPrograms();
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo lịch phát");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Đang tải chương trình...</p>
      </div>
    );
  }

  return (
    <div className={styles.studioProgramsContainer}>
      <div className={styles.headerSection}>
        <h2>
          <FontAwesomeIcon icon={faTv} />
          Quản lý Chương trình
        </h2>
        <div className={styles.buttonGroup}>
          <button
            className={styles.toggleInactiveButton}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive
              ? "Ẩn chương trình đã xóa"
              : "Xem chương trình đã xóa"}
          </button>
          <button
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Tạo chương trình mới
          </button>
          <button
            className={styles.scheduleButton}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <FontAwesomeIcon icon={faClock} />
            Tạo lịch phát mới
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.createModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Tạo chương trình mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeButton}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Tên chương trình</label>
              <input
                type="text"
                value={formData.programName}
                onChange={(e) => {
                  validateInputs("programName", e.target.value);
                  setFormData({ ...formData, programName: e.target.value });
                }}
                placeholder="Nhập tên chương trình"
                className={`${
                  formData.programNameError ? styles.inputError : ""
                }`}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  validateInputs("title", e.target.value);
                  setFormData({ ...formData, title: e.target.value });
                }}
                placeholder="Nhập tiêu đề"
                className={`${formData.titleError ? styles.inputError : ""}`}
              />
            </div>

            <button
              className={styles.submitButton}
              onClick={handleCreateProgram}
              disabled={isCreating}
            >
              {isCreating ? "Đang tạo..." : "Tạo chương trình"}
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className={styles.createModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Chỉnh sửa chương trình</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={styles.closeButton}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Tên chương trình</label>
              <input
                type="text"
                value={editFormData.programName}
                onChange={(e) => {
                  validateInputs("programName", e.target.value, true);
                  setEditFormData({
                    ...editFormData,
                    programName: e.target.value,
                  });
                }}
                className={`${
                  editFormData.programNameError ? styles.inputError : ""
                }`}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tiêu đề</label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => {
                  validateInputs("title", e.target.value, true);
                  setEditFormData({ ...editFormData, title: e.target.value });
                }}
                className={`${
                  editFormData.titleError ? styles.inputError : ""
                }`}
              />
            </div>

            <button
              className={styles.submitButton}
              onClick={handleUpdateProgram}
            >
              Cập nhật
            </button>

            <button
              className={styles.deleteButton}
              onClick={handleDeleteProgram}
            >
              Xóa chương trình
            </button>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className={styles.createModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Tạo lịch phát mới</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className={styles.closeButton}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Chọn chương trình</label>
              <select
                value={scheduleForm.programID}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    programID: e.target.value,
                  })
                }
              >
                <option value="">-- Chọn chương trình --</option>
                {programs.map((program) => (
                  <option key={program.programID} value={program.programID}>
                    {program.programName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Thời gian bắt đầu (GMT+7)</label>
              <input
                type="datetime-local"
                value={scheduleForm.startTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    startTime: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Thời gian kết thúc (GMT+7)</label>
              <input
                type="datetime-local"
                value={scheduleForm.endTime}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, endTime: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.checkboxContainer}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={scheduleForm.isReplay}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        isReplay: e.target.checked,
                      })
                    }
                    className={styles.checkboxInput}
                  />
                  Phát lại
                </label>
              </div>
            </div>

            <button
              className={styles.submitButton}
              onClick={handleCreateSchedule}
            >
              Tạo lịch phát
            </button>
          </div>
        </div>
      )}

      {filteredPrograms.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>
            {showInactive
              ? "Không có chương trình đã xóa"
              : "Chưa có chương trình nào được tạo"}
          </h3>
          <p>
            {showInactive
              ? ""
              : 'Bấm vào nút "Tạo chương trình mới" để bắt đầu'}
          </p>
        </div>
      ) : (
        <div className={styles.programsGrid}>
          {filteredPrograms.map((program) => (
            <div key={program.programID} className={styles.programCard}>
              <div className={styles.programThumbnail}>
                <img
                  src={
                    program.thumbnail ||
                    `https://picsum.photos/300/200?random=${program.programID}`
                  }
                  alt={program.programName}
                />
                <div
                  className={`${styles.programBadge} ${
                    program.status === "Inactive" ? styles.inactive : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faTv} />
                  {program.status === "Active" ? "Hoạt động" : "Đã xóa"}
                </div>
              </div>
              <div className={styles.programInfo}>
                <div className={styles.programHeader}>
                  <h3>{program.programName}</h3>
                  {program.status === "Active" && (
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setEditFormData({
                          programID: program.programID,
                          programName: program.programName,
                          title: program.title,
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      Sửa
                    </button>
                  )}
                </div>
                <div className={styles.programTitle}>{program.title}</div>
                <div className={styles.programMeta}>
                  <span>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {new Date(program.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span>{program.schedules.$values.length} lịch phát</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudioPrograms;
