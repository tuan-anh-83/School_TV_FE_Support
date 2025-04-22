import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./upcomingList.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const FilterSelect = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
  }
`;
const UpComingList = () => {
  const [activeFilter, setActiveFilter] = useState("Tất Cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUniversity, setSearchUniversity] = useState("");
  const [searchStatus, setSearchStatus] = useState("all");
  const [reminders, setReminders] = useState({});
  const [modalEvent, setModalEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, searchUniversity, searchStatus, events, filteredEvents]);

  const fetchEvents = () => {
    setEvents([
      {
        id: 1,
        date: "25/12/2023 - 14:00",
        title: "Lễ Trao Bằng Tốt Nghiệp 2023",
        university: "ĐH Quốc Gia Hà Nội",
        description:
          "Buổi lễ trao bằng tốt nghiệp cho sinh viên khóa 2019-2023.",
        location: "Hội trường A1",
        participants: "2000 người tham gia",
        status: "upcoming",
        image: "https://picsum.photos/300/200",
      },
      {
        id: 2,
        date: "15/11/2023 - 09:00",
        title: "Hội Thảo Công Nghệ",
        university: "FPT Polytechnic",
        description: "Cập nhật xu hướng công nghệ mới nhất.",
        location: "Hội trường B2",
        status: "past",
        participants: "500 người tham gia",
        image: "https://picsum.photos/300/200",
      },
      {
        id: 3,
        date: "20/11/2023 - 6:00",
        title: "Cuộc thi Hackathon Blockchain 2025",
        university: "Tôn Đức Thắng",
        description: "Cập nhật xu hướng công nghệ mới nhất.",
        location: "Sân trường",
        status: "upcoming",
        participants: "500 người tham gia",
        image: "https://picsum.photos/300/200",
      },
    ]);
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Lọc theo tên sự kiện
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trường đại học
    if (searchUniversity) {
      filtered = filtered.filter((event) =>
        event.university.toLowerCase().includes(searchUniversity.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (searchStatus !== "all") {
      filtered = filtered.filter((event) => event.status === searchStatus);
    }

    setFilteredEvents(filtered);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleReminder = (eventId) => {
    setReminders((prev) => ({ ...prev, [eventId]: true }));
  };

  const showEventDetails = (event) => {
    setModalEvent(event);
  };

  const closeEventDetails = () => {
    setModalEvent(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterEvents();
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchUniversity("");
    setSearchStatus("all");
  };

  return (
    <main className="events-container">
      <section className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo tên sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo trường..."
              value={searchUniversity}
              onChange={(e) => setSearchUniversity(e.target.value)}
            />
            <FilterSelect
              className="search-select"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="past">Đã kết thúc</option>
            </FilterSelect>
          </div>
          <div className="search-buttons">
            <button type="submit" className="primary-button search-button">
              <i className="fas fa-search"></i> Tìm Kiếm
            </button>
          </div>
        </form>

        <div className="filter-options">
          {["Tất Cả", "Hội Thảo", "Lễ Tốt Nghiệp", "Workshop", "Ngày Hội"].map(
            (filter) => (
              <button
                key={filter}
                className={`filter-button ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            )
          )}
        </div>
      </section>

      <section className="events-list">
        {["upcoming", "past"].map((status) => (
          <section key={status} className="events-section">
            <h2 className="section-title">
              {status === "upcoming" ? (
                <>
                  <FontAwesomeIcon fontSize={30} icon={faCalendarDays} />{" "}
                  {"   "} Sự Kiện Sắp Diễn Ra
                </>
              ) : (
                <>
                  <FontAwesomeIcon fontSize={30} icon={faCalendarCheck} />{" "}
                  {"   "} Sự Kiện Đã Kết Thúc
                </>
              )}
            </h2>
            <div className="events-grid">
              {filteredEvents
                .filter((event) => event.status === status)
                .map((event) => (
                  <div key={event.id} className="event-card" data-aos="fade-up">
                    <span className={`event-status status-${event.status}`}>
                      {status === "upcoming" ? "Sắp diễn ra" : "Đã kết thúc"}
                    </span>
                    <p className="event-date">
                      <i className="far fa-calendar"></i> {event.date}
                    </p>
                    <h3 className="event-title">{event.title}</h3>
                    <p>{event.university}</p>
                    <div className="event-meta">
                      <p className="event-location">
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {event.location}
                      </p>
                      <span>
                        <i className="fas fa-users"></i> {event.participants}
                      </span>
                    </div>
                    <div className="event-actions">
                      <button
                        className="event-button primary-button"
                        onClick={() => showEventDetails(event)}
                      >
                        <i className="fas fa-info-circle"></i>{" "}
                        {status === "upcoming" ? "Chi Tiết" : "Xem Lại"}
                      </button>
                      {status === "upcoming" && (
                        <button
                          className={`event-button secondary-button reminder-btn ${
                            reminders[event.id] ? "active" : ""
                          }`}
                          onClick={() => handleReminder(event.id)}
                          disabled={reminders[event.id]}
                        >
                          {reminders[event.id] ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            <i className="far fa-bell"></i>
                          )}{" "}
                          Đặt Lịch Nhắc
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </section>

      {/* Modal Event Details */}
      {modalEvent && (
        <div className="modal" id="eventModal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="event-title">Chi Tiết Sự Kiện</h2>
              <button className="close-button" onClick={closeEventDetails}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <img
                src={modalEvent.image}
                alt="Event"
                className="event-detail-image"
              />
              <div className="event-date">
                <i className="far fa-calendar"></i> {modalEvent.date}
              </div>
              <h3 className="event-title">{modalEvent.title}</h3>
              <div className="event-organizer">
                <h4>Đơn Vị Tổ Chức</h4>
                <p>{modalEvent.university}</p>
              </div>
              <div className="event-description">{modalEvent.description}</div>
              <div className="event-meta">
                <span>
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {modalEvent.location}
                </span>
                <span>
                  <i className="fas fa-users"></i> {modalEvent.participants}
                </span>
              </div>
            </div>
            <div className="event-actions">
              <button className="event-button primary-button">
                <i className="far fa-bell"></i> Đặt Lịch Nhắc
              </button>
              <button
                className="event-button secondary-button"
                onClick={closeEventDetails}
              >
                <i className="fas fa-times"></i> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UpComingList;
