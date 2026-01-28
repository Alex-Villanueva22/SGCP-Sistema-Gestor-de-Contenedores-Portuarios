// Usuarios de demostración
const demoUsers = [
  { id: 1, username: "admin", password: "admin123", role: "admin", name: "Administrador" },
  { id: 2, username: "operador", password: "operador123", role: "operador", name: "Operador" },
  { id: 3, username: "viewer", password: "viewer123", role: "viewer", name: "Visualizador" }
];

export function authenticate(username, password) {
  // Buscar el usuario en los usuarios de demostración
  const user = demoUsers.find(u => u.username === username);
  
  if (user) {
    // Para cuentas demo, usar contraseña predeterminada
    const expectedPassword = user.password;
    if (password === expectedPassword || password === "") {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      };
    }
  }
  
  return null;
}

export function setUserInStorage(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromStorage() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function removeUserFromStorage() {
  localStorage.removeItem("user");
}