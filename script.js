const supabase = supabase.createClient(
    'https://pqufeiliyerbfnkukzay.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdWZlaWxpeWVyYmZua3VremF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzEzMzYsImV4cCI6MjEwMjI0NzMzNn0.F383-Gb1vrbLlaZa-chEwiylPPesh_pWurQQHVhf5gs'
);

const photoInput = document.getElementById("photoInput");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const recentPhotos = document.getElementById("recentPhotos");

// Cargar fotos al iniciar
async function loadGallery() {
    const { data } = await supabase.from('fotos').select('url').order('created_at', { ascending: false });
    if (data) {
        recentPhotos.innerHTML = "";
        data.forEach(item => appendPhoto(item.url));
    }
}

// Realtime: Escuchar nuevas fotos
supabase.channel('public:fotos').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fotos' }, payload => {
    appendPhoto(payload.new.url);
}).subscribe();

function appendPhoto(url) {
    const img = document.createElement("img");
    img.src = url;
    recentPhotos.prepend(img);
}

loadGallery();

// Vista previa al seleccionar la foto
photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if(!file) return;

    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";
    uploadBtn.disabled = false;
});

// Lógica de Subida directa a Supabase Storage
uploadBtn.addEventListener("click", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    uploadBtn.innerText = "📤 Subiendo...";
    uploadBtn.disabled = true;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36.substring(2))}.${fileExt}`;

    // 1. Subir al Bucket 'PhotoEvent'
    const { data: uploadData, error } = await supabase.storage.from('PhotoEvent').upload(fileName, file);

    if (error) {
        alert("Error al subir: " + error.message);
        uploadBtn.innerText = "📤 Enviar";
        uploadBtn.disabled = false;
        return;
    }

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage.from('PhotoEvent').getPublicUrl(fileName);

    // 3. Guardar URL en la tabla 'fotos'
    await supabase.from('fotos').insert([{ url: publicUrl }]);

    // Limpiar
    imagePreview.style.display = "none";
    uploadBtn.innerText = "📤 Enviar";
    photoInput.value = "";
    uploadBtn.disabled = true;
});