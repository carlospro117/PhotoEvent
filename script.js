const photoInput = document.getElementById("photoInput");
const photoBtn = document.getElementById("photoBtn");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");
const recentPhotos = document.getElementById("recentPhotos");

let selectedFile = null;

// Cargar las fotos guardadas en el dispositivo al abrir la página
function loadSavedPhotos() {
    const saved = localStorage.getItem("boda_fotos");
    if (saved) {
        const photos = JSON.parse(saved);
        recentPhotos.innerHTML = "";
        photos.forEach(url => {
            const imgThumbnail = document.createElement("img");
            imgThumbnail.src = url;
            recentPhotos.appendChild(imgThumbnail);
        });
    }
}

loadSavedPhotos();

// FOTO
photoBtn.addEventListener("click", () => {
    photoInput.click();
});

photoInput.addEventListener("change", () => {
    selectedFile = photoInput.files[0];
    if(!selectedFile) return;

    imagePreview.src = URL.createObjectURL(selectedFile);
    imagePreview.style.display = "block";

    uploadBtn.innerText = "📤 Enviar Foto";
    uploadBtn.disabled = false;
});

// SUBIR
uploadBtn.addEventListener("click", async () => {
    if(!selectedFile) return;

    status.innerText = "📤 Enviando...";
    uploadBtn.disabled = true;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "event_photos");

    const resourceType = "image"; 

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/surehwg9/${resourceType}/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if(response.ok) {
            // Guardar la URL en la galería visual y en la memoria del dispositivo
            const imageUrl = data.secure_url;
            
            const imgThumbnail = document.createElement("img");
            imgThumbnail.src = imageUrl;
            recentPhotos.insertBefore(imgThumbnail, recentPhotos.firstChild);

            // Actualizar almacenamiento local para que no se pierdan al actualizar
            let saved = JSON.parse(localStorage.getItem("boda_fotos")) || [];
            saved.unshift(imageUrl);
            localStorage.setItem("boda_fotos", JSON.stringify(saved));

            status.innerText = "🎉 ¡Gracias! Tu foto fue enviada.";

            imagePreview.style.display = "none";
            imagePreview.src = "";
            photoInput.value = "";
            selectedFile = null;

            setTimeout(() => {
                uploadBtn.disabled = true;
                uploadBtn.innerText = "📤 Enviar";
                status.innerText = "";
            }, 3000);

        } else {
            console.log(data);
            status.innerText = "❌ Error al subir el archivo.";
            uploadBtn.disabled = false;
        }
    } catch(error) {
        console.error(error);
        status.innerText = "❌ Error de conexión.";
        uploadBtn.disabled = false;
    }
});