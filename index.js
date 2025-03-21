import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "diary",
	password: "julia",
	port: 5432
});
db.connect();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index.ejs", { title: "Home" });
});

app.get("/register", (req, res) => {
	res.render("register.ejs", { title: "Register" });
});

app.post("/register", async (req, res) => {
	const username = req.body.user_username;
	const password = req.body.user_password;

	try {
		const checkResult = await db.query(
			"SELECT * FROM users WHERE username = $1",
			[username]
		);

		if (checkResult.rows.length > 0) {
			res.send("Account already exists. Try logging in to your account");
		} else {
			const result = await db.query(
				"INSERT INTO users (username, password) VALUES ($1, $2)",
				[username, password]
			);
			console.log(result);
			res.render("dashboard.ejs", {
				title: "Dashboard",
				username
			});
		}
	} catch (err) {
		console.log(err);
	}
});

app.get("/login", (req, res) => {
	res.render("login.ejs", { title: "Login" });
});

app.post("/login", async (req, res) => {
	const username = req.body.user_username;
	const password = req.body.user_password;

	try {
		const result = await db.query(
			"SELECT * FROM users WHERE username = $1",
			[username]
		);
		if (result.rows.length > 0) {
			const user = result.rows[0];
			const storedPassword = user.password;

			if (password === storedPassword) {
				res.render("dashboard.ejs", {
					title: "Dashboard",
					username
				});
			} else {
				res.send("Incorrect password");
			}
		} else {
			res.send("User not found");
		}
	} catch (err) {
		console.log(err);
	}
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
