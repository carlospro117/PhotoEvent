const photoInput = document.getElementById("photoInput");
const videoInput = document.getElementById("videoInput");

const photoBtn = document.getElementById("photoBtn");
const videoBtn = document.getElementById("videoBtn");

const imagePreview = document.getElementById("imagePreview");
const videoPreview = document.getElementById("videoPreview");

const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");

let selectedFile = null;

// FOTO
photoBtn.addEventListener("click", () => {
    photoInput.click();
});

// VIDEO
videoBtn.addEventListener("click", () => {
    videoInput.click();
});

// FOTO
photoInput.addEventListener("change", () => {

    selectedFile = photoInput.files[0];

    if(!selectedFile) return;

    imagePreview.src = URL.createObjectURL(selectedFile);

    imagePreview.style.display="block";

    videoPreview.style.display="none";
    videoPreview.src="";

    uploadBtn.innerText="📤 Enviar Foto";
    uploadBtn.disabled=false;

});

// VIDEO
videoInput.addEventListener("change", () => {

    selectedFile = videoInput.files[0];

    if(!selectedFile) return;

    videoPreview.src = URL.createObjectURL(selectedFile);

    videoPreview.style.display="block";

    imagePreview.style.display="none";
    imagePreview.src="";

    uploadBtn.innerText="📤 Enviar Video";
    uploadBtn.disabled=false;

});

// SUBIR
uploadBtn.addEventListener("click", async()=>{

    if(!selectedFile) return;

    status.innerText="📤 Enviando...";

    uploadBtn.disabled=true;

    const formData=new FormData();

    formData.append("file",selectedFile);
    formData.append("upload_preset","event_photos");

    const resourceType =
        selectedFile.type.startsWith("video")
        ? "video"
        : "image";

    try{

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/surehwg9/${resourceType}/upload`,
            {
                method:"POST",
                body:formData
            }
        );

        const data = await response.json();

        if(response.ok){

            console.log(data.secure_url);

            status.innerText="🎉 ¡Gracias! Tu archivo fue enviado correctamente.";

            imagePreview.style.display="none";
            videoPreview.style.display="none";

            imagePreview.src="";
            videoPreview.src="";

            photoInput.value="";
            videoInput.value="";

            selectedFile=null;

            setTimeout(()=>{

                uploadBtn.disabled=true;
                uploadBtn.innerText="📤 Enviar";
                status.innerText="";

            },3000);

        }else{

            console.log(data);

            status.innerText="❌ Error al subir el archivo.";

            uploadBtn.disabled=false;

        }

    }catch(error){

        console.error(error);

        status.innerText="❌ Error de conexión.";

        uploadBtn.disabled=false;

    }

});