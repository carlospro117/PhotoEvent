const takePhotoBtn = document.getElementById("takePhoto");
const cameraInput = document.getElementById("cameraInput");
const preview = document.getElementById("preview");
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

    preview.src = URL.createObjectURL(selectedFile);
    preview.style.display = "block";
    uploadBtn.disabled = false;
});

// Subir foto a Cloudinary
uploadBtn.addEventListener("click", async () => {

    if (!selectedFile) return;

    status.innerText = "⏳ Subiendo foto...";
    uploadBtn.disabled = true;

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("upload_preset", "event_photos");

    try {

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/surehwg9/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (response.ok) {

            status.innerText = "✅ ¡Foto enviada correctamente!";

            console.log(data.secure_url);

            preview.style.display = "none";
            cameraInput.value = "";
            selectedFile = null;
            uploadBtn.disabled = true;

        } else {

            status.innerText = "❌ Error al subir la foto.";
            console.log(data);

            uploadBtn.disabled = false;

        }

    } catch (error) {

        console.error(error);
        status.innerText = "❌ Error de conexión.";
        uploadBtn.disabled = false;

    }

});