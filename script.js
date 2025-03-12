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

// ✅ Función corregida para calcular la nota y estrellas
function calcularNotaFinal() {
    let puntosIntegral = 0;
    let puntosCompetencias = 0;
    let estrellasIntegral = 0;
    let estrellasCompetencias = 0;
    let maxPuntos = 93;

    let selects = ["conocimiento", "responsabilidad", "excelencia", "normas", "habilidades", "trabajo_equipo"];

    selects.forEach(id => {
        let select = document.getElementById(id);
        if (select) {
            let opcionSeleccionada = select.options[select.selectedIndex];
            puntosIntegral += parseFloat(opcionSeleccionada.value);
            
            // ✅ CORREGIDO: Obtener correctamente el atributo "data-estrella"
            if (opcionSeleccionada.getAttribute("data-estrella") === "true") {
                estrellasIntegral++;
            }
        }
    });

    document.querySelectorAll("input[type='radio']:checked").forEach(radio => {
        puntosCompetencias += parseFloat(radio.value);
        if (radio.getAttribute("data-estrella") === "true") {
            estrellasCompetencias++;
        }
    });

    let totalPuntos = puntosIntegral + puntosCompetencias;
    let notaFinal = (totalPuntos / maxPuntos) * 100;
    notaFinal = Math.round(notaFinal * 100) / 100;

    let totalEstrellas = estrellasIntegral + estrellasCompetencias;
    if (totalEstrellas > 11) {
        totalEstrellas = 11;
    }

    document.getElementById("resultadoFinal").innerHTML = `
        <p><strong>Nota Final:</strong> ${notaFinal} / 100</p>
        <p><strong>Total de Estrellas:</strong> ${totalEstrellas} / 11 → ${"⭐".repeat(totalEstrellas)}</p>
    `;
}

// ✅ Función corregida para enviar los datos
function enviarDatos() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwTlGVP9Fq_Q1Tu9Azh9Em4R8pPw02IudL4b6KxG6TUUv0dVTmc2NOsCmV0flR1rxDp3w/exec';

    const formData = {
        cedulaEvaluado: document.getElementById("cedulaEvaluado").value,
        cedulaEvaluador: document.getElementById("cedulaEvaluador").value,
        conocimiento: document.getElementById("conocimiento").value,
        responsabilidad: document.getElementById("responsabilidad").value,
        excelencia: document.getElementById("excelencia").value,
        normas: document.getElementById("normas").value,
        habilidades: document.getElementById("habilidades").value,
        trabajo_equipo: document.getElementById("trabajo_equipo").value,
        notaFinal: document.getElementById("resultadoFinal").innerText.match(/\d+(\.\d+)?/g)[0],
        estrellasTotales: document.getElementById("resultadoFinal").innerText.match(/\d+/g)[1]
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
