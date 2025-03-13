document.addEventListener("DOMContentLoaded", function () {
    const fechaElement = document.getElementById("fecha");
    const fechaActual = new Date().toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    fechaElement.textContent = `Fecha: ${fechaActual}`;

    document.getElementById("btnVerificar").addEventListener("click", obtenerInformacion);
    
    document.getElementById("btnSiguiente").addEventListener("click", function () {
        document.getElementById("info").classList.add("minimized");
        document.getElementById("evaluacion").classList.remove("hidden");
    });

    document.getElementById("btnFinalizar").addEventListener("click", enviarDatos);

    document.querySelectorAll(".collapsible").forEach(header => {
        header.addEventListener("click", function () {
            let content = this.nextElementSibling;
            if (content.style.display === "none" || content.style.display === "") {
                content.style.display = "block";
            } else {
                content.style.display = "none";
            }
        });
    });

    document.querySelectorAll(".btn-siguiente").forEach(button => {
        button.addEventListener("click", function () {
            let currentSection = this.closest(".collapsible-section");
            let nextSectionId = this.getAttribute("data-target");
            let nextSection = document.getElementById(nextSectionId);

            if (currentSection && nextSection) {
                currentSection.classList.add("minimized");
                nextSection.classList.remove("hidden");
            }
        });
    });

    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", calcularNotaFinal);
    });

    document.querySelectorAll("input[type='radio']").forEach(radio => {
        radio.addEventListener("change", calcularNotaFinal);
    });
});

async function obtenerInformacion() {
    const url = "https://script.google.com/macros/s/AKfycbzJy52gJU7Ldf9hNtUsHFm7G8CvLcoFK7inh14nYwglaD9QYeX5-zzDwhdP5zQUVbRDGQ/exec";
    let cedulaEvaluado = document.getElementById("cedulaEvaluado").value.trim();
    let cedulaEvaluador = document.getElementById("cedulaEvaluador").value.trim();

    if (!cedulaEvaluado || !cedulaEvaluador) {
        alert("Por favor, ingresa la cédula del evaluado y del evaluador.");
        return;
    }

    try {
        let response = await fetch(url);
        let data = await response.json();

        const limpiarTexto = (texto) => texto ? texto.toString().trim().toLowerCase() : "";

        const empleado = data.find(persona => limpiarTexto(persona.Cédula) === limpiarTexto(cedulaEvaluado));
        const jefe = data.find(persona => limpiarTexto(persona.Cédula) === limpiarTexto(cedulaEvaluador));

        if (!empleado) {
            alert("No se encontró información del empleado.");
            return;
        }

        if (!jefe) {
            alert("No se encontró información del jefe inmediato.");
            return;
        }

        document.getElementById("nombreEmpleado").textContent = `${empleado.Nombre} ${empleado["Apellido 1"]} ${empleado["Apellido 2"]}`;
        document.getElementById("cedulaEmpleado").textContent = empleado.Cédula;
        document.getElementById("puestoEmpleado").textContent = empleado.Puesto;
        document.getElementById("areaEmpleado").textContent = empleado.Área;
        document.getElementById("fechaIngreso").textContent = empleado.Ingreso;

        document.getElementById("nombreJefe").textContent = `${jefe.Nombre} ${jefe["Apellido 1"]} ${jefe["Apellido 2"]}`;
        document.getElementById("puestoJefe").textContent = jefe.Puesto;
        document.getElementById("areaJefe").textContent = jefe.Área;

        document.getElementById("info").classList.remove("hidden");
        document.getElementById("btnSiguiente").classList.remove("hidden");

    } catch (error) {
        alert("Hubo un error al obtener la información.");
    }
}

