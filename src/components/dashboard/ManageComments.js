import React, { useState, useEffect } from "react";
import { updateComment, deleteComment, fetchAllComments } from "../../api";
import styles from "./ManageComments.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import LoadingPage from '../../hooks/LoadingPage'; // Import trang chờ
const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load danh sách bình luận
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await fetchAllComments();
        console.log("Dữ liệu bình luận từ API:", data);
        if (!Array.isArray(data)) throw new Error("Dữ liệu không hợp lệ");
        setComments(data);
        toast.success("Tải danh sách bình luận thành công!");
      } catch (error) {
        console.error("Lỗi khi tải danh sách bình luận:", error);
        toast.error("Không thể tải danh sách bình luận.");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  useEffect(() => {
    console.log("Danh sách bình luận:", comments);
  }, [comments]);

  // Xử lý duyệt hoặc hủy duyệt bình luận
  const handleApprove = async (commentId, newDisplayStatus) => {
    if (commentId === undefined || newDisplayStatus === undefined) {
      toast.error("Thông tin không hợp lệ.");
      return;
    }

    try {
      await updateComment(commentId, { Display: newDisplayStatus });
      setComments((prev) =>
        prev.map((comment) =>
          comment.Id === commentId ? { ...comment, Display: newDisplayStatus } : comment
        )
      );
      toast.success(
        newDisplayStatus === 1
          ? "Bình luận đã được duyệt."
          : "Bình luận đã được hủy duyệt."
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái bình luận:", error);
      toast.error("Không thể cập nhật trạng thái bình luận.");
    }
  };

  // Xác nhận xóa bình luận
  const confirmDeleteComment = (commentId) => {
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bình luận này không?",
      buttons: [
        {
          label: "Có",
          onClick: () => handleDelete(commentId),
        },
        {
          label: "Không",
          onClick: () => toast.info("Hủy xóa bình luận."),
        },
      ],
    });
  };

  // Xử lý xóa bình luận
  const handleDelete = async (id) => {
    console.log("ID truyền vào handleDelete:", id);
    if (!id) {
      toast.error("ID không hợp lệ.");
      return;
    }

    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((comment) => comment.Id !== id));
      toast.success("Bình luận đã bị xóa.");
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      toast.error("Không thể xóa bình luận.");
    }
  };

  // Render UI
  if (loading) {
    return <LoadingPage />; // Hiển thị LoadingPage khi đang tải
  }
  return (
    <div className={styles.container}>
      <ToastContainer />
      <h1>Quản Lý Bình Luận</h1>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Khách Hàng</th>
              <th>Email</th>
              <th>Nội Dung</th>
              <th>Đánh Giá</th>
              <th>Khách Sạn</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.Id}>
                <td>{comment.CustomerName || "Không rõ"}</td>
                <td>{comment.Email || "Không rõ"}</td>
                <td>{comment.Content || "Không rõ"}</td>
                <td>{comment.Rating ? `${comment.Rating}/5` : "Không rõ"}</td>
                <td>{comment.HotelName || "Không rõ"}</td>
                <td>{comment.Display === 1 ? "Hiển Thị" : "Chờ Duyệt"}</td>
                <td>
                  {comment.Display === 0 ? (
                    <button onClick={() => handleApprove(comment.Id, 1)}>Duyệt</button>
                  ) : (
                    <button onClick={() => handleApprove(comment.Id, 0)}>Hủy Duyệt</button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => confirmDeleteComment(comment.Id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageComments;
