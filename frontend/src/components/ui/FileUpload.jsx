/*File sharing*/
import React, { useState } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider"; 

const FileUpload = ({ chatId }) => {
  const [file, setFile] = useState(null);
  const { user } = ChatState(); 

  const handleUpload = async () => {
  if (!file) return alert("No file selected");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const uploadRes = await axios.post("http://localhost:5000/api/message/upload-doc", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.token}`,
      },
    });

    const { fileUrl, originalname } = uploadRes.data;

    await axios.post("http://localhost:5000/api/message", {
    content: fileUrl,
    filename: originalname, 
    chatId,
    }, {
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
    },
    });

        setFile(null);
    } catch (error) {
        console.error("Upload error:", error);
    }
    };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Send File</button>
    </div>
  );
};

export default FileUpload;