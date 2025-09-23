const API_URL = "https://rotam-backend-production.up.railway.app";

// Pegar token do localStorage
const token = localStorage.getItem("token");

// =============== LISTAR OCORRÊNCIAS ===============
async function loadOccurrences() {
  try {
    const res = await fetch(`${API_URL}/occurrences`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    const tbody = document.querySelector("#occurrencesTable tbody");
    tbody.innerHTML = "";

    data.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.reporter_name}</td>
        <td>${o.comun_name}</td>
        <td>${o.occurred_at ? o.occurred_at.substring(0, 10) : ""}</td>
        <td>${o.location}</td>
        <td>${o.type}</td>
        <td>${o.status}</td>
        <td>
          <button onclick="deleteOccurrence(${o.id})" class="btn-red">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar ocorrências", err);
    alert("Erro ao carregar ocorrências. Faça login novamente.");
    logout();
  }
}

// =============== CADASTRAR NOVA OCORRÊNCIA ===============
document.getElementById("occurrenceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    reporter_id: document.getElementById("reporter_id").value,
    reporter_name: document.getElementById("reporter_name").value,
    comun_name: document.getElementById("comun_name").value,
    comun_rg: document.getElementById("comun_rg").value,
    comun_cpf: document.getElementById("comun_cpf").value,
    comun_phone: document.getElementById("comun_phone").value,
    address: document.getElementById("address").value,
    occurred_at: document.getElementById("occurred_at").value,
    location: document.getElementById("location").value,
    type: document.getElementById("type").value,
    status: document.getElementById("status").value,
    description: document.getElementById("description").value,
    involved: document.getElementById("involved").value
  };

  try {
    const res = await fetch(`${API_URL}/occurrences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Erro ao cadastrar ocorrência");

    alert("Ocorrência cadastrada com sucesso!");
    document.getElementById("occurrenceForm").reset();
    loadOccurrences();
  } catch (err) {
    console.error(err);
    alert("Erro ao cadastrar ocorrência");
  }
});

// =============== DELETAR OCORRÊNCIA ===============
async function deleteOccurrence(id) {
  if (!confirm("Tem certeza que deseja excluir esta ocorrência?")) return;

  try {
    const res = await fetch(`${API_URL}/occurrences/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erro ao excluir ocorrência");

    alert("Ocorrência excluída!");
    loadOccurrences();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir ocorrência");
  }
}

// Carregar ocorrências ao abrir página
loadOccurrences();
