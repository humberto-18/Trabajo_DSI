const API_BASE_URL = "https://trabajo-dsi3.onrender.com/";
  const btn = document.getElementById("btn-llamar-api");
  const salida = document.getElementById("respuesta");

  btn.addEventListener("click", async () => {
    salida.textContent = "Llamando API...";
    try {
      const res = await fetch(API_BASE_URL + "/api/saludo");
      if (!res.ok) {
        throw new Error("Error HTTP " + res.status);
      }
      const data = await res.json();
      salida.textContent =
        "Respuesta del backend:\n\n" + JSON.stringify(data, null, 2);
    } catch (err) {
      console.error(err);
      salida.textContent = "Error al llamar al backend: " + err.message;
    }
  });