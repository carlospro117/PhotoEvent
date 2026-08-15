// Usar window.supabase para evitar errores de referencia
const supabaseUrl = 'https://pqufeiliyerbfnkukzay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdWZlaWxpeWVyYmZua3VremF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzEzMzYsImV4cCI6MjEwMjI0NzMzNn0.F383-Gb1vrbLlaZa-chEwiylPPesh_pWurQQHVhf5gs';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
const bucketName = 'PhotoEvent';

const photoInput = document.getElementById("photoInput");
const photoBtn = document.getElementById("photoBtn");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");
const gallery = document.getElementById("gallery");

let selectedFile = null;

// Abrir cámara con el método que ya te funcionaba
photoBtn.addEventListener("click", () => {
    photoInput.click();
});

// Al seleccionar la foto
photoInput.addEventListener("change", () => {
    selectedFile = photoInput.files[0];

    if (!selectedFile) return;

    // Previsualización rápida y ligera
    imagePreview.src = URL.createObjectURL(selectedFile);
    imagePreview.style.display = "block";

    uploadBtn.innerText = "📤 Enviar Foto";
    uploadBtn.disabled = false;
    status.innerText = "";
});

// Subir a Supabase
uploadBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    status.innerText = "📤 Enviando a la nube...";
    uploadBtn.disabled = true;

    const fileExt = selectedFile.name.split('.').pop() || 'jpg';
    const fileName = `foto_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
        const { data, error } = await supabaseClient.storage
            .from(bucketName)
            .upload(fileName, selectedFile);

        if (error) throw error;

        status.innerText = "🎉 ¡Foto enviada correctamente!";

        imagePreview.style.display = "none";
        imagePreview.src = "";
        photoInput.value = "";
        selectedFile = null;

        // Recargar la galería para mostrar la nueva foto
        loadGallery();

        setTimeout(() => {
            uploadBtn.disabled = true;
            uploadBtn.innerText = "📤 Enviar";
            status.innerText = "";
        }, 3000);

    } catch (error) {
        console.error(error);
        status.innerText = "❌ Error al subir: " + error.message;
        uploadBtn.disabled = false;
    }
});

// Cargar galería de fotos de otros usuarios
async function loadGallery() {
    try {
        const { data: files, error } = await supabaseClient.storage
            .from(bucketName)
            .list('', {
                limit: 20,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) throw error;

        gallery.innerHTML = "";
        const validFiles = files.filter(f => f.name && !f.name.startsWith('.'));

        if (validFiles.length === 0) {
            gallery.innerHTML = '<p style="grid-column: 1 / -1; color: #9ca3af; font-size: 14px;">Aún no hay fotos. ¡Sé el primero!</p>';
            return;
        }

        validFiles.forEach(file => {
            const { data } = supabaseClient.storage
                .from(bucketName)
                .getPublicUrl(file.name);
            
            const publicUrl = data.publicUrl;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = publicUrl;
            img.alt = "Foto de evento";
            img.loading = "lazy";

            const downloadLink = document.createElement('a');
            downloadLink.href = `${publicUrl}?download=`;
            downloadLink.className = 'download-btn';
            downloadLink.innerHTML = '⬇ Descargar';
            downloadLink.target = '_blank';

            itemDiv.appendChild(img);
            itemDiv.appendChild(downloadLink);
            gallery.appendChild(itemDiv);
        });

    } catch (error) {
        console.error(error);
        gallery.innerHTML = '<p style="grid-column: 1 / -1; color: #ef4444; font-size: 14px;">Error al cargar la galería.</p>';
    }
}

// Ejecutar al cargar la página
loadGallery();