const photoInput = document.getElementById("photoInput");
const videoInput = document.getElementById("videoInput");

const photoBtn = document.getElementById("photoBtn");
const videoBtn = document.getElementById("videoBtn");

const imagePreview = document.getElementById("imagePreview");
const videoPreview = document.getElementById("videoPreview");

const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");

let selectedFile = null;

// Abrir cámara de fotos
photoBtn.addEventListener("click", () => {
    photoInput.click();
});

// Abrir cámara de video
videoBtn.addEventListener("click", () => {
    videoInput.click();
});

// Seleccionar foto
photoInput.addEventListener("change", () => {

    selectedFile = photoInput.files[0];

    if (!selectedFile) return;

    imagePreview.src = URL.createObjectURL(selectedFile);
    imagePreview.style.display = "block";

    videoPreview.style.display = "none";
    videoPreview.src = "";

    uploadBtn.disabled = false;

});

// Seleccionar video
videoInput.addEventListener("change", () => {

    selectedFile = videoInput.files[0];

    if (!selectedFile) return;

    videoPreview.src = URL.createObjectURL(selectedFile);
    videoPreview.style.display = "block";

    imagePreview.style.display = "none";
    imagePreview.src = "";

    uploadBtn.disabled = false;

});

// Subir
uploadBtn.addEventListener("click", async () => {

    if (!selectedFile) return;

    status.innerText = "📤 Enviando...";

    uploadBtn.disabled = true;

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("upload_preset", "event_photos");

    const resourceType =
        selectedFile.type.startsWith("video")
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

            status.innerText = "🎉 ¡Gracias! Tu archivo fue enviado.";

            console.log(data.secure_url);

            imagePreview.style.display = "none";
            videoPreview.style.display = "none";

            imagePreview.src = "";
            videoPreview.src = "";

            photoInput.value = "";
            videoInput.value = "";

            selectedFile = null;

            setTimeout(() => {

                uploadBtn.disabled = true;
                status.innerText = "";

            }, 3000);

        } else {

            console.log(data);

            status.innerText = "❌ Error al subir.";

            uploadBtn.disabled = false;

        }

    } catch (error) {

        console.error(error);

        status.innerText = "❌ Error de conexión.";

        uploadBtn.disabled = false;

    }

});