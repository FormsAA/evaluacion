document.addEventListener("DOMContentLoaded", function () {
    // Mostrar la fecha actual
    const fechaElement = document.getElementById("fecha");
    const fechaActual = new Date().toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    fechaElement.textContent = `Fecha: ${fechaActual}`;

    // Agregar eventos a los botones
    document.getElementById("btnVerificar").addEventListener("click", obtenerInformacion);
    document.getElementById("btnSiguiente").addEventListener("click", mostrarEvaluacion);
    document.getElementById("btnFinalizar").addEventListener("click", function () {
        alert("Evaluación completada. Gracias por tu tiempo.");
    });

    // Función para colapsar y expandir secciones
    document.querySelectorAll(".collapsible").forEach(header => {
        header.addEventListener("click", function () {
            let content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
                this.querySelector(".toggle-btn").textContent = "▼";
            } else {
                content.style.display = "block";
                this.querySelector(".toggle-btn").textContent = "▲";
            }
        });
    });

    // Evento para los botones "Siguiente"
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

    // Eventos para calcular notas en tiempo real
    document.querySelectorAll(".evaluacion-integral").forEach(select => {
        select.addEventListener("change", calcularNotaEvaluacionIntegral);
    });

    document.querySelectorAll("input[type='radio']").forEach(radio => {
        radio.addEventListener("change", calcularNota);
    });
});

// Función para obtener la información del evaluado y evaluador desde Google Sheets
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

        // Llenar información del evaluado
        document.getElementById("nombreEmpleado").textContent = `${empleado.Nombre} ${empleado["Apellido 1"]} ${empleado["Apellido 2"]}`;
        document.getElementById("cedulaEmpleado").textContent = empleado.Cédula;
        document.getElementById("puestoEmpleado").textContent = empleado.Puesto;
        document.getElementById("areaEmpleado").textContent = empleado.Área;
        document.getElementById("fechaIngreso").textContent = empleado.Ingreso;

        // Llenar información del jefe inmediato
        document.getElementById("nombreJefe").textContent = `${jefe.Nombre} ${jefe["Apellido 1"]} ${jefe["Apellido 2"]}`;
        document.getElementById("puestoJefe").textContent = jefe.Puesto;
        document.getElementById("areaJefe").textContent = jefe.Área;

        // Mostrar la información y el botón "Siguiente"
        document.getElementById("info").classList.remove("hidden");
        document.getElementById("btnSiguiente").classList.remove("hidden");

    } catch (error) {
        alert("Hubo un error al obtener la información.");
    }
}

// Función para mostrar la evaluación
function mostrarEvaluacion() {
    document.getElementById("info").classList.add("minimized");
    document.getElementById("evaluacion").classList.remove("hidden");
}

// Función para calcular la nota de Evaluación Integral
function calcularNotaEvaluacionIntegral() {
    let totalPuntos = 0;
    let estrellas = 0;
    let maxPuntos = 18; // 6 preguntas con opción máxima de 3 pts cada una

    // Obtener todos los selects seleccionados
    document.querySelectorAll(".evaluacion-integral").forEach(select => {
        let opcionSeleccionada = select.options[select.selectedIndex];
        let valor = parseFloat(opcionSeleccionada.value);
        totalPuntos += valor;

        // Si la opción tiene estrella, sumamos una
        if (opcionSeleccionada.dataset.estrella === "true") {
            estrellas++;
        }
    });

    // Convertimos el conteo de estrellas en emojis
    let estrellasStr = "⭐".repeat(estrellas);

    // Mostrar la nota y estrellas en pantalla
    document.getElementById("resultadoEvaluacionIntegral").innerHTML = `
        <p><strong>Nota final (Evaluación Integral):</strong> ${totalPuntos} / ${maxPuntos}</p>
        <p><strong>Calificación en estrellas:</strong> ${estrellasStr || "Sin estrellas"}</p>
    `;
}

// Función para calcular la nota de Competencias Profesionales
function calcularNota() {
    let totalPuntos = 0;
    let estrellas = 0;
    let maxPuntos = 75; // 5 preguntas con opción máxima de 15 pts cada una

    // Obtener todos los radio buttons seleccionados
    document.querySelectorAll("input[type='radio']:checked").forEach(radio => {
        let valor = parseFloat(radio.value);
        totalPuntos += valor;

        // Si la opción seleccionada tiene estrella, sumamos una estrella
        if (radio.dataset.estrella === "true") {
            estrellas++;
        }
    });

    // Convertimos el conteo de estrellas en emojis
    let estrellasStr = "⭐".repeat(estrellas);

    // Mostrar la nota y estrellas en pantalla
    document.getElementById("resultado").innerHTML = `
        <p><strong>Nota final:</strong> ${totalPuntos} / ${maxPuntos}</p>
        <p><strong>Cantidad de estrellas:</strong> ${estrellasStr || "Sin estrellas"}</p>
    `;
}
