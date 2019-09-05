//import packages
let express = require('express');
let bodyParser = require('body-parser');    // parse payload of incoming POST requests
let mongodb = require('mongodb'); 

let app = express();                        //configure express

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('images'));
app.use(express.static('css'));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(8080);

const MongoClient = mongodb.MongoClient;    //configure MongoDB client

const url = 'mongodb://localhost:27017/';   //url to the MongoDB server

let db;                                     //reference to the collection


MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, client) {
        if (err) {
            console.log('Err ', err);
        } else {
            console.log('server is running @ http://localhost:8080/');
            db = client.db('lab6');
            db.createCollection('tasks');
        }
    }
);


/*  ***************************************
                ROUTES HANDLERS
    ***************************************
*/

//request to the home page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

/*
    a.  Insert new task...
        add new document to the DB
*/
app.get('/newtask', function(req, res) {
    res.sendFile(__dirname + '/views/newTask.html')
});

// POST method function for adding new tasks to list when user clicks the submit button
app.post('/addtask', function(req, res) {
    let taskInfo = req.body;
    db.collection('tasks').insertOne({
        id: Math.round(Math.random()*1000),
        name: taskInfo.name, 
        assign: taskInfo.assign,
        due: taskInfo.due,
        status: taskInfo.status,
        desc: taskInfo.desc
    });
    res.redirect('/listtasks');
});

/*
    b.  Get all tasks...
        show all the tasks in a table format
*/
app.get('/listtasks', function(req, res) {
    db.collection('tasks').find({}).toArray(function(err, data){
        res.render('listtasks.html', { tasks: data })
    }); 
});

/*
    c.  Delete tasks by taskID
        take a taskID as input and delete its tasks from the DB
*/
app.get('/delete', function(req, res) {
    res.sendFile(__dirname + '/views/delete.html')
});

app.post('/deletebyid', function(req, res) {
    let taskInfo = req.body;
    let filter = {id : parseInt(taskInfo.id)};
    db.collection('tasks').deleteOne( filter, function(err, results){
        res.redirect('/listtasks');
    });
});

/*
    d.  Delete all the completed tasks
*/
app.post('/deletebystatus', function(req, res) {
    db.collection('tasks').deleteMany({ status: { $eq: 'Complete' }}, 
    function(err, results){
        res.redirect('/listtasks');
    });
});

/*
    e.  Update task status by taskID: 
        the page takes two inputs: a taskID and a new status (either InProgress or Complete). 
        It sets the new status to the task with taskID.
*/
app.get('/updatetask', function(req, res) {
    res.sendFile(__dirname + '/views/updatetask.html')
});

app.post('/taskupdate', function(req, res) {
    let taskInfo = req.body;
    let filter = { id: parseInt(taskInfo.id)};
    let theUpdate = {$set: { status: 'Complete' }};
    db.collection('tasks').updateOne( filter, theUpdate, function(err, results){
        res.redirect('/listtasks');
    });
});
