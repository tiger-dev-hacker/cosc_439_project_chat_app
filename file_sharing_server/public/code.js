(function () {
    let receiverID; 
    const socket = io();

    function generateID() {
        return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
    }

    document.querySelector("#sender-start-con-btn").addEventListener("click", function () {
        let joinID = generateID();
        document.querySelector("#join-id").innerHTML = `
        <b>Room ID</b>
        <span> ${joinID}</span>
        `;
        socket.emit("sender-join", {
            uid:joinID
        });
    }); 

    socket.on("init", function (uid) {
        receiverID = uid;
        document.querySelector(".join-screen").classList.remove("active");
        document.querySelector(".fs-screen").classList.add("active");
        
    });

    document.querySelector("#file-input").addEventListener("change", function (e) {
        let file = e.target.files[0];
        if (!file) {
            return;
        }

        let reader = new FileReader();
        reader.onload = function (e) {
            let buffer = new Uint8Array(reader.result);
            let el = document.createElement("div");
            el.classList.add("item");
            el.innerHTML = `
            <div class="progress">0%</div>
            <div class="filename">${file.name}</div>
            `;
            document.querySelector(".files-list").appendChild(el);
            shareFile({
                filename: file.name,
                total_buffer_size: buffer.length,
                buffer_size: 1024
            }, buffer, el.querySelector(".progress"));
        }
        reader.readAsArrayBuffer(file);
        console.log("here");
    });

    let fileShareBuffer = null;
    let fileShareMeta = null;
    let fileShareProgressNode = null;
    
    function shareFile(metadata, buffer, progress_node) {
        fileShareMeta = metadata;
        fileShareBuffer = buffer;
        fileShareProgressNode = progress_node;
    
        socket.emit("file-meta", {
            uid: receiverID,
            metadata: metadata
        });
    }
    
    socket.on("fs-share", function () {
        let chunk = fileShareBuffer.slice(0, fileShareMeta.buffer_size);
        fileShareBuffer = fileShareBuffer.slice(fileShareMeta.buffer_size);
        fileShareProgressNode.innerText =
            Math.trunc((fileShareMeta.total_buffer_size - fileShareBuffer.length) / fileShareMeta.total_buffer_size * 100) + "%";
    
        if (chunk.length !== 0) {
            socket.emit("file-raw", {
                uid: receiverID,
                buffer: chunk
            });
        }
    });
})();