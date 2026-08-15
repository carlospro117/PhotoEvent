// Inicialización de Supabase con tus credenciales
const supabase = supabase.createClient(
    'https://pqufeiliyerbfnkukzay.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdWZlaWxpeWVyYmZua3VremF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzEzMzYsImV4cCI6MjEwMjI0NzMzNn0.F383-Gb1vrbLlaZa-chEwiylPPesh_pWurQQHVhf5gs'
);

const photoInput = document.getElementById("photoInput");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const recentPhotos = document.getElementById("recentPhotos");
const statusText = document.getElementById("status");

// 1. Cargar la galería inicial desde la base de datos
async function loadGallery() {
    const { data, error } = await supabase
        .from('fotos')
        .select('url')
        .order('created_at', { ascending: false });

    if (data) {
        recentPhotos.innerHTML = "";
        data.forEach(item => appendPhoto(item.url));
    }
}

// 2. Escuchar en tiempo real si alguien sube una foto nueva
supabase
    .channel('public:fotos')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fotos' }, payload => {
        appendPhoto(payload.new.url);
    })
    .subscribe();

function appendPhoto(url) {
    const img = document.createElement("img");
    img.src = url;
    recentPhotos.prepend(img);
}

// Ejecutar carga inicial
loadGallery();

// 3. Mostrar previsualización robusta al seleccionar o tomar la foto
photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerText = "📸 Foto lista para enviar";

    const reader = new FileReader();
    reader.onload = function(uploadEvent) {
        imagePreview.src = uploadEvent.target.result;
        imagePreview.style.display = "block";
        uploadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
});

// 4. Subir la foto al bucket 'PhotoEvent' y registrarla en la tabla 'fotos'
uploadBtn.addEventListener("click", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    uploadBtn.innerText = "📤 Subiendo...";
    uploadBtn.disabled = true;
    statusText.innerText = "📤 Subiendo a la nube...";

    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

    // A) Subir al Bucket de Supabase
    const { error: uploadError } = await supabase.storage
        .from('PhotoEvent')
        .upload(fileName, file);

    if (uploadError) {
        alert("Error al subir archivo: " + uploadError.message);
        uploadBtn.innerText = "📤 Enviar";
        uploadBtn.disabled = false;
        statusText.innerText = "❌ Error al subir.";
        return;
    }

    // B) Obtener la URL pública del archivo subido
    const { data: { publicUrl } } = supabase.storage
        .from('PhotoEvent')
        .getPublicUrl(fileName);

    // C) Guardar la URL en la tabla 'fotos' (lo que activa el tiempo real)
    const { error: dbError } = await supabase
        .from('fotos')
        .insert([{ url: publicUrl }]);

    if (dbError) {
        alert("Error guardando en la base de datos: " + dbError.message);
        uploadBtn.innerText = "📤 Enviar";
        uploadBtn.disabled = false;
        return;
    }

    // D) Limpiar interfaz con éxito
    imagePreview.style.display = "none";
    imagePreview.src = "";
    uploadBtn.innerText = "📤 Enviar";
    photoInput.value = "";
    uploadBtn.disabled = true;
    statusText.innerText = "🎉 ¡Foto enviada con éxito!";

    setTimeout(() => {
        statusText.innerText = "";
    }, 3000);
});