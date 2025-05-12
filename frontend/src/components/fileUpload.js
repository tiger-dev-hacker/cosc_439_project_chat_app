import React, { useState, useEffect, useRef } from "react";

const FileUpload = ({ receiverID, socket }) => {
  const [file, setFile] = useState(null); // Store selected file
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const filesListRef = useRef(null);

  // Check if the socket is connected, wait until connected if needed
  const isSocketConnected = () => {
    if (!socket || !socket.connected) {
      console.error("Socket connection is not established.");
      return false;
    }
    return true;
  };

  // Handle file input change (file selection)
  const handleFileChange = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Store the selected file
      console.log("File selected:", selectedFile.name);
    }
  };

  // Validate file size (optional check, adjust based on your need)
  const validateFileSize = (file) => {
    const MAX_SIZE_MB = 100; // Max file size in MB
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      alert(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
      return false;
    }
    return true;
  };

  // Handle the send file logic (send after the file is selected)
  const handleSendFile = async () => {
    if (!file || !receiverID) {
      alert("No file selected or receiver ID is not set.");
      console.error("No file or receiver ID");
      return;
    }

    if (!validateFileSize(file)) return;

    if (!isSocketConnected()) {
      alert("Socket connection is not established.");
      return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
      let buffer = new Uint8Array(reader.result);
      let el = document.createElement("div");
      el.classList.add("item");
      el.innerHTML = `
        <div class="filename">${file.name}</div>
      `;
      filesListRef.current.appendChild(el);

      // Share file with socket
      shareFile(
        {
          filename: file.name,
          total_buffer_size: buffer.length,
          buffer_size: 1024,
        },
        buffer,
        el.querySelector(".progress")
      );
    };
    reader.readAsArrayBuffer(file);
  };

  // Share file over socket in chunks
  const shareFile = (metadata, buffer, progress_node) => {
    if (!socket || !receiverID || !socket.connected) return;

    // Emit file metadata to the backend
    console.log("Emitting file metadata...");
    socket.emit("file-meta", {
      uid: receiverID,
      metadata: metadata,
    });

    socket.on("fs-begin", function () {
      if (buffer.length === 0) {
        console.log("File upload completed.");
        progress_node.innerText = "Upload completed!";
        return;
      }

      let chunk = buffer.slice(0, metadata.buffer_size);
      buffer = buffer.slice(metadata.buffer_size);

  

      // Emit file chunks if available
      if (chunk.length > 0) {
        console.log("Emitting file chunk...");
        socket.emit("file-raw", {
          uid: receiverID,
          buffer: chunk,
        });
      }
    });
  };

  return (
    <div>
      <input
        type="file"
        id="file-input"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {/* Send File button */}
      <button
        onClick={handleSendFile}
        disabled={!file || !receiverID} // Disable the button if no file or receiver ID
      >
        Send File
      </button>

      <div ref={filesListRef} className="files-list"></div>
    </div>
  );
};

export default FileUpload;
