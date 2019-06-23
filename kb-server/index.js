const express = require('express');
// const methodOverride = require('method-override');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const db = require('./queries');
const port = 3000;
const cors = require('cors');

// var server = express();
var urlencodedParser = bodyParser.urlencoded({ extended: true });

// override with POST having ?_method=DELETE
// app.use(methodOverride('_method'));
app.use(cors());
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);

app.options('*', cors()); // include before other routes

app.get('/', (request, response) => {
	response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/plans', db.getPlans);
//app.get("/plans/:id", db.getPlanById);
app.post('/plans', urlencodedParser, db.createPlan);

app.post('/testpost', urlencodedParser, function(req, res) {
	console.log(req.body);
});
app.put('/plans/:id', db.updatePlan);

app.delete('/plans/:planName', urlencodedParser, db.deletePlan);
// console.log(req.body);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
