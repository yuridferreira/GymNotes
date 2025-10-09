import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("treinos.db");

// --- Inicializa a tabela ---
export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS treinos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          series INTEGER NOT NULL,
          repeticoes INTEGER NOT NULL,
          peso REAL,
          grupo TEXT NOT NULL,
          data INTEGER
        );`,
        [],
        () => resolve(true),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Adiciona um treino ---
export const addTreino = ({ nome, series, repeticoes, peso, grupo, data }) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO treinos (nome, series, repeticoes, peso, grupo, data)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [nome, series, repeticoes, peso, grupo, data],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Atualiza um treino ---
export const updateTreino = ({ id, nome, series, repeticoes, peso, grupo, data }) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE treinos SET nome=?, series=?, repeticoes=?, peso=?, grupo=?, data=? WHERE id=?;`,
        [nome, series, repeticoes, peso, grupo, data, id],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Deleta um treino ---
export const deleteTreino = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM treinos WHERE id=?;`,
        [id],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Busca todos os treinos ---
export const getTreinos = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM treinos ORDER BY id DESC;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Busca treino por ID ---
export const getTreinoById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM treinos WHERE id=?;`,
        [id],
        (_, { rows }) => resolve(rows._array[0]),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Busca por grupo ---
export const getTreinosByGrupo = (grupo) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM treinos WHERE grupo=? ORDER BY id DESC;`,
        [grupo],
        (_, { rows }) => resolve(rows._array),
        (_, err) => reject(err)
      );
    });
  });
});

// --- Busca por data (timestamp) ---
export const getTreinosByData = (data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM treinos WHERE data=? ORDER BY id DESC;`,
        [data],
        (_, { rows }) => resolve(rows._array),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Busca por nome parcial ---
export const getTreinosByNome = (nome) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM treinos WHERE nome LIKE ? ORDER BY id DESC;`,
        [`%${nome}%`],
        (_, { rows }) => resolve(rows._array),
        (_, err) => reject(err)
      );
    });
  });
};

// --- Limpa todos os treinos ---
export const clearTreinos = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM treinos;`,
        [],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

// Inicializa banco de dados automaticamente
initDB().catch(err => console.log("Erro ao inicializar DB:", err));

