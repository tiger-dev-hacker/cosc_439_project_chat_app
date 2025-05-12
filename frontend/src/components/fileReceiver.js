import React, { useEffect, useState } from "react";

const FileReceiver = ({ receiverID, socket }) => {
  const [receivedChunks, setReceivedChunks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    if (!socket || !receiverID) return;

    // Emit receiver join event
    socket.emit("receiver-join", {
      uid: receiverID,
      sender_uid: "sender", // TODO: dynamically replace with actual sender ID
    });

    console.log("Receiver connected with ID:", receiverID);

    // --- 1. Listen for metadata ---
    const handleMeta = (meta) => {
      console.log("Received file metadata:", meta);
      setMetadata(meta);

      // Initialize array for chunks
      const totalChunks = Math.ceil(meta.total_buffer_size / meta.buffer_size);
      setReceivedChunks(new Array(totalChunks));

      // Signal that receiver is ready
      socket.emit("fs-start", { uid: receiverID });
    };

    // --- 2. Handle chunked data ---
    const handleChunk = (chunk) => {
      console.log("Received chunk of length:", chunk.length);

      setReceivedChunks((prevChunks) => {
        const updatedChunks = [...prevChunks];
        const currentIndex = updatedChunks.findIndex((c) => c === undefined);

        if (currentIndex !== -1) {
          updatedChunks[currentIndex] = new Uint8Array(chunk);

          // Calculate the loaded progress
          const loaded = updatedChunks
            .filter(Boolean)
            .reduce((acc, cur) => acc + cur.length, 0);

          const percent = Math.trunc(
            (loaded / metadata.total_buffer_size) * 100
          );
          setProgress(percent);

          // If file is fully received, create the download link
          if (loaded >= metadata.total_buffer_size) {
            const blob = new Blob(updatedChunks);
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            console.log("File fully received:", metadata.filename);
          }
        }

        return updatedChunks;
      });
    };

    // Register event listeners
    socket.on("fs-meta", handleMeta);
    
    socket.on("fs-chunk", handleChunk); // Listen for incoming chunks

    // Cleanup
    return () => {
      socket.off("fs-meta", handleMeta);
      socket.off("fs-begin");
      socket.off("fs-chunk", handleChunk);
    };
  }, [socket, receiverID, metadata]);

  return (
    <div>
      <h2>File Receiver</h2>
      <div>Progress: {progress}%</div>
      {downloadUrl && (
        <a href={downloadUrl} download={metadata?.filename}>
          Download {metadata?.filename}
        </a>
      )}
    </div>
  );
};

export default FileReceiver;
