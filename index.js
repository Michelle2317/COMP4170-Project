import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

const app = express();

app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "diary",
	password: "password",
	port: 5432
});
db.connect();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index", { title: "Login" });
});

app.post("/login", (req, res) => {
	let username = req.body["username_name"];
	let email = req.body["email_name"];
	const query = "INSERT INTO users (username, email) VALUES ($1, $2)";
	db.query(query, [username, email], (err, result) => {
		res.render("dashboard", { title: "Dashboard", username });
	});
});

app.get("/dashboard", (req, res) => {
	res.render("dashboard", { title: "Dashboard" });
});

app.get("/create", (req, res) => {
	res.render("create", { title: "Create Diary" });
});

app.get("/edit", (req, res) => {
	res.render("edit", { title: "Edit Diary" });
});

app.get("/view", (req, res) => {
	res.render("view", { title: "View Diary" });
});

app.get("/delete", (req, res) => {
	res.render("delete", { title: "Delete Diary" });
});

app.listen(3000, () => {
	console.log(`App listening at port 3000`);
});