// ✅ Función corregida para calcular la nota y estrellas correctamente
function calcularNotaFinal() {
    let puntosTotal = 0;
    let estrellasTotal = 0;
    let maxPuntos = 93;

    // Recorrer todos los select y obtener los valores
    document.querySelectorAll("select").forEach(select => {
        let opcionSeleccionada = select.options[select.selectedIndex];

        // Sumar los puntos de la opción seleccionada
        puntosTotal += parseFloat(opcionSeleccionada.value) || 0;

        // Solo sumar estrella si la opción seleccionada tiene data-estrella="true"
        if (opcionSeleccionada.hasAttribute("data-estrella") && opcionSeleccionada.getAttribute("data-estrella") === "true") {
            estrellasTotal++;
        }
    });

    // Recorrer todos los radio buttons seleccionados
    document.querySelectorAll("input[type='radio']:checked").forEach(radio => {
        puntosTotal += parseFloat(radio.value) || 0;

        // Solo sumar estrella si el radio seleccionado tiene data-estrella="true"
        if (radio.hasAttribute("data-estrella") && radio.getAttribute("data-estrella") === "true") {
            estrellasTotal++;
        }
    });

    // Calcular la nota en base a 100
    let notaFinal = Math.round((puntosTotal / maxPuntos) * 100);

    // Asegurar que las estrellas no sean más de 11 ni negativas
    estrellasTotal = Math.max(0, Math.min(estrellasTotal, 11));

    // Guardar el total de estrellas como un atributo para evitar problemas de extracción
    let resultadoElement = document.getElementById("resultadoFinal");
    resultadoElement.setAttribute("data-estrellas-totales", estrellasTotal);

    // Mostrar resultados
    resultadoElement.innerHTML = `
        <p><strong>Nota Final:</strong> ${notaFinal} / 100</p>
        <p><strong>Total de Estrellas:</strong> ${estrellasTotal} / 11 → ${estrellasTotal > 0 ? "⭐".repeat(estrellasTotal) : "Sin estrellas"}</p>
    `;
}


// ✅ Función corregida para enviar los datos
function enviarDatos() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxu5xHaDAcAPUYoOoncDrekShmGqRIag4N2iLGACgHsTRkL9MhDTsBxSq-wn0xyDsFuPA/exec';

    const resultadoElement = document.getElementById("resultadoFinal");
    
    const formData = {
        cedulaEvaluado: document.getElementById("cedulaEvaluado").value,
        cedulaEvaluador: document.getElementById("cedulaEvaluador").value,

        // Evaluación Integral
        conocimiento: document.getElementById("conocimiento").value,
        responsabilidad: document.getElementById("responsabilidad").value,
        excelencia: document.getElementById("excelencia").value,
        normas: document.getElementById("normas").value,
        habilidades: document.getElementById("habilidades").value,
        trabajo_equipo: document.getElementById("trabajo_equipo").value,

        // Evaluación de Competencias Profesionales
        comportamiento_individual: document.querySelector('input[name="comportamiento_individual"]:checked')?.value || "",
        calidad_trabajo: document.querySelector('input[name="calidad_trabajo"]:checked')?.value || "",
        relaciones_otros: document.querySelector('input[name="relaciones_otros"]:checked')?.value || "",
        asimilacion_conocimientos: document.querySelector('input[name="asimilacion_conocimientos"]:checked')?.value || "",
        adaptabilidad: document.querySelector('input[name="adaptabilidad"]:checked')?.value || "",

        // Desempeño y desenvolvimiento general
        descripcion: document.getElementById("descripcion").value,
        prospecto: document.getElementById("prospecto").value,
        criterio: document.getElementById("criterio").value,

        // Comentarios y resultados
        comentario: document.getElementById("comentario").value,
        justificacion: document.getElementById("justificacion").value,
        
        // Extraer la nota final correctamente
        notaFinal: resultadoElement.innerText.match(/Nota Final:\s(\d+)/)?.[1] || "0",

        // Extraer las estrellas correctamente desde el atributo guardado
        estrellasTotales: resultadoElement.getAttribute("data-estrellas-totales") || "0"
    };

    fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(response => {
        if (response.success) {
            alert("Evaluación guardada exitosamente. Descarga el PDF aquí: " + response.pdfURL);
        } else {
            alert("Error al guardar la evaluación.");
        }
    })
    .catch(error => {
        alert("Error en el envío. Intenta de nuevo.");
    });
}
