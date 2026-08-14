const photoInput = document.getElementById("photoInput");
const photoBtn = document.getElementById("photoBtn");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");
const recentPhotos = document.getElementById("recentPhotos");

let selectedFile = null;

// FUNCIÓN PARA CARGAR TODAS LAS FOTOS DE LA NUBE
async function loadGallery() {
    try {
        // Agregamos "?t=" y la hora actual para evitar la caché de Cloudinary y siempre pedir los datos en tiempo real
        const timestamp = new Date().getTime();
        const response = await fetch(`https://res.cloudinary.com/surehwg9/image/list/boda.json?t=${timestamp}`, {
            cache: "no-store"
        });
        
        if (response.ok) {
            const data = await response.json();
            recentPhotos.innerHTML = ""; // Limpiamos antes de cargar
            
            // Recorremos los resultados para crear las imágenes
            data.resources.forEach(res => {
                const imgUrl = `https://res.cloudinary.com/surehwg9/image/upload/v${res.version}/${res.public_id}.${res.format}`;
                const imgThumbnail = document.createElement("img");
                imgThumbnail.src = imgUrl;
                recentPhotos.appendChild(imgThumbnail);
            });
        }
    } catch (error) {
        console.error("Aún no hay fotos o hubo un error al cargar la galería:", error);
    }
}

// Cargar la galería apenas se abra la página
loadGallery();

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
    formData.append("tags", "boda"); 

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
            // En lugar de solo agregar la foto localmente, volvemos a descargar la lista fresca
            loadGallery();

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