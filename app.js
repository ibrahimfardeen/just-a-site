const express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({
    extended: true
}));


// MySQL connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'juhosi',
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

var customer_id = '';

app.post('/login', (req, res) => {
    console.log(req.body);

    var username = req.body.username;
    var password = req.body.password;
    customer_id = '';
    var checkUser = "select * from user where user_id = ? and password = ?";
    connection.query(checkUser, [username, password], function (error, results) {
        if (error) throw error;

        console.log(results)

        if (results.length == 0) {
            res.render("error", {
                message: "Entered Username or Password is wrong",
                link: '/login'
            });
        } else if (results[0].user_type == 'admin') {
            res.redirect('/admin');
        } else {
            customer_id += results[0].user_id;
            res.redirect('/customer');
        }
    });
});
var sum_result = [];
app.get('/admin', (req, res) => {

    var query = "select distinct customer_id from customer";
    connection.query(query, function (error, result) {
        sum_result = [];

        if (error) throw error;
        console.log(result);
        console.log(result.length );
        
        if (result.length >= 1) {
            var sums1 = "select sum(quantity) as total_quantity, sum(weight) as total_weight, sum(box_count) as total_box_count, customer_id from customer where customer_id=" + "'" + result[0].customer_id + "'";

            connection.query(sums1, function (error, results) {
                if (error) throw error;
                sum_result.push(results[0]);
                console.log(sum_result);
            })
        }
        if (result.length >= 2) {
            var sums2 = "select sum(quantity) as total_quantity, sum(weight) as total_weight, sum(box_count) as total_box_count, customer_id from customer where customer_id=" + "'" + result[1].customer_id + "'";

            connection.query(sums2, function (error, results) {
                if (error) throw error;
                sum_result.push(results[0]);
                console.log(sum_result);

            })
        }

    })
    res.render('admin', {
        customer: sum_result,
        x: 0,
        y: 0,
        z: 0
    });
});

app.get('/customer', (req, res) => {
    res.render('customer');
});

app.post('/customer', (req, res) => {
    console.log(req.body);

    var orderDate = req.body.orderDate;
    var company = req.body.company;
    var owner = req.body.owner;
    var item = req.body.item;
    var quantity = req.body.quantity;
    var weight = req.body.weight;
    var requestShipment = req.body.requestShipment;
    var trackingId = req.body.trackingId;
    var shipmentSize = req.body.shipmentSize;
    var boxCount = req.body.boxCount;
    var specification = req.body.specification;
    var checklistQuantity = req.body.checklistQuantity;

    var fields = [
        [
            orderDate,
            company,
            owner,
            item,
            quantity,
            weight,
            requestShipment,
            trackingId,
            shipmentSize,
            boxCount,
            specification,
            checklistQuantity,
            customer_id
        ]
    ]

    var query = "INSERT INTO customer(order_date, company, owner, item, quantity, weight, req_for_shipment, tracking_id, shipment_size, box_count, specification, checklist_quantity, customer_id) VALUES ?"

    connection.query(query, [fields], function (error, result) {
        if (error) throw error;
        res.redirect('/order-placed');
    });
});

app.get('/order-placed', (req, res) => {
    res.render('order-placed');
});

app.get('/error', (req, res) => {
    res.render('error', {
        message: 'Test Error message',
        link: '/login'
    });
});

// Start the server
app.listen(7000, () => {
    console.log('Server is listening on port 7000');
});