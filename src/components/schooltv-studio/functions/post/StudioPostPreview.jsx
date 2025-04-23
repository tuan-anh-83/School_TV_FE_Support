import React, { useEffect } from "react";
import "./StudioPostPreview.scss";
import { Avatar, Flex, Image, Modal } from "antd";
import { FaUserFriends } from "react-icons/fa";
import { GlobalOutlined } from "@ant-design/icons";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import Markdown from "react-markdown";
import removeMd from "remove-markdown";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const MAX_UNEXPANDED_PREVIEW = 200;

const customSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "u"],
};

function StudioPostPreview(props) {
  const { previewPostData, isMobile } = props;
  const [expanded, setExpanded] = React.useState(false);
  const [imageContent, setImageContent] = React.useState(null);
  const [isPreviewAllImagesOpen, setIsPreviewAllImagesOpen] =
    React.useState(false);
  const content = previewPostData?.Content || "";
  const plainText = React.useMemo(() => removeMd(content), [content]);
  const shortPreview = React.useMemo(() => {
    if (plainText.length <= MAX_UNEXPANDED_PREVIEW) return content;

    let truncatedText = plainText.slice(0, MAX_UNEXPANDED_PREVIEW);
    let lastSpace = truncatedText.lastIndexOf(" ");
    if (lastSpace > 0) truncatedText = truncatedText.slice(0, lastSpace);
    let markdownCutIndex = 0;
    let visibleLength = 0;
    let insideTag = false;

    for (let i = 0; i < content.length; i++) {
      if (content[i] === "<") insideTag = true;
      if (content[i] === ">") insideTag = false;

      if (!insideTag && !content[i].match(/[*_~`[\]]/)) visibleLength++;

      if (visibleLength >= truncatedText.length) {
        markdownCutIndex = i + 1;
        break;
      }
    }

    return content.slice(0, markdownCutIndex) + "...";
  }, [content, plainText]);

  const shouldRequireExpand = plainText.length > MAX_UNEXPANDED_PREVIEW;

  useEffect(() => {
    if (
      !previewPostData.ImageFiles ||
      previewPostData.ImageFiles.length === 0
    ) {
      setImageContent(null);
      return;
    }

    const imageNumber = previewPostData.ImageFiles.length;
    switch (imageNumber) {
      case 1:
        setImageContent(
          <div className="poPre-images-one">
            <Image
              width={"100%"}
              style={{ maxHeight: 500, objectFit: "contain", borderRadius: 5 }}
              src={previewPostData.ImageFiles[0]?.preview || null}
              preview={isMobile ? false : { mask: false }}
            />
          </div>
        );
        break;
      case 2:
        setImageContent(
          <div className="poPre-images-two">
            {previewPostData.ImageFiles.slice(0, 2).map((img, index) => (
              <div key={index} className="poPre-images-two-item">
                <Image
                  src={img.preview || null}
                  preview={isMobile ? false : { mask: false }}
                  width={"100%"}
                  height={"100%"}
                />
              </div>
            ))}
          </div>
        );
        break;
      default:
        setImageContent(
          <div className="poPre-image-three">
            <div className="poPre-images-three-item">
              <Image
                src={previewPostData.ImageFiles[0]?.preview || null}
                preview={isMobile ? false : { mask: false }}
                width={"100%"}
                height={"100%"}
                style={{ borderRadius: 5 }}
              />
            </div>
            <div className="poPre-images-three-item">
              <div className="poPre-image-small">
                <Image
                  src={previewPostData.ImageFiles[1]?.preview || null}
                  preview={isMobile ? false : { mask: false }}
                  width={"100%"}
                  height={"100%"}
                  style={{ borderRadius: 5 }}
                />
              </div>
              <div
                className="poPre-image-small"
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => setIsPreviewAllImagesOpen(true)}
              >
                <Image
                  src={previewPostData.ImageFiles[2]?.preview || null}
                  preview={false}
                  width={"100%"}
                  height={"100%"}
                  style={{
                    borderRadius: 5,
                    filter: imageNumber > 3 ? "blur(3px)" : "none",
                  }}
                />
                {imageNumber > 3 && (
                  <div className="image-overlay">+{imageNumber - 3}</div>
                )}
              </div>
            </div>
          </div>
        );
        break;
    }
  }, [previewPostData.ImageFiles]);

  return (
    <div className="post-preview-container" id="post-preview-container">
      <div className="post-preview-owner">
        <Avatar
          size={55}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            previewPostData.owner.name
          )}&background=random`}
        />
        <div className="post-preview-owner-info">
          <p
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "var(--text-color)",
            }}
          >
            {previewPostData.owner.name}
          </p>
          <Flex align="center">
            <p
              style={{
                marginRight: 5,
                color: "var(--video-interaction-color)",
                fontSize: 12,
              }}
            >
              1 phút trước
            </p>
            {previewPostData?.FollowerMode !== undefined &&
              (previewPostData.FollowerMode ? (
                <FaUserFriends
                  style={{
                    color: "var(--video-interaction-color)",
                    fontSize: 12,
                  }}
                />
              ) : (
                <GlobalOutlined
                  style={{
                    color: "var(--video-interaction-color)",
                    fontSize: 12,
                  }}
                />
              ))}
          </Flex>
        </div>
      </div>

      <div className="post-preview-content">
        <div className="post-preview-title">
          <p>{previewPostData?.Title || ""}</p>
        </div>

        <div
          className={`post-preview-description ${
            shouldRequireExpand ? " post-preview-description-lc-more" : ""
          } ${expanded ? " post-preview-description-expanded" : ""}`}
        >
          <Markdown
            rehypePlugins={[rehypeRaw, [rehypeSanitize, customSanitizeSchema]]}
            remarkPlugins={[remarkGfm]}
          >
            {expanded ? content : shortPreview}
          </Markdown>
          {shouldRequireExpand && (
            <div style={{ display: "inline-block", marginLeft: 4 }}>
              <a
                href="#!"
                onClick={() => setExpanded((x) => !x)}
                className="post-preview-btn-more"
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
              </a>
            </div>
          )}
        </div>

        <div className="post-preview-images">{imageContent}</div>
        {/* Modal hiển thị toàn bộ album khi click vào ảnh thứ 3 */}
        {previewPostData.ImageFiles?.length > 0 && (
          <Modal
            open={isPreviewAllImagesOpen}
            footer={null}
            onCancel={() => setIsPreviewAllImagesOpen(false)}
            centered
            maskClosable={false}
            zIndex={1002}
          >
            <Swiper
              key={isPreviewAllImagesOpen}
              modules={[Pagination, Navigation]}
              navigation={true}
              spaceBetween={10}
              slidesPerView={1}
            >
              {previewPostData?.ImageFiles?.map((img, index) => (
                <SwiperSlide key={index}>
                  <Image
                    width={"100%"}
                    src={img.preview || null}
                    preview={false}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default StudioPostPreview;
