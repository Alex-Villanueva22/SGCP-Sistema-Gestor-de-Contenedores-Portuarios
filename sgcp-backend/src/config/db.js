const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

async function init() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Pool de conexiones Oracle creado');

    // 🔐 Validar credenciales al inicio
    const testConnection = await oracledb.getConnection();
    await testConnection.close();
    console.log("🔐 Credenciales Oracle validadas correctamente");

  } catch (err) {
    console.error('❌ Error creando el pool de Oracle o validando credenciales:', err);
    throw err;
  }
}

function getConnection() {
  return oracledb.getConnection();
}

async function close() {
  try {
    await oracledb.getPool().close(0);
    console.log('🛑 Pool de conexiones Oracle cerrado');
  } catch (err) {
    console.error('❌ Error cerrando el pool de Oracle:', err);
  }
}

module.exports = {
  init,
  getConnection,
  close,
  oracledb
};