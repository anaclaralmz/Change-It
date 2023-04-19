const express = require('express'); // framework express
const app = express(); // app faz o manuseio do express
const hostname = '127.0.0.1'; // endereço
const port = 1234; // porta do site
var md5 = require('md5') // recebe o módulo do md5 (criptografia)
var sqlite3 = require('sqlite3').verbose(); // import de todos os módulos necessários
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");
const req = require('express/lib/request');
const { read } = require('fs');
// var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
// var atualizar = 'UPDATE user SET (name , email, password) WHERE VALUES id=1'
// var get = 'SELECT * FROM user'
// var delet = "DELETE FROM user WHERE id= '" + req.body.id + "'";

app.use(express.static("../frontend/")); // pega o diretório do front
app.use(express.json()); // pega o diretório do node.js

const DBSOURCE = "DatabaseOficial5.db" // responsável pela operação do bd
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(express.urlencoded({
    extended: true
}))

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/Home.html`); // printa no console
});

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) { // aparece o erro no console se ele existir
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.') // aparece isso no console se der bom
    }
});

module.exports = db // exporta o bd

//get, post, put, delete methods

/*
========================================================================================
//                  Endpoints relacionados à tabela Doacoes                           //
//                                COMPLETO                                            //
========================================================================================
*/

// READ - Torna possível retornar os dados (elas são retornadas pelo AJAX na página "listaDoacoes.html")
app.get("/readInsumos", (req, res) => { // Método Get, pega todas as informações dentro do banco de dados e retorna elas, tornado possível exibí-las quando necessário
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = 'SELECT * FROM Doacoes ORDER BY idDoacoes COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close();
});

// CREATE - Registra uma nova doação de insumo na tabela Doacoes
app.post("/registrarInsumos", (req, res) => { //Método Post, pega os campos da ficha de insumos e também envia para o banco de dado

    sql = `INSERT INTO Doacoes (Data, Anonimo, Nome, CPF, NomeProduto, Email, Ajuda, Observacoes) VALUES ('${req.body.dataInsumos}','${req.body.AnonimoIns}','${req.body.nomeInsumos}', '${req.body.CPFInsumos}', '${req.body.NomeProduto}', '${req.body.emailInsumo}', '${req.body.AjudaIns}', '${req.body.ObsInsumos}')`

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close(); // Fecha o banco
});


// Deleta o registro de um insumo na tabela Doacoes pelo id, isso serve para casos em que um insumo foi registrado errado ou não é correto
app.post("/deleteInsumos", (req, res) => { //Método Delete, deleta um usuário do banco de dados, por exemplo
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    sql = "DELETE FROM Doacoes WHERE idDoacoes = '" + req.body.idDoacoes + "'";
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

// Não julgamos necessário que haja um UPDATE para as doações de insumos, tendo em vista que não há informações relevantes que não possam ser trocadas usando um DELETE + CREATE

/*
========================================================================================
//                  Endpoints relacionados à tabela Monetario                         //
//                                   COMPLETO                                         //
========================================================================================
*/

// READ - Torna possível retornar os dados (elas são retornadas pelo AJAX na página "listaDoacoesMon.html")
app.get("/readMonetario", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = 'SELECT * FROM Monetario ORDER BY idMonetario COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close();
});

// CREATE - Registra uma nova transferência bancária com as informações do doador na tabela DoacoesMon
app.post("/insertMonetario", (req, res) => { //Método Post, pega os campos da ficha de cadastro do Voluntário e envia para o banco de dados
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var Nome = req.body.Nome;
    console.log(req.body.Anonimo)
    if (req.body.Anonimo == 'Sim') {
        Nome = 'Anônimo'
    };

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco

    var sql = `INSERT INTO Monetario (Data, Anonimo, Nome, Valor, Observacoes) VALUES ('${req.body.Data}', '${req.body.Anonimo}', '${Nome}', '${req.body.Valor}', '${req.body.Observacoes}')`;

    db.run(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close(); // Fecha o banco
})

// DELETE -Deleta o registro de uma doação financeira se necessário
app.post("/deleteMonetario", (req, res) => { //Método Delete, deleta um usuário do banco de dados, por exemplo
    sql = "DELETE FROM Monetario WHERE idMonetario = '" + req.body.idMonetario + "'";
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            res.status(500).send(err.message);
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

// Não julgamos necessário que haja um UPDATE para as doações monetárias, tendo em vista que não há informações relevantes que não possam ser trocadas usando um DELETE + CREATE

/*
========================================================================================
//                  Endpoints relacionados à tabela Voluntario                        //
//                                   COMPLETO                                         //
========================================================================================
*/

// READ - Torna possível retornar os dados (elas são retornadas pelo AJAX na página "listaVoluntários.html")
app.get('/readVoluntario', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = 'SELECT * FROM Voluntario ORDER BY Nome COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        res.json(rows);
    });
    db.close(); // Fecha o banco
});

// CREATE - Registra um novo voluntário na tabela de voluntários
app.post("/registrarVoluntario", (req, res) => { //Método Post, pega os campos da ficha de cadastro do Voluntário e envia para o banco de dados
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    sql = `INSERT INTO voluntario (Nome, Idade, Motivo, Documento, Email, VObservacoes) VALUES ('${req.body.username}', '${req.body.idade}', '${req.body.motivo}', '${req.body.documento}', '${req.body.email}', '${req.body.obs}')`;

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
})

// DELETE - Deleta o registro de um voluntário se necessário
app.post("/deleteVoluntario", (req, res) => { //Método Delete, deleta um usuário do banco de dados, por exemplo
    sql = "DELETE FROM Voluntario WHERE idVoluntario = '" + req.body.idVoluntario + "'";
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            res.status(500).send(err.message);
        }
        res.end();
    });
    db.close(); // Fecha o banco
});


// Não julgamos necessário que haja um UPDATE para os voluntários, tendo em vista que eles podem fazer uma nova requisição de voluntariado


/*
========================================================================================
//                  Endpoints relacionados à tabela Colaborador                       //
//                                 1 PENDÊNCIA                                        //
========================================================================================
*/

// READ - Torna possível retornar os dados (elas são retornadas pelo AJAX na página "listaColaboradores.html")
app.get('/readColaborador', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = 'SELECT * FROM Colaborador ORDER BY CPF COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close(); // Fecha o banco
});

// CREATE - Registra um novo colaborador na tabela de colaboradores e cria seu email e senha na tabela de administração para ser possível efetuar o login na página "Login.html"
app.post("/registrarColaboradores", (req, res) => { //Método de inserir dados do colaborador
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    const Senha = String(req.body.CPFColab)
    const email = `${req.body.NomeColab}@gmail.com`;

    var today = new Date();
    const PrimeiroAcesso = today.toLocaleDateString();


    sql = `INSERT INTO Colaborador (Nome, CPF, Tipo, Senha, Email, Endereco, PrimeiroAcesso, ObsColab) VALUES ('${req.body.NomeColab}', '${req.body.CPFColab}', '${req.body.TipoColab}', '${Senha}', '${email}', '${req.body.enderecoColab}', '${PrimeiroAcesso}', '${req.body.ObsColab}')`;

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco

    sqld = `INSERT INTO Administrador (Email, Senha) VALUES ('${email}', '${Senha}')`;
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sqld, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

// UPDATE - Pendente, deve ser possível alterar algumas informações dos colaboradores, mas esse método está pendente!
/* app.post('/updateColaborador', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    sql = `UPDATE Colaborador SET`
    if (req.body.NomeColab) {
        sql += ` Nome = '${req.body.NomeColab}',`;
    };
    if (req.body.TipoColab) {
        sql += ` Tipo = '${req.body.TipoColab}'`
    };
    if (req.body.SenhaColab) {
        sql += `, Senha = '${req.body.SenhaColab}'`
    };

    sql += ` WHERE CPF = '${req.body.CPFColab}'`;

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            res.status(500).send(err.message);
        }
        res.end();
    });
    db.close(); // Fecha o banco
}); 
*/

// DELETE - Deleta um colaborador se necessário (para o UPDATE não fazer tanta falta)
app.post('/deleteColaborador', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    sql = "DELETE FROM Colaborador WHERE CPF = '" + req.body.CPFColab + "'";
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

/*
========================================================================================
//                  Endpoints relacionados à tabela Servico                           //
//                                   COMPLETO                                         //
========================================================================================
*/

// READ - TOrna possível retornar os dados (elas são retornadas pelo AJAX na página "listaAtividades.html")
app.get("/readServico", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = 'SELECT * FROM Servico ORDER BY Data COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close(); // Fecha o banco

});

// CREATE - Registra um novo serviço na tabela de serviços, sendo esse serviço um Banho ou um Lanche
app.post("/insertServico", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    if (req.body.servico == "Banho") {
        console.log(req.body.idCadastro);
        var sql = `INSERT INTO Servico (Servico, Toalha, Lanche, idCadastro, Data) VALUES ('Banho', '${req.body.idToalha}', '-', '${req.body.idCadastro}', '${req.body.Data}')`;
    }
    if (req.body.servico == "Lanche") {
        var sql = `INSERT INTO Servico (Servico, Toalha, Lanche, idCadastro, Data) VALUES ('Lanche', '-', '${req.body.Lanche}', '${req.body.idCadastro}', '${req.body.Data}')`
    }

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

// DELETE - Deleta o registro de um serviço se necessário
app.post('/deleteServico', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    sql = "DELETE FROM Servico WHERE idServico = '" + req.body.idServico + "'";
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

/*
========================================================================================
//                  Endpoints relacionados à tabela Toalha                            //
//                                   COMPLETO                                         //
========================================================================================
*/

// READ - Torna possível retornar os dados (elas são retornadas pelo AJAX na parte dos Banhos em "listaAtividades.html")
app.get("/readToalha", (req, res) => { //  retorna as informações das toalhas, tornando possível exibí-las quando necessário
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = 'SELECT * FROM Toalha ORDER BY idToalha COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close(); // Fecha o banco

});

// CREATE - Registra uma nova toalha (só o seu número)
app.post("/insertToalha", (req, res) => { //Método de inserir dados do colaborador
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    sql = `INSERT INTO Toalha (NumToalha) VALUES ('${req.body.Numero_Toalha}')`;

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

// DELETE - Deleta uma toalha do banco de dados
app.post('/deleteToalha', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS

    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    sql = "DELETE FROM Toalha WHERE idToalha = '" + req.body.idToalha + "'";
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});

/*
========================================================================================
//                 Endpoints relacionados à tabela rbCadastramento                    //
//                                 INCOMPLETO                                         //
========================================================================================
*/
// READ Cadastros de assistidos (GET)
app.get("/readCadastroAssistido", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    var db = new sqlite3.Database(DBSOURCE);
    var sql = 'SELECT * FROM tbCadastramento ORDER BY idCadastro COLLATE NOCASE';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close();
});

// Alternativa sobre o modal seria abrir outra página e mandar o endpoint pra ela
/* app.get("/readCadastroEspecifico", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    var db = new sqlite3.Database(DBSOURCE);
    var sql = 'SELECT * FROM tbCadastramento WHERE idCadastro = ' + req.body.idCadastro;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
    db.close();

    location.replace("../frontend/visualizarAssistido.html")
}); */

app.post("/cadastro", (req, res) => { //Método Post, pega os campos da ficha de assistidos e também envia para o banco de dados
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS
    var db = new sqlite3.Database(DBSOURCE);


    let dt = req.body.data
    let nomec = req.body.NomeCA
    let nomesocialac = req.body.NomeSocialCA
    let documento = req.body.DocumentoCA
    let datanasc = req.body.NascCA
    let obs = req.body.observacao
    let viadutomarquise = req.body.marquises
    let predio = req.body.Predios
    let parque = req.body.Parques
    let estacao = req.body.Estacoes
    let margem = req.body.Rodovias
    let construcoes = req.body.Construcoes
    let galeria = req.body.Galerias
    let abandonado = req.body.abandonados
    let outro_locais = req.body.Locais
    let albergue = req.body.moradia_Albergue
    let domicilios = req.body.domicilio_Particular
    let r = req.body.rua
    let a = req.body.alb
    let d = req.body.domi
    let o = req.body.out
    let tempo = req.body.tempo_rua
    let motivo = req.body.motivos
    let tempo_mora = req.body.tempo_m
    let familia = req.body.f
    let contatofora = req.body.contato_parente_fr
    let freq = req.body.atv_comu
    let atend = req.body.ult_atendimento
    let carteiras = req.body.carteira
    let ganhou = req.body.ganhar
    let benef = req.body.beneficio
    let qual = req.body.qual
    let dt1 = req.body.data1
    let dt2 = req.body.data2
    let dt3 = req.body.data3
    let dt4 = req.body.data4
    let dt5 = req.body.data5
    let servico1 = req.body.serv1
    let servico2 = req.body.serv2
    let servico3 = req.body.serv3
    let servico4 = req.body.serv4
    let servico5 = req.body.serv5

    if (documento == ' ' || documento == null) {
        documento = 'nao ha';
    };

    sql = "INSERT INTO tbCadastramento (data, nome_completo, clamado, possui_documentos, nascimento, observacao, marquises_viadutos, predios_pri_pub, parques, estacao, rodovias, areas_internas, galerias, lugares_abandonados, outros_locais, albergue, domiciliar_particular,d_rua, d_albergue, d_domicilio, d_outro, tempo_de_rua, motivos_morar_rua, quanto_tempo_mora_na_cidade, vive_com_sua_familia, contato_com_parentes, seis_meses_atv_comunitaria, seis_meses_atendido_nos_lugares_abaixo, emprego_carteira_assinada, renda, recebeu_beneficio, qual, encam_dt_1, encam_ser_1, encam_dt_2, encam_ser_2, encam_dt_3, encam_ser_3, encam_dt_4, encam_ser_4, encam_dt_5, encam_ser_5) VALUES ('" + dt + "','" + nomec + "','" + nomesocialac + "','" + documento + "','" + datanasc + "','" + obs + "','" + viadutomarquise + "','" + predio + "','" + parque + "','" + estacao + "','" + margem + "','" + construcoes + "','" + galeria + "','" + abandonado + "','" + outro_locais + "','" + albergue + "','" + domicilios + "','" + r + "','" + a + "','" + d + "','" + o + "','" + tempo + "','" + motivo + "','" + tempo_mora + "','" + familia + "','" + contatofora + "','" + freq + "','" + atend + "','" + carteiras + "','" + ganhou + "','" + benef + "','" + qual + "','" + dt1 + "','" + servico1 + "','" + dt2 + "','" + servico2 + "','" + dt3 + "','" + servico3 + "','" + dt4 + "','" + servico4 + "','" + dt5 + "','" + servico5 + "')";
    console.log(r, a, d, o);
    db.run(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

app.post("/deleteCadastroAssistido", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');

    sql = "DELETE FROM tbCadastramento WHERE idCadastro = '" + req.body.idCadastro + "'";
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    db.run(sql, [], err => {
        if (err) {
            throw err;
        }
        res.end();
    });
    db.close(); // Fecha o banco
});



// Endpoint necessário para a confirmação do Login
app.post("/login", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Isso é importante para evitar o erro de CORS
    var login = req.body.user
    console.log(login)
    var senha = req.body.senha
    console.log(senha)
    var db = new sqlite3.Database(DBSOURCE); // Abre o banco
    var sql = `SELECT * FROM Administrador WHERE Email = "${login}"`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows)
        if (rows == '') {
            res.status(400).send('Credenciais incorretas!')
        } else {
            console.log(rows[0])
            if (rows[0].Senha == senha) {
                res.status(200).send('Usuário Logado!')
            } else {
                res.status(400).send('Credenciais incorretas!')
            }
        }
    });
    db.close(); // Fecha o banco
})





