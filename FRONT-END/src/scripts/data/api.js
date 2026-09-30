const API_URL = 'https://mycare.yusufabdil.my.id';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Ambil token dari localStorage
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fungsi untuk melakukan POST dengan body JSON
const postRequest = async (url, body) => {
  const response = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  return await response.json();
};

// Fungsi untuk melakukan GET
const getRequest = async (url) => {
  const response = await fetch(`${API_URL}${url}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await response.json();
};

// Fungsi untuk melakukan PUT
const putRequest = async (url, body) => {
  const response = await fetch(`${API_URL}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  return await response.json();
};

// Fungsi untuk melakukan DELETE
const deleteRequest = async (url) => {
  const response = await fetch(`${API_URL}${url}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return await response.json();
};

export {
  postRequest,
  getRequest,
  putRequest,
  deleteRequest,
};