const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const conString = config.urlConnection;
const client = new Client(conString);
client.connect((err) => {
    if (err) {
        return console.error("Não foi possível conectar ao banco.", err);
    }
    client.query("SELECT NOW()", (err, result) => {
        if (err) {
            return console.error("Erro ao executar a query.", err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok  Servidor disponível.");
});

// Get all clients
app.get("/Clientes", (req, res) => {
    try {
        client.query("SELECT * FROM Clientes", (err, result) => {
            if (err) {
                return console.error("Erro ao executar a query de SELECT", err);
            }
            res.send(result.rows);
            console.log("Rota: get Clientes");
        });
    } catch (error) {
        console.log(error);
    }
});

// Get client by ID
app.get("/Clientes/:id", (req, res) => {
    try {
        console.log("Rota: Clientes/" + req.params.id);
        const id = req.params.id;
        client.query("SELECT * FROM Clientes WHERE id = $1", [id], (err, result) => {
            if (err) {
                return console.error("Erro ao executar a query de SELECT id", err);
            }
            res.send(result.rows);
        });
    } catch (error) {
        console.log(error);
    }
});

// Delete client by ID
app.delete("/Clientes/:id", (req, res) => {
    try {
        const id = req.params.id;
        console.log("Rota: delete/" + id);
        client.query("DELETE FROM Clientes WHERE id = $1", [id], (err, result) => {
            if (err) {
                return console.error("Erro ao executar a query de DELETE", err);
            }
            if (result.rowCount === 0) {
                res.status(404).json({ info: "Registro não encontrado." });
            } else {
                res.status(200).json({ info: `Registro excluído. Código: ${id}` });
            }
        });
    } catch (error) {
        console.log(error);
    }
});

// Create a new client
app.post("/Clientes", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);
        const { nome, email, telefone, idade, experiencia } = req.body;
        client.query(
            "INSERT INTO Clientes (nome, email, telefone, idade, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nome, email, telefone, idade, experiencia],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a query de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

// Update a client
app.put("/Clientes/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);
        const id = req.params.id;
        const { nome, email, telefone, idade, experiencia } = req.body;
        client.query(
            "UPDATE Clientes SET nome=$1, email=$2, telefone=$3, idade=$4, experiencia=$5 WHERE id=$6",
            [nome, email, telefone, idade, experiencia, id],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a query de UPDATE", err);
                }
                res.setHeader("id", id);
                res.status(202).json({ identificador: id });
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

// Listen on the specified port
app.listen(config.port, () => {
    console.log("Servidor funcionando na porta " + config.port);
});

module.exports = app;
