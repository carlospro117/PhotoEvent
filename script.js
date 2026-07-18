const takePhotoBtn = document.getElementById("takePhoto");
const cameraInput = document.getElementById("cameraInput");

const imagePreview = document.getElementById("imagePreview");
const videoPreview = document.getElementById("videoPreview");

const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");

let selectedFile = null;

// Abrir cámara
takePhotoBtn.addEventListener("click", () => {
    cameraInput.click();
});

// Mostrar vista previa
cameraInput.addEventListener("change", () => {

    selectedFile = cameraInput.files[0];

    if (!selectedFile) return;

    imagePreview.style.display = "none";
    videoPreview.style.display = "none";

    const url = URL.createObjectURL(selectedFile);

    if (selectedFile.type.startsWith("image")) {

        imagePreview.src = url;
        imagePreview.style.display = "block";

    } else if (selectedFile.type.startsWith("video")) {

        videoPreview.src = url;
        videoPreview.style.display = "block";

    }

    uploadBtn.disabled = false;

});

// Subir archivo
uploadBtn.addEventListener("click", async () => {

    if (!selectedFile) return;

    status.innerText = "📤 Enviando...";

    uploadBtn.disabled = true;

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("upload_preset", "event_photos");

    const resourceType = selectedFile.type.startsWith("video")
        ? "video"
        : "image";

    try {

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/surehwg9/${resourceType}/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (response.ok) {

            console.log(data);

            status.innerText = "🎉 ¡Gracias! Tu archivo fue enviado correctamente.";

            imagePreview.style.display = "none";
            videoPreview.style.display = "none";

            imagePreview.src = "";
            videoPreview.src = "";

            cameraInput.value = "";

            selectedFile = null;

            setTimeout(() => {

                status.innerText = "";

                uploadBtn.disabled = true;

            }, 3000);

        } else {

            console.error(data);

            status.innerText = "❌ Error al subir el archivo.";

            uploadBtn.disabled = false;

        }

    } catch (error) {

        console.error(error);

        status.innerText = "❌ Error de conexión.";

        uploadBtn.disabled = false;

    }

});