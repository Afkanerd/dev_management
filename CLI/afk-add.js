#! /usr/bin/env node

const {
    Command
} = require('commander');
const program = new Command();
var mysql = require('mysql');
const fs = require("fs");
const Security = require("../models/security.model.js");
const security = new Security();
const {
    v4: uuidv4,
    v1: uuidv1
} = require('uuid');

program
    .requiredOption('-u, --username <username>', 'mysql username')
    .requiredOption('-p, --password <password>', 'mysql password')
    .requiredOption('-e, --email <email>', 'admin email');

program.parse(process.argv);

const options = program.opts();
if (!options.username) return console.log("error: required option '-u, --username <username>' cannot be empty");
if (!options.email) return console.log("error: required option '-e, --email <email>' cannot be empty");
if (!options.password) return console.log("error: required option '-p, --password <password>' cannot be empty");

if (!fs.existsSync(`${__dirname}/config.json`)) {
    return console.log("error: Please configure database \ncommand: afk config -d <Database name>");
};

var connection = mysql.createConnection({
    host: 'localhost',
    user: `${options.username}`,
    password: `${options.password}`,
    database: require("./config.json").MYSQL_DATABASE
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.message);
        return;
    }

    console.log('success:');

    let auth_id = security.hash(uuidv4())
    let auth_key = security.hash(uuidv1())

    var data = {
        id: uuidv4(),
        auth_id: auth_id,
        auth_key: auth_key,
        email: options.email
    };

    connection.query('CREATE TABLE IF NOT EXISTS admins(id VARCHAR(64) DEFAULT (uuid()), auth_id VARCHAR(255) NOT NULL UNIQUE, auth_key VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY(id));', function (error, results, fields) {
        if (error) throw error.message;

        // console.log(results)
        return;
    });

    connection.query('INSERT INTO admins SET ?', data, function (error, results, fields) {
        if (error) throw error.message;

        // console.log(results)
        return;
    });

    connection.query('SELECT * FROM admins WHERE email = ?', [options.email], async function (error, results, fields) {
        if (error) throw error.message;

        console.log(results);
        process.exit();
    });
});