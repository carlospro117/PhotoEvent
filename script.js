const supabase = supabase.createClient(
    'https://pqufeiliyerbfnkukzay.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdWZlaWxpeWVyYmZua3VremF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzEzMzYsImV4cCI6MjEwMjI0NzMzNn0.F383-Gb1vrbLlaZa-chEwiylPPesh_pWurQQHVhf5gs'
);

const photoInput = document.getElementById("photoInput");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");
const gallery = document.getElementById("gallery");

// Al seleccionar foto
photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";
        uploadBtn.style.display = "block";
    }
});

// Subir a Supabase
uploadBtn.addEventListener("click", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    status.innerText = "📤 Subiendo...";
    uploadBtn.disabled = true;

    const fileName = `foto_${Date.now()}.jpg`;

    const { error } = await supabase.storage
        .from('PhotoEvent')
        .upload(fileName, file);

    if (error) {
        status.innerText = "❌ Error: " + error.message;
        uploadBtn.disabled = false;
    } else {
        status.innerText = "🎉 ¡Foto subida!";
        imagePreview.style.display = "none";
        uploadBtn.style.display = "none";
        photoInput.value = "";
        loadGallery();
    }
});

// Cargar Galería
async function loadGallery() {
    const { data } = await supabase.storage.from('PhotoEvent').list();
    gallery.innerHTML = "";
    data.forEach(file => {
        const { data: urlData } = supabase.storage.from('PhotoEvent').getPublicUrl(file.name);
        gallery.innerHTML += `<img src="${urlData.publicUrl}" onclick="window.open('${urlData.publicUrl}')">`;
    });
}

loadGallery();