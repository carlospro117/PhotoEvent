const supabase = supabase.createClient(
    'https://pqufeiliyerbfnkukzay.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdWZlaWxpeWVyYmZua3VremF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzEzMzYsImV4cCI6MjEwMjI0NzMzNn0.F383-Gb1vrbLlaZa-chEwiylPPesh_pWurQQHVhf5gs'
);

const photoInput = document.getElementById("photoInput");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const recentPhotos = document.getElementById("recentPhotos");
const statusText = document.getElementById("status");

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

// Vista previa robusta usando FileReader
photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerText = "📸 Foto seleccionada con éxito";

    const reader = new FileReader();
    reader.onload = function(uploadEvent) {
        imagePreview.src = uploadEvent.target.result;
        imagePreview.style.display = "block";
        uploadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
});

// Lógica de Subida directa a Supabase Storage
uploadBtn.addEventListener("click", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    uploadBtn.innerText = "📤 Subiendo...";
    uploadBtn.disabled = true;
    statusText.innerText = "📤 Subiendo a la nube...";

    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 1. Subir al Bucket 'PhotoEvent'
    const { data: uploadData, error } = await supabase.storage.from('PhotoEvent').upload(fileName, file);

    if (error) {
        alert("Error al subir: " + error.message);
        uploadBtn.innerText = "📤 Enviar";
        uploadBtn.disabled = false;
        statusText.innerText = "❌ Error al subir.";
        return;
    }

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage.from('PhotoEvent').getPublicUrl(fileName);

    // 3. Guardar URL en la tabla 'fotos'
    const { error: dbError } = await supabase.from('fotos').insert([{ url: publicUrl }]);

    if (dbError) {
        alert("Error guardando en la tabla: " + dbError.message);
        uploadBtn.innerText = "📤 Enviar";
        uploadBtn.disabled = false;
        return;
    }

    // Limpiar interfaz
    imagePreview.style.display = "none";
    uploadBtn.innerText = "📤 Enviar";
    photoInput.value = "";
    uploadBtn.disabled = true;
    statusText.innerText = "🎉 ¡Foto enviada con éxito!";
    
    setTimeout(() => {
        statusText.innerText = "";
    }, 3000);
});