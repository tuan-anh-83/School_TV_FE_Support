import "./CommunityPost.scss";
import { Avatar, Breadcrumb, Form } from "antd";
import { UserOutlined, GlobalOutlined } from "@ant-design/icons";
import Carousel from "../../components/carousel/carousel";
import { useEffect, useState } from "react";
import apiFetch from "../../config/baseAPI";
import { notification } from "antd";

function CommunityPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("News/combined", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data.$values);
          setLoading(false);
        } else {
          throw new Error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        notification.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể lấy bài viết từ API. Vui lòng thử lại.",
          placement: "topRight",
          duration: 5,
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="community-post-container">
      <div className="community-post-home">
        <Breadcrumb
          separator=">"
          items={[
            { title: "Home", href: "/watchHome" },
            { title: "Bài Viết Cộng Đồng", href: "/CommunityPost" },
          ]}
        />
      </div>

      {posts.map((post) => (
        <div key={post.newsID} className="community-post-form">
          <Form>
            <div className="community-post-avatar">
              <Avatar size={50} icon={<UserOutlined />} />
              <div className="community-post-info">
                <a className="community-post-username">
                  {post.schoolChannel && post.schoolChannel.name
                    ? post.schoolChannel.name
                    : "N/A"}
                </a>
                <a className="community-post-time">
                  {new Date(post.createdAt).toLocaleString()} <GlobalOutlined />
                </a>
              </div>
            </div>

            <div className="community-post-content">
              <span>{post.title}</span>
              <span>{post.content}</span>
              <span className="community-post-hashtags">
                {post.categoryNews ? `#${post.categoryNews.name}` : ""}
              </span>
            </div>

            {post.newsPictures && post.newsPictures.$values.length > 0 && (
              <div className="community-post-image">
                <img
                  src={`data:image/jpeg;base64,${post.newsPictures.$values[0].fileData}`}
                  alt={post.title}
                />
              </div>
            )}
          </Form>
        </div>
      ))}
    </div>
  );
}

export default CommunityPost;
