//dependancies
const mysql = require('mysql');
const http = require('http');
const fs = require('fs');
var url = require('url');

http.createServer((req, res) => {
    
    // take the text from the url
    let adr = url.parse(req.url, true);

    // get the current url
    let urlpathname = adr.pathname;

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
        const data = result.map(item => ({thing_text: item.thing_text, thing_id: item.thing_id}));
        
        // Send the data back to the client as JSON
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(data));
        return res.end();
    });

    // if at the delete url run sql to delete the selected item
    } else if (urlpathname === '/delete') {

            //receive the post request made to the delete endpoint from the frontend
            
            let body = '';
            req.on('data', chunk => {
            body += chunk;
            });
        
            req.on('end', () => {
            const data = JSON.parse(body);
            const thingId = data.thing_id;
            console.log('thing_id:', thingId);
        
            // delete the item with thingId

            db.query(`DELETE FROM things WHERE thing_id=${thingId}`, (err, result) => {
            if (err) {
                console.error(err);
                result.statusCode = 500;
                result.end(`Error deleting item ${thingId}`);
                return;
            }

            // Send response
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: `Successfully deleted item ${thingId}` }));
    });
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