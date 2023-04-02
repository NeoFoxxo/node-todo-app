//dependancies
const mysql = require('mysql');
const http = require('http');
const fs = require('fs');
var url = require('url');

let item;

http.createServer((req, res) => {


    // take the text from the url
    let adr = url.parse(req.url, true);

    // get the current url
    const urlpathname = adr.pathname;

    // split the url to only get the text
    let item = adr.query.text;

    // get ready for the post to the db
    let post = { thing_text: item };

    // check if it is undefined or empty before sending it
    if (item !== undefined || item === "") {
        db.query("INSERT INTO things SET ?", post, (err, result) => {
            if (err) throw err;
            console.log(result);
        });
    }

    // if at root home page load the html
    if (urlpathname === '/'){
    // start server and pull the html
    fs.readFile('index.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        // console.log("server online at port 3001")
        return res.end();
      });
    
    // if at the get data url run a select statement to get all the items and save it as json
    } else if (urlpathname === '/get-data') {
        db.query('SELECT * from things', (err, result) => {
        if (err) throw err;
        const data = result.map(item => ({thing_text: item.thing_text}));
        
        // Send the data back to the client as JSON
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(data));
        return res.end();
    });

    // 404 cause yeah
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('404 Not Found');
        return res.end();
    }
}).listen(3001) 

// connect to the holy database
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "node_todo"
});

// console log when the database has successfully connected or show the error
db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database");
});