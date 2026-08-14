const photoInput = document.getElementById("photoInput");
const photoBtn = document.getElementById("photoBtn");
const imagePreview = document.getElementById("imagePreview");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");

let selectedFile = null;

// FOTO
photoBtn.addEventListener("click", () => {
    photoInput.click();
});

// FOTO
photoInput.addEventListener("change", () => {

    selectedFile = photoInput.files[0];

    if(!selectedFile) return;

    imagePreview.src = URL.createObjectURL(selectedFile);

    imagePreview.style.display="block";

    uploadBtn.innerText="📤 Enviar Foto";
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

    // Como ahora solo se envían fotos, podemos dejar fijo el tipo de recurso como "image"
    const resourceType = "image"; 

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
            imagePreview.src="";
            photoInput.value="";
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